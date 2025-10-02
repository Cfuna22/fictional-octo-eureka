import React, { useState, useEffect } from "react";
import {
  Wifi,
  Battery,
  Clock,
  Users,
  Smartphone,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import QRCode from "qrcode";
import { gql, useQuery } from "@apollo/client";

// ===============================
//  GraphQL query for kiosks
// ===============================
const GET_KIOSKS = gql`
  query GetKiosks {
    kiosksCollection {
      edges {
        node {
          id
          name
          location
          status
          active_queue
          total_processed
          metrics
        }
      }
    }
  }
`;

const KioskPortal: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [batteryLevel] = useState(87);
  const [wifiStrength] = useState(4);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [generatedTicket, setGeneratedTicket] = useState("");

  // Fetch kiosks from Supabase
  const { data, loading, error } = useQuery(GET_KIOSKS, {
    fetchPolicy: "network-only",
  });

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Generate a dummy ticket + QR for now
  const generateTicket = async () => {
    const ticketNumber = `T-${Math.floor(Math.random() * 900) + 100}`;
    setGeneratedTicket(ticketNumber);

    const mobileUrl = `${window.location.origin}/ticket/${ticketNumber}`;

    try {
      const qrDataUrl = await QRCode.toDataURL(mobileUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: "#0F172A",
          light: "#FFFFFF",
        },
      });
      setQrCodeUrl(qrDataUrl);
      setShowQRModal(true);
    } catch (error) {
      console.error("Error generating QR code:", error);
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
                  bar <= wifiStrength ? "bg-green-500" : "bg-gray-600"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4" />
          <span className="text-lg font-mono">
            {currentTime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Battery className="w-5 h-5" />
          <span
            className={`text-sm ${
              batteryLevel < 20 ? "text-red-400" : "text-green-400"
            }`}
          >
            {batteryLevel}%
          </span>
          <div className="w-8 h-4 border border-white rounded-sm relative">
            <div
              className={`h-full rounded-sm ${
                batteryLevel < 20
                  ? "bg-red-400"
                  : batteryLevel < 50
                  ? "bg-yellow-400"
                  : "bg-green-400"
              }`}
              style={{ width: `${batteryLevel}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Handle loading/error states
  if (loading) return <p className="p-8">Loading kiosks...</p>;
  if (error) return <p className="p-8 text-red-500">Error: {error.message}</p>;

  const kiosks =
    data?.kiosksCollection?.edges?.map((edge: any) => edge.node) ?? [];

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

          {/* Show Kiosks from Supabase */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {kiosks.map((kiosk: any) => (
              <Card
                key={kiosk.id}
                className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-6">
                  <h2 className="text-2xl font-semibold mb-2">
                    {kiosk.name}
                  </h2>
                  <p className="text-gray-600">📍 {kiosk.location}</p>
                  <p className="mt-1">Status: {kiosk.status}</p>
                  <p className="mt-1">
                    Active Queue: {kiosk.active_queue} | Processed:{" "}
                    {kiosk.total_processed}
                  </p>
                  <Button
                    onClick={generateTicket}
                    className="mt-4 w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Join Queue
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Extra Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="overflow-hidden shadow-lg hover:shadow-xl">
              <Button
                onClick={() => window.location.href = "/digital-services"}
                className="w-full h-40 bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white p-0 rounded-lg"
              >
                <CardContent className="p-6 text-center space-y-3">
                  <Smartphone className="w-10 h-10 mx-auto" />
                  <h2 className="text-xl font-bold">BUY AIRTIME & DATA</h2>
                  <p className="opacity-90">Top up your phone</p>
                </CardContent>
              </Button>
            </Card>

            <Card className="overflow-hidden shadow-lg hover:shadow-xl">
              <Button
                onClick={() => window.location.href = "/digital-services"}
                className="w-full h-40 bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white p-0 rounded-lg"
              >
                <CardContent className="p-6 text-center space-y-3">
                  <Receipt className="w-8 h-8 mx-auto" />
                  <h2 className="text-xl font-bold">PAY BILLS</h2>
                  <p className="opacity-90">Electricity, Cable TV & More</p>
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
            <DialogTitle className="text-center text-2xl">
              Your Queue Ticket
            </DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-6 p-4">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <h2 className="text-4xl font-bold text-blue-600 mb-2">
                {generatedTicket}
              </h2>
              <p className="text-slate-600">Your ticket number</p>
            </div>

            {qrCodeUrl && (
              <div className="flex justify-center">
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="border-2 border-slate-200 rounded-lg shadow-lg"
                />
              </div>
            )}

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
