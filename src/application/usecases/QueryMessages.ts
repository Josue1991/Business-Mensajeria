import { IMessageRepository, MessageQuery } from '@domain/repositories/IMessageRepository';
import { QueryMessagesDTO, MessageQueryResultDTO, MessageResponseDTO } from '../dto/MessageDTO';
import { Message } from '@domain/entities/Message';

export class QueryMessagesUseCase {
  constructor(private readonly messageRepository: IMessageRepository) {}

  async execute(dto: QueryMessagesDTO): Promise<MessageQueryResultDTO> {
    const query: MessageQuery = {
      type: dto.type,
      status: dto.status as any,
      userId: dto.userId,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      traceId: dto.traceId,
      limit: dto.limit || 50,
      offset: dto.offset || 0
    };

    const result = await this.messageRepository.query(query);

    return {
      messages: result.messages.map(msg => this.mapToDTO(msg)),
      total: result.total,
      hasMore: result.hasMore,
      limit: query.limit!,
      offset: query.offset!
    };
  }

  async getById(id: string): Promise<MessageResponseDTO | null> {
    const message = await this.messageRepository.findById(id);
    return message ? this.mapToDTO(message) : null;
  }

  async getStatus(id: string): Promise<{ id: string; status: string; sentAt?: string } | null> {
    const message = await this.messageRepository.findById(id);
    if (!message) return null;

    return {
      id: message.id,
      status: message.status,
      sentAt: message.sentAt?.toISOString()
    };
  }

  private mapToDTO(message: Message): MessageResponseDTO {
    return {
      id: message.id,
      type: message.type,
      status: message.status,
      createdAt: message.createdAt.toISOString(),
      sentAt: message.sentAt?.toISOString(),
      traceId: message.traceId
    };
  }
}
