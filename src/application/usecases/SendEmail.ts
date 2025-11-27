import { IMessageRepository } from '@domain/repositories/IMessageRepository';
import { EmailMessage } from '@domain/entities/EmailMessage';
import { MessageDomainService } from '@domain/services/MessageDomainService';
import { TemplateService } from '@domain/services/TemplateService';
import { SendEmailDTO, MessageResponseDTO } from '../dto/MessageDTO';

export interface IEmailQueue {
  addJob(message: EmailMessage): Promise<void>;
}

export class SendEmailUseCase {
  constructor(
    private readonly messageRepository: IMessageRepository,
    private readonly messageDomainService: MessageDomainService,
    private readonly templateService: TemplateService,
    private readonly emailQueue: IEmailQueue
  ) {}

  async execute(dto: SendEmailDTO): Promise<MessageResponseDTO> {
    // Render template if specified
    let body = dto.body;
    if (dto.templateName && dto.templateData) {
      body = this.templateService.render(dto.templateName, dto.templateData);
    }

    // Sanitize HTML body
    if (dto.isHtml !== false) {
      body = this.messageDomainService.sanitizeEmailBody(body, true);
    }

    // Create email message
    const emailMessage = EmailMessage.create({
      from: dto.from,
      to: dto.to,
      subject: dto.subject,
      body,
      isHtml: dto.isHtml,
      cc: dto.cc,
      bcc: dto.bcc,
      attachments: dto.attachments,
      replyTo: dto.replyTo,
      templateName: dto.templateName,
      templateData: dto.templateData,
      priority: dto.priority,
      metadata: dto.metadata,
      userId: dto.userId,
      traceId: dto.traceId
    });

    // Validate
    const validation = this.messageDomainService.validateMessage(emailMessage);
    if (!validation.valid) {
      throw new Error(`Invalid email message: ${validation.errors.join(', ')}`);
    }

    // Save to database
    await this.messageRepository.save(emailMessage);

    // Queue for sending
    emailMessage.markAsQueued();
    await this.messageRepository.update(emailMessage);
    await this.emailQueue.addJob(emailMessage);

    return this.mapToDTO(emailMessage);
  }

  async executeBatch(dtos: SendEmailDTO[]): Promise<MessageResponseDTO[]> {
    const results: MessageResponseDTO[] = [];

    for (const dto of dtos) {
      try {
        const result = await this.execute(dto);
        results.push(result);
      } catch (error: any) {
        console.error(`Failed to queue email: ${error.message}`);
        // Continue with next email
      }
    }

    return results;
  }

  private mapToDTO(message: EmailMessage): MessageResponseDTO {
    return {
      id: message.id,
      type: message.type,
      status: message.status,
      createdAt: message.createdAt.toISOString(),
      sentAt: message.sentAt?.toISOString(),
      traceId: message.traceId
    };
  }
}
