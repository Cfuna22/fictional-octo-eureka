import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import KioskInterface from "./pages/KioskInterface";
import KioskPortal from "./pages/KioskPortal";
import QKioskPro from "./pages/QKioskPro";
import MobileTicketView from "./pages/MobileTicketView";
import Subscription from "./pages/Subscription";
import DigitalServices from "./pages/DigitalServices";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/kiosk" element={<KioskInterface />} />
          <Route path="/kiosk-portal" element={<KioskPortal />} />
          <Route path="/qkiosk-pro" element={<QKioskPro />} />
          <Route path="/ticket/:ticketId" element={<MobileTicketView />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/digital-services" element={<DigitalServices />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
