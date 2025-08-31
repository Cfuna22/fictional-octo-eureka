import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Smartphone, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VtuProvider {
  id: string;
  name: string;
  logo: string;
  status: 'active' | 'maintenance' | 'failed';
  success_rate: number;
  response_time: number;
}

interface DataBundle {
  id: string;
  name: string;
  size: string;
  price: number;
  validity: string;
}

const NIGERIAN_NETWORKS = [
  { id: 'mtn', name: 'MTN', color: 'bg-yellow-500' },
  { id: 'airtel', name: 'Airtel', color: 'bg-red-500' },
  { id: 'glo', name: 'Glo', color: 'bg-green-500' },
  { id: '9mobile', name: '9mobile', color: 'bg-blue-500' }
];

const DATA_BUNDLES: Record<string, DataBundle[]> = {
  mtn: [
    { id: 'mtn_1gb', name: '1GB', size: '1GB', price: 500, validity: '30 days' },
    { id: 'mtn_2gb', name: '2GB', size: '2GB', price: 1000, validity: '30 days' },
    { id: 'mtn_5gb', name: '5GB', size: '5GB', price: 2000, validity: '30 days' }
  ],
  airtel: [
    { id: 'airtel_1gb', name: '1GB', size: '1GB', price: 450, validity: '30 days' },
    { id: 'airtel_2gb', name: '2GB', size: '2GB', price: 900, validity: '30 days' },
    { id: 'airtel_5gb', name: '5GB', size: '5GB', price: 1800, validity: '30 days' }
  ],
  glo: [
    { id: 'glo_1gb', name: '1GB', size: '1GB', price: 400, validity: '30 days' },
    { id: 'glo_2gb', name: '2GB', size: '2GB', price: 800, validity: '30 days' },
    { id: 'glo_5gb', name: '5GB', size: '5GB', price: 1600, validity: '30 days' }
  ],
  '9mobile': [
    { id: '9mobile_1gb', name: '1GB', size: '1GB', price: 550, validity: '30 days' },
    { id: '9mobile_2gb', name: '2GB', size: '2GB', price: 1100, validity: '30 days' },
    { id: '9mobile_5gb', name: '5GB', size: '5GB', price: 2200, validity: '30 days' }
  ]
};

export const SelfHealingVtuService: React.FC = () => {
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  const [serviceType, setServiceType] = useState<'airtime' | 'data'>('airtime');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedBundle, setSelectedBundle] = useState<DataBundle | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [providers] = useState<VtuProvider[]>([
    { id: 'primary', name: 'Primary VTU', logo: '', status: 'active', success_rate: 98, response_time: 2.1 },
    { id: 'backup', name: 'Backup VTU', logo: '', status: 'active', success_rate: 95, response_time: 3.5 },
    { id: 'fallback', name: 'USSD Fallback', logo: '', status: 'active', success_rate: 85, response_time: 8.0 }
  ]);

  const { toast } = useToast();

  // Auto-detect network from phone number
  useEffect(() => {
    if (phoneNumber.length >= 4) {
      const prefix = phoneNumber.substring(0, 4);
      
      if (['0803', '0806', '0703', '0706', '0813', '0816', '0810', '0814', '0903', '0906'].includes(prefix)) {
        setSelectedNetwork('mtn');
      } else if (['0802', '0808', '0812', '0701', '0708', '0902', '0907', '0901'].includes(prefix)) {
        setSelectedNetwork('airtel');
      } else if (['0805', '0807', '0811', '0815', '0705', '0905'].includes(prefix)) {
        setSelectedNetwork('glo');
      } else if (['0809', '0817', '0818', '0909', '0908'].includes(prefix)) {
        setSelectedNetwork('9mobile');
      }
    }
  }, [phoneNumber]);

  const processTransaction = async (withProvider: VtuProvider) => {
    setIsProcessing(true);
    
    try {
      // Simulate API call with different success rates
      const success = Math.random() < (withProvider.success_rate / 100);
      
      await new Promise(resolve => 
        setTimeout(resolve, withProvider.response_time * 1000)
      );

      if (!success) {
        throw new Error(`${withProvider.name} transaction failed`);
      }

      // Success - show receipt
      toast({
        title: "Transaction Successful!",
        description: `${serviceType === 'airtime' ? '₦' + amount : selectedBundle?.size} sent to ${phoneNumber}`,
      });

      // Reset form
      setPhoneNumber('');
      setAmount('');
      setSelectedBundle(null);
      setSelectedNetwork('');
      
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTransaction = async () => {
    if (!phoneNumber || !selectedNetwork || (serviceType === 'airtime' && !amount) || (serviceType === 'data' && !selectedBundle)) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Self-healing: Try providers in order of success rate
    const sortedProviders = [...providers].sort((a, b) => b.success_rate - a.success_rate);
    
    for (let i = 0; i < sortedProviders.length; i++) {
      const provider = sortedProviders[i];
      
      if (provider.status !== 'active') continue;
      
      try {
        await processTransaction(provider);
        return; // Success, exit loop
      } catch (error) {
        console.error(`Provider ${provider.name} failed:`, error);
        
        if (i < sortedProviders.length - 1) {
          toast({
            title: "Switching Provider",
            description: `${provider.name} unavailable. Trying ${sortedProviders[i + 1].name}...`,
          });
        } else {
          // All providers failed
          toast({
            title: "Transaction Failed",
            description: "All payment providers are currently unavailable. Please try again later.",
            variant: "destructive"
          });
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Service Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Select Service
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={serviceType === 'airtime' ? 'default' : 'outline'}
              onClick={() => setServiceType('airtime')}
              className="h-16"
            >
              Buy Airtime
            </Button>
            <Button
              variant={serviceType === 'data' ? 'default' : 'outline'}
              onClick={() => setServiceType('data')}
              className="h-16"
            >
              Buy Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Phone Number Input */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Phone Number</label>
              <Input
                type="tel"
                placeholder="08012345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="text-lg h-12"
                maxLength={11}
              />
            </div>

            {selectedNetwork && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Detected Network:</span>
                <Badge className={NIGERIAN_NETWORKS.find(n => n.id === selectedNetwork)?.color}>
                  {NIGERIAN_NETWORKS.find(n => n.id === selectedNetwork)?.name}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Amount/Bundle Selection */}
      {serviceType === 'airtime' ? (
        <Card>
          <CardContent className="pt-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Amount (₦)</label>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {['100', '200', '500', '1000', '2000', '5000'].map((preset) => (
                  <Button
                    key={preset}
                    variant="outline"
                    onClick={() => setAmount(preset)}
                    className="h-12"
                  >
                    ₦{preset}
                  </Button>
                ))}
              </div>
              <Input
                type="number"
                placeholder="Enter custom amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-lg h-12"
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        selectedNetwork && (
          <Card>
            <CardHeader>
              <CardTitle>Select Data Bundle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {DATA_BUNDLES[selectedNetwork]?.map((bundle) => (
                  <Button
                    key={bundle.id}
                    variant={selectedBundle?.id === bundle.id ? 'default' : 'outline'}
                    onClick={() => setSelectedBundle(bundle)}
                    className="h-16 justify-between"
                  >
                    <div className="text-left">
                      <div className="font-medium">{bundle.size}</div>
                      <div className="text-sm opacity-75">{bundle.validity}</div>
                    </div>
                    <div className="font-bold">₦{bundle.price.toLocaleString()}</div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      )}

      {/* Provider Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Provider Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {providers.map((provider) => (
              <div key={provider.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    provider.status === 'active' ? 'bg-green-500' : 
                    provider.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <span className="font-medium">{provider.name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{provider.success_rate}% success</span>
                  <span>{provider.response_time}s avg</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Button */}
      <Button
        onClick={handleTransaction}
        disabled={isProcessing || !phoneNumber || !selectedNetwork}
        className="w-full h-14 text-lg"
      >
        {isProcessing ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing...
          </div>
        ) : (
          `Complete ${serviceType === 'airtime' ? '₦' + amount : selectedBundle?.size} Purchase`
        )}
      </Button>

      {/* USSD Fallback Info */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          If online payment fails, USSD codes will be provided as backup: 
          MTN (*555#), Airtel (*141#), Glo (*127#), 9mobile (*200#)
        </AlertDescription>
      </Alert>
    </div>
  );
};