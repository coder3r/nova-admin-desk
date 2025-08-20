import {
  Activity,
  BadgeCheck,
  Bell,
  BellOff,
  BarChart3,
  DollarSign,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  TrendingUp,
  Users,
  Zap,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./../components/ui/card";

interface DashboardStats {
  totalProducts: number;
  totalUsers: number;
  totalRevenue: number;
  totalOrders: number;
}

const playNotificationSound = () => {
  const audio = new Audio("/sounds/notify.mp3");
  audio.play().catch((err) => console.warn("🔇 Sound error:", err));
};

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0,
    totalOrders: 0,
  });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<
    "granted" | "denied" | "default"
  >("default");
  const navigate = useNavigate();

  const API_SOCKET_URL = import.meta.env.VITE_API_SOCKET_URL;

  useEffect(() => {
    // Simulate loading dashboard stats with animation
    const animateStats = () => {
      const targets = {
        totalProducts: 156,
        totalUsers: 2847,
        totalRevenue: 45670,
        totalOrders: 892,
      };

      Object.entries(targets).forEach(([key, target]) => {
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          setStats(prev => ({ ...prev, [key]: Math.floor(current) }));
        }, 50);
      });
    };

    setTimeout(animateStats, 500);

    // Check notification permission
    if ('Notification' in window) {
      setNotificationStatus(Notification.permission as "granted" | "denied" | "default");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("token");
    navigate("/admin/login");
  };

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, color: "text-primary" },
    { id: "products", label: "Products", icon: Package, color: "text-accent" },
    { id: "users", label: "Users", icon: Users, color: "text-blue-400" },
    { id: "analytics", label: "Analytics", icon: BarChart3, color: "text-purple-400" },
    { id: "settings", label: "Settings", icon: Settings, color: "text-muted-foreground" },
  ];

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      gradient: "from-blue-500 to-blue-600",
      change: "+12%",
      description: "Active listings"
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      gradient: "from-emerald-500 to-emerald-600",
      change: "+5%",
      description: "Registered members"
    },
    {
      title: "Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      gradient: "from-purple-500 to-purple-600",
      change: "+18%",
      description: "Monthly earnings"
    },
    {
      title: "Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      gradient: "from-orange-500 to-orange-600",
      change: "+8%",
      description: "Completed purchases"
    },
  ];

  const recentActivities = [
    { type: "user", message: "New user registered", time: "2 minutes ago", color: "bg-blue-500" },
    { type: "purchase", message: "Product purchased", time: "5 minutes ago", color: "bg-emerald-500" },
    { type: "product", message: "New product added", time: "1 hour ago", color: "bg-purple-500" },
    { type: "update", message: "System updated", time: "2 hours ago", color: "bg-orange-500" },
  ];

  return (
    <div className="min-h-screen bg-background relative">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-72 glass-card border-r border-border/50 z-50 transform transition-transform duration-300 ease-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gradient">Nova Admin</h2>
                  <p className="text-xs text-muted-foreground">Premium Portal</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {sidebarItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 group animate-slide-up ${
                    isActive
                      ? "bg-gradient-primary text-white shadow-premium scale-105"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Icon className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-white' : item.color}`} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border/50">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full flex items-center gap-2 text-destructive border-destructive/20 hover:bg-destructive/10 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 min-h-screen">
        {/* Top Bar */}
        <header className="glass border-b border-border/50 sticky top-0 z-30">
          <div className="flex items-center justify-between p-4 lg:p-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                  Dashboard Overview
                </h1>
                <p className="text-muted-foreground text-sm lg:text-base">
                  Welcome back! Monitor your platform's performance
                </p>
              </div>
            </div>
            
            {/* Notification Status */}
            <div className="flex items-center gap-3">
              {notificationStatus === "granted" ? (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm">
                  <BadgeCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">Notifications Active</span>
                </div>
              ) : notificationStatus === "denied" ? (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm">
                  <BellOff className="w-4 h-4" />
                  <span className="hidden sm:inline">Notifications Blocked</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 text-muted-foreground text-sm">
                  <Bell className="w-4 h-4" />
                  <span className="hidden sm:inline">Enable Notifications</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-4 lg:p-8 space-y-8">
          {/* Stats Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Card
                  key={index}
                  className="glass-card border-0 shadow-premium hover:shadow-accent transition-all duration-300 hover:scale-105 animate-scale-in group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          {card.title}
                        </p>
                        <p className="text-3xl font-bold text-foreground">
                          {card.value}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-sm text-emerald-400">
                            <TrendingUp className="w-3 h-3" />
                            {card.change}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {card.description}
                          </span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${card.gradient} group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </section>

          {/* Content Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <Card className="glass-card border-0 shadow-premium animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Activity className="w-5 h-5 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all duration-200 animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className={`w-3 h-3 ${activity.color} rounded-full animate-pulse`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glass-card border-0 shadow-premium animate-fade-in">
              <CardHeader>
                <CardTitle className="text-foreground">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => navigate("/admin/products/add")}
                    className="h-20 btn-primary text-white transition-all duration-300 hover:scale-105"
                  >
                    <div className="text-center">
                      <Package className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm font-medium">Add Product</span>
                    </div>
                  </Button>
                  <Button
                    onClick={() => navigate("/admin/products")}
                    variant="outline"
                    className="h-20 border-border/50 hover:bg-secondary/50 transition-all duration-300 hover:scale-105"
                  >
                    <div className="text-center">
                      <Settings className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm font-medium">Manage</span>
                    </div>
                  </Button>
                  <Button
                    onClick={() => navigate("/admin/users")}
                    className="h-20 btn-accent text-white transition-all duration-300 hover:scale-105"
                  >
                    <div className="text-center">
                      <Users className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm font-medium">View Users</span>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 border-border/50 hover:bg-secondary/50 transition-all duration-300 hover:scale-105"
                  >
                    <div className="text-center">
                      <BarChart3 className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm font-medium">Analytics</span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;