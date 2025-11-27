import { Message, MessageStatus } from '../entities/Message';

export interface MessageQuery {
  type?: string;
  status?: MessageStatus;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  traceId?: string;
  limit?: number;
  offset?: number;
}

export interface MessageQueryResult {
  messages: Message[];
  total: number;
  hasMore: boolean;
}

export interface IMessageRepository {
  save(message: Message): Promise<void>;
  saveBatch(messages: Message[]): Promise<void>;
  findById(id: string): Promise<Message | null>;
  query(query: MessageQuery): Promise<MessageQueryResult>;
  update(message: Message): Promise<void>;
  deleteOlderThan(date: Date): Promise<number>;
  count(query?: Partial<MessageQuery>): Promise<number>;
  getFailedMessages(limit?: number): Promise<Message[]>;
}
