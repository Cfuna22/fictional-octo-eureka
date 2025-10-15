import { Kiosk } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Monitor, 
  Cpu, 
  HardDrive, 
  Wifi, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  Users
} from 'lucide-react';

interface KioskStatusCardProps {
  kiosk: any; // Changed from Kiosk to any to handle backend data structure
}

export function KioskStatusCard({ kiosk }: KioskStatusCardProps) {
  // Safely access properties with fallbacks
  const status = kiosk.status || 'unknown';
  const metrics = kiosk.metrics || {};
  const cpu = metrics.cpu || 0;
  const memory = metrics.memory || 0;
  const diskSpace = metrics.diskSpace || 0;
  const networkLatency = metrics.networkLatency || 0;
  const activeQueue = kiosk.active_queue || kiosk.activeQueue || 0;
  const totalProcessed = kiosk.total_processed || kiosk.totalProcessed || 0;
  const lastHeartbeat = kiosk.last_heartbeat || kiosk.lastHeartbeat;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-gradient-success';
      case 'warning': return 'bg-warning';
      case 'critical': return 'bg-destructive';
      case 'offline': return 'bg-muted';
      default: return 'bg-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle2 className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'critical': return <AlertTriangle className="w-5 h-5" />;
      case 'offline': return <Monitor className="w-5 h-5" />;
      default: return <Monitor className="w-5 h-5" />;
    }
  };

  const getLastHeartbeatText = (timestamp: string) => {
    if (!timestamp) return 'Unknown';
    
    try {
      const diff = Date.now() - new Date(timestamp).getTime();
      const minutes = Math.floor(diff / 60000);
      if (minutes < 1) return 'Just now';
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      return `${hours}h ${minutes % 60}m ago`;
    } catch (error) {
      return 'Unknown';
    }
  };

  return (
    <Card className="bg-gradient-card border-border shadow-card hover:shadow-glow transition-all duration-300 h-full">
      {/* Mobile View (320px-768px) - Compact Layout */}
      <div className="md:hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-foreground truncate">
              {kiosk.name}
            </CardTitle>
            <Badge 
              className={`${getStatusColor(status)} text-white font-medium flex items-center gap-1 text-xs`}
            >
              {getStatusIcon(status)}
              <span className="hidden sm:inline">{status.toUpperCase()}</span>
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate">{kiosk.location}</p>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Primary Mobile Metrics - Queue Focus */}
          <div className="bg-accent/20 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Queue: {activeQueue}</span>
              </div>
              <span className="text-xs text-muted-foreground">Served: {totalProcessed}</span>
            </div>
            {status === 'critical' && (
              <button className="w-full bg-destructive text-white py-2 px-3 rounded text-xs font-medium">
                Emergency Override
              </button>
            )}
          </div>

          {/* Expandable Details */}
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              System Details
              <AlertTriangle className="w-4 h-4 group-open:rotate-180 transition-transform" />
            </summary>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span>CPU: {cpu}%</span>
                <Progress value={cpu} className="h-1 w-16" />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Memory: {memory}%</span>
                <Progress value={memory} className="h-1 w-16" />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Storage: {diskSpace}%</span>
                <Progress value={diskSpace} className="h-1 w-16" />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Latency: {networkLatency}ms</span>
                <Progress value={Math.max(0, 100 - (networkLatency / 10))} className="h-1 w-16" />
              </div>
            </div>
          </details>

          {/* Last Heartbeat */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{getLastHeartbeatText(lastHeartbeat)}</span>
            </div>
            {status === 'healthy' && (
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            )}
          </div>
        </CardContent>
      </div>

      {/* Tablet View (769px-1024px) - Balanced Layout */}
      <div className="hidden md:block lg:hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground">
              {kiosk.name}
            </CardTitle>
            <Badge 
              className={`${getStatusColor(status)} text-white font-medium flex items-center gap-1`}
            >
              {getStatusIcon(status)}
              {status.toUpperCase()}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{kiosk.location}</p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Tablet System Metrics - 2 Column */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Cpu className="w-4 h-4 text-primary shrink-0" />
                <span>CPU: {cpu}%</span>
              </div>
              <Progress value={cpu} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <HardDrive className="w-4 h-4 text-primary shrink-0" />
                <span>Memory: {memory}%</span>
              </div>
              <Progress value={memory} className="h-2" />
            </div>
          </div>

          {/* Queue Stats */}
          <div className="flex justify-between items-center pt-2 border-t border-border">
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-primary shrink-0" />
              <span>Queue: {activeQueue}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Served: {totalProcessed}
            </div>
          </div>

          {/* Last Heartbeat & Status */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Last seen: {getLastHeartbeatText(lastHeartbeat)}</span>
            </div>
            {status === 'healthy' && (
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            )}
          </div>
        </CardContent>
      </div>

      {/* Desktop View (1025px+) - Full Detail Layout */}
      <div className="hidden lg:block">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground">
              {kiosk.name}
            </CardTitle>
            <Badge 
              className={`${getStatusColor(status)} text-white font-medium flex items-center gap-1`}
            >
              {getStatusIcon(status)}
              {status.toUpperCase()}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{kiosk.location}</p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Desktop System Metrics - Full Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Cpu className="w-4 h-4 text-primary shrink-0" />
                <span>CPU: {cpu}%</span>
              </div>
              <Progress value={cpu} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <HardDrive className="w-4 h-4 text-primary shrink-0" />
                <span>Memory: {memory}%</span>
              </div>
              <Progress value={memory} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <HardDrive className="w-4 h-4 text-primary shrink-0" />
                <span>Storage: {diskSpace}%</span>
              </div>
              <Progress value={diskSpace} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Wifi className="w-4 h-4 text-primary shrink-0" />
                <span>Latency: {networkLatency}ms</span>
              </div>
              <Progress 
                value={Math.max(0, 100 - (networkLatency / 10))} 
                className="h-2" 
              />
            </div>
          </div>

          {/* Queue Stats */}
          <div className="flex justify-between items-center pt-2 border-t border-border">
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-primary shrink-0" />
              <span>Queue: {activeQueue}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Served: {totalProcessed}
            </div>
          </div>

          {/* Last Heartbeat */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Last seen: {getLastHeartbeatText(lastHeartbeat)}</span>
            </div>
            {status === 'healthy' && (
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            )}
          </div>

          {/* AI Predictions */}
          {kiosk.predictions && (
            <div className="pt-2 border-t border-border">
              <div className="text-xs font-medium text-warning mb-1">AI Predictions:</div>
              {kiosk.predictions.memoryExhaustionTime && (
                <div className="text-xs text-muted-foreground">
                  Memory exhaustion in {kiosk.predictions.memoryExhaustionTime}
                </div>
              )}
              {kiosk.predictions.diskFullTime && (
                <div className="text-xs text-muted-foreground">
                  Disk full in {kiosk.predictions.diskFullTime}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
}
