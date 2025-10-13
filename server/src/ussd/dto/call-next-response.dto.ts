import { QueueTicketDto } from './queue-ticket.dto';

export class CallNextTicketResponseDto {
  currentTicket: QueueTicketDto | null;
  nextTicket: QueueTicketDto | null;
  message: string;
}
