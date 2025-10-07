import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import fishingImage from "@/assets/fishing-404.jpg";
import { Fish, Home } from "lucide-react";

const NotFound: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-background to-primary/5">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating fish */}
        <Fish className="absolute left-[10%] top-[20%] h-8 w-8 animate-float text-secondary/30" />
        <Fish
          className="absolute right-[15%] top-[60%] h-6 w-6 animate-wave text-accent/30"
          style={{ animationDelay: "1s" }}
        />
        <Fish
          className="absolute left-[80%] bottom-[30%] h-10 w-10 animate-float text-primary/30"
          style={{ animationDelay: "2s" }}
        />

        {/* Ripple effects */}
        <div className="absolute left-[20%] top-[40%] h-32 w-32 animate-ripple rounded-full bg-primary/10" />
        <div
          className="absolute right-[25%] bottom-[35%] h-40 w-40 animate-ripple rounded-full bg-secondary/10"
          style={{ animationDelay: "1.5s" }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 text-center">
        <div className="grid gap-8 md:grid-cols-2 md:items-center md:gap-12">
          {/* Left side - Image */}
          <div className="order-2 md:order-1">
            <div className="relative overflow-hidden rounded-3xl shadow-[0_20px_60px_-15px_rgba(59,130,246,0.3)]">
              <img
                src={fishingImage}
                alt="Person fishing by the water"
                className="h-auto w-full animate-fade-in-up"
              />
              {/* Fishing rod bob animation */}
              <div className="absolute right-[30%] top-[20%] h-24 w-1 origin-top animate-bob bg-gradient-to-b from-transparent to-primary/40" />
            </div>
          </div>

          {/* Right side - Text content */}
          <div className="order-1 space-y-6 md:order-2 md:text-left">
            {/* 404 Number */}
            <div className="animate-fade-in-up">
              <h1 className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-8xl font-black tracking-tighter text-transparent md:text-9xl">
                404
              </h1>
            </div>

            {/* Message */}
            <div className="animate-fade-in-up space-y-3" style={{ animationDelay: "0.1s" }}>
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">
                Oops! We're fishing for that page…
              </h2>
              <p className="text-lg text-muted-foreground md:text-xl">
                Looks like this page swam away. Don't worry, we'll help you get back on course!
              </p>
            </div>

            {/* CTA Button */}
            <div className="animate-fade-in-up pt-4" style={{ animationDelay: "0.2s" }}>
              <Link to="/">
                <Button variant="ocean" size="lg" className="group gap-3 text-base font-semibold">
                  <Home className="h-5 w-5 transition-transform group-hover:scale-110" />
                  Go Back to Dashboard
                </Button>
              </Link>
            </div>

            {/* Additional helpful info */}
            <div className="animate-fade-in-up pt-4" style={{ animationDelay: "0.3s" }}>
              <p className="text-sm text-muted-foreground">
                If you believe this is an error, please{" "}
                <a
                  href="/contact"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  contact support
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

