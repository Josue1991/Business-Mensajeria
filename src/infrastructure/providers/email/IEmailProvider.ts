import { EmailAttachment } from '@domain/entities/EmailMessage';

export interface IEmailProvider {
  send(params: {
    from: { email: string; name?: string };
    to: { email: string; name?: string }[];
    subject: string;
    body: string;
    isHtml: boolean;
    cc?: { email: string; name?: string }[];
    bcc?: { email: string; name?: string }[];
    attachments?: EmailAttachment[];
    replyTo?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }>;
}
