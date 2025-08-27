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
  kiosk: Kiosk;
}

export function KioskStatusCard({ kiosk }: KioskStatusCardProps) {
  const getStatusColor = (status: Kiosk['status']) => {
    switch (status) {
      case 'healthy': return 'bg-gradient-success';
      case 'warning': return 'bg-warning';
      case 'critical': return 'bg-destructive';
      case 'offline': return 'bg-muted';
      default: return 'bg-muted';
    }
  };

  const getStatusIcon = (status: Kiosk['status']) => {
    switch (status) {
      case 'healthy': return <CheckCircle2 className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'critical': return <AlertTriangle className="w-5 h-5" />;
      case 'offline': return <Monitor className="w-5 h-5" />;
      default: return <Monitor className="w-5 h-5" />;
    }
  };

  const getLastHeartbeatText = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m ago`;
  };

  return (
    <Card className="bg-gradient-card border-border shadow-card hover:shadow-glow transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            {kiosk.name}
          </CardTitle>
          <Badge 
            className={`${getStatusColor(kiosk.status)} text-white font-medium flex items-center gap-1`}
          >
            {getStatusIcon(kiosk.status)}
            {kiosk.status.toUpperCase()}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{kiosk.location}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* System Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Cpu className="w-4 h-4 text-primary" />
              <span>CPU: {kiosk.metrics.cpu}%</span>
            </div>
            <Progress value={kiosk.metrics.cpu} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <HardDrive className="w-4 h-4 text-primary" />
              <span>Memory: {kiosk.metrics.memory}%</span>
            </div>
            <Progress value={kiosk.metrics.memory} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <HardDrive className="w-4 h-4 text-primary" />
              <span>Storage: {kiosk.metrics.diskSpace}%</span>
            </div>
            <Progress value={kiosk.metrics.diskSpace} className="h-2" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Wifi className="w-4 h-4 text-primary" />
              <span>Latency: {kiosk.metrics.networkLatency}ms</span>
            </div>
            <Progress 
              value={Math.max(0, 100 - (kiosk.metrics.networkLatency / 10))} 
              className="h-2" 
            />
          </div>
        </div>

        {/* Queue Stats */}
        <div className="flex justify-between items-center pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-primary" />
            <span>Queue: {kiosk.activeQueue}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Served: {kiosk.totalProcessed}
          </div>
        </div>

        {/* Last Heartbeat */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Last seen: {getLastHeartbeatText(kiosk.lastHeartbeat)}</span>
          </div>
          {kiosk.status === 'healthy' && (
            <div className="w-2 h-2 bg-success rounded-full animate-pulse-soft"></div>
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
    </Card>
  );
}