import { useState, useEffect } from 'react';
import { ResponsiveDashboardLayout } from '@/components/ResponsiveDashboardLayout';
import { ResponsiveContainer, ResponsiveCardGrid } from '@/components/ResponsiveGrid';
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
      <ResponsiveContainer>
        <div className="space-y-4 md:space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
            <div>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground">System Overview</h2>
              <p className="text-sm text-muted-foreground">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </p>
            </div>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              className="gap-2 min-h-[44px] touch-manipulation w-full md:w-auto"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Data</span>
            </Button>
          </div>

          <Tabs defaultValue="overview" className="space-y-4 md:space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto md:h-10">
              <TabsTrigger 
                value="overview" 
                className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-3 md:py-2 min-h-[44px] md:min-h-0 text-xs md:text-sm touch-manipulation"
              >
                <Monitor className="w-4 h-4" />
                <span className="hidden md:inline">Overview</span>
                <span className="md:hidden">Home</span>
              </TabsTrigger>
              <TabsTrigger 
                value="queues" 
                className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-3 md:py-2 min-h-[44px] md:min-h-0 text-xs md:text-sm touch-manipulation"
              >
                <Users className="w-4 h-4" />
                <span className="hidden md:inline">Queue Management</span>
                <span className="md:hidden">Queue</span>
              </TabsTrigger>
              <TabsTrigger 
                value="healing" 
                className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-3 md:py-2 min-h-[44px] md:min-h-0 text-xs md:text-sm touch-manipulation"
              >
                <Activity className="w-4 h-4" />
                <span className="hidden md:inline">Self-Healing</span>
                <span className="md:hidden">Health</span>
              </TabsTrigger>
              <TabsTrigger 
                value="ai" 
                className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-3 md:py-2 min-h-[44px] md:min-h-0 text-xs md:text-sm touch-manipulation"
              >
                <Brain className="w-4 h-4" />
                <span className="hidden md:inline">AI Insights</span>
                <span className="md:hidden">AI</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 md:space-y-6">
              <div>
                <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 flex items-center gap-2">
                  <Monitor className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  <span>Kiosk Status Monitor</span>
                </h3>
                <ResponsiveCardGrid>
                  {kiosks.map((kiosk) => (
                    <KioskStatusCard key={kiosk.id} kiosk={kiosk} />
                  ))}
                </ResponsiveCardGrid>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
                <QueueOverview tickets={tickets} agents={agents} />
                <AIInsightsPanel />
              </div>
            </TabsContent>

            <TabsContent value="queues" className="space-y-4 md:space-y-6">
              <QueueOverview tickets={tickets} agents={agents} />
            </TabsContent>

            <TabsContent value="healing" className="space-y-4 md:space-y-6">
              <SelfHealingLog events={healthEvents} />
            </TabsContent>

            <TabsContent value="ai" className="space-y-4 md:space-y-6">
              <AIInsightsPanel />
            </TabsContent>
          </Tabs>
        </div>
      </ResponsiveContainer>
    </ResponsiveDashboardLayout>
  );
};

export default Dashboard;