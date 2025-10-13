import { useState, useEffect } from 'react';
import { QueueTicket, ServiceAgent } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Users, 
  UserCheck, 
  TrendingUp,
  CheckCircle2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { queueService } from '@/services/queueService';
import { toast } from '@/hooks/use-toast';

interface QueueOverviewProps {
  refreshInterval?: number;
}

export function QueueOverview({ 
  refreshInterval = 100000
}: QueueOverviewProps) {
  const [tickets, setTickets] = useState<QueueTicket[]>([]);
  const [agents, setAgents] = useState<ServiceAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [callingNext, setCallingNext] = useState<string | null>(null);
  const [currentAgent, setCurrentAgent] = useState<ServiceAgent | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      console.log('🔄 Starting fetchData, currentAgent:', currentAgent?.id);
      
      const [ticketsData, agentsData] = await Promise.all([
        queueService.getQueue(),
        queueService.getAgents()
      ]);
      
      console.log('📊 Agents data received:', agentsData.map(a => ({ id: a.id, name: a.name })));
      
      setTickets(ticketsData);
      setAgents(agentsData);
    } catch (err: any) {
      console.error('Failed to fetch queue data:', err);
      setError(err.message || 'Failed to load queue data');
      toast({
        title: "Error",
        description: "Failed to load queue data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Auto-select agent when agents change and no agent is selected
  useEffect(() => {
    if (!currentAgent && agents.length > 0) {
      const firstAvailableAgent = agents.find(agent => agent.status === 'available');
      console.log('🎯 Auto-selecting agent:', firstAvailableAgent?.id);
      setCurrentAgent(firstAvailableAgent || agents[0]);
    }
  }, [agents, currentAgent]);

  useEffect(() => {
    fetchData();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  const handleCallNext = async (serviceType: string) => {
    if (!currentAgent) {
      toast({
        title: "Agent Required",
        description: "Please select an agent to call next ticket",
        variant: "destructive"
      });
      return;
    }

    // Debug: Log the service type and available tickets
    const waitingForThisService = waitingTickets.filter(ticket => 
      ticket.service_type === serviceType
    );
    
    console.log('🎯 Calling next for service:', serviceType);
    console.log('📋 Waiting tickets for this service:', waitingForThisService);
    console.log('👤 Using agent:', currentAgent.id, currentAgent.name);
    console.log('🔧 All service types in tickets:', [...new Set(tickets.map(t => t.service_type))]);

    setCallingNext(serviceType);

    try {
      const result = await queueService.callNextTicket(currentAgent.id, serviceType);
      
      if (result.nextTicket) {
        toast({
          title: "Ticket Called",
          description: `Called ${result.nextTicket.customer_name} (${result.nextTicket.ticket_number})`,
          variant: "default"
        });
      } else {
        // Check if there really are waiting tickets
        if (waitingForThisService.length > 0) {
          toast({
            title: "Call Failed",
            description: `No ticket returned for ${serviceType}, but ${waitingForThisService.length} tickets are waiting. Check backend service.`,
            variant: "destructive"
          });
        } else {
          toast({
            title: "No Tickets",
            description: `No waiting tickets for ${serviceType}`,
            variant: "default"
          });
        }
      }

      await fetchData();

    } catch (err: any) {
      console.error('Failed to call next ticket:', err);
      
      // More specific error handling
      if (waitingForThisService.length > 0) {
        toast({
          title: "Call Failed",
          description: `Failed to call next ticket for ${serviceType}. ${waitingForThisService.length} tickets are waiting. Error: ${err.message}`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "No Tickets", 
          description: `No waiting tickets for ${serviceType}`,
          variant: "default"
        });
      }
    } finally {
      setCallingNext(null);
    }
  };

  const waitingTickets = tickets.filter(t => t.status === 'waiting');
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress');
  
  const averageWaitTime = waitingTickets.length
    ? Math.round(
        waitingTickets.reduce((acc, t) => acc + (t.estimated_wait_time || 0), 0) / waitingTickets.length
      )
    : 0;
  
  const availableAgents = agents.filter(a => a.status === 'available');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive';
      case 'high': return 'bg-warning';
      case 'normal': return 'bg-primary';
      case 'low': return 'bg-muted';
      default: return 'bg-muted';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'text-warning';
      case 'called': return 'text-primary';
      case 'in_progress': return 'text-success';
      case 'completed': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const ticketsByService = waitingTickets.reduce((acc, ticket) => {
    const serviceType = ticket.service_type || 'Unknown Service';
    if (!acc[serviceType]) {
      acc[serviceType] = [];
    }
    acc[serviceType].push(ticket);
    return acc;
  }, {} as Record<string, QueueTicket[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading queue data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Agent Selection */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Selected Agent</p>
              {currentAgent ? (
                <div className="flex items-center gap-3">
                  <p className="text-lg font-bold text-foreground">{currentAgent.name}</p>
                  <Badge 
                    variant={currentAgent.status === 'available' ? 'default' : 'secondary'}
                    className={
                      currentAgent.status === 'available' 
                        ? 'bg-green-500 text-white' 
                        : currentAgent.status === 'busy'
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-500 text-white'
                    }
                  >
                    {currentAgent.status}
                  </Badge>
                </div>
              ) : (
                <p className="text-lg font-bold text-destructive">No agent selected</p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <select 
                value={currentAgent?.id || ''}
                onChange={(e) => {
                  const agent = agents.find(a => a.id === e.target.value);
                  console.log('👤 Manually selected agent:', agent?.id, agent?.name);
                  setCurrentAgent(agent || null);
                }}
                className="border rounded px-3 py-2 text-sm min-w-48 bg-background"
              >
                <option value="">Select an agent...</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.status})
                  </option>
                ))}
              </select>
              
              {currentAgent && (
                <div className="text-sm text-muted-foreground hidden sm:block">
                  Skills: {currentAgent.skills?.join(', ') || 'General'}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Queue Dashboard</h2>
        <Button 
          onClick={fetchData} 
          variant="outline" 
          size="sm"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Queue Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-gradient-card border-border">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Waiting</p>
                <p className="text-xl sm:text-3xl font-bold text-warning">{waitingTickets.length}</p>
              </div>
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-warning shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">In Progress</p>
                <p className="text-xl sm:text-3xl font-bold text-primary">{inProgressTickets.length}</p>
              </div>
              <UserCheck className="w-6 h-6 sm:w-8 sm:h-8 text-primary shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Avg Wait</p>
                <p className="text-xl sm:text-3xl font-bold text-foreground">{averageWaitTime}m</p>
              </div>
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-primary shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Available Agents</p>
                <p className="text-xl sm:text-3xl font-bold text-success">{availableAgents.length}</p>
              </div>
              <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-success shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Queue - Grouped by Service Type */}
      <Card className="bg-gradient-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Active Queue ({waitingTickets.length} waiting)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.keys(ticketsByService).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No customers waiting in queue
              </div>
            ) : (
              Object.entries(ticketsByService).map(([serviceType, serviceTickets]) => (
                <div key={serviceType} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg text-foreground">{serviceType}</h3>
                      <Badge variant="outline" className="text-xs">
                        {serviceTickets.length} waiting
                      </Badge>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleCallNext(serviceType)}
                      disabled={!currentAgent || callingNext === serviceType}
                      className="min-w-24 min-h-9 touch-manipulation text-xs"
                    >
                      {callingNext === serviceType ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Calling...
                        </>
                      ) : (
                        'Call Next'
                      )}
                    </Button>
                  </div>
                  
                  {serviceTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 p-3 sm:p-4 bg-secondary/50 rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
                          {ticket.position}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm sm:text-base text-foreground truncate">
                            {ticket.customer_name || 'Unknown Customer'}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            Ticket: {ticket.ticket_number} • {ticket.phone}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        <Badge className={`${getPriorityColor(ticket.priority)} text-white text-xs shrink-0`}>
                          {ticket.priority}
                        </Badge>
                        <div className="text-right">
                          <p className="text-xs sm:text-sm font-medium">
                            ~{ticket.estimated_wait_time}min
                          </p>
                          <p className={`text-xs ${getStatusColor(ticket.status)}`}>
                            {ticket.status?.replace('_', ' ') || 'unknown'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className={`p-3 sm:p-4 rounded-lg border ${
                  currentAgent?.id === agent.id 
                    ? 'bg-primary/10 border-primary' 
                    : 'bg-secondary/50 border-border'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm sm:text-base text-foreground truncate pr-2">
                    {agent.name}
                    {currentAgent?.id === agent.id && (
                      <span className="ml-2 text-xs text-primary">(Selected)</span>
                    )}
                  </h4>
                  <Badge 
                    variant={agent.status === 'available' ? 'default' : 'secondary'}
                    className={`shrink-0 text-xs ${
                      agent.status === 'available' 
                        ? 'bg-gradient-success text-white' 
                        : agent.status === 'busy'
                        ? 'bg-warning text-warning-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {agent.status}
                  </Badge>
                </div>
                <div className="space-y-1 text-xs sm:text-sm text-muted-foreground">
                  <p>Efficiency: {agent.efficiency ?? 0}%</p>
                  <p>Served Today: {agent.totalServed ?? 0}</p>
                  <p className="truncate">Skills: {agent.skills?.join(', ') || 'N/A'}</p>
                  {agent.currentTicket && (
                    <p className="text-primary truncate">
                      Current: Ticket #{agent.currentTicket.slice(-3)}
                    </p>
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
