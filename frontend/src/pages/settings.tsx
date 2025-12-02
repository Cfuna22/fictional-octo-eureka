import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { LogOut, ArrowLeft } from "lucide-react";
import { Switch } from "@/components/ui/switch";


const Settings = () => {
  const navigate = useNavigate();
  const [whatsappNotifications, setWhatsappNotifications] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSavePassword = () => {
    if (!password || !confirmPassword) {
      toast({
        title: "Missing Fields",
        description: "Please fill in both password fields.",
        variant: "destructive",
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated.",
      });
      setPassword("");
      setConfirmPassword("");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground text-sm">
            Manage your account and preferences
          </p>
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => navigate("/userDashboard")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </header>

      {/* Main Settings Grid */}
      <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Settings */}
        <Card className="bg-gradient-card border-border shadow-glow">
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                type="password"
                id="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                type="password"
                id="confirmPassword"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button
              onClick={handleSavePassword}
              className="w-full bg-gradient-primary text-white hover:shadow-glow"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Update Password"}
            </Button>
          </CardContent>
        </Card>

        {/* Subscription Settings */}
        <Card className="bg-gradient-card border-border shadow-glow">
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground text-base">
              Current Plan: <span className="font-semibold">Free</span>
            </p>
            <Button
              onClick={() => navigate("/userSubscription")}
              className="w-full bg-gradient-primary text-white hover:shadow-glow"
            >
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-gradient-card border-border shadow-glow">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-foreground font-semibold">WhatsApp Updates</span>
              <Switch
                checked={whatsappNotifications}
                onCheckedChange={setWhatsappNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-gradient-card border-border shadow-glow">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              onClick={() => navigate("/userProfile")}
              className="w-full bg-secondary/30 hover:bg-secondary/50"
            >
              View Profile
            </Button>
            <Button
              onClick={() => {
                console.log("User logged out");
                navigate("/");
              }}
              className="w-full bg-destructive text-white hover:bg-destructive/80"
            >
              <LogOut className="w-4 h-4 mr-2 inline" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Settings;
