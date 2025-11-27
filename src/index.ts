import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { Redis } from 'ioredis';
import { config } from '@shared/config/config';
import { logger } from '@shared/utils/logger';
import { MongoMessageRepository } from '@infrastructure/database/mongodb/MongoMessageRepository';
import { NodemailerProvider } from '@infrastructure/providers/email/NodemailerProvider';
import { TwilioProvider } from '@infrastructure/providers/sms/TwilioProvider';
import { MessageDomainService } from '@domain/services/MessageDomainService';
import { TemplateService } from '@domain/services/TemplateService';
import { SendEmailUseCase } from '@application/usecases/SendEmail';
import { SendSMSUseCase } from '@application/usecases/SendSMS';
import { QueryMessagesUseCase } from '@application/usecases/QueryMessages';
import { RetryFailedMessageUseCase } from '@application/usecases/RetryFailedMessage';
import { SendEmailWithReportUseCase } from '@application/usecases/SendEmailWithReport';
import { ReportServiceClient } from '@infrastructure/clients/ReportServiceClient';
import { EmailQueue } from '@infrastructure/queue/bullmq/EmailQueue';
import { SMSQueue } from '@infrastructure/queue/bullmq/SMSQueue';
import { EmailWorker } from '@infrastructure/queue/bullmq/workers/EmailWorker';
import { SMSWorker } from '@infrastructure/queue/bullmq/workers/SMSWorker';
import { createMessageRoutes } from '@infrastructure/http/express/routes';
import { authMiddleware } from '@infrastructure/http/express/middleware/auth.middleware';

class Server {
  private app: Application;
  private mongoRepository!: MongoMessageRepository;
  private redisConnection!: Redis;
  private emailWorker!: EmailWorker;
  private smsWorker!: SMSWorker;

  constructor() {
    this.app = express();
    this.setupMiddleware();
  }

  private setupMiddleware(): void {
    this.app.use(helmet());
    this.app.use(cors({ origin: config.server.corsOrigin }));
    this.app.use(compression());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logger
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent')
      });
      next();
    });
  }

  private async initializeDatabase(): Promise<void> {
    this.mongoRepository = new MongoMessageRepository(
      config.mongodb.uri,
      config.mongodb.dbName
    );
    await this.mongoRepository.connect();
    logger.info('MongoDB connected');
  }

  private async initializeRedis(): Promise<void> {
    this.redisConnection = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      maxRetriesPerRequest: null
    });

    this.redisConnection.on('connect', () => {
      logger.info('Redis connected');
    });

    this.redisConnection.on('error', (error) => {
      logger.error('Redis error:', error);
    });
  }

  private async initializeWorkers(): Promise<void> {
    const emailProvider = new NodemailerProvider(
      config.email.smtp.host,
      config.email.smtp.port,
      config.email.smtp.secure,
      config.email.smtp.user,
      config.email.smtp.password
    );

    const smsProvider = new TwilioProvider(
      config.sms.twilio.accountSid,
      config.sms.twilio.authToken,
      config.sms.twilio.phoneNumber
    );

    this.emailWorker = new EmailWorker(
      config.queue.emailName,
      this.redisConnection,
      this.mongoRepository,
      emailProvider
    );

    this.smsWorker = new SMSWorker(
      config.queue.smsName,
      this.redisConnection,
      this.mongoRepository,
      smsProvider
    );

    logger.info('Workers initialized');
  }

  private setupRoutes(): void {
    const messageDomainService = new MessageDomainService();
    const templateService = new TemplateService('templates');

    const emailQueue = new EmailQueue(config.queue.emailName, this.redisConnection);
    const smsQueue = new SMSQueue(config.queue.smsName, this.redisConnection);

    const sendEmailUseCase = new SendEmailUseCase(
      this.mongoRepository,
      messageDomainService,
      templateService,
      emailQueue
    );

    const sendSMSUseCase = new SendSMSUseCase(
      this.mongoRepository,
      messageDomainService,
      smsQueue
    );

    const queryMessagesUseCase = new QueryMessagesUseCase(this.mongoRepository);

    const retryFailedMessageUseCase = new RetryFailedMessageUseCase(
      this.mongoRepository,
      messageDomainService,
      emailQueue,
      smsQueue,
      config.queue.maxRetries
    );

    const reportServiceClient = new ReportServiceClient(
      config.reportService.url,
      config.reportService.apiKey
    );

    const sendEmailWithReportUseCase = new SendEmailWithReportUseCase(
      sendEmailUseCase,
      reportServiceClient
    );

    // Health check
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // Message routes
    this.app.use('/api/messages', authMiddleware, createMessageRoutes(
      sendEmailUseCase,
      sendSMSUseCase,
      queryMessagesUseCase,
      retryFailedMessageUseCase,
      sendEmailWithReportUseCase
    ));

    // 404 handler
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({ error: 'Route not found' });
    });

    // Error handler
    this.app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      logger.error('Error:', err);
      res.status(err.statusCode || 500).json({
        error: err.message || 'Internal server error'
      });
    });
  }

  public async start(): Promise<void> {
    try {
      await this.initializeDatabase();
      await this.initializeRedis();
      await this.initializeWorkers();
      this.setupRoutes();

      const port = config.server.port;
      this.app.listen(port, () => {
        logger.info(`Business-Mensajeria service running on port ${port}`);
        logger.info(`Environment: ${config.server.nodeEnv}`);
      });
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  public async stop(): Promise<void> {
    if (this.emailWorker) await this.emailWorker.close();
    if (this.smsWorker) await this.smsWorker.close();
    if (this.redisConnection) await this.redisConnection.quit();
    logger.info('Server stopped');
  }
}

// Start server
const server = new Server();
server.start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await server.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await server.stop();
  process.exit(0);
});
