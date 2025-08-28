import { useState, useEffect } from 'react';
import { ResponsiveDashboardLayout } from '@/components/ResponsiveDashboardLayout';
import { KioskStatusCard } from '@/components/KioskStatusCard';
import { QueueOverview } from '@/components/QueueOverview';
import { SelfHealingLog } from '@/components/SelfHealingLog';
import { AIInsightsPanel } from '@/components/AIInsightsPanel';
import { mockKiosks, mockTickets, mockAgents, mockHealthEvents } from '@/data/mockData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Monitor, 
  Users, 
  Activity, 
  Brain,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const [kiosks, setKiosks] = useState(mockKiosks);
  const [tickets, setTickets] = useState(mockTickets);
  const [agents, setAgents] = useState(mockAgents);
  const [healthEvents, setHealthEvents] = useState(mockHealthEvents);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate metric changes
      setKiosks(prevKiosks => 
        prevKiosks.map(kiosk => ({
          ...kiosk,
          metrics: {
            ...kiosk.metrics,
            cpu: Math.max(10, Math.min(95, kiosk.metrics.cpu + (Math.random() - 0.5) * 5)),
            memory: Math.max(10, Math.min(95, kiosk.metrics.memory + (Math.random() - 0.5) * 3)),
            networkLatency: Math.max(5, Math.min(500, kiosk.metrics.networkLatency + (Math.random() - 0.5) * 10))
          },
          lastHeartbeat: kiosk.status !== 'offline' ? new Date().toISOString() : kiosk.lastHeartbeat
        }))
      );
      
      // Update queue positions
      setTickets(prevTickets => 
        prevTickets.map(ticket => ({
          ...ticket,
          estimatedWaitTime: Math.max(1, ticket.estimatedWaitTime - 0.5)
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setLastRefresh(new Date());
    // In a real app, this would trigger a data refresh from the API
  };

  return (
    <ResponsiveDashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">System Overview</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            className="gap-2 min-h-11 touch-manipulation w-full sm:w-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Data</span>
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto sm:h-10">
            <TabsTrigger 
              value="overview" 
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-3 sm:py-2 min-h-11 sm:min-h-0 text-xs sm:text-sm touch-manipulation"
            >
              <Monitor className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Home</span>
            </TabsTrigger>
            <TabsTrigger 
              value="queues" 
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-3 sm:py-2 min-h-11 sm:min-h-0 text-xs sm:text-sm touch-manipulation"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Queue Management</span>
              <span className="sm:hidden">Queue</span>
            </TabsTrigger>
            <TabsTrigger 
              value="healing" 
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-3 sm:py-2 min-h-11 sm:min-h-0 text-xs sm:text-sm touch-manipulation"
            >
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Self-Healing</span>
              <span className="sm:hidden">Health</span>
            </TabsTrigger>
            <TabsTrigger 
              value="ai" 
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-3 sm:py-2 min-h-11 sm:min-h-0 text-xs sm:text-sm touch-manipulation"
            >
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">AI Insights</span>
              <span className="sm:hidden">AI</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <Monitor className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <span className="text-sm sm:text-base">Kiosk Status Monitor</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {kiosks.map((kiosk) => (
                  <KioskStatusCard key={kiosk.id} kiosk={kiosk} />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              <QueueOverview tickets={tickets} agents={agents} />
              <AIInsightsPanel />
            </div>
          </TabsContent>

          <TabsContent value="queues" className="space-y-4 sm:space-y-6">
            <QueueOverview tickets={tickets} agents={agents} />
          </TabsContent>

          <TabsContent value="healing" className="space-y-4 sm:space-y-6">
            <SelfHealingLog events={healthEvents} />
          </TabsContent>

          <TabsContent value="ai" className="space-y-4 sm:space-y-6">
            <AIInsightsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </ResponsiveDashboardLayout>
  );
};

export default Dashboard;