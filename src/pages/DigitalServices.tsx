import React, { useState } from 'react';
import { ArrowLeft, Smartphone, Wifi, Receipt, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

  const flutterwaveConfig = {
    public_key: "FLWPUBK_TEST-SANDBOXDEMOKEY-X", // Replace with your Flutterwave public key
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

  const processPayment = () => {
    handleFlutterPayment({
      callback: (response) => {
        console.log(response);
        if (response.status === 'successful') {
          const newTransaction: Transaction = {
            id: String(response.transaction_id || `tx-${Date.now()}`),
            type: selectedService,
            network: selectedNetwork,
            amount: selectedService === 'data' ? selectedBundle?.price || 0 : parseFloat(amount),
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
      onClose: () => {
        console.log('Payment modal closed');
      },
    });
  };

  const handleAirtimePayment = () => {
    // Mock airtime payment logic
    const newTransaction: Transaction = {
      id: `airtime-${Date.now()}`,
      type: selectedService,
      network: selectedNetwork,
      amount: selectedService === 'data' ? selectedBundle?.price || 0 : parseFloat(amount),
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

  const ServiceSelection = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Choose Service</h2>
        <p className="text-muted-foreground">Select the digital service you want to purchase</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg ${
            selectedService === 'airtime' ? 'ring-2 ring-primary border-primary' : ''
          }`}
          onClick={() => setSelectedService('airtime')}
        >
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Airtime</h3>
              <p className="text-sm text-muted-foreground">Top up your phone</p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg ${
            selectedService === 'data' ? 'ring-2 ring-primary border-primary' : ''
          }`}
          onClick={() => setSelectedService('data')}
        >
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Wifi className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Data Bundles</h3>
              <p className="text-sm text-muted-foreground">Internet data packages</p>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-lg ${
            selectedService === 'bills' ? 'ring-2 ring-primary border-primary' : ''
          }`}
          onClick={() => setSelectedService('bills')}
        >
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <Receipt className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Bill Payments</h3>
              <p className="text-sm text-muted-foreground">Electricity, Cable TV & more</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button 
        onClick={() => setCurrentStep('details')} 
        className="w-full"
        size="lg"
      >
        Continue
      </Button>
    </div>
  );

  const ServiceDetails = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Service Details</h2>
        <p className="text-muted-foreground">
          {selectedService === 'airtime' && 'Enter phone number and amount'}
          {selectedService === 'data' && 'Choose your data bundle'}
          {selectedService === 'bills' && 'Enter customer details'}
        </p>
      </div>

      {/* Network Selection */}
      <div className="space-y-3">
        <Label>Select Network</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {networks.map((network) => (
            <Card
              key={network.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedNetwork === network.id ? 'ring-2 ring-primary border-primary' : ''
              }`}
              onClick={() => setSelectedNetwork(network.id as Network)}
            >
              <CardContent className="p-4 text-center space-y-2">
                <div className={`w-12 h-12 mx-auto ${network.color} rounded-full flex items-center justify-center text-white text-xl`}>
                  {network.logo}
                </div>
                <p className="font-medium text-sm">{network.name}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Phone Number */}
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="e.g., 08123456789"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="text-lg"
        />
      </div>

      {/* Airtime Amount */}
      {selectedService === 'airtime' && (
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (₦)</Label>
          <Input
            id="amount"
            type="number"
            placeholder="e.g., 1000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-lg"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {[100, 200, 500, 1000, 2000, 5000].map((value) => (
              <Button
                key={value}
                variant="outline"
                size="sm"
                onClick={() => setAmount(value.toString())}
                className="text-xs"
              >
                ₦{value}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Data Bundles */}
      {selectedService === 'data' && (
        <div className="space-y-3">
          <Label>Choose Data Bundle</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dataBundles[selectedNetwork].map((bundle) => (
              <Card
                key={bundle.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedBundle?.id === bundle.id ? 'ring-2 ring-primary border-primary' : ''
                }`}
                onClick={() => setSelectedBundle(bundle)}
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-lg">{bundle.size}</h4>
                      <p className="text-sm text-muted-foreground">{bundle.validity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">₦{bundle.price.toLocaleString()}</p>
                      {bundle.popular && (
                        <Badge variant="secondary" className="text-xs">Popular</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setCurrentStep('service')} className="flex-1">
          Back
        </Button>
        <Button 
          onClick={() => setCurrentStep('payment')} 
          className="flex-1"
          disabled={
            !phoneNumber || 
            (selectedService === 'airtime' && !amount) ||
            (selectedService === 'data' && !selectedBundle)
          }
        >
          Continue to Payment
        </Button>
      </div>
    </div>
  );

  const PaymentScreen = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Payment Summary</h2>
        <p className="text-muted-foreground">Review your purchase details</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service:</span>
            <span className="font-medium capitalize">{selectedService}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Network:</span>
            <span className="font-medium">{networks.find(n => n.id === selectedNetwork)?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Phone Number:</span>
            <span className="font-medium">{phoneNumber}</span>
          </div>
          {selectedService === 'data' && selectedBundle && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bundle:</span>
              <span className="font-medium">{selectedBundle.size}</span>
            </div>
          )}
          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total Amount:</span>
              <span>₦{(selectedService === 'data' ? selectedBundle?.price || 0 : parseFloat(amount || '0')).toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Button onClick={processPayment} className="w-full" size="lg">
          Pay with Flutterwave
        </Button>
        <Button onClick={handleAirtimePayment} variant="outline" className="w-full" size="lg">
          Pay with Airtime (+10% fee)
        </Button>
      </div>

      <Button variant="ghost" onClick={() => setCurrentStep('details')} className="w-full">
        Back to Details
      </Button>
    </div>
  );

  const ConfirmationScreen = () => (
    <div className="space-y-6 text-center">
      <div className="space-y-4">
        <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Transaction Successful!</h2>
        <p className="text-muted-foreground">Your {selectedService} purchase has been completed</p>
      </div>

      {transaction && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Receipt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transaction ID:</span>
              <span className="font-mono text-sm">{transaction.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service:</span>
              <span className="capitalize">{transaction.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Network:</span>
              <span>{networks.find(n => n.id === transaction.network)?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Recipient:</span>
              <span>{transaction.recipient}</span>
            </div>
            {transaction.bundle && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bundle:</span>
                <span>{transaction.bundle}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-bold">₦{transaction.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span>{new Date(transaction.timestamp).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        <Button onClick={resetFlow} className="w-full" size="lg">
          Make Another Purchase
        </Button>
        <Button variant="outline" onClick={() => navigate('/')} className="w-full">
          Back to Dashboard
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Digital Services</h1>
              <p className="text-sm text-muted-foreground">Airtime, Data & Bill Payments</p>
            </div>
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