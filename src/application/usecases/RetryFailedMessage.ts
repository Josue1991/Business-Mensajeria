import { IMessageRepository } from '@domain/repositories/IMessageRepository';
import { MessageDomainService } from '@domain/services/MessageDomainService';
import { EmailMessage } from '@domain/entities/EmailMessage';
import { SMSMessage } from '@domain/entities/SMSMessage';

export interface IEmailQueue {
  addJob(message: EmailMessage): Promise<void>;
}

export interface ISMSQueue {
  addJob(message: SMSMessage): Promise<void>;
}

export class RetryFailedMessageUseCase {
  constructor(
    private readonly messageRepository: IMessageRepository,
    private readonly messageDomainService: MessageDomainService,
    private readonly emailQueue: IEmailQueue,
    private readonly smsQueue: ISMSQueue,
    private readonly maxRetries: number = 3
  ) {}

  async execute(messageId: string): Promise<{ retried: boolean; reason?: string }> {
    const message = await this.messageRepository.findById(messageId);

    if (!message) {
      return { retried: false, reason: 'Message not found' };
    }

    if (!this.messageDomainService.shouldRetry(message, this.maxRetries)) {
      return { 
        retried: false, 
        reason: `Message cannot be retried (status: ${message.status}, retries: ${message.retryCount})` 
      };
    }

    // Increment retry count
    message.incrementRetry();
    await this.messageRepository.update(message);

    // Re-queue based on type
    if (message instanceof EmailMessage) {
      await this.emailQueue.addJob(message);
    } else if (message instanceof SMSMessage) {
      await this.smsQueue.addJob(message);
    }

    return { retried: true };
  }

  async retryAllFailed(limit: number = 100): Promise<{ retriedCount: number }> {
    const failedMessages = await this.messageRepository.getFailedMessages(limit);
    let retriedCount = 0;

    for (const message of failedMessages) {
      if (this.messageDomainService.shouldRetry(message, this.maxRetries)) {
        const result = await this.execute(message.id);
        if (result.retried) {
          retriedCount++;
        }
      }
    }

    return { retriedCount };
  }
}
