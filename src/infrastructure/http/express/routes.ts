import { Router, Request, Response } from 'express';
import { SendEmailUseCase } from '@application/usecases/SendEmail';
import { SendSMSUseCase } from '@application/usecases/SendSMS';
import { QueryMessagesUseCase } from '@application/usecases/QueryMessages';
import { RetryFailedMessageUseCase } from '@application/usecases/RetryFailedMessage';
import { SendEmailWithReportUseCase } from '@application/usecases/SendEmailWithReport';
import { SendEmailDTO, SendSMSDTO, QueryMessagesDTO, EmailWithReportDTO } from '@application/dto/MessageDTO';

export function createMessageRoutes(
  sendEmailUseCase: SendEmailUseCase,
  sendSMSUseCase: SendSMSUseCase,
  queryMessagesUseCase: QueryMessagesUseCase,
  retryFailedMessageUseCase: RetryFailedMessageUseCase,
  sendEmailWithReportUseCase: SendEmailWithReportUseCase
): Router {
  const router = Router();

  // Send single email
  router.post('/email', async (req: Request, res: Response) => {
    try {
      const dto: SendEmailDTO = req.body;
      const result = await sendEmailUseCase.execute(dto);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Send batch emails
  router.post('/email/batch', async (req: Request, res: Response) => {
    try {
      const dtos: SendEmailDTO[] = req.body;
      const result = await sendEmailUseCase.executeBatch(dtos);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Send email with report
  router.post('/email/with-report', async (req: Request, res: Response) => {
    try {
      const dto: EmailWithReportDTO = req.body;
      const result = await sendEmailWithReportUseCase.execute(dto);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Send single SMS
  router.post('/sms', async (req: Request, res: Response) => {
    try {
      const dto: SendSMSDTO = req.body;
      const result = await sendSMSUseCase.execute(dto);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Send batch SMS
  router.post('/sms/batch', async (req: Request, res: Response) => {
    try {
      const dtos: SendSMSDTO[] = req.body;
      const result = await sendSMSUseCase.executeBatch(dtos);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Query messages
  router.get('/', async (req: Request, res: Response) => {
    try {
      const dto: QueryMessagesDTO = {
        type: req.query.type as any,
        status: req.query.status as string,
        userId: req.query.userId as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        traceId: req.query.traceId as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
      };

      const result = await queryMessagesUseCase.execute(dto);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get message by ID
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const result = await queryMessagesUseCase.getById(req.params.id);
      if (!result) {
        return res.status(404).json({ error: 'Message not found' });
      }
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get message status
  router.get('/:id/status', async (req: Request, res: Response) => {
    try {
      const result = await queryMessagesUseCase.getStatus(req.params.id);
      if (!result) {
        return res.status(404).json({ error: 'Message not found' });
      }
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Retry failed message
  router.post('/:id/retry', async (req: Request, res: Response) => {
    try {
      const result = await retryFailedMessageUseCase.execute(req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Retry all failed messages
  router.post('/retry/all', async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const result = await retryFailedMessageUseCase.retryAllFailed(limit);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  return router;
}
