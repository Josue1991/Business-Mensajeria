export enum MessageType {
  EMAIL = 'EMAIL',
  SMS = 'SMS'
}

export enum MessageStatus {
  PENDING = 'PENDING',
  QUEUED = 'QUEUED',
  SENDING = 'SENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  RETRY = 'RETRY'
}

export enum MessagePriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface MessageMetadata {
  [key: string]: any;
}

export abstract class Message {
  constructor(
    public readonly id: string,
    public readonly type: MessageType,
    public status: MessageStatus,
    public readonly priority: MessagePriority,
    public readonly createdAt: Date,
    public sentAt?: Date,
    public failedAt?: Date,
    public retryCount: number = 0,
    public error?: string,
    public metadata?: MessageMetadata,
    public userId?: string,
    public traceId?: string
  ) {}

  abstract validate(): { valid: boolean; errors: string[] };

  markAsQueued(): void {
    this.status = MessageStatus.QUEUED;
  }

  markAsSending(): void {
    this.status = MessageStatus.SENDING;
  }

  markAsSent(): void {
    this.status = MessageStatus.SENT;
    this.sentAt = new Date();
  }

  markAsFailed(error: string): void {
    this.status = MessageStatus.FAILED;
    this.failedAt = new Date();
    this.error = error;
  }

  incrementRetry(): void {
    this.retryCount++;
    this.status = MessageStatus.RETRY;
  }

  canRetry(maxRetries: number): boolean {
    return this.retryCount < maxRetries;
  }

  toJSON(): Record<string, any> {
    return {
      id: this.id,
      type: this.type,
      status: this.status,
      priority: this.priority,
      createdAt: this.createdAt.toISOString(),
      sentAt: this.sentAt?.toISOString(),
      failedAt: this.failedAt?.toISOString(),
      retryCount: this.retryCount,
      error: this.error,
      metadata: this.metadata,
      userId: this.userId,
      traceId: this.traceId
    };
  }

  protected static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
