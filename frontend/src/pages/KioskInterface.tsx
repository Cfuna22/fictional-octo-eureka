import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Clock,
  CheckCircle2,
  ArrowRight,
  Zap,
  Users,
  Phone,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { queueService } from "@/services/queueService";

const KioskInterface = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<
    "welcome" | "service" | "details" | "ticket"
  >("welcome");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [ticketNumber, setTicketNumber] = useState("");
  const [queuePosition, setQueuePosition] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const services = [
    {
      id: "account",
      name: "Account Opening",
      wait: "12 min",
      priority: "normal",
    },
    { id: "loan", name: "Loan Application", wait: "18 min", priority: "high" },
    { id: "general", name: "General Inquiry", wait: "8 min", priority: "low" },
    {
      id: "business",
      name: "Business Services",
      wait: "25 min",
      priority: "high",
    },
    {
      id: "investment",
      name: "Investment Consultation",
      wait: "30 min",
      priority: "normal",
    },
  ];

  // Validate and format Kenyan phone number
  const validateAndFormatPhone = (phone: string): string | null => {
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, "");

    // Kenyan phone number patterns
    if (cleanPhone.length === 9 && cleanPhone.startsWith("7")) {
      return `+234${cleanPhone}`;
    }

    if (cleanPhone.length === 10 && cleanPhone.startsWith("07")) {
      return `+234${cleanPhone.substring(1)}`;
    }

    if (cleanPhone.length === 12 && cleanPhone.startsWith("234")) {
      return `+${cleanPhone}`;
    }

    if (cleanPhone.length === 13 && cleanPhone.startsWith("234")) {
      return `+${cleanPhone}`;
    }

    return null;
  };

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);

    if (value.trim() === "") {
      setPhoneError("");
      return;
    }

    const formatted = validateAndFormatPhone(value);
    if (!formatted) {
      setPhoneError(
        "Please enter a valid Nigerian phone number (e.g., 0795160491 or 795160491)"
      );
    } else {
      setPhoneError("");
    }
  };

  const handleServiceSelect = (service: any) => {
    setSelectedService(service);
    setCurrentStep("details");
  };

  const handleSubmit = async () => {
    if (!customerName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your name to continue.",
        variant: "destructive",
      });
      return;
    }

    // Validate phone if provided
    if (phoneNumber.trim() && phoneError) {
      toast({
        title: "Invalid Phone Number",
        description: phoneError,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Format phone number for backend
      let formattedPhone = "";
      if (phoneNumber.trim()) {
        const validatedPhone = validateAndFormatPhone(phoneNumber);
        if (!validatedPhone) {
          throw new Error("Invalid phone number format");
        }
        formattedPhone = validatedPhone;
      } else {
        // Use a default format if no phone provided
        formattedPhone = "+234700000000";
      }

      console.log("Calling backend with:", { name: customerName, phone: formattedPhone });

      // Call backend to join queue
      const response = await queueService.joinQueue({
        name: customerName,
        phone: formattedPhone,
      });

      console.log("Backend response:", response);

      // Only show ticket screen if backend call was successful
      if (response && response.id) {
        // Generate ticket number from backend response
        const ticket = `Q${response.id.slice(-6).toUpperCase()}`;
        setTicketNumber(ticket);
        setQueuePosition(response.position);
        setCurrentStep("ticket");

        toast({
          title: "Ticket Generated",
          description: `Your ticket ${ticket} has been created successfully.`,
        });

        // If phone number was provided, show WhatsApp notification message
        if (phoneNumber.trim()) {
          toast({
            title: "WhatsApp Notification Sent",
            description: "You'll receive queue updates via WhatsApp.",
            variant: "default",
          });
        }
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      console.error("Failed to join queue:", error);
      
      // Stay on the details form if there's an error
      setCurrentStep("details");
      
      toast({
        title: "Error",
        description: error.message || "Failed to join queue. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ... rest of your render methods remain exactly the same

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
        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <Button
            onClick={() => setCurrentStep("service")}
            size="lg"
            className="flex-1 h-16 text-lg font-semibold bg-primary hover:bg-primary/90"
          >
            Join Queue
          </Button>
          <Button
            onClick={() => navigate("/digital-services")}
            size="lg"
            className="flex-1 h-16 text-lg font-semibold bg-secondary hover:bg-secondary/90"
          >
            Buy Airtime & Data
          </Button>
        </div>
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
        <p className="text-muted-foreground">
          Choose the service you need today
        </p>
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
                    ${
                      service.priority === "high"
                        ? "bg-warning"
                        : service.priority === "normal"
                        ? "bg-primary"
                        : "bg-muted"
                    }
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
          onClick={() => setCurrentStep("welcome")}
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
          Service:{" "}
          <span className="text-primary font-semibold">
            {selectedService?.name}
          </span>
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
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number (Optional)</Label>
          <Input
            id="phone"
            value={phoneNumber}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="0795160491 or 795160491"
            className="text-lg p-4"
            disabled={isLoading}
          />
          {phoneError && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="w-4 h-4" />
              {phoneError}
            </div>
          )}
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Phone className="w-3 h-3" />
            Receive real-time queue updates via WhatsApp
          </p>
          <p className="text-xs text-muted-foreground">
            Format: 0795160491, 795160491, or +234795160491
          </p>
        </div>

        <div className="pt-4 space-y-4">
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !customerName.trim() || !!phoneError}
            className="w-full bg-gradient-primary hover:shadow-glow text-white font-semibold p-4 text-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Joining Queue...
              </>
            ) : (
              "Generate Ticket"
            )}
          </Button>
          <Button
            onClick={() => setCurrentStep("service")}
            variant="ghost"
            className="w-full"
            disabled={isLoading}
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
          <p className="text-sm text-muted-foreground mb-2">
            Your Ticket Number
          </p>
          <h2 className="text-6xl font-bold text-primary font-mono">
            {ticketNumber}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-foreground">
              {queuePosition - 1}
            </p>
            <p className="text-sm text-muted-foreground">People ahead</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-warning">
              ~{selectedService?.wait}
            </p>
            <p className="text-sm text-muted-foreground">Estimated wait</p>
          </div>
        </div>

        <div className="bg-secondary/30 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-2">
            Service Selected:
          </p>
          <p className="font-semibold text-foreground">
            {selectedService?.name}
          </p>
          <p className="text-sm text-primary mt-1">Hello, {customerName}!</p>
        </div>

        {phoneNumber && (
          <div className="bg-success/10 border border-success/30 rounded-lg p-4">
            <p className="text-sm text-success flex items-center justify-center gap-2">
              <Phone className="w-4 h-4" />
              WhatsApp updates will be sent to {phoneNumber}
            </p>
          </div>
        )}

        <Button
          onClick={() => {
            setCurrentStep("welcome");
            setCustomerName("");
            setPhoneNumber("");
            setSelectedService(null);
            setTicketNumber("");
            setQueuePosition(0);
            setPhoneError("");
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
              <p className="text-sm text-muted-foreground">
                Customer Check-In Interface
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate("/")}
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
          {currentStep === "welcome" && renderWelcomeScreen()}
          {currentStep === "service" && renderServiceSelection()}
          {currentStep === "details" && renderDetailsForm()}
          {currentStep === "ticket" && renderTicketScreen()}
        </div>
      </div>
    </div>
  );
};

export default KioskInterface;
