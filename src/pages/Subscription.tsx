import React, { useState } from 'react';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, Download, Smartphone, CreditCard, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock data for subscription plans
const subscriptionPlans = [
  {
    id: 'basic',
    name: 'Basic',
    monthlyPrice: 5000,
    annualPrice: 48000,
    features: [
      '50 customers/day',
      'SMS Support',
      'Basic Analytics',
      '1 Location',
      'Email Support'
    ],
    popular: false
  },
  {
    id: 'professional',
    name: 'Professional',
    monthlyPrice: 15000,
    annualPrice: 144000,
    features: [
      '200 customers/day',
      'SMS & Email Support',
      'Advanced Analytics',
      '5 Locations',
      'WhatsApp Integration',
      'Priority Support'
    ],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 35000,
    annualPrice: 336000,
    features: [
      'Unlimited customers',
      'All Communication Channels',
      'Custom Analytics',
      'Unlimited Locations',
      'AI-Powered Insights',
      '24/7 Dedicated Support',
      'Custom Integrations'
    ],
    popular: false
  }
];

// Mock invoice data
const mockInvoices = [
  {
    id: 'INV-001',
    date: '2024-01-15',
    planName: 'Professional',
    amount: 144000,
    status: 'Paid',
    downloadUrl: '#'
  },
  {
    id: 'INV-002',
    date: '2024-02-15',
    planName: 'Professional',
    amount: 15000,
    status: 'Paid',
    downloadUrl: '#'
  },
  {
    id: 'INV-003',
    date: '2024-03-15',
    planName: 'Professional',
    amount: 15000,
    status: 'Pending',
    downloadUrl: null
  }
];

const Subscription: React.FC = () => {
  const navigate = useNavigate();
  const [isAnnual, setIsAnnual] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<typeof subscriptionPlans[0] | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currentPlan] = useState('professional'); // Mock current plan

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getDisplayPrice = (plan: typeof subscriptionPlans[0]) => {
    const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
    const period = isAnnual ? '/yr' : '/mo';
    return `${formatPrice(price)} ${period}`;
  };

  const getSavings = (plan: typeof subscriptionPlans[0]) => {
    if (!isAnnual) return null;
    const monthlyCost = plan.monthlyPrice * 12;
    const savings = monthlyCost - plan.annualPrice;
    const savingsPercent = Math.round((savings / monthlyCost) * 100);
    return `Save ${savingsPercent}% (${formatPrice(savings)})`;
  };

  // Flutterwave configuration
  const flutterwaveConfig = {
    public_key: 'FLWPUBK_TEST-SANDBOXDEMOKEY-X', // Replace with actual public key
    tx_ref: Date.now().toString(),
    amount: selectedPlan ? (isAnnual ? selectedPlan.annualPrice : selectedPlan.monthlyPrice) : 0,
    currency: 'NGN',
    payment_options: 'card,mobilemoney,ussd',
    customer: {
      email: 'user@example.com',
      phone_number: '070********',
      name: 'Qatalyst User',
    },
    customizations: {
      title: 'Qatalyst Subscription',
      description: `Payment for ${selectedPlan?.name} plan`,
      logo: '/lovable-uploads/57ba805a-8067-402e-a68a-b01d47cf928b.png',
    },
  };

  const handleFlutterPayment = useFlutterwave(flutterwaveConfig);

  const handlePaymentSuccess = () => {
    closePaymentModal();
    setIsPaymentModalOpen(false);
    // Handle success - update subscription, show success message, etc.
  };

  const handleChoosePlan = (plan: typeof subscriptionPlans[0]) => {
    setSelectedPlan(plan);
    setIsPaymentModalOpen(true);
  };

  const handleAirtimePayment = () => {
    // Implement airtime payment flow
    console.log('Airtime payment initiated for plan:', selectedPlan?.name);
    // This would typically open a USSD flow or SMS-based payment
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Subscription Management</h1>
              <p className="text-muted-foreground">Manage your Qatalyst subscription and billing</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Billing Toggle */}
        <div className="flex justify-center">
          <div className="flex items-center gap-4 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                !isAnnual 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                isAnnual 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Annual Billing
              <span className="ml-2 text-xs text-success font-semibold">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Plan Comparison */}
        <div className="grid md:grid-cols-3 gap-6">
          {subscriptionPlans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative transition-all hover:shadow-lg ${
                plan.popular ? 'border-primary shadow-glow' : ''
              } ${currentPlan === plan.id ? 'ring-2 ring-primary' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
              )}
              {currentPlan === plan.id && (
                <div className="absolute -top-3 right-4">
                  <Badge variant="secondary">Your Current Plan</Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-primary">
                    {getDisplayPrice(plan)}
                  </div>
                  {isAnnual && (
                    <div className="text-sm text-success font-medium">
                      {getSavings(plan)}
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-success flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className="w-full"
                  variant={currentPlan === plan.id ? 'secondary' : 'default'}
                  onClick={() => handleChoosePlan(plan)}
                  disabled={currentPlan === plan.id}
                >
                  {currentPlan === plan.id ? 'Current Plan' : 'Choose Plan'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Invoice History */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice History</CardTitle>
            <CardDescription>
              View and download your billing history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice Date</TableHead>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                    <TableCell>{invoice.planName}</TableCell>
                    <TableCell>{formatPrice(invoice.amount)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={invoice.status === 'Paid' ? 'default' : 'secondary'}
                        className={invoice.status === 'Paid' ? 'bg-success' : ''}
                      >
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {invoice.status === 'Paid' && (
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Subscription</DialogTitle>
          </DialogHeader>
          
          {selectedPlan && (
            <div className="space-y-6">
              {/* Plan Summary */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{selectedPlan.name} Plan</span>
                  <span className="text-lg font-bold text-primary">
                    {getDisplayPrice(selectedPlan)}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Billing cycle: {isAnnual ? 'Annual' : 'Monthly'}
                </div>
                {isAnnual && (
                  <div className="text-sm text-success font-medium mt-1">
                    {getSavings(selectedPlan)}
                  </div>
                )}
              </div>

              {/* Payment Options */}
              <div className="space-y-3">
                <h3 className="font-medium">Choose Payment Method</h3>
                
                <Button
                  className="w-full h-12 gap-3 bg-primary hover:bg-primary/90"
                  onClick={() => {
                    handleFlutterPayment({
                      callback: (response) => {
                        console.log(response);
                        if (response.status === 'successful') {
                          handlePaymentSuccess();
                        }
                        closePaymentModal();
                      },
                      onClose: () => {
                        console.log('Payment modal closed');
                      },
                    });
                  }}
                >
                  <CreditCard className="w-5 h-5" />
                  Pay with Flutterwave
                  <div className="text-xs opacity-90">Cards, Bank Transfer, Mobile Money</div>
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-12 gap-3"
                  onClick={handleAirtimePayment}
                >
                  <Smartphone className="w-5 h-5" />
                  Pay with Airtime
                  <div className="text-xs opacity-70">Mobile airtime deduction</div>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Subscription;