import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  Smartphone, 
  Wifi, 
  CreditCard,
  ChevronDown,
  ChevronUp,
  Phone,
  Receipt
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const MobileTicketView = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [servicesOpen, setServicesOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<'airtime' | 'data' | 'bills' | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<'mtn' | 'airtel' | 'glo' | '9mobile' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');

  // Mock ticket data - in real app, this would come from API
  const [ticketData] = useState({
    ticketNumber: ticketId || 'T-054',
    nowServing: 'T-048',
    position: 5,
    estimatedWait: 18,
    status: 'waiting',
    queueLength: 12
  });

  const networks = [
    { id: 'mtn', name: 'MTN', color: 'bg-yellow-500', logo: '📱' },
    { id: 'airtel', name: 'Airtel', color: 'bg-red-500', logo: '📡' },
    { id: 'glo', name: 'Glo', color: 'bg-green-500', logo: '🌐' },
    { id: '9mobile', name: '9mobile', color: 'bg-green-600', logo: '📶' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-blue-500';
      case 'called': return 'bg-orange-500';
      case 'in_progress': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const handleNetworkSelect = (networkId: string) => {
    setSelectedNetwork(networkId as any);
  };

  const handleServicePurchase = () => {
    // Navigate to digital services with pre-selected options
    navigate('/digital-services', { 
      state: { 
        service: selectedService, 
        network: selectedNetwork,
        returnTo: `/ticket/${ticketId}`
      } 
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <h1 className="font-semibold text-slate-800">Queue Status</h1>
            <p className="text-xs text-slate-500">
              {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
          <div className="w-9"> {/* Spacer for center alignment */}</div>
        </div>
      </header>

      <div className="p-4 space-y-4 pb-20">
        {/* Ticket Status Card - Primary Element */}
        <Card className="shadow-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-blue-600">
                {ticketData.ticketNumber}
              </CardTitle>
              <Badge className={`${getStatusColor(ticketData.status)} text-white px-3 py-1`}>
                {ticketData.status.charAt(0).toUpperCase() + ticketData.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Status */}
            <div className="text-center bg-white rounded-lg p-4 border border-blue-100">
              <p className="text-sm text-slate-600 mb-1">Now Serving</p>
              <p className="text-3xl font-bold text-slate-800">{ticketData.nowServing}</p>
            </div>

            {/* Wait Information Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center bg-white rounded-lg p-4 border border-slate-200">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-5 h-5 text-blue-500 mr-1" />
                </div>
                <p className="text-2xl font-bold text-slate-800">{ticketData.position}</p>
                <p className="text-xs text-slate-600">People ahead</p>
              </div>
              
              <div className="text-center bg-white rounded-lg p-4 border border-slate-200">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5 text-orange-500 mr-1" />
                </div>
                <p className="text-2xl font-bold text-orange-600">~{ticketData.estimatedWait}m</p>
                <p className="text-xs text-slate-600">Estimated wait</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Queue Progress</span>
                <span>{ticketData.queueLength - ticketData.position}/{ticketData.queueLength}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${((ticketData.queueLength - ticketData.position) / ticketData.queueLength) * 100}%` 
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Other Services - Collapsible Section */}
        <Collapsible open={servicesOpen} onOpenChange={setServicesOpen}>
          <CollapsibleTrigger asChild>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">Other Services</h3>
                      <p className="text-sm text-slate-600">Airtime, Data & Bill Payments</p>
                    </div>
                  </div>
                  {servicesOpen ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </CardContent>
            </Card>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-4 mt-4">
            {/* Service Selection */}
            {!selectedService && (
              <div className="grid grid-cols-1 gap-3">
                <Button
                  onClick={() => setSelectedService('airtime')}
                  variant="outline"
                  className="h-16 justify-start text-left border-2 hover:border-green-500 hover:bg-green-50"
                >
                  <div className="flex items-center space-x-3 w-full">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Buy Airtime</p>
                      <p className="text-sm text-slate-600">Top up your phone</p>
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={() => setSelectedService('data')}
                  variant="outline"
                  className="h-16 justify-start text-left border-2 hover:border-blue-500 hover:bg-blue-50"
                >
                  <div className="flex items-center space-x-3 w-full">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Wifi className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Buy Data</p>
                      <p className="text-sm text-slate-600">Internet bundles</p>
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={() => setSelectedService('bills')}
                  variant="outline"
                  className="h-16 justify-start text-left border-2 hover:border-orange-500 hover:bg-orange-50"
                >
                  <div className="flex items-center space-x-3 w-full">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Receipt className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Pay Bills</p>
                      <p className="text-sm text-slate-600">Electricity, Cable TV</p>
                    </div>
                  </div>
                </Button>
              </div>
            )}

            {/* Network Selection for Airtime/Data */}
            {selectedService && (selectedService === 'airtime' || selectedService === 'data') && !selectedNetwork && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    Choose Network
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedService(null)}
                    >
                      Back
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {networks.map((network) => (
                      <Button
                        key={network.id}
                        onClick={() => handleNetworkSelect(network.id)}
                        variant="outline"
                        className="h-20 p-0 border-2 hover:shadow-md"
                      >
                        <div className="text-center space-y-2">
                          <div className={`w-12 h-12 mx-auto ${network.color} rounded-full flex items-center justify-center text-white text-xl`}>
                            {network.logo}
                          </div>
                          <p className="font-medium text-sm">{network.name}</p>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Service Details Form */}
            {selectedService && selectedNetwork && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    {selectedService === 'airtime' ? 'Buy Airtime' : 'Buy Data'}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedNetwork(null)}
                    >
                      Back
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-3 bg-slate-100 rounded-lg">
                    <p className="font-medium">
                      {networks.find(n => n.id === selectedNetwork)?.name} {selectedService}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="phone-mobile">Phone Number</Label>
                      <Input
                        id="phone-mobile"
                        type="tel"
                        placeholder="08123456789"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="text-lg h-12"
                      />
                    </div>

                    {selectedService === 'airtime' && (
                      <div>
                        <Label htmlFor="amount-mobile">Amount (₦)</Label>
                        <Input
                          id="amount-mobile"
                          type="number"
                          placeholder="1000"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="text-lg h-12"
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                          {[100, 200, 500, 1000, 2000].map((value) => (
                            <Button
                              key={value}
                              variant="outline"
                              size="sm"
                              onClick={() => setAmount(value.toString())}
                              className="text-xs h-8"
                            >
                              ₦{value}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button 
                      onClick={handleServicePurchase}
                      className="w-full h-12 bg-green-600 hover:bg-green-700 text-white"
                      disabled={!phoneNumber || (selectedService === 'airtime' && !amount)}
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4">
        <Button 
          onClick={() => navigate('/digital-services')}
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold"
        >
          Explore All Services
        </Button>
      </div>
    </div>
  );
};

export default MobileTicketView;
