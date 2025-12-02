import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, Key, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const UserProfile = () => {
  const navigate = useNavigate();

  // Mock user data (replace with real API later)
  const [userData, setUserData] = useState({
    name: "John Doe",
    email: "john@example.com",
    phone: "0795160491",
    subscription: "Free",
  });

  const [formData, setFormData] = useState({
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    password: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSaveChanges = () => {
    setIsSaving(true);
    setTimeout(() => {
      // Simulate API call
      setUserData({ ...userData, ...formData });
      setFormData({ ...formData, password: "" });
      setIsSaving(false);
      alert("Profile updated successfully!");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          className="p-2 rounded-full"
          onClick={() => navigate("/userDashboard")}
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Your Profile</h1>
      </header>

      {/* Profile Overview Card */}
      <Card className="bg-gradient-card border-border shadow-glow mb-6">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-primary rounded-full shadow-glow">
              <User className="w-12 h-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-xl font-bold text-foreground">
            {userData.name}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{userData.email}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Subscription: {userData.subscription}
          </p>
        </CardHeader>
      </Card>

      {/* Editable Form */}
      <Card className="bg-gradient-card border-border shadow-glow">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Edit Your Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Name */}
          <div className="relative">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="pl-10 text-lg"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          {/* Email */}
          <div className="relative">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="pl-10 text-lg"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="relative">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative mt-1">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="phone"
                type="text"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="pl-10 text-lg"
                placeholder="Enter your phone"
              />
            </div>
          </div>

          {/* Password */}
          <div className="relative">
            <Label htmlFor="password">Password (Optional)</Label>
            <div className="relative mt-1">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="pl-10 text-lg"
                placeholder="Enter new password"
              />
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="w-full bg-gradient-primary hover:shadow-glow text-white font-semibold p-4 text-lg mt-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
