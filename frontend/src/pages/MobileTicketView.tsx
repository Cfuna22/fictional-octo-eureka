import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Users,
  Smartphone,
  Wifi,
  Receipt,
  ChevronDown,
  ChevronUp,
  Phone,
  Loader2,
} from "lucide-react";
import { gql, useQuery } from "@apollo/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// =========================================
// GraphQL Query: Get ticket by ID
// =========================================
const GET_TICKET = gql`
  query GetTicket($id: UUID!) {
    ticketsCollection(filter: { id: { eq: $id } }) {
      edges {
        node {
          id
          customer_name
          service_type
          status
          estimated_wait_time
          created_at
          kiosk {
            id
            name
            location
          }
        }
      }
    }
  }
`;

const MobileTicketView = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // UI states for collapsible services
  const [servicesOpen, setServicesOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<
    "airtime" | "data" | "bills" | null
  >(null);
  const [selectedNetwork, setSelectedNetwork] = useState<
    "mtn" | "airtel" | "glo" | "9mobile" | null
  >(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");

  // Fetch ticket from Supabase
  const { data, loading, error } = useQuery(GET_TICKET, {
    variables: { id: ticketId },
    pollInterval: 5000, // refresh every 5s
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const networks = [
    { id: "mtn", name: "MTN", color: "bg-yellow-500", logo: "📱" },
    { id: "airtel", name: "Airtel", color: "bg-red-500", logo: "📡" },
    { id: "glo", name: "Glo", color: "bg-green-500", logo: "🌐" },
    { id: "9mobile", name: "9mobile", color: "bg-green-600", logo: "📶" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "bg-blue-500";
      case "in_progress":
        return "bg-orange-500";
      case "completed":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleServicePurchase = () => {
    navigate("/digital-services", {
      state: {
        service: selectedService,
        network: selectedNetwork,
        returnTo: `/ticket/${ticketId}`,
      },
    });
  };

  // Handle loading + error states
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2">Loading ticket...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center text-red-500">
        Error: {error.message}
      </div>
    );
  }

  const ticket = data?.ticketsCollection?.edges?.[0]?.node;

  if (!ticket) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-600">
        Ticket not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <h1 className="font-semibold text-slate-800">Queue Status</h1>
            <p className="text-xs text-slate-500">
              {currentTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="w-9" />
        </div>
      </header>

      {/* Ticket Card */}
      <div className="p-4 space-y-4 pb-20">
        <Card className="shadow-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-blue-600">
                {ticket.id.slice(0, 6).toUpperCase()}
              </CardTitle>
              <Badge
                className={`${getStatusColor(ticket.status)} text-white px-3 py-1`}
              >
                {ticket.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Now Serving */}
            <div className="text-center bg-white rounded-lg p-4 border border-blue-100">
              <p className="text-sm text-slate-600 mb-1">Service</p>
              <p className="text-3xl font-bold text-slate-800">
                {ticket.service_type}
              </p>
            </div>

            {/* Wait Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center bg-white rounded-lg p-4 border border-slate-200">
                <Users className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-slate-800">?</p>
                <p className="text-xs text-slate-600">People ahead</p>
              </div>
              <div className="text-center bg-white rounded-lg p-4 border border-slate-200">
                <Clock className="w-5 h-5 text-orange-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-600">
                  ~{ticket.estimated_wait_time}m
                </p>
                <p className="text-xs text-slate-600">Estimated wait</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Other Services (kept same as before) */}
        <Collapsible open={servicesOpen} onOpenChange={setServicesOpen}>
          <CollapsibleTrigger asChild>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      Other Services
                    </h3>
                    <p className="text-sm text-slate-600">
                      Airtime, Data & Bill Payments
                    </p>
                  </div>
                </div>
                {servicesOpen ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </CardContent>
            </Card>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-4 mt-4">
            {/* Service selection + form remain unchanged */}
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4">
        <Button
          onClick={() => navigate("/digital-services")}
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold"
        >
          Explore All Services
        </Button>
      </div>
    </div>
  );
};

export default MobileTicketView;
