import { Message, MessageType, MessageStatus, MessagePriority, MessageMetadata } from './Message';

export class SMSMessage extends Message {
  constructor(
    id: string,
    status: MessageStatus,
    priority: MessagePriority,
    createdAt: Date,
    public readonly from: string,
    public readonly to: string,
    public readonly body: string,
    sentAt?: Date,
    failedAt?: Date,
    retryCount: number = 0,
    error?: string,
    metadata?: MessageMetadata,
    userId?: string,
    traceId?: string
  ) {
    super(
      id,
      MessageType.SMS,
      status,
      priority,
      createdAt,
      sentAt,
      failedAt,
      retryCount,
      error,
      metadata,
      userId,
      traceId
    );
  }

  static create(params: {
    from: string;
    to: string;
    body: string;
    priority?: MessagePriority;
    metadata?: MessageMetadata;
    userId?: string;
    traceId?: string;
  }): SMSMessage {
    return new SMSMessage(
      this.generateId(),
      MessageStatus.PENDING,
      params.priority || MessagePriority.NORMAL,
      new Date(),
      params.from,
      params.to,
      params.body,
      undefined,
      undefined,
      0,
      undefined,
      params.metadata,
      params.userId,
      params.traceId
    );
  }

  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.from || this.from.trim() === '') {
      errors.push('From phone number is required');
    }

    if (!this.to || this.to.trim() === '') {
      errors.push('To phone number is required');
    }

    if (!this.body || this.body.trim() === '') {
      errors.push('Message body is required');
    }

    // Validate phone number format (basic E.164)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    
    if (this.from && !phoneRegex.test(this.from)) {
      errors.push('Invalid from phone number format (use E.164: +1234567890)');
    }

    if (this.to && !phoneRegex.test(this.to)) {
      errors.push('Invalid to phone number format (use E.164: +1234567890)');
    }

    // SMS body length validation (160 characters for single SMS)
    if (this.body && this.body.length > 1600) {
      errors.push('Message body is too long (max 1600 characters)');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  getSegmentCount(): number {
    if (!this.body) return 0;
    return Math.ceil(this.body.length / 160);
  }

  toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      from: this.from,
      to: this.to,
      body: this.body,
      segments: this.getSegmentCount()
    };
  }
}
