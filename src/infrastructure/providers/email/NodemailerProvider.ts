import nodemailer, { Transporter } from 'nodemailer';
import { IEmailProvider } from './IEmailProvider';
import { EmailAttachment } from '@domain/entities/EmailMessage';

export class NodemailerProvider implements IEmailProvider {
  private transporter: Transporter;

  constructor(
    private readonly smtpHost: string,
    private readonly smtpPort: number,
    private readonly smtpSecure: boolean,
    private readonly smtpUser: string,
    private readonly smtpPassword: string
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.smtpHost,
      port: this.smtpPort,
      secure: this.smtpSecure,
      auth: {
        user: this.smtpUser,
        pass: this.smtpPassword
      }
    });
  }

  async send(params: {
    from: { email: string; name?: string };
    to: { email: string; name?: string }[];
    subject: string;
    body: string;
    isHtml: boolean;
    cc?: { email: string; name?: string }[];
    bcc?: { email: string; name?: string }[];
    attachments?: EmailAttachment[];
    replyTo?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const mailOptions: any = {
        from: params.from.name 
          ? `"${params.from.name}" <${params.from.email}>`
          : params.from.email,
        to: params.to.map(r => r.name ? `"${r.name}" <${r.email}>` : r.email).join(', '),
        subject: params.subject,
        replyTo: params.replyTo
      };

      if (params.isHtml) {
        mailOptions.html = params.body;
      } else {
        mailOptions.text = params.body;
      }

      if (params.cc && params.cc.length > 0) {
        mailOptions.cc = params.cc.map(r => r.name ? `"${r.name}" <${r.email}>` : r.email).join(', ');
      }

      if (params.bcc && params.bcc.length > 0) {
        mailOptions.bcc = params.bcc.map(r => r.name ? `"${r.name}" <${r.email}>` : r.email).join(', ');
      }

      if (params.attachments && params.attachments.length > 0) {
        mailOptions.attachments = params.attachments.map(att => ({
          filename: att.filename,
          content: att.content,
          path: att.path,
          contentType: att.contentType
        }));
      }

      const info = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}
