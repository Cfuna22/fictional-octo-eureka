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
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <main className="flex-1 flex flex-col">
          {/* Mobile Header (320px-768px) */}
          <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border p-3 md:p-4 lg:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <SidebarTrigger className="h-9 w-9 shrink-0" />
                <div className="flex items-center gap-2 min-w-0">
                  <img 
                    src="/qatalyst-logo/57ba805a-8067-402e-a68a-b01d47cf928b.png" 
                    alt="Qatalyst Logo" 
                    className="w-6 h-6 shrink-0"
                  />
                  <h1 className="text-sm sm:text-lg font-bold text-foreground truncate">
                    QatalystQ
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <Button 
                  onClick={() => navigate('/kiosk')}
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex gap-1 h-8"
                >
                  <Monitor className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden md:inline text-xs">Kiosk</span>
                </Button>
                
                <Button 
                  onClick={() => navigate('/subscription')}
                  variant="outline"
                  size="sm"
                  className="gap-1 h-8"
                >
                  <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline text-xs">Plan</span>
                </Button>
              </div>
            </div>
          </header>

          {/* Tablet Header (769px-1024px) */}
          <header className="hidden md:flex lg:hidden sticky top-0 z-50 bg-gradient-card/95 backdrop-blur-sm border-b border-border px-4 py-3">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
                <div className="flex items-center gap-3">
                  <img 
                    src="/qatalyst-logo/57ba805a-8067-402e-a68a-b01d47cf928b.png" 
                    alt="Qatalyst Logo" 
                    className="w-7 h-7"
                  />
                  <div>
                    <h1 className="text-xl font-bold text-foreground">QatalystQ</h1>
                    <p className="text-xs text-muted-foreground">
                      AI-Powered Queue Management
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  onClick={() => navigate('/kiosk')}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Monitor className="w-4 h-4" />
                  Kiosk
                </Button>
                
                <Button 
                  onClick={() => navigate('/subscription')}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Plan
                </Button>
              </div>
            </div>
          </header>

          {/* Desktop Header (1025px+) */}
          <header className="hidden lg:flex sticky top-0 z-50 bg-gradient-card/95 backdrop-blur-sm border-b border-border px-6 py-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div className="flex items-center gap-4">
                  <img 
                    src="/qatalyst-logo/57ba805a-8067-402e-a68a-b01d47cf928b.png" 
                    alt="Qatalyst Logo" 
                    className="w-8 h-8"
                  />
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">QatalystQ System Overview</h1>
                    <p className="text-sm text-muted-foreground">
                      AI-Powered Queue Management & Analytics Platform
                    </p>
                  </div>
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
                  Subscription Management
                </Button>

                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Current Time</p>
                  <p className="text-sm font-mono text-foreground">{currentTime}</p>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content Area with Responsive Padding */}
          <div className="flex-1 overflow-auto">
            <div className="p-3 sm:p-4 md:p-5 lg:p-6 max-w-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}