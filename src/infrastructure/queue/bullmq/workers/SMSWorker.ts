import { Worker, Job } from 'bullmq';
import { Redis } from 'ioredis';
import { IMessageRepository } from '@domain/repositories/IMessageRepository';
import { ISMSProvider } from '@infrastructure/providers/sms/ISMSProvider';
import { SMSMessage } from '@domain/entities/SMSMessage';

export class SMSWorker {
  private worker: Worker;

  constructor(
    queueName: string,
    connection: Redis,
    private readonly messageRepository: IMessageRepository,
    private readonly smsProvider: ISMSProvider
  ) {
    this.worker = new Worker(
      queueName,
      async (job: Job) => this.processJob(job),
      { connection }
    );

    this.worker.on('completed', (job) => {
      console.log(`SMS job ${job.id} completed`);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`SMS job ${job?.id} failed:`, err);
    });
  }

  private async processJob(job: Job): Promise<void> {
    const { messageId } = job.data;

    const message = await this.messageRepository.findById(messageId);
    if (!message || !(message instanceof SMSMessage)) {
      throw new Error('SMS message not found');
    }

    message.markAsSending();
    await this.messageRepository.update(message);

    const result = await this.smsProvider.send({
      from: message.from,
      to: message.to,
      body: message.body
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
