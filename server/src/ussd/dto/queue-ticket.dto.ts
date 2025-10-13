import { IsString, IsOptional } from 'class-validator';

export class QueueTicketDto {
  id: string;
  phone: string;
  customer_name: string;
  service_type: string;
  ticket_number: string;
  status: string;
  created_at: Date;
  position: number;
  estimated_wait_time: number;
  priority: string;
}

export class CallNextTicketDto {
  @IsString()
  agentId: string;

  @IsString()
  @IsOptional()
  serviceType?: string;
}

export interface ServiceAgent {
  id: string;
  name: string;
  status: 'available' | 'busy' | 'offline';
  efficiency?: number;
  total_served?: number;
  skills?: string[];
  current_ticket?: string;
  created_at?: string;
}
