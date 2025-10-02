import { useState } from 'react';
import { ResponsiveDashboardLayout } from '@/components/ResponsiveDashboardLayout';
import { ResponsiveContainer, ResponsiveCardGrid } from '@/components/ResponsiveGrid';
import { KioskStatusCard } from '@/components/KioskStatusCard';
import { QueueOverview } from '@/components/QueueOverview';
import { SelfHealingLog } from '@/components/SelfHealingLog';
import { AIInsightsPanel } from '@/components/AIInsightsPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, Users, Activity, Brain, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { gql, useQuery } from '@apollo/client';

// ✅ Supabase GraphQL query (Relay-style)
const GET_DASHBOARD_DATA = gql`
  query GetDashboardData {
    kiosksCollection {
      edges {
        node {
          id
          name
          status
          location
          last_heartbeat
          metrics
          active_queue
          total_processed
        }
      }
    }
    ticketsCollection {
      edges {
        node {
          id
          customer_name
          service_type
          status
          estimated_wait_time
          created_at
        }
      }
    }
    service_agentsCollection {
      edges {
        node {
          id
          name
          specialization
          status
        }
      }
    }
    health_eventsCollection {
      edges {
        node {
          id
          event_type
          description
          severity
          detected_at
        }
      }
    }
  }
`;

const Dashboard = () => {
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // 🟢 Fetch live data
  const { data, loading, error, refetch } = useQuery(GET_DASHBOARD_DATA, {
    fetchPolicy: 'network-only', // always get fresh data
  });

  if (loading) return <p className="p-4">Loading dashboard...</p>;
  if (error) return <p className="p-4 text-red-500">Error: {error.message}</p>;

  // ✅ Unwrap Relay-style edges → node
  const kiosks = data?.kiosksCollection?.edges.map((e: any) => e.node) ?? [];
  const tickets = data?.ticketsCollection?.edges.map((e: any) => e.node) ?? [];
  const agents = data?.service_agentsCollection?.edges.map((e: any) => e.node) ?? [];
  const healthEvents = data?.health_eventsCollection?.edges.map((e: any) => e.node) ?? [];

  const handleRefresh = () => {
    setLastRefresh(new Date());
    refetch(); // 🔄 refresh data from Supabase
  };

  return (
    <ResponsiveDashboardLayout>
      <ResponsiveContainer>
        <div className="space-y-4 md:space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
            <div>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground">
                System Overview
              </h2>
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

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-4 md:space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto md:h-10">
              <TabsTrigger value="overview">
                <Monitor className="w-4 h-4" />
                <span className="hidden md:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="queues">
                <Users className="w-4 h-4" />
                <span className="hidden md:inline">Queue Management</span>
              </TabsTrigger>
              <TabsTrigger value="healing">
                <Activity className="w-4 h-4" />
                <span className="hidden md:inline">Self-Healing</span>
              </TabsTrigger>
              <TabsTrigger value="ai">
                <Brain className="w-4 h-4" />
                <span className="hidden md:inline">AI Insights</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 md:space-y-6">
              <div>
                <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 flex items-center gap-2">
                  <Monitor className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  <span>Kiosk Status Monitor</span>
                </h3>
                <ResponsiveCardGrid>
                  {kiosks.map((kiosk: any) => (
                    <KioskStatusCard key={kiosk.id} kiosk={kiosk} />
                  ))}
                </ResponsiveCardGrid>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
                <QueueOverview tickets={tickets} agents={agents} />
                <AIInsightsPanel />
              </div>
            </TabsContent>

            {/* Queues Tab */}
            <TabsContent value="queues" className="space-y-4 md:space-y-6">
              <QueueOverview tickets={tickets} agents={agents} />
            </TabsContent>

            {/* Healing Tab */}
            <TabsContent value="healing" className="space-y-4 md:space-y-6">
              <SelfHealingLog events={healthEvents} />
            </TabsContent>

            {/* AI Tab */}
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
