export interface ISMSProvider {
  send(params: {
    from: string;
    to: string;
    body: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }>;
}
