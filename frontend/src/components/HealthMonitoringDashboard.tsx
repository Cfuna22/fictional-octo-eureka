import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Server, 
  Wifi, 
  Battery, 
  Clock, 
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp
} from 'lucide-react';

interface SystemHealth {
  overall: number;
  components: {
    api_connectivity: number;
    payment_gateway: number;
    vtu_services: number;
    database: number;
    queue_system: number;
  };
  alerts: Alert[];
  metrics: {
    response_time: number;
    success_rate: number;
    active_transactions: number;
    queue_length: number;
    uptime: number;
  };
}

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export const HealthMonitoringDashboard: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth>({
    overall: 95,
    components: {
      api_connectivity: 98,
      payment_gateway: 92,
      vtu_services: 89,
      database: 99,
      queue_system: 96
    },
    alerts: [],
    metrics: {
      response_time: 1.2,
      success_rate: 94.8,
      active_transactions: 12,
      queue_length: 8,
      uptime: 99.7
    }
  });

  const [realtimeData, setRealtimeData] = useState({
    currentLoad: 45,
    memoryUsage: 62,
    networkLatency: 85,
    batteryLevel: 87
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate fluctuating metrics
      setRealtimeData(prev => ({
        currentLoad: Math.max(20, Math.min(90, prev.currentLoad + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(30, Math.min(85, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        networkLatency: Math.max(50, Math.min(200, prev.networkLatency + (Math.random() - 0.5) * 20)),
        batteryLevel: Math.max(20, Math.min(100, prev.batteryLevel - 0.1))
      }));

      // Simulate occasional health changes
      if (Math.random() < 0.1) {
        setHealth(prev => ({
          ...prev,
          overall: Math.max(80, Math.min(100, prev.overall + (Math.random() - 0.5) * 5)),
          metrics: {
            ...prev.metrics,
            response_time: Math.max(0.5, Math.min(5.0, prev.metrics.response_time + (Math.random() - 0.5) * 0.3)),
            success_rate: Math.max(85, Math.min(100, prev.metrics.success_rate + (Math.random() - 0.5) * 2))
          }
        }));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (score: number) => {
    if (score >= 95) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getStatusIcon = (score: number) => {
    if (score >= 95) return <CheckCircle className="w-4 h-4" />;
    if (score >= 80) return <AlertCircle className="w-4 h-4" />;
    return <XCircle className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Overall Health Score */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            System Health Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${getStatusColor(health.overall)}`}>
                {getStatusIcon(health.overall)}
              </div>
              <div>
                <p className="text-2xl font-bold">{health.overall.toFixed(1)}%</p>
                <p className="text-muted-foreground">Overall Health</p>
              </div>
            </div>
            <Badge variant={health.overall >= 95 ? 'default' : health.overall >= 80 ? 'secondary' : 'destructive'}>
              {health.overall >= 95 ? 'Excellent' : health.overall >= 80 ? 'Good' : 'Needs Attention'}
            </Badge>
          </div>
          <Progress value={health.overall} className="h-2" />
        </CardContent>
      </Card>

      {/* Component Health Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(health.components).map(([component, score]) => (
          <Card key={component}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium capitalize">
                  {component.replace('_', ' ')}
                </span>
                {getStatusIcon(score)}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Health Score</span>
                  <span className="font-medium">{score.toFixed(1)}%</span>
                </div>
                <Progress value={score} className="h-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Server className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CPU Load</p>
                <p className="text-lg font-bold">{realtimeData.currentLoad.toFixed(1)}%</p>
              </div>
            </div>
            <Progress value={realtimeData.currentLoad} className="h-1 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Memory</p>
                <p className="text-lg font-bold">{realtimeData.memoryUsage.toFixed(1)}%</p>
              </div>
            </div>
            <Progress value={realtimeData.memoryUsage} className="h-1 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Wifi className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Network</p>
                <p className="text-lg font-bold">{realtimeData.networkLatency.toFixed(0)}ms</p>
              </div>
            </div>
            <Progress 
              value={Math.max(0, 100 - (realtimeData.networkLatency - 50))} 
              className="h-1 mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Battery className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Battery</p>
                <p className="text-lg font-bold">{realtimeData.batteryLevel.toFixed(0)}%</p>
              </div>
            </div>
            <Progress value={realtimeData.batteryLevel} className="h-1 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Key Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Key Performance Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{health.metrics.response_time.toFixed(1)}s</p>
              <p className="text-sm text-muted-foreground">Avg Response</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{health.metrics.success_rate.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Success Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{health.metrics.active_transactions}</p>
              <p className="text-sm text-muted-foreground">Active Transactions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{health.metrics.queue_length}</p>
              <p className="text-sm text-muted-foreground">Queue Length</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-600">{health.metrics.uptime.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Alerts */}
      {health.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {health.alerts.map((alert) => (
                <Alert key={alert.id}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="flex justify-between items-center">
                    <span>{alert.message}</span>
                    <Badge variant={alert.type === 'error' ? 'destructive' : 'secondary'}>
                      {alert.type}
                    </Badge>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Auto-Recovery Status */}
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <div>
              <p className="font-medium text-green-800">Self-Healing Systems Active</p>
              <p className="text-sm text-green-600">
                Automatic component recovery and failover protection enabled
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};