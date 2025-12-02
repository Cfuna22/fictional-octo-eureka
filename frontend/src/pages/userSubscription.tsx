import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";

const features = [
  "Unlimited ticket generation",
  "Advanced analytics dashboard",
  "Priority customer support",
  "Custom branding options",
  "Access to AI insights panel",
  "Early access to new features",
];

const UserSubscription = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background py-8 px-4 md:px-12 lg:px-24">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Subscription</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your plan and upgrade to unlock premium features
          </p>
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => navigate("/userDashboard")}
        >
          Back to Dashboard
        </Button>
      </header>

      {/* Main Content Wrapper */}
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Plan Card */}
        <Card className="bg-gradient-card border-border shadow-glow lg:col-span-1">
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground text-lg font-semibold">Free</p>
            <p className="text-muted-foreground">
              Your current plan allows limited ticket generation and basic access.
            </p>
            <Button
              className="w-full bg-gradient-primary text-white hover:shadow-glow"
              onClick={() => navigate("/userSubscription")}
            >
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>

        {/* Premium Plan Card */}
        <Card className="bg-gradient-card border-border shadow-glow lg:col-span-2 flex flex-col">
          <CardHeader>
            <CardTitle>Upgrade to Premium</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <p className="text-foreground text-base">
              Unlock unlimited tickets, advanced analytics, AI insights, and much more!
            </p>

            {/* Features Grid */}
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {features.map((feature, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-2 text-foreground bg-secondary/5 p-2 rounded"
                >
                  <Check className="w-5 h-5 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button className="mt-auto w-full bg-gradient-primary text-white hover:shadow-glow py-3 text-lg font-semibold">
              Upgrade Now
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserSubscription;
