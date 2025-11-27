import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { SMSMessage } from '@domain/entities/SMSMessage';

export class SMSQueue {
  private queue: Queue;

  constructor(
    queueName: string,
    private readonly connection: Redis
  ) {
    this.queue = new Queue(queueName, { connection: this.connection });
  }

  async addJob(message: SMSMessage): Promise<void> {
    const priority = this.getPriority(message.priority);
    
    await this.queue.add(
      'send-sms',
      { messageId: message.id },
      {
        priority,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 60000 // 1 minute
        }
      }
    );
  }

  private getPriority(priority: string): number {
    const priorities: Record<string, number> = {
      URGENT: 1,
      HIGH: 2,
      NORMAL: 3,
      LOW: 4
    };
    return priorities[priority] || 3;
  }

  getQueue(): Queue {
    return this.queue;
  }
}
