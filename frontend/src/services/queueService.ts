const API_BASE_URL = 'http://localhost:3000';

export interface JoinQueueRequest {
  phone: string;
  name: string;
  serviceType?: string;
}

export interface JoinQueueResponse {
  id: string;
  position: number;
  newUser: boolean;
}

export interface QueuePosition {
  phone: string;
  position: number;
}

export interface QueueTicket {
  id: string;
  phone: string;
  customer_name: string;
  service_type: string;
  ticket_number: string;
  status: string;
  created_at: string;
  position: number;
  estimated_wait_time: number;
  priority: string;
  called_at?: string;
  completed_at?: string;
  agent_id?: string;
}

export interface ServiceAgent {
  id: string;
  name: string;
  status: 'available' | 'busy' | 'offline';
  efficiency?: number;
  totalServed?: number;
  skills?: string[];
  currentTicket?: string;
  specialization?: string;
}

// Single QueueService class that combines all methods
class QueueService {
  async joinQueue(data: JoinQueueRequest): Promise<JoinQueueResponse> {
    const response = await fetch(`${API_BASE_URL}/queue/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to join queue');
    }

    return response.json();
  }

  async getQueuePosition(phone: string): Promise<QueuePosition> {
    const response = await fetch(`${API_BASE_URL}/queue/position/${encodeURIComponent(phone)}`);
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to get queue position');
    }

    return response.json();
  }

  async getQueue(): Promise<QueueTicket[]> {
    const response = await fetch(`${API_BASE_URL}/queue`);
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to get queue');
    }

    return response.json();
  }

  async getAgents(): Promise<ServiceAgent[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/ussd/agents`);
      
      if (!response.ok) {
        // If endpoint doesn't exist, use mock data
        if (response.status === 404) {
          console.warn('Agents endpoint not found, using mock data');
          return this.getMockAgents();
        }
        const error = await response.text();
        throw new Error(`HTTP ${response.status}: ${error || 'Failed to get agents'}`);
      }

      const agents = await response.json();
      
      // Fallback to mock data if no agents returned
      if (!agents || agents.length === 0) {
        return this.getMockAgents();
      }
      
      console.log('✅ Successfully fetched real agents from API:', agents);

      return agents;
    } catch (error) {
      console.warn('Failed to fetch agents from API, using mock data:', error);
      
      if (error.message?.includes('Failed to fetch') || error.message?.includes('Network')) {
      console.warn('Network error, using mock data');
      return this.getMockAgents();
    }
  }
  }

  private getMockAgents(): ServiceAgent[] {
  return [
    {
      id: '9233e1d3-4d1b-4bfa-b593-6d149eb39172',
      name: 'John Agent',
      status: 'available',
      efficiency: 85,
      totalServed: 12,
      skills: ['Account Opening', 'General Inquiry'],
      currentTicket: 'T000123'
    },
    {
      id: '43f143af-f237-4296-8099-3ce58b364233',
      name: 'Sarah Manager',
      status: 'busy',
      efficiency: 92,
      totalServed: 18,
      skills: ['Loan Application', 'Business Services'],
      currentTicket: 'T000456'
    },
    {
      id: '19b4204e-f4db-4a75-b0f1-0e81d69b313f',
      name: 'Mike Specialist',
      status: 'available',
      efficiency: 78,
      totalServed: 8,
      skills: ['Investment Consultation'],
    }
  ];
}
  async callNextTicket(agentId: string, serviceType?: string): Promise<{
    currentTicket: QueueTicket | null;
    nextTicket: QueueTicket | null;
    message: string;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/ussd/call-next`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId,
          serviceType
        }),
      });

      // Check if endpoint exists (404 means endpoint doesn't exist yet)
      if (response.status === 404) {
        console.log('Call-next endpoint not found, using mock implementation');
        return await this.mockCallNextTicket(agentId, serviceType);
      }

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to call next ticket');
      }

      return response.json();
    } catch (error) {
      console.error('Failed to call next ticket, using mock implementation:', error);
      return await this.mockCallNextTicket(agentId, serviceType);
    }
  }

  private async mockCallNextTicket(agentId: string, serviceType?: string): Promise<{
    currentTicket: QueueTicket | null;
    nextTicket: QueueTicket | null;
    message: string;
  }> {
    console.log('Using mock call next implementation for agent:', agentId, 'service:', serviceType);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const currentQueue = await this.getQueue();
    const waitingTickets = currentQueue.filter(t => t.status === 'waiting');
    
    const nextTicket = serviceType 
      ? waitingTickets.find(t => t.service_type === serviceType)
      : waitingTickets[0];

    if (!nextTicket) {
      return {
        currentTicket: null,
        nextTicket: null,
        message: `No waiting tickets${serviceType ? ` for ${serviceType}` : ''}`,
      };
    }

    const mockUpdatedTicket = {
      ...nextTicket,
      status: 'in_progress',
      agent_id: agentId,
      called_at: new Date().toISOString(),
    };

    return {
      currentTicket: null,
      nextTicket: mockUpdatedTicket,
      message: `Called ticket ${mockUpdatedTicket.ticket_number} for ${mockUpdatedTicket.customer_name}`,
    };
  }
}

export const queueService = new QueueService();
