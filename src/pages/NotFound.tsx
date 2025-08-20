import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-6 animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 glass rounded-3xl mb-6">
          <AlertTriangle className="w-10 h-10 text-destructive" />
        </div>
        
        <div className="space-y-3">
          <h1 className="text-6xl font-bold text-gradient">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">Page Not Found</h2>
          <p className="text-muted-foreground max-w-md">
            Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="flex items-center gap-2 border-border/50 hover:bg-secondary/50"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          
          <Button
            onClick={() => window.location.href = "/"}
            className="btn-primary text-white flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Return Home
          </Button>
        </div>

        <div className="pt-8 text-xs text-muted-foreground">
          Error Code: 404 • Page Not Found
        </div>
      </div>
    </div>
  );
};

export default NotFound;
