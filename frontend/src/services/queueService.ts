const API_BASE_URL = 'http://localhost:3000';

export interface JoinQueueRequest {
  phone: string;
  name: string;
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

  async getQueue(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/queue`);
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to get queue');
    }

    return response.json();
  }
}

export const queueService = new QueueService();
