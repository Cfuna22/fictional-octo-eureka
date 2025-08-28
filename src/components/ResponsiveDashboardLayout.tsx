import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from './AppSidebar';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Monitor, CreditCard } from 'lucide-react';

interface ResponsiveDashboardLayoutProps {
  children: ReactNode;
}

export function ResponsiveDashboardLayout({ children }: ResponsiveDashboardLayoutProps) {
  const navigate = useNavigate();
  const currentTime = new Date().toLocaleString();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <main className="flex-1 flex flex-col">
          {/* Mobile/Tablet Header */}
          <header className="sticky top-0 z-40 bg-background border-b border-border p-4 lg:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="lg:hidden" />
                <div className="flex items-center gap-2">
                  <img 
                    src="/lovable-uploads/57ba805a-8067-402e-a68a-b01d47cf928b.png" 
                    alt="Qatalyst Logo" 
                    className="w-6 h-6"
                  />
                  <h1 className="text-lg font-bold text-foreground">QatalystQ</h1>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => navigate('/kiosk')}
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex gap-1"
                >
                  <Monitor className="w-4 h-4" />
                  <span className="hidden md:inline">Kiosk</span>
                </Button>
                
                <Button 
                  onClick={() => navigate('/subscription')}
                  variant="outline"
                  size="sm"
                  className="gap-1"
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="hidden md:inline">Plan</span>
                </Button>
              </div>
            </div>
          </header>

          {/* Desktop Header */}
          <header className="hidden lg:flex sticky top-0 z-40 bg-gradient-card border-b border-border px-6 py-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">System Overview</h1>
                  <p className="text-sm text-muted-foreground">
                    AI-Powered Queue Management System
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button 
                  onClick={() => navigate('/kiosk')}
                  variant="outline"
                  className="gap-2"
                >
                  <Monitor className="w-4 h-4" />
                  View Kiosk Interface
                </Button>
                
                <Button 
                  onClick={() => navigate('/subscription')}
                  variant="outline"
                  className="gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Subscription
                </Button>

                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Current Time</p>
                  <p className="text-sm font-mono text-foreground">{currentTime}</p>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <div className="flex-1 p-4 sm:p-6 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}