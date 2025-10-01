export interface Kiosk {
  id: string;
  name: string;
  location: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  lastHeartbeat: string;
  metrics: {
    cpu: number;
    memory: number;
    diskSpace: number;
    networkLatency: number;
  };
  predictions?: {
    memoryExhaustionTime?: string;
    diskFullTime?: string;
    estimatedDowntime?: number;
  };
  activeQueue: number;
  totalProcessed: number;
}

export interface QueueTicket {
  id: string;
  customerName: string;
  serviceType: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  estimatedWaitTime: number;
  actualWaitTime?: number;
  status: 'waiting' | 'called' | 'in_progress' | 'completed' | 'no_show';
  kioskId: string;
  timestamp: string;
  position: number;
}

export interface ServiceAgent {
  id: string;
  name: string;
  status: 'available' | 'busy' | 'break' | 'offline';
  currentTicket?: string;
  skills: string[];
  efficiency: number;
  totalServed: number;
}

export interface HealthEvent {
  id: string;
  kioskId: string;
  type: 'auto_restart' | 'cache_clear' | 'reboot' | 'ticket_reassignment' | 'alert_escalation';
  description: string;
  timestamp: string;
  success: boolean;
  details?: any;
}