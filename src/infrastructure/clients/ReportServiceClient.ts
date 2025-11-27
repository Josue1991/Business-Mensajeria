import axios from 'axios';
import { IReportServiceClient } from '@application/usecases/SendEmailWithReport';

export class ReportServiceClient implements IReportServiceClient {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string
  ) {}

  async getReportFile(reportId: string, format: string): Promise<Buffer> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/reports/${reportId}/download`,
        {
          params: { format },
          headers: {
            'x-api-key': this.apiKey
          },
          responseType: 'arraybuffer'
        }
      );

      return Buffer.from(response.data);
    } catch (error: any) {
      throw new Error(`Failed to fetch report: ${error.message}`);
    }
  }
}
