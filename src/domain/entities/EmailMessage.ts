import { Message, MessageType, MessageStatus, MessagePriority, MessageMetadata } from './Message';

export interface EmailAttachment {
  filename: string;
  content?: Buffer | string;
  path?: string;
  contentType?: string;
}

export interface EmailRecipient {
  email: string;
  name?: string;
}

export class EmailMessage extends Message {
  constructor(
    id: string,
    status: MessageStatus,
    priority: MessagePriority,
    createdAt: Date,
    public readonly from: EmailRecipient,
    public readonly to: EmailRecipient[],
    public readonly subject: string,
    public readonly body: string,
    public readonly isHtml: boolean = true,
    public readonly cc?: EmailRecipient[],
    public readonly bcc?: EmailRecipient[],
    public readonly attachments?: EmailAttachment[],
    public readonly replyTo?: string,
    public readonly templateName?: string,
    public readonly templateData?: Record<string, any>,
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
      MessageType.EMAIL,
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
    from: EmailRecipient;
    to: EmailRecipient[];
    subject: string;
    body: string;
    isHtml?: boolean;
    cc?: EmailRecipient[];
    bcc?: EmailRecipient[];
    attachments?: EmailAttachment[];
    replyTo?: string;
    templateName?: string;
    templateData?: Record<string, any>;
    priority?: MessagePriority;
    metadata?: MessageMetadata;
    userId?: string;
    traceId?: string;
  }): EmailMessage {
    return new EmailMessage(
      this.generateId(),
      MessageStatus.PENDING,
      params.priority || MessagePriority.NORMAL,
      new Date(),
      params.from,
      params.to,
      params.subject,
      params.body,
      params.isHtml !== undefined ? params.isHtml : true,
      params.cc,
      params.bcc,
      params.attachments,
      params.replyTo,
      params.templateName,
      params.templateData,
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

    if (!this.from?.email) {
      errors.push('From email is required');
    }

    if (!this.to || this.to.length === 0) {
      errors.push('At least one recipient is required');
    }

    if (!this.subject || this.subject.trim() === '') {
      errors.push('Subject is required');
    }

    if (!this.body || this.body.trim() === '') {
      errors.push('Body is required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (this.from?.email && !emailRegex.test(this.from.email)) {
      errors.push('Invalid from email format');
    }

    this.to?.forEach((recipient, index) => {
      if (!emailRegex.test(recipient.email)) {
        errors.push(`Invalid recipient email at position ${index}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      from: this.from,
      to: this.to,
      subject: this.subject,
      body: this.body,
      isHtml: this.isHtml,
      cc: this.cc,
      bcc: this.bcc,
      attachments: this.attachments?.map(att => ({
        filename: att.filename,
        contentType: att.contentType,
        hasContent: !!att.content
      })),
      replyTo: this.replyTo,
      templateName: this.templateName,
      templateData: this.templateData
    };
  }
}
