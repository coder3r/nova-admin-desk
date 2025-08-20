import AdminLogin from '@/components/AdminLogin';
import { Shield, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const adminStatus = localStorage.getItem("admin");
    const token = localStorage.getItem("token");
    
    if (adminStatus === "true" && token) {
      setIsAdmin(true);
      navigate('/admin/dashboard');
    }
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 glass rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-primary animate-glow" />
          </div>
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="space-y-2">
            <p className="text-foreground font-medium">Loading Nova Admin</p>
            <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
              <Zap className="w-3 h-3 text-accent" />
              <span>Initializing premium dashboard...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <AdminLogin />;
};

export default Index;