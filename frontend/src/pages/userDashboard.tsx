import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Settings, LogOut, CreditCard, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import KioskInterface from "./KioskInterface";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    // TODO: implement actual logout logic
    console.log("User logged out");
    navigate("/"); // redirect to landing/login page
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">Qatalyst Dashboard</h1>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <Button
            onClick={() => navigate("/userSubscription")}
            className="bg-gradient-primary hover:shadow-glow text-white font-semibold"
          >
            Upgrade to Premium
          </Button>
          <Button
            variant="ghost"
            className="flex items-center gap-1"
            onClick={() => navigate("/settings")}
          >
            <Settings className="w-4 h-4" /> Settings
          </Button>
          <Button
            variant="ghost"
            className="flex items-center gap-1"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" /> Logout
          </Button>
          <Button
            variant="ghost"
            className="flex items-center justify-center w-10 h-10 p-2 rounded-full bg-secondary/10 hover:bg-secondary/20"
            onClick={() => navigate("/userProfile")}
          >
            <User className="w-6 h-6 text-foreground" />
          </Button>
        </nav>

        {/* Mobile Hamburger */}
        <div className="md:hidden relative">
          <Button
            variant="ghost"
            className="p-2 rounded-full"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-6 h-6 text-foreground" />
          </Button>
          {mobileMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-card text-foreground shadow-glow rounded-lg flex flex-col py-2 z-50">
              <Button
                variant="ghost"
                className="w-full text-left px-4 py-2 hover:bg-secondary/20"
                onClick={() => navigate("/settings")}
              >
                <Settings className="w-4 h-4 mr-2 inline" /> Settings
              </Button>
              <Button
                variant="ghost"
                className="w-full text-left px-4 py-2 hover:bg-secondary/20"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2 inline" /> Logout
              </Button>
              <Button
                variant="ghost"
                className="w-full text-left px-4 py-2 hover:bg-secondary/20"
                onClick={() => navigate("/userProfile")}
              >
                <User className="w-4 h-4 mr-2 inline" /> Profile
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Dashboard Content */}
      {/* Kiosk Interface embedded */}
      <div className="w-full">
        <KioskInterface hideHeader />
      </div>
      <main className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-card border-border shadow-glow">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Your Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">Current Subscription: Free</p>
            <p className="text-muted-foreground mt-2">
              Upgrade to premium to unlock more features.
            </p>
            <Button
              onClick={() => navigate("/userSubscription")}
              className="mt-4 w-full bg-gradient-primary text-white hover:shadow-glow"
            >
              Upgrade Now
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-glow">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Usage Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">Tickets generated: 12</p>
            <p className="text-foreground">Active sessions: 3</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-glow">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button
              onClick={() => navigate("/userProfile")}
              className="bg-secondary/30 hover:bg-secondary/50 w-full"
            >
              View Profile
            </Button>
            <Button
              onClick={() => navigate("/settings")}
              className="bg-secondary/30 hover:bg-secondary/50 w-full"
            >
              Settings
            </Button>
            <Button
              onClick={handleLogout}
              className="bg-destructive text-white hover:bg-destructive/80 w-full"
            >
              Logout
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default UserDashboard;
