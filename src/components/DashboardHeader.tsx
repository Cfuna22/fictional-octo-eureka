import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  Settings, 
  BarChart3, 
  Activity,
  Zap,
  Monitor
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DashboardHeader() {
  const currentTime = new Date().toLocaleString();
  const navigate = useNavigate();

  return (
    <header className="bg-gradient-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg shadow-glow">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                QatalystQ
              </h1>
              <p className="text-sm text-muted-foreground">
                AI-Powered Queue Management System
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            onClick={() => navigate('/kiosk')}
            variant="outline"
            className="gap-2"
          >
            <Monitor className="w-4 h-4" />
            View Kiosk Interface
          </Button>

          <div className="text-right">
            <p className="text-sm text-muted-foreground">Current Time</p>
            <p className="text-sm font-mono text-foreground">{currentTime}</p>
          </div>

          <Badge className="bg-gradient-success text-white animate-pulse-soft">
            <Activity className="w-3 h-3 mr-1" />
            System Healthy
          </Badge>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <BarChart3 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}