import twilio, { Twilio } from 'twilio';
import { ISMSProvider } from './ISMSProvider';

export class TwilioProvider implements ISMSProvider {
  private client: Twilio;

  constructor(
    private readonly accountSid: string,
    private readonly authToken: string,
    private readonly defaultFrom: string
  ) {
    this.client = twilio(accountSid, authToken);
  }

  async send(params: {
    from: string;
    to: string;
    body: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const message = await this.client.messages.create({
        from: params.from || this.defaultFrom,
        to: params.to,
        body: params.body
      });

      return {
        success: true,
        messageId: message.sid
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}
