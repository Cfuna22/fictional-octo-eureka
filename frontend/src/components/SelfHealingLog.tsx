import { HealthEvent } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  RefreshCw, 
  Trash2, 
  Power, 
  ArrowRight, 
  AlertTriangle,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface SelfHealingLogProps {
  events: HealthEvent[];
}

export function SelfHealingLog({ events }: SelfHealingLogProps) {
  const getEventIcon = (type: HealthEvent['type']) => {
    switch (type) {
      case 'auto_restart': return <RefreshCw className="w-4 h-4" />;
      case 'cache_clear': return <Trash2 className="w-4 h-4" />;
      case 'reboot': return <Power className="w-4 h-4" />;
      case 'ticket_reassignment': return <ArrowRight className="w-4 h-4" />;
      case 'alert_escalation': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: HealthEvent['type'], success: boolean) => {
    if (!success) return 'bg-destructive';

    switch (type) {
      case 'auto_restart': return 'bg-primary';
      case 'cache_clear': return 'bg-success';
      case 'reboot': return 'bg-warning';
      case 'ticket_reassignment': return 'bg-primary';
      case 'alert_escalation': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getTimeAgo = (timestamp?: string) => {
    if (!timestamp) return 'N/A';
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <Card className="bg-gradient-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary animate-glow" />
          Self-Healing Activity Log
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Automated remediation actions taken by the system
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No recent self-healing events
            </div>
          ) : (
            events.map((event) => {
              const kioskLabel = event.kioskId?.split('-')[1] ?? 'N/A';
              return (
                <div
                  key={event.id}
                  className="flex items-start gap-4 p-4 bg-secondary/30 rounded-lg border border-border"
                >
                  <div className={`p-2 rounded-lg ${getEventColor(event.type, event.success)} text-white`}>
                    {getEventIcon(event.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        Kiosk {kioskLabel}
                      </Badge>
                      <Badge 
                        className={`text-xs ${
                          event.success 
                            ? 'bg-gradient-success text-white' 
                            : 'bg-destructive text-white'
                        }`}
                      >
                        {event.success ? (
                          <><CheckCircle2 className="w-3 h-3 mr-1" /> Success</>
                        ) : (
                          <><XCircle className="w-3 h-3 mr-1" /> Failed</>
                        )}
                      </Badge>
                    </div>

                    <p className="text-sm font-medium text-foreground mb-1">
                      {event.description ?? 'No description'}
                    </p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <p>{formatTimestamp(event.timestamp)}</p>
                      <p>{getTimeAgo(event.timestamp)}</p>
                    </div>

                    {event.details && (
                      <div className="mt-2 p-2 bg-background/50 rounded text-xs text-muted-foreground">
                        <pre className="whitespace-pre-wrap">
                          {JSON.stringify(event.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}

