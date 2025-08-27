import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Zap,
  Users,
  Phone,
  ArrowLeft
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const KioskInterface = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'welcome' | 'service' | 'details' | 'ticket'>('welcome');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [ticketNumber, setTicketNumber] = useState('');

  const services = [
    { id: 'account', name: 'Account Opening', wait: '12 min', priority: 'normal' },
    { id: 'loan', name: 'Loan Application', wait: '18 min', priority: 'high' },
    { id: 'general', name: 'General Inquiry', wait: '8 min', priority: 'low' },
    { id: 'business', name: 'Business Services', wait: '25 min', priority: 'high' },
    { id: 'investment', name: 'Investment Consultation', wait: '30 min', priority: 'normal' }
  ];

  const handleServiceSelect = (service: any) => {
    setSelectedService(service);
    setCurrentStep('details');
  };

  const handleSubmit = () => {
    if (!customerName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name to continue.",
        variant: "destructive"
      });
      return;
    }

    // Generate ticket number
    const ticket = `Q${Date.now().toString().slice(-4)}`;
    setTicketNumber(ticket);
    setCurrentStep('ticket');
    
    toast({
      title: "Ticket Generated",
      description: `Your ticket ${ticket} has been created successfully.`,
    });
  };

  const renderWelcomeScreen = () => (
    <Card className="bg-gradient-card border-border shadow-glow">
      <CardHeader className="text-center pb-8">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gradient-primary rounded-2xl shadow-glow">
            <Zap className="w-12 h-12 text-white" />
          </div>
        </div>
        <CardTitle className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Welcome to QatalystQ
        </CardTitle>
        <p className="text-xl text-muted-foreground mt-2">
          AI-Powered Queue Management
        </p>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-lg mb-8 text-foreground">
          Get in line and receive real-time updates on your wait time
        </p>
        <Button 
          onClick={() => setCurrentStep('service')}
          size="lg"
          className="bg-gradient-primary hover:shadow-glow text-white font-semibold px-12 py-6 text-lg"
        >
          Start Check-In
          <ArrowRight className="w-6 h-6 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );

  const renderServiceSelection = () => (
    <Card className="bg-gradient-card border-border">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <User className="w-6 h-6 text-primary" />
          Select Service Type
        </CardTitle>
        <p className="text-muted-foreground">Choose the service you need today</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {services.map((service) => (
            <Button
              key={service.id}
              variant="outline"
              onClick={() => handleServiceSelect(service)}
              className="w-full p-6 h-auto justify-start bg-secondary/30 hover:bg-secondary/50 border-border"
            >
              <div className="flex items-center justify-between w-full">
                <div className="text-left">
                  <h3 className="font-semibold text-lg">{service.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      Estimated wait: {service.wait}
                    </span>
                  </div>
                </div>
                <Badge 
                  className={`
                    ${service.priority === 'high' ? 'bg-warning' : 
                      service.priority === 'normal' ? 'bg-primary' : 'bg-muted'}
                    text-white
                  `}
                >
                  {service.priority} priority
                </Badge>
              </div>
            </Button>
          ))}
        </div>
        <Button 
          onClick={() => setCurrentStep('welcome')}
          variant="ghost"
          className="w-full mt-6"
        >
          ← Back to Welcome
        </Button>
      </CardContent>
    </Card>
  );

  const renderDetailsForm = () => (
    <Card className="bg-gradient-card border-border">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-success" />
          Contact Information
        </CardTitle>
        <p className="text-muted-foreground">
          Service: <span className="text-primary font-semibold">{selectedService?.name}</span>
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter your full name"
            className="text-lg p-4"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number (Optional)</Label>
          <Input
            id="phone"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter your phone number for SMS updates"
            className="text-lg p-4"
          />
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Phone className="w-3 h-3" />
            Receive real-time queue updates via SMS
          </p>
        </div>

        <div className="pt-4 space-y-4">
          <Button 
            onClick={handleSubmit}
            className="w-full bg-gradient-primary hover:shadow-glow text-white font-semibold p-4 text-lg"
          >
            Generate Ticket
          </Button>
          <Button 
            onClick={() => setCurrentStep('service')}
            variant="ghost"
            className="w-full"
          >
            ← Change Service Type
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderTicketScreen = () => (
    <Card className="bg-gradient-card border-border shadow-glow">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gradient-success rounded-2xl">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
        </div>
        <CardTitle className="text-3xl font-bold text-success">
          Ticket Generated!
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-6">
        <div className="bg-primary/10 border border-primary/30 rounded-2xl p-8">
          <p className="text-sm text-muted-foreground mb-2">Your Ticket Number</p>
          <h2 className="text-6xl font-bold text-primary font-mono">{ticketNumber}</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-foreground">3</p>
            <p className="text-sm text-muted-foreground">People ahead</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-warning">~{selectedService?.wait}</p>
            <p className="text-sm text-muted-foreground">Estimated wait</p>
          </div>
        </div>

        <div className="bg-secondary/30 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-2">Service Selected:</p>
          <p className="font-semibold text-foreground">{selectedService?.name}</p>
          <p className="text-sm text-primary mt-1">Hello, {customerName}!</p>
        </div>

        {phoneNumber && (
          <div className="bg-success/10 border border-success/30 rounded-lg p-4">
            <p className="text-sm text-success flex items-center justify-center gap-2">
              <Phone className="w-4 h-4" />
              SMS updates will be sent to {phoneNumber}
            </p>
          </div>
        )}

        <Button 
          onClick={() => {
            setCurrentStep('welcome');
            setCustomerName('');
            setPhoneNumber('');
            setSelectedService(null);
            setTicketNumber('');
          }}
          variant="outline"
          className="w-full"
        >
          Generate Another Ticket
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="bg-gradient-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg shadow-glow">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                QatalystQ Kiosk
              </h1>
              <p className="text-sm text-muted-foreground">Customer Check-In Interface</p>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/')}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      {/* Main Kiosk Interface */}
      <div className="flex items-center justify-center p-8 min-h-[calc(100vh-100px)]">
        <div className="w-full max-w-2xl">
          {currentStep === 'welcome' && renderWelcomeScreen()}
          {currentStep === 'service' && renderServiceSelection()}
          {currentStep === 'details' && renderDetailsForm()}
          {currentStep === 'ticket' && renderTicketScreen()}
        </div>
      </div>
    </div>
  );
};

export default KioskInterface;