import { MessageType, MessagePriority } from '@domain/entities/Message';
import { EmailRecipient, EmailAttachment } from '@domain/entities/EmailMessage';

export interface SendEmailDTO {
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
  userId?: string;
  traceId?: string;
  metadata?: Record<string, any>;
}

export interface SendSMSDTO {
  from: string;
  to: string;
  body: string;
  priority?: MessagePriority;
  userId?: string;
  traceId?: string;
  metadata?: Record<string, any>;
}

export interface SendBulkEmailDTO {
  emails: SendEmailDTO[];
}

export interface SendBulkSMSDTO {
  messages: SendSMSDTO[];
}

export interface MessageResponseDTO {
  id: string;
  type: MessageType;
  status: string;
  createdAt: string;
  sentAt?: string;
  traceId?: string;
}

export interface QueryMessagesDTO {
  type?: MessageType;
  status?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  traceId?: string;
  limit?: number;
  offset?: number;
}

export interface MessageQueryResultDTO {
  messages: MessageResponseDTO[];
  total: number;
  hasMore: boolean;
  limit: number;
  offset: number;
}

export interface EmailWithReportDTO extends SendEmailDTO {
  reportId: string;
  reportFormat?: 'pdf' | 'excel' | 'csv';
}
