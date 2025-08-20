import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Shield, Eye, EyeOff, Zap, Lock, Mail } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminBg from '@/assets/admin-bg.jpg';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("admin", "true");
        localStorage.setItem("token", data.token);
        navigate("/admin/dashboard");
      } else {
        alert(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login Error:", err);
      alert("Server error, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${adminBg})` }}
      >
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm"></div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0">
          <div className="floating absolute top-20 left-20 w-4 h-4 bg-primary/30 rounded-full animate-float"></div>
          <div className="floating absolute top-40 right-32 w-6 h-6 bg-accent/40 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="floating absolute bottom-40 left-40 w-3 h-3 bg-primary-glow/50 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="floating absolute bottom-20 right-20 w-5 h-5 bg-accent-glow/40 rounded-full animate-float" style={{ animationDelay: '0.5s' }}></div>
        </div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in">
          
          {/* Header Section */}
          <header className="text-center mb-8 animate-slide-down">
            <div className="inline-flex items-center justify-center w-20 h-20 glass rounded-3xl mb-6 group hover:scale-110 transition-all duration-300">
              <Shield className="w-10 h-10 text-primary animate-glow" />
            </div>
            <h1 className="text-4xl font-bold text-gradient mb-3">Nova Admin</h1>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Zap className="w-4 h-4 text-accent" />
              <p className="text-lg">Premium Dashboard Portal</p>
            </div>
          </header>

          {/* Login Card */}
          <Card className="glass-card border-0 shadow-premium animate-scale-in">
            <CardHeader className="space-y-1 pb-8">
              <CardTitle className="text-2xl font-semibold text-center text-foreground">
                Secure Access
              </CardTitle>
              <p className="text-center text-muted-foreground">
                Enter your credentials to access the admin panel
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-6">
                
                {/* Email Field */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    Email Address
                  </label>
                  <div className="relative group">
                    <Input
                      type="email"
                      placeholder="admin@novatech.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 bg-secondary/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all duration-300 group-hover:border-primary/50"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" />
                    Password
                  </label>
                  <div className="relative group">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your secure password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 pr-12 bg-secondary/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all duration-300 group-hover:border-primary/50"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 btn-primary text-white font-semibold rounded-xl shadow-premium hover:shadow-accent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shimmer-effect"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5" />
                      <span>Access Dashboard</span>
                    </div>
                  )}
                </Button>
              </form>

              {/* Security Footer */}
              <div className="mt-8 pt-6 border-t border-border/50">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                    <span>Secured Connection</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-primary" />
                    <span>256-bit Encryption</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="mt-6 text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <p className="text-xs text-muted-foreground">
              Nova Tech Solutions © 2024 • Admin Portal v2.0
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AdminLogin;