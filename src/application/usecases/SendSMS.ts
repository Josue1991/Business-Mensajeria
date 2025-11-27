import { IMessageRepository } from '@domain/repositories/IMessageRepository';
import { SMSMessage } from '@domain/entities/SMSMessage';
import { MessageDomainService } from '@domain/services/MessageDomainService';
import { SendSMSDTO, MessageResponseDTO } from '../dto/MessageDTO';

export interface ISMSQueue {
  addJob(message: SMSMessage): Promise<void>;
}

export class SendSMSUseCase {
  constructor(
    private readonly messageRepository: IMessageRepository,
    private readonly messageDomainService: MessageDomainService,
    private readonly smsQueue: ISMSQueue
  ) {}

  async execute(dto: SendSMSDTO): Promise<MessageResponseDTO> {
    // Create SMS message
    const smsMessage = SMSMessage.create({
      from: dto.from,
      to: dto.to,
      body: dto.body,
      priority: dto.priority,
      metadata: dto.metadata,
      userId: dto.userId,
      traceId: dto.traceId
    });

    // Validate
    const validation = this.messageDomainService.validateMessage(smsMessage);
    if (!validation.valid) {
      throw new Error(`Invalid SMS message: ${validation.errors.join(', ')}`);
    }

    // Save to database
    await this.messageRepository.save(smsMessage);

    // Queue for sending
    smsMessage.markAsQueued();
    await this.messageRepository.update(smsMessage);
    await this.smsQueue.addJob(smsMessage);

    return this.mapToDTO(smsMessage);
  }

  async executeBatch(dtos: SendSMSDTO[]): Promise<MessageResponseDTO[]> {
    const results: MessageResponseDTO[] = [];

    for (const dto of dtos) {
      try {
        const result = await this.execute(dto);
        results.push(result);
      } catch (error: any) {
        console.error(`Failed to queue SMS: ${error.message}`);
        // Continue with next SMS
      }
    }

    return results;
  }

  private mapToDTO(message: SMSMessage): MessageResponseDTO {
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
