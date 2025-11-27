import { Message, MessageStatus } from '../entities/Message';

export interface MessageStatistics {
  totalMessages: number;
  sentCount: number;
  failedCount: number;
  pendingCount: number;
  successRate: number;
  emailCount: number;
  smsCount: number;
}

export class MessageDomainService {
  async calculateStatistics(messages: Message[]): Promise<MessageStatistics> {
    const totalMessages = messages.length;
    const sentCount = messages.filter(msg => msg.status === MessageStatus.SENT).length;
    const failedCount = messages.filter(msg => msg.status === MessageStatus.FAILED).length;
    const pendingCount = messages.filter(
      msg => msg.status === MessageStatus.PENDING || 
            msg.status === MessageStatus.QUEUED || 
            msg.status === MessageStatus.SENDING
    ).length;

    const emailCount = messages.filter(msg => msg.type === 'EMAIL').length;
    const smsCount = messages.filter(msg => msg.type === 'SMS').length;

    const successRate = totalMessages > 0 ? (sentCount / totalMessages) * 100 : 0;

    return {
      totalMessages,
      sentCount,
      failedCount,
      pendingCount,
      successRate,
      emailCount,
      smsCount
    };
  }

  validateMessage(message: Message): { valid: boolean; errors: string[] } {
    return message.validate();
  }

  shouldRetry(message: Message, maxRetries: number): boolean {
    return message.status === MessageStatus.FAILED && message.canRetry(maxRetries);
  }

  calculateRetryDelay(retryCount: number, baseDelay: number = 60000): number {
    // Exponential backoff: baseDelay * 2^retryCount
    return baseDelay * Math.pow(2, retryCount);
  }

  sanitizeEmailBody(body: string, isHtml: boolean): string {
    if (!isHtml) return body;

    // Basic HTML sanitization (in production, use a library like DOMPurify)
    return body
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '');
  }

  truncateSMSBody(body: string, maxLength: number = 160): string {
    if (body.length <= maxLength) return body;
    return body.substring(0, maxLength - 3) + '...';
  }
}
