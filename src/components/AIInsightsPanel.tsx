import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  Users,
  Zap,
  Target,
  Activity
} from 'lucide-react';

export function AIInsightsPanel() {
  const insights = [
    {
      type: 'prediction',
      severity: 'info',
      title: 'Peak Hour Prediction',
      description: 'Expected 40% increase in queue volume between 2:00-4:00 PM',
      confidence: 94,
      action: 'Recommend adding 2 additional agents'
    },
    {
      type: 'optimization',
      severity: 'success',
      title: 'Route Optimization',
      description: 'AI routing reduced average wait time by 23% this morning',
      confidence: 98,
      action: 'Continue current routing algorithm'
    },
    {
      type: 'alert',
      severity: 'warning',
      title: 'Capacity Warning',
      description: 'Kiosk-002 predicted memory exhaustion in 2.5 hours',
      confidence: 87,
      action: 'Schedule maintenance during low-traffic period'
    },
    {
      type: 'efficiency',
      severity: 'info',
      title: 'Agent Performance',
      description: 'Ahmed Hassan showing 12% above-average efficiency',
      confidence: 91,
      action: 'Consider for complex transactions'
    }
  ];

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'info': return <Brain className="w-4 h-4 text-primary" />;
      default: return <Brain className="w-4 h-4 text-primary" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'border-success/30 bg-success/5';
      case 'warning': return 'border-warning/30 bg-warning/5';
      case 'info': return 'border-primary/30 bg-primary/5';
      default: return 'border-primary/30 bg-primary/5';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'prediction': return <TrendingUp className="w-3 h-3" />;
      case 'optimization': return <Target className="w-3 h-3" />;
      case 'alert': return <AlertTriangle className="w-3 h-3" />;
      case 'efficiency': return <Zap className="w-3 h-3" />;
      default: return <Brain className="w-3 h-3" />;
    }
  };

  return (
    <Card className="bg-gradient-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary animate-glow" />
          AI Insights & Predictions
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Real-time AI analysis and recommendations
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getSeverityColor(insight.severity)}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {getSeverityIcon(insight.severity)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {getTypeIcon(insight.type)}
                      {insight.type}
                    </Badge>
                    <Badge 
                      variant="secondary" 
                      className="text-xs bg-background/50"
                    >
                      {insight.confidence}% confidence
                    </Badge>
                  </div>
                  
                  <h4 className="font-medium text-foreground mb-1">
                    {insight.title}
                  </h4>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {insight.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Recommended:</span>
                    <span className="text-primary font-medium">
                      {insight.action}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* AI Performance Stats */}
        <div className="mt-6 pt-4 border-t border-border">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            AI System Performance
          </h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-success">97.2%</p>
              <p className="text-xs text-muted-foreground">Prediction Accuracy</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">23ms</p>
              <p className="text-xs text-muted-foreground">Response Time</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">156</p>
              <p className="text-xs text-muted-foreground">Actions Today</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}