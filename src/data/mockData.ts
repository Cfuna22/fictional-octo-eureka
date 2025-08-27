import { Kiosk, QueueTicket, ServiceAgent, HealthEvent } from '@/types';

export const mockKiosks: Kiosk[] = [
  {
    id: 'kiosk-001',
    name: 'Main Lobby - Kiosk A',
    location: 'Downtown Branch',
    status: 'healthy',
    lastHeartbeat: new Date(Date.now() - 30000).toISOString(),
    metrics: {
      cpu: 45,
      memory: 62,
      diskSpace: 78,
      networkLatency: 12
    },
    activeQueue: 8,
    totalProcessed: 127
  },
  {
    id: 'kiosk-002',
    name: 'Service Area - Kiosk B',
    location: 'Downtown Branch',
    status: 'warning',
    lastHeartbeat: new Date(Date.now() - 45000).toISOString(),
    metrics: {
      cpu: 78,
      memory: 89,
      diskSpace: 45,
      networkLatency: 156
    },
    predictions: {
      memoryExhaustionTime: '2 hours 34 minutes',
      estimatedDowntime: 15
    },
    activeQueue: 12,
    totalProcessed: 89
  },
  {
    id: 'kiosk-003',
    name: 'Express Lane - Kiosk C',
    location: 'Northside Branch',
    status: 'healthy',
    lastHeartbeat: new Date(Date.now() - 15000).toISOString(),
    metrics: {
      cpu: 23,
      memory: 34,
      diskSpace: 67,
      networkLatency: 8
    },
    activeQueue: 3,
    totalProcessed: 203
  },
  {
    id: 'kiosk-004',
    name: 'Premium Services',
    location: 'Westside Branch',
    status: 'critical',
    lastHeartbeat: new Date(Date.now() - 300000).toISOString(),
    metrics: {
      cpu: 95,
      memory: 97,
      diskSpace: 12,
      networkLatency: 890
    },
    predictions: {
      memoryExhaustionTime: '23 minutes',
      diskFullTime: '1 hour 12 minutes'
    },
    activeQueue: 0,
    totalProcessed: 56
  },
  {
    id: 'kiosk-005',
    name: 'Self-Service Hub',
    location: 'Eastside Branch',
    status: 'offline',
    lastHeartbeat: new Date(Date.now() - 900000).toISOString(),
    metrics: {
      cpu: 0,
      memory: 0,
      diskSpace: 0,
      networkLatency: 0
    },
    activeQueue: 0,
    totalProcessed: 45
  }
];

export const mockTickets: QueueTicket[] = [
  {
    id: 'ticket-001',
    customerName: 'Sarah Chen',
    serviceType: 'Account Opening',
    priority: 'normal',
    estimatedWaitTime: 12,
    status: 'waiting',
    kioskId: 'kiosk-001',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    position: 1
  },
  {
    id: 'ticket-002',
    customerName: 'Marcus Rodriguez',
    serviceType: 'Loan Application',
    priority: 'high',
    estimatedWaitTime: 8,
    status: 'called',
    kioskId: 'kiosk-001',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    position: 2
  },
  {
    id: 'ticket-003',
    customerName: 'Emily Johnson',
    serviceType: 'General Inquiry',
    priority: 'low',
    estimatedWaitTime: 18,
    status: 'waiting',
    kioskId: 'kiosk-002',
    timestamp: new Date(Date.now() - 180000).toISOString(),
    position: 3
  }
];

export const mockAgents: ServiceAgent[] = [
  {
    id: 'agent-001',
    name: 'David Park',
    status: 'busy',
    currentTicket: 'ticket-002',
    skills: ['loans', 'accounts', 'investments'],
    efficiency: 92,
    totalServed: 34
  },
  {
    id: 'agent-002',
    name: 'Lisa Thompson',
    status: 'available',
    skills: ['accounts', 'general'],
    efficiency: 87,
    totalServed: 28
  },
  {
    id: 'agent-003',
    name: 'Ahmed Hassan',
    status: 'break',
    skills: ['loans', 'mortgages', 'business'],
    efficiency: 95,
    totalServed: 41
  }
];

export const mockHealthEvents: HealthEvent[] = [
  {
    id: 'event-001',
    kioskId: 'kiosk-002',
    type: 'auto_restart',
    description: 'Automatically restarted check-in service due to memory threshold',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    success: true,
    details: { memoryUsage: 89, threshold: 85 }
  },
  {
    id: 'event-002',
    kioskId: 'kiosk-004',
    type: 'alert_escalation',
    description: 'Critical system metrics - escalated to technical staff',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    success: true,
    details: { alertsSent: ['SMS', 'Email', 'Dashboard'] }
  },
  {
    id: 'event-003',
    kioskId: 'kiosk-005',
    type: 'ticket_reassignment',
    description: 'Reassigned 4 active tickets to nearest healthy kiosks',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    success: true,
    details: { ticketsReassigned: 4, targetKiosks: ['kiosk-001', 'kiosk-003'] }
  }
];