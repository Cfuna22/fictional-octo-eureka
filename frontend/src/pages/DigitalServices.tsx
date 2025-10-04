import React, { useState } from 'react';
import { ArrowLeft, Smartphone, Wifi, Receipt, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { useNavigate } from 'react-router-dom';

type ServiceType = 'airtime' | 'data' | 'bills';
type Network = 'mtn' | 'airtel' | 'glo' | '9mobile';

interface DataBundle {
  id: string;
  size: string;
  price: number;
  validity: string;
  popular?: boolean;
}

interface Transaction {
  id: string;
  type: ServiceType;
  network: Network;
  amount: number;
  recipient: string;
  status: 'success' | 'pending' | 'failed';
  timestamp: string;
  bundle?: string;
}

const DigitalServices = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'service' | 'details' | 'payment' | 'confirmation'>('service');
  const [selectedService, setSelectedService] = useState<ServiceType>('airtime');
  const [selectedNetwork, setSelectedNetwork] = useState<Network>('mtn');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedBundle, setSelectedBundle] = useState<DataBundle | null>(null);
  const [transaction, setTransaction] = useState<Transaction | null>(null);

  const networks = [
    { id: 'mtn' as const, name: 'MTN', color: 'bg-yellow-500', logo: '📱' },
    { id: 'airtel' as const, name: 'Airtel', color: 'bg-red-500', logo: '📡' },
    { id: 'glo' as const, name: 'Glo', color: 'bg-green-500', logo: '🌐' },
    { id: '9mobile' as const, name: '9mobile', color: 'bg-green-600', logo: '📶' }
  ];

  const dataBundles: Record<Network, DataBundle[]> = {
    mtn: [
      { id: 'mtn-1gb', size: '1GB', price: 500, validity: '30 days', popular: true },
      { id: 'mtn-2gb', size: '2GB', price: 1000, validity: '30 days' },
      { id: 'mtn-5gb', size: '5GB', price: 2000, validity: '30 days', popular: true },
      { id: 'mtn-10gb', size: '10GB', price: 3500, validity: '30 days' },
    ],
    airtel: [
      { id: 'airtel-1gb', size: '1GB', price: 480, validity: '30 days', popular: true },
      { id: 'airtel-2gb', size: '2GB', price: 960, validity: '30 days' },
      { id: 'airtel-5gb', size: '5GB', price: 1920, validity: '30 days', popular: true },
      { id: 'airtel-10gb', size: '10GB', price: 3360, validity: '30 days' },
    ],
    glo: [
      { id: 'glo-1gb', size: '1GB', price: 520, validity: '30 days', popular: true },
      { id: 'glo-2gb', size: '2GB', price: 1040, validity: '30 days' },
      { id: 'glo-5gb', size: '5GB', price: 2080, validity: '30 days', popular: true },
      { id: 'glo-10gb', size: '10GB', price: 3640, validity: '30 days' },
    ],
    '9mobile': [
      { id: '9mobile-1gb', size: '1GB', price: 510, validity: '30 days', popular: true },
      { id: '9mobile-2gb', size: '2GB', price: 1020, validity: '30 days' },
      { id: '9mobile-5gb', size: '5GB', price: 2040, validity: '30 days', popular: true },
      { id: '9mobile-10gb', size: '10GB', price: 3570, validity: '30 days' },
    ],
  };

  // === Flutterwave Config ===
  const flutterwaveConfig = {
    public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
    tx_ref: `digital-${Date.now()}`,
    amount: selectedService === 'data' ? selectedBundle?.price || 0 : parseFloat(amount || '0'),
    currency: 'NGN',
    payment_options: 'card,mobilemoney,ussd',
    customer: {
      email: 'customer@example.com',
      phone_number: phoneNumber,
      name: 'Digital Services Customer',
    },
    customizations: {
      title: 'Qatalyst Digital Services',
      description: `${selectedService.toUpperCase()} - ${selectedNetwork.toUpperCase()}`,
      logo: 'https://your-logo-url.com/logo.png',
    },
  };

  const handleFlutterPayment = useFlutterwave(flutterwaveConfig);

  // === Real Payment Handler ===
  const processPayment = () => {
    if (!flutterwaveConfig.amount || flutterwaveConfig.amount <= 0) {
      alert('Please enter a valid amount or select a bundle');
      return;
    }

    handleFlutterPayment({
      callback: (response) => {
        if (response.status === 'successful' || response.status === 'completed') {
          const newTransaction: Transaction = {
            id: String(response.transaction_id || `tx-${Date.now()}`),
            type: selectedService,
            network: selectedNetwork,
            amount: flutterwaveConfig.amount,
            recipient: phoneNumber,
            status: 'success',
            timestamp: new Date().toISOString(),
            bundle: selectedService === 'data' ? selectedBundle?.size : undefined,
          };
          setTransaction(newTransaction);
          setCurrentStep('confirmation');
        }
        closePaymentModal();
      },
      onClose: () => console.log('Payment modal closed'),
    });
  };

  // === Mock Payment ===
  const handleAirtimePayment = () => {
    const airtimeAmount = selectedService === 'data'
      ? selectedBundle?.price || 0
      : parseFloat(amount || '0');

    if (!airtimeAmount || airtimeAmount <= 0) {
      alert('Please enter a valid amount or select a bundle');
      return;
    }

    const newTransaction: Transaction = {
      id: `airtime-${Date.now()}`,
      type: selectedService,
      network: selectedNetwork,
      amount: airtimeAmount,
      recipient: phoneNumber,
      status: 'success',
      timestamp: new Date().toISOString(),
      bundle: selectedService === 'data' ? selectedBundle?.size : undefined,
    };
    setTransaction(newTransaction);
    setCurrentStep('confirmation');
  };

  const resetFlow = () => {
    setCurrentStep('service');
    setSelectedService('airtime');
    setSelectedNetwork('mtn');
    setPhoneNumber('');
    setAmount('');
    setSelectedBundle(null);
    setTransaction(null);
  };

  // === Screens (UI Components) ===
  const ServiceSelection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">Choose Service</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { type: 'airtime', icon: <Smartphone className="w-8 h-8 text-primary" />, label: 'Airtime' },
          { type: 'data', icon: <Wifi className="w-8 h-8 text-primary" />, label: 'Data Bundles' },
          { type: 'bills', icon: <Receipt className="w-8 h-8 text-primary" />, label: 'Bill Payments' },
        ].map((s) => (
          <Card
            key={s.type}
            className={`cursor-pointer transition hover:shadow-lg ${selectedService === s.type ? 'ring-2 ring-primary border-primary' : ''}`}
            onClick={() => setSelectedService(s.type as ServiceType)}
          >
            <CardContent className="p-6 text-center space-y-3">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                {s.icon}
              </div>
              <h3 className="font-semibold">{s.label}</h3>
            </CardContent>
          </Card>
        ))}
      </div>
      <Button onClick={() => setCurrentStep('details')} className="w-full">Continue</Button>
    </div>
  );

  const ServiceDetails = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">Enter Details</h2>

      {/* Network Selection */}
      <div>
        <Label>Select Network</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
          {networks.map((network) => (
            <Card
              key={network.id}
              className={`cursor-pointer ${selectedNetwork === network.id ? 'ring-2 ring-primary border-primary' : ''}`}
              onClick={() => setSelectedNetwork(network.id)}
            >
              <CardContent className="p-4 text-center">
                <div className={`w-12 h-12 mx-auto ${network.color} rounded-full flex items-center justify-center text-white text-xl`}>
                  {network.logo}
                </div>
                <p className="mt-2">{network.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Phone Number */}
      <div>
        <Label>Phone Number</Label>
        <Input
          type="tel"
          placeholder="08123456789"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
      </div>

      {/* Airtime Amount */}
      {selectedService === 'airtime' && (
        <div>
          <Label>Amount (₦)</Label>
          <Input
            type="number"
            placeholder="1000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {[100, 200, 500, 1000, 2000, 5000].map((val) => (
              <Button key={val} size="sm" variant="outline" onClick={() => setAmount(val.toString())}>
                ₦{val}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Data Bundles */}
      {selectedService === 'data' && (
        <div>
          <Label>Choose Data Bundle</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            {dataBundles[selectedNetwork].map((bundle) => (
              <Card
                key={bundle.id}
                className={`cursor-pointer ${selectedBundle?.id === bundle.id ? 'ring-2 ring-primary border-primary' : ''}`}
                onClick={() => setSelectedBundle(bundle)}
              >
                <CardContent className="p-4 flex justify-between">
                  <div>
                    <h4 className="font-semibold">{bundle.size}</h4>
                    <p className="text-sm">{bundle.validity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₦{bundle.price.toLocaleString()}</p>
                    {bundle.popular && <Badge variant="secondary">Popular</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setCurrentStep('service')} className="flex-1">Back</Button>
        <Button
          className="flex-1"
          onClick={() => setCurrentStep('payment')}
          disabled={!phoneNumber || (selectedService === 'airtime' && !amount) || (selectedService === 'data' && !selectedBundle)}
        >
          Continue to Payment
        </Button>
      </div>
    </div>
  );

  const PaymentScreen = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center">Payment Summary</h2>
      <Card>
        <CardContent className="p-6 space-y-3">
          <div className="flex justify-between"><span>Service:</span><span>{selectedService}</span></div>
          <div className="flex justify-between"><span>Network:</span><span>{networks.find(n => n.id === selectedNetwork)?.name}</span></div>
          <div className="flex justify-between"><span>Phone:</span><span>{phoneNumber}</span></div>
          {selectedBundle && <div className="flex justify-between"><span>Bundle:</span><span>{selectedBundle.size}</span></div>}
          <div className="border-t pt-2 flex justify-between font-bold">
            <span>Total:</span>
            <span>₦{(selectedService === 'data' ? selectedBundle?.price || 0 : parseFloat(amount || '0')).toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      <Button onClick={processPayment} className="w-full">Pay with Flutterwave</Button>
      <Button onClick={handleAirtimePayment} variant="outline" className="w-full">Mock Payment</Button>
      <Button variant="ghost" className="w-full" onClick={() => setCurrentStep('details')}>Back</Button>
    </div>
  );

  const ConfirmationScreen = () => (
    <div className="space-y-6 text-center">
      <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold">Transaction Successful!</h2>
      {transaction && (
        <Card>
          <CardHeader><CardTitle className="text-center">Receipt</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between"><span>ID:</span><span>{transaction.id}</span></div>
            <div className="flex justify-between"><span>Service:</span><span>{transaction.type}</span></div>
            <div className="flex justify-between"><span>Network:</span><span>{transaction.network}</span></div>
            <div className="flex justify-between"><span>Recipient:</span><span>{transaction.recipient}</span></div>
            {transaction.bundle && <div className="flex justify-between"><span>Bundle:</span><span>{transaction.bundle}</span></div>}
            <div className="flex justify-between font-bold"><span>Amount:</span><span>₦{transaction.amount}</span></div>
            <div className="flex justify-between"><span>Date:</span><span>{new Date(transaction.timestamp).toLocaleString()}</span></div>
          </CardContent>
        </Card>
      )}
      <Button className="w-full" onClick={resetFlow}>Make Another Purchase</Button>
      <Button variant="outline" className="w-full" onClick={() => navigate('/')}>Back to Dashboard</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Digital Services</h1>
            <p className="text-sm text-muted-foreground">Airtime, Data & Bill Payments</p>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto p-4 py-8">
        <div className="max-w-2xl mx-auto">
          {currentStep === 'service' && <ServiceSelection />}
          {currentStep === 'details' && <ServiceDetails />}
          {currentStep === 'payment' && <PaymentScreen />}
          {currentStep === 'confirmation' && <ConfirmationScreen />}
        </div>
      </main>
    </div>
  );
};

export default DigitalServices;

