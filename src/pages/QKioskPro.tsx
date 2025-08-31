import React, { useState, useEffect } from 'react';
import { ConnectionAware } from '@/components/ConnectionAware';
import { SelfHealingVtuService } from '@/components/SelfHealingVtuService';
import { PriorityComponentLoader } from '@/components/PriorityComponentLoader';
import { HealthMonitoringDashboard } from '@/components/HealthMonitoringDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, Smartphone, Receipt, Clock, Battery, Wifi, QrCode } from 'lucide-react';
import QRCode from 'qrcode';

interface QueueData {
  currentTicket: string;
  nowServing: string;
  waitTime: number;
  queueLength: number;
  estimatedServiceTime: string;
}

const QKioskPro: React.FC = () => {
  const [activeService, setActiveService] = useState<'queue' | 'vtu' | 'bills' | 'health'>('queue');
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [batteryLevel] = useState(85);
  const [connectionQuality, setConnectionQuality] = useState<'fast' | 'slow' | 'offline'>('fast');
  
  const [queueData, setQueueData] = useState<QueueData>({
    currentTicket: 'T-054',
    nowServing: 'T-048',
    waitTime: 25,
    queueLength: 6,
    estimatedServiceTime: '3:45 PM'
  });

  // Simulate real-time queue updates
  useEffect(() => {
    const interval = setInterval(() => {
      setQueueData(prev => ({
        ...prev,
        waitTime: Math.max(1, prev.waitTime - 1),
        nowServing: Math.random() > 0.7 ? `T-${String(parseInt(prev.nowServing.slice(2)) + 1).padStart(3, '0')}` : prev.nowServing
      }));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Simulate connection quality changes
  useEffect(() => {
    const interval = setInterval(() => {
      const qualities: ('fast' | 'slow' | 'offline')[] = ['fast', 'fast', 'fast', 'slow', 'fast']; // Bias towards fast
      setConnectionQuality(qualities[Math.floor(Math.random() * qualities.length)]);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const generateQueueTicket = async () => {
    const newTicketNumber = `T-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`;
    const mobileUrl = `${window.location.origin}/ticket/${newTicketNumber}`;
    
    try {
      const qrDataUrl = await QRCode.toDataURL(mobileUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#0F172A',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(qrDataUrl);
      setQueueData(prev => ({ ...prev, currentTicket: newTicketNumber, queueLength: prev.queueLength + 1 }));
      setShowQRModal(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  // Define components for priority loading
  const components = [
    {
      id: 'queue-status',
      component: () => (
        <Card className="bg-gradient-to-r from-primary to-primary-foreground">
          <CardContent className="p-6 text-center text-white">
            <h2 className="text-3xl font-bold mb-2">Now Serving</h2>
            <p className="text-5xl font-mono font-bold mb-2">{queueData.nowServing}</p>
            <p className="text-lg opacity-90">Queue Length: {queueData.queueLength} people</p>
          </CardContent>
        </Card>
      ),
      priority: 5,
      bandwidth_requirement: 'low' as const,
    },
    {
      id: 'vtu-service',
      component: SelfHealingVtuService,
      priority: 3,
      bandwidth_requirement: 'medium' as const,
    },
    {
      id: 'health-dashboard',
      component: HealthMonitoringDashboard,
      priority: 1,
      bandwidth_requirement: 'high' as const,
    }
  ];

  const StatusBar = () => (
    <div className="bg-background border-b border-border px-6 py-3 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Wifi className="w-5 h-5 text-muted-foreground" />
          <div className="flex space-x-1">
            {[1, 2, 3, 4].map((bar) => (
              <div
                key={bar}
                className={`w-1 h-4 rounded ${
                  connectionQuality === 'fast' ? 'bg-green-500' :
                  connectionQuality === 'slow' ? 'bg-yellow-500' : 'bg-red-500'
                }`}
              />
            ))}
          </div>
        </div>
        <Badge variant={connectionQuality === 'fast' ? 'default' : 'secondary'}>
          {connectionQuality === 'offline' ? 'Offline' : '4G'}
        </Badge>
      </div>
      
      <div className="flex items-center space-x-2">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <span className="text-lg font-mono text-foreground">
          {new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          })}
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <Battery className="w-5 h-5 text-muted-foreground" />
        <span className={`text-sm ${batteryLevel < 20 ? 'text-red-400' : 'text-green-400'}`}>
          {batteryLevel}%
        </span>
      </div>
    </div>
  );

  const ServiceNavigation = () => (
    <div className="flex gap-2 mb-6 overflow-x-auto">
      {[
        { id: 'queue', label: 'Queue', icon: Users },
        { id: 'vtu', label: 'VTU Services', icon: Smartphone },
        { id: 'bills', label: 'Bill Payment', icon: Receipt },
        { id: 'health', label: 'System Health', icon: Battery }
      ].map(({ id, label, icon: Icon }) => (
        <Button
          key={id}
          variant={activeService === id ? 'default' : 'outline'}
          onClick={() => setActiveService(id as any)}
          className="flex items-center gap-2 whitespace-nowrap"
        >
          <Icon className="w-4 h-4" />
          {label}
        </Button>
      ))}
    </div>
  );

  const renderMainContent = () => {
    switch (activeService) {
      case 'queue':
        return (
          <div className="space-y-6">
            {/* Main Queue Action */}
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Welcome to Q-Kiosk Pro
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground">
                Advanced Queue Management with Self-Healing Technology
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
                <Button
                  onClick={generateQueueTicket}
                  className="w-full h-48 bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground p-0"
                >
                  <CardContent className="p-8 text-center space-y-4">
                    <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                      <Users className="w-10 h-10" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold mb-2">JOIN THE QUEUE</h2>
                      <p className="text-xl opacity-90">Get your smart ticket</p>
                    </div>
                  </CardContent>
                </Button>
              </Card>

              <PriorityComponentLoader
                components={[components[0]]} // Queue status component
                connectionQuality={connectionQuality}
                batteryLevel={batteryLevel}
              />
            </div>
          </div>
        );

      case 'vtu':
        return (
          <PriorityComponentLoader
            components={[components[1]]} // VTU service component
            connectionQuality={connectionQuality}
            batteryLevel={batteryLevel}
          />
        );

      case 'health':
        return (
          <PriorityComponentLoader
            components={[components[2]]} // Health dashboard component
            connectionQuality={connectionQuality}
            batteryLevel={batteryLevel}
          />
        );

      default:
        return (
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
              <p className="text-muted-foreground">This service is under development</p>
            </CardContent>
          </Card>
        );
    }
  };

  const OfflineFallback = () => (
    <Card>
      <CardContent className="p-6 text-center">
        <h3 className="text-lg font-bold mb-2">Offline Queue System</h3>
        <p className="text-muted-foreground mb-4">
          Limited functionality available without internet connection
        </p>
        <Button onClick={generateQueueTicket} variant="outline" className="w-full">
          Generate Offline Ticket
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <ConnectionAware fallback={<OfflineFallback />}>
      <div className="h-screen flex flex-col bg-background">
        <StatusBar />
        
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-4 md:p-6 max-w-6xl">
            <ServiceNavigation />
            {renderMainContent()}
          </div>
        </main>

        {/* QR Code Modal */}
        <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl flex items-center gap-2 justify-center">
                <QrCode className="w-6 h-6" />
                Smart Queue Ticket
              </DialogTitle>
            </DialogHeader>
            <div className="text-center space-y-6 p-4">
              <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-6">
                <h2 className="text-4xl font-bold text-primary mb-2">{queueData.currentTicket}</h2>
                <p className="text-muted-foreground">Your ticket number</p>
              </div>
              
              <div className="space-y-4">
                <p className="text-lg font-semibold">
                  Scan for real-time updates on your phone
                </p>
                {qrCodeUrl && (
                  <div className="flex justify-center">
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code for mobile tracking" 
                      className="border-2 border-border rounded-lg shadow-lg"
                    />
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Self-healing technology ensures continuous service even during network issues
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center bg-muted rounded-lg p-4">
                <div>
                  <p className="text-2xl font-bold">{queueData.queueLength}</p>
                  <p className="text-sm text-muted-foreground">People ahead</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">~{queueData.waitTime} min</p>
                  <p className="text-sm text-muted-foreground">Est. wait time</p>
                </div>
              </div>

              <Button 
                onClick={() => setShowQRModal(false)}
                className="w-full"
                size="lg"
              >
                Done
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ConnectionAware>
  );
};

export default QKioskPro;