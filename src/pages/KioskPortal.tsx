import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Clock, Users, Smartphone, Receipt, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import QRCode from 'qrcode';

const KioskPortal = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [batteryLevel] = useState(87);
  const [wifiStrength] = useState(4);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [generatedTicket, setGeneratedTicket] = useState('');

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const generateTicket = async () => {
    const ticketNumber = `T-${Math.floor(Math.random() * 900) + 100}`;
    setGeneratedTicket(ticketNumber);
    
    // Generate QR code URL for mobile access
    const mobileUrl = `${window.location.origin}/ticket/${ticketNumber}`;
    
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
      setShowQRModal(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const StatusBar = () => (
    <div className="bg-slate-900 text-white px-6 py-3 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Wifi className="w-5 h-5" />
          <div className="flex space-x-1">
            {[1, 2, 3, 4].map((bar) => (
              <div
                key={bar}
                className={`w-1 h-4 rounded ${
                  bar <= wifiStrength ? 'bg-green-500' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm">4G</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Clock className="w-4 h-4" />
        <span className="text-lg font-mono">
          {currentTime.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          })}
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <Battery className="w-5 h-5" />
        <span className={`text-sm ${batteryLevel < 20 ? 'text-red-400' : 'text-green-400'}`}>
          {batteryLevel}%
        </span>
        <div className="w-8 h-4 border border-white rounded-sm relative">
          <div 
            className={`h-full rounded-sm ${
              batteryLevel < 20 ? 'bg-red-400' : 
              batteryLevel < 50 ? 'bg-yellow-400' : 'bg-green-400'
            }`}
            style={{ width: `${batteryLevel}%` }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Status Bar */}
      <StatusBar />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold text-slate-800 mb-4">
              Welcome to QatalystQ
            </h1>
            <p className="text-2xl text-slate-600">
              Choose your service to get started
            </p>
          </div>

          {/* Main Action Buttons */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Join Queue Button */}
            <Card className="overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
              <Button
                onClick={generateTicket}
                className="w-full h-48 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-0 rounded-lg"
              >
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-2">JOIN THE QUEUE</h2>
                    <p className="text-xl opacity-90">Get your ticket number</p>
                  </div>
                </CardContent>
              </Button>
            </Card>

            {/* Buy Airtime & Data Button */}
            <Card className="overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
              <Button
                onClick={() => window.location.href = '/digital-services'}
                className="w-full h-48 bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white p-0 rounded-lg"
              >
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                    <Smartphone className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-2">BUY AIRTIME & DATA</h2>
                    <p className="text-xl opacity-90">Top up your phone</p>
                  </div>
                </CardContent>
              </Button>
            </Card>
          </div>

          {/* Secondary Action - Pay Bills */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <Button
                onClick={() => window.location.href = '/digital-services'}
                className="w-full h-32 bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white p-0 rounded-lg"
              >
                <CardContent className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                    <Receipt className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">PAY BILLS</h3>
                    <p className="text-lg opacity-90">Electricity, Cable TV & More</p>
                  </div>
                </CardContent>
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">Your Queue Ticket</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-6 p-4">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <h2 className="text-4xl font-bold text-blue-600 mb-2">{generatedTicket}</h2>
              <p className="text-slate-600">Your ticket number</p>
            </div>
            
            <div className="space-y-4">
              <p className="text-lg font-semibold text-slate-700">
                Scan to track your position on mobile
              </p>
              {qrCodeUrl && (
                <div className="flex justify-center">
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code" 
                    className="border-2 border-slate-200 rounded-lg shadow-lg"
                  />
                </div>
              )}
              <p className="text-sm text-slate-500">
                Scan with your phone's camera to view real-time queue updates
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center bg-slate-50 rounded-lg p-4">
              <div>
                <p className="text-2xl font-bold text-slate-700">5</p>
                <p className="text-sm text-slate-500">People ahead</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">~18 min</p>
                <p className="text-sm text-slate-500">Estimated wait</p>
              </div>
            </div>

            <Button 
              onClick={() => setShowQRModal(false)}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KioskPortal;