import { 
  Monitor, 
  Users, 
  Activity, 
  Brain,
  Settings,
  BarChart3,
  Home,
  Building,
  Shield,
  CreditCard
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from '@/components/ui/badge';

const navigationItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Kiosk Interface", url: "/kiosk", icon: Monitor },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Subscription", url: "/subscription", icon: CreditCard },
];

const systemItems = [
  { title: "System Health", url: "/health", icon: Activity },
  { title: "AI Insights", url: "/ai", icon: Brain },
  { title: "Security", url: "/security", icon: Shield },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { open, setOpen } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium border-r-2 border-primary" 
      : "hover:bg-sidebar-accent/50";

  return (
    <Sidebar 
      className={`${!open ? "w-16" : "w-64"} transition-all duration-300 border-r border-sidebar-border`}
      collapsible="icon"
    >
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <img 
              src="/lovable-uploads/57ba805a-8067-402e-a68a-b01d47cf928b.png" 
              alt="Qatalyst Logo" 
              className="w-6 h-6"
            />
          </div>
          {open && (
            <div>
              <h2 className="text-lg font-bold text-sidebar-foreground">QatalystQ</h2>
              <p className="text-xs text-sidebar-foreground/60">Queue Management</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className={!open ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="min-h-12 touch-manipulation">
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavCls}
                      title={!open ? item.title : undefined}
                    >
                      <item.icon className="w-5 h-5 shrink-0" />
                      {open && <span className="ml-3">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className={!open ? "sr-only" : ""}>
            System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="min-h-12 touch-manipulation">
                    <NavLink 
                      to={item.url} 
                      className={getNavCls}
                      title={!open ? item.title : undefined}
                    >
                      <item.icon className="w-5 h-5 shrink-0" />
                      {open && <span className="ml-3">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {open && (
          <div className="mt-auto p-4">
            <div className="bg-sidebar-accent/50 rounded-lg p-3">
              <Badge className="bg-gradient-success text-white animate-pulse-soft mb-2">
                <Activity className="w-3 h-3 mr-1" />
                System Healthy
              </Badge>
              <p className="text-xs text-sidebar-foreground/60">
                All services operational
              </p>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}