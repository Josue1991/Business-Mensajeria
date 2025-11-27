import { Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { IMessageRepository } from '@domain/repositories/IMessageRepository';
import { IEmailProvider } from '@infrastructure/providers/email/IEmailProvider';
import { EmailMessage } from '@domain/entities/EmailMessage';

export class EmailWorker {
  private worker: Worker;

  constructor(
    queueName: string,
    connection: Redis,
    private readonly messageRepository: IMessageRepository,
    private readonly emailProvider: IEmailProvider
  ) {
    this.worker = new Worker(
      queueName,
      async (job: Job) => this.processJob(job),
      { connection }
    );

    this.worker.on('completed', (job) => {
      console.log(`Email job ${job.id} completed`);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`Email job ${job?.id} failed:`, err);
    });
  }

  private async processJob(job: Job): Promise<void> {
    const { messageId } = job.data;

    const message = await this.messageRepository.findById(messageId);
    if (!message || !(message instanceof EmailMessage)) {
      throw new Error('Email message not found');
    }

    message.markAsSending();
    await this.messageRepository.update(message);

    const result = await this.emailProvider.send({
      from: message.from,
      to: message.to,
      subject: message.subject,
      body: message.body,
      isHtml: message.isHtml,
      cc: message.cc,
      bcc: message.bcc,
      attachments: message.attachments,
      replyTo: message.replyTo
    });

    if (result.success) {
      message.markAsSent();
    } else {
      message.markAsFailed(result.error || 'Unknown error');
    }

    await this.messageRepository.update(message);
  }

  async close(): Promise<void> {
    await this.worker.close();
  }
}
