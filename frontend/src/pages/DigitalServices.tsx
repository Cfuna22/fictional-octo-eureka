import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  // === Flutterwave Config (hook at top level) ===
  const flutterwaveConfig = {
    public_key:  import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
    tx_ref: `digital-${Date.now()}`,
    amount: selectedService === 'data' ? selectedBundle?.price || 0 : parseFloat(amount) || 0,
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
    const flutterwaveAmount = flutterwaveConfig.amount;

    if (!flutterwaveAmount || flutterwaveAmount <= 0) {
      alert('Please enter a valid amount or select a bundle');
      return;
    }

    handleFlutterPayment({
      callback: (response) => {
        console.log('Payment Response:', response);

        if (response.status === 'successful') {
          const newTransaction: Transaction = {
            id: String(response.transaction_id || `tx-${Date.now()}`),
            type: selectedService,
            network: selectedNetwork,
            amount: flutterwaveAmount,
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
          {/* TODO: your ServiceSelection, ServiceDetails, PaymentScreen, ConfirmationScreen components */}
          {/* They should call processPayment() or handleAirtimePayment() */}
        </div>
      </main>
    </div>
  );
};

export default DigitalServices;

