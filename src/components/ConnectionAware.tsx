import React, { useState, useEffect, ReactNode } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ConnectionAwareProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const ConnectionAware: React.FC<ConnectionAwareProps> = ({ 
  children, 
  fallback 
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionQuality, setConnectionQuality] = useState<'fast' | 'slow' | 'offline'>('fast');
  const [retryAttempts, setRetryAttempts] = useState(0);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) {
        setRetryAttempts(0);
        checkConnectionQuality();
      } else {
        setConnectionQuality('offline');
      }
    };

    const checkConnectionQuality = async () => {
      if (!navigator.onLine) return;
      
      try {
        const start = Date.now();
        await fetch('/api/ping', { cache: 'no-cache' }).catch(() => {
          // Fallback to a reliable external endpoint
          return fetch('https://www.google.com/favicon.ico', { 
            mode: 'no-cors',
            cache: 'no-cache'
          });
        });
        const duration = Date.now() - start;
        
        setConnectionQuality(duration < 1000 ? 'fast' : 'slow');
      } catch {
        setConnectionQuality('slow');
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Check connection quality on mount
    checkConnectionQuality();
    
    // Periodic connection quality check
    const interval = setInterval(checkConnectionQuality, 30000);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(interval);
    };
  }, []);

  const handleRetry = () => {
    setRetryAttempts(prev => prev + 1);
    window.location.reload();
  };

  if (!isOnline || connectionQuality === 'offline') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
              <WifiOff className="w-8 h-8 text-destructive" />
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Connection Lost
              </h2>
              <p className="text-muted-foreground">
                Please check your internet connection and try again.
              </p>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={handleRetry} 
                className="w-full gap-2"
                disabled={retryAttempts >= 3}
              >
                <RefreshCw className="w-4 h-4" />
                {retryAttempts >= 3 ? 'Max Retries Reached' : 'Retry Connection'}
              </Button>
              
              {fallback && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-3">
                    Limited offline functionality available:
                  </p>
                  {fallback}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Wifi className="w-4 h-4" />
              <span>Attempts: {retryAttempts}/3</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`connection-quality-${connectionQuality}`}>
      {connectionQuality === 'slow' && (
        <div className="bg-orange-600/10 border border-orange-600/20 p-2 text-center">
          <p className="text-sm text-orange-600">
            Slow connection detected. Some features may be limited.
          </p>
        </div>
      )}
      {children}
    </div>
  );
};