import { QueueTicket, ServiceAgent } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Users, 
  UserCheck, 
  AlertCircle,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';

interface QueueOverviewProps {
  tickets: QueueTicket[];
  agents: ServiceAgent[];
}

export function QueueOverview({ tickets, agents }: QueueOverviewProps) {
  const waitingTickets = tickets.filter(t => t.status === 'waiting');
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress');
  const averageWaitTime = Math.round(
    tickets.reduce((acc, t) => acc + t.estimatedWaitTime, 0) / tickets.length
  );
  
  const availableAgents = agents.filter(a => a.status === 'available');
  const busyAgents = agents.filter(a => a.status === 'busy');

  const getPriorityColor = (priority: QueueTicket['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive';
      case 'high': return 'bg-warning';
      case 'normal': return 'bg-primary';
      case 'low': return 'bg-muted';
      default: return 'bg-muted';
    }
  };

  const getStatusColor = (status: QueueTicket['status']) => {
    switch (status) {
      case 'waiting': return 'text-warning';
      case 'called': return 'text-primary';
      case 'in_progress': return 'text-success';
      case 'completed': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Queue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Waiting</p>
                <p className="text-3xl font-bold text-warning">{waitingTickets.length}</p>
              </div>
              <Users className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-3xl font-bold text-primary">{inProgressTickets.length}</p>
              </div>
              <UserCheck className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Wait</p>
                <p className="text-3xl font-bold text-foreground">{averageWaitTime}m</p>
              </div>
              <Clock className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Agents</p>
                <p className="text-3xl font-bold text-success">{availableAgents.length}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Queue */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Active Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {waitingTickets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No customers waiting in queue
              </div>
            ) : (
              waitingTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {ticket.position}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{ticket.customerName}</p>
                      <p className="text-sm text-muted-foreground">{ticket.serviceType}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge className={`${getPriorityColor(ticket.priority)} text-white`}>
                      {ticket.priority}
                    </Badge>
                    <div className="text-right">
                      <p className="text-sm font-medium">~{ticket.estimatedWaitTime}min</p>
                      <p className={`text-xs ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      Call Next
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Agents Status */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" />
            Agent Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="p-4 bg-secondary/50 rounded-lg border border-border"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-foreground">{agent.name}</h4>
                  <Badge 
                    variant={agent.status === 'available' ? 'default' : 'secondary'}
                    className={
                      agent.status === 'available' 
                        ? 'bg-gradient-success text-white' 
                        : agent.status === 'busy'
                        ? 'bg-warning text-warning-foreground'
                        : 'bg-muted'
                    }
                  >
                    {agent.status}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Efficiency: {agent.efficiency}%</p>
                  <p>Served Today: {agent.totalServed}</p>
                  <p>Skills: {agent.skills.join(', ')}</p>
                  {agent.currentTicket && (
                    <p className="text-primary">Current: Ticket #{agent.currentTicket.slice(-3)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}