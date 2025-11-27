import { MongoClient, Db, Collection } from 'mongodb';
import { IMessageRepository, MessageQuery, MessageQueryResult } from '@domain/repositories/IMessageRepository';
import { Message, MessageStatus, MessageType } from '@domain/entities/Message';
import { EmailMessage, EmailRecipient, EmailAttachment } from '@domain/entities/EmailMessage';
import { SMSMessage } from '@domain/entities/SMSMessage';

interface MessageDocument {
  _id: string;
  type: string;
  status: string;
  priority: string;
  createdAt: Date;
  sentAt?: Date;
  failedAt?: Date;
  retryCount: number;
  error?: string;
  metadata?: any;
  userId?: string;
  traceId?: string;
  // Email specific
  from?: any;
  to?: any[];
  subject?: string;
  body?: string;
  isHtml?: boolean;
  cc?: any[];
  bcc?: any[];
  attachments?: any[];
  replyTo?: string;
  templateName?: string;
  templateData?: any;
}

export class MongoMessageRepository implements IMessageRepository {
  private db: Db | null = null;
  private collection: Collection<MessageDocument> | null = null;

  constructor(
    private readonly connectionString: string,
    private readonly dbName: string
  ) {}

  async connect(): Promise<void> {
    const client = await MongoClient.connect(this.connectionString);
    this.db = client.db(this.dbName);
    this.collection = this.db.collection<MessageDocument>('messages');

    // Create indexes
    await this.collection.createIndex({ createdAt: -1 });
    await this.collection.createIndex({ status: 1 });
    await this.collection.createIndex({ type: 1 });
    await this.collection.createIndex({ userId: 1 });
    await this.collection.createIndex({ traceId: 1 });
  }

  async save(message: Message): Promise<void> {
    if (!this.collection) throw new Error('Database not connected');

    const document = this.toDocument(message);
    await this.collection.insertOne(document);
  }

  async saveBatch(messages: Message[]): Promise<void> {
    if (!this.collection) throw new Error('Database not connected');

    const documents = messages.map(msg => this.toDocument(msg));
    await this.collection.insertMany(documents);
  }

  async findById(id: string): Promise<Message | null> {
    if (!this.collection) throw new Error('Database not connected');

    const document = await this.collection.findOne({ _id: id });
    return document ? this.toDomain(document) : null;
  }

  async query(query: MessageQuery): Promise<MessageQueryResult> {
    if (!this.collection) throw new Error('Database not connected');

    const filter: any = {};

    if (query.type) filter.type = query.type;
    if (query.status) filter.status = query.status;
    if (query.userId) filter.userId = query.userId;
    if (query.traceId) filter.traceId = query.traceId;

    if (query.startDate || query.endDate) {
      filter.createdAt = {};
      if (query.startDate) filter.createdAt.$gte = query.startDate;
      if (query.endDate) filter.createdAt.$lte = query.endDate;
    }

    const limit = query.limit || 50;
    const offset = query.offset || 0;

    const [documents, total] = await Promise.all([
      this.collection
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .toArray(),
      this.collection.countDocuments(filter)
    ]);

    const messages = documents.map(doc => this.toDomain(doc));

    return {
      messages,
      total,
      hasMore: offset + documents.length < total
    };
  }

  async update(message: Message): Promise<void> {
    if (!this.collection) throw new Error('Database not connected');

    const document = this.toDocument(message);
    await this.collection.updateOne(
      { _id: message.id },
      { $set: document }
    );
  }

  async deleteOlderThan(date: Date): Promise<number> {
    if (!this.collection) throw new Error('Database not connected');

    const result = await this.collection.deleteMany({
      createdAt: { $lt: date }
    });

    return result.deletedCount;
  }

  async count(query?: Partial<MessageQuery>): Promise<number> {
    if (!this.collection) throw new Error('Database not connected');

    const filter: any = {};
    if (query?.type) filter.type = query.type;
    if (query?.status) filter.status = query.status;

    return this.collection.countDocuments(filter);
  }

  async getFailedMessages(limit: number = 100): Promise<Message[]> {
    if (!this.collection) throw new Error('Database not connected');

    const documents = await this.collection
      .find({ status: MessageStatus.FAILED })
      .sort({ failedAt: -1 })
      .limit(limit)
      .toArray();

    return documents.map(doc => this.toDomain(doc));
  }

  private toDocument(message: Message): MessageDocument {
    const baseDoc: MessageDocument = {
      _id: message.id,
      type: message.type,
      status: message.status,
      priority: message.priority,
      createdAt: message.createdAt,
      sentAt: message.sentAt,
      failedAt: message.failedAt,
      retryCount: message.retryCount,
      error: message.error,
      metadata: message.metadata,
      userId: message.userId,
      traceId: message.traceId
    };

    if (message instanceof EmailMessage) {
      return {
        ...baseDoc,
        from: message.from,
        to: message.to,
        subject: message.subject,
        body: message.body,
        isHtml: message.isHtml,
        cc: message.cc,
        bcc: message.bcc,
        attachments: message.attachments,
        replyTo: message.replyTo,
        templateName: message.templateName,
        templateData: message.templateData
      };
    } else if (message instanceof SMSMessage) {
      return {
        ...baseDoc,
        from: message.from,
        to: [message.to],
        body: message.body
      };
    }

    return baseDoc;
  }

  private toDomain(document: MessageDocument): Message {
    if (document.type === MessageType.EMAIL) {
      return new EmailMessage(
        document._id,
        document.status as MessageStatus,
        document.priority as any,
        document.createdAt,
        document.from as EmailRecipient,
        document.to as EmailRecipient[],
        document.subject!,
        document.body!,
        document.isHtml,
        document.cc as EmailRecipient[],
        document.bcc as EmailRecipient[],
        document.attachments as EmailAttachment[],
        document.replyTo,
        document.templateName,
        document.templateData,
        document.sentAt,
        document.failedAt,
        document.retryCount,
        document.error,
        document.metadata,
        document.userId,
        document.traceId
      );
    } else {
      return new SMSMessage(
        document._id,
        document.status as MessageStatus,
        document.priority as any,
        document.createdAt,
        document.from as string,
        document.to![0] as string,
        document.body!,
        document.sentAt,
        document.failedAt,
        document.retryCount,
        document.error,
        document.metadata,
        document.userId,
        document.traceId
      );
    }
  }
}
