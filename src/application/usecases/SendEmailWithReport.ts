import { SendEmailDTO, EmailWithReportDTO } from '../dto/MessageDTO';
import { SendEmailUseCase } from './SendEmail';
import axios from 'axios';

export interface IReportServiceClient {
  getReportFile(reportId: string, format: string): Promise<Buffer>;
}

export class SendEmailWithReportUseCase {
  constructor(
    private readonly sendEmailUseCase: SendEmailUseCase,
    private readonly reportServiceClient: IReportServiceClient
  ) {}

  async execute(dto: EmailWithReportDTO): Promise<any> {
    // Fetch report from Business-Report service
    const reportFormat = dto.reportFormat || 'pdf';
    const reportBuffer = await this.reportServiceClient.getReportFile(
      dto.reportId,
      reportFormat
    );

    // Create attachment
    const attachment = {
      filename: `report_${dto.reportId}.${reportFormat}`,
      content: reportBuffer,
      contentType: this.getContentType(reportFormat)
    };

    // Add attachment to email
    const emailDto: SendEmailDTO = {
      ...dto,
      attachments: [...(dto.attachments || []), attachment]
    };

    // Send email with attachment
    return this.sendEmailUseCase.execute(emailDto);
  }

  private getContentType(format: string): string {
    const contentTypes: Record<string, string> = {
      pdf: 'application/pdf',
      excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      csv: 'text/csv'
    };
    return contentTypes[format] || 'application/octet-stream';
  }
}
