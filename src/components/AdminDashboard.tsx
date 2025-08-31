import {
  Activity,
  AlertCircle,
  BadgeCheck,
  BarChart3,
  Bell,
  BellOff,
  BellRing,
  ChevronRight,
  Clock,
  DollarSign,
  Eye,
  EyeOff,
  IndianRupee,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  Package,
  RefreshCw,
  Settings,
  ShoppingCart,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  hasNotificationPermission,
  listenToForegroundMessages,
  requestNotificationPermission,
  shouldSkipNotificationSetup,
} from "../firebase/firebase-messaging";
import { Button } from "./../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./../components/ui/card";

// Custom scrollbar styles
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, rgba(59, 130, 246, 0.5), rgba(147, 51, 234, 0.5));
    border-radius: 3px;
    transition: background 0.3s ease;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, rgba(59, 130, 246, 0.8), rgba(147, 51, 234, 0.8));
  }
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(59, 130, 246, 0.5) transparent;
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = scrollbarStyles;
  document.head.appendChild(styleSheet);
}

// Types
interface DashboardStats {
  totalProducts: {
    count: number;
    change: string;
  };
  totalUsers: {
    count: number;
    change: string;
  };
  totalRevenue: {
    amount: number;
    change: string;
  };
  totalOrders: {
    count: number;
    completed: number;
    change: string;
  };
}

interface RecentActivity {
  type: string;
  message: string;
  time: string;
  color: string;
  icon?: string;
  priority?: "high" | "medium" | "low";
}

interface CacheData {
  stats: DashboardStats;
  activities: RecentActivity[];
  timestamp: number;
}

interface NovaAdminGlobals {
  novaAdminCache?: CacheData;
  novaAdminLoaded?: boolean;
}

// Constants
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const ANIMATION_DURATION = 2000;
const STATS_ANIMATION_SPEED = 30;
const NOTIFICATION_POPUP_DELAY = 2000;

// Cache Management Utilities
class CacheManager {
  private static readonly DASHBOARD_CACHE_KEY = "nova_admin_dashboard_cache";
  private static readonly DASHBOARD_LOADED_KEY = "nova_admin_dashboard_loaded";

  static saveDashboardData(
    stats: DashboardStats,
    activities: RecentActivity[]
  ): void {
    try {
      const cacheData: CacheData = {
        stats,
        activities,
        timestamp: Date.now(),
      };

      // Memory cache
      window.dashboardCache = cacheData;
      window.dashboardLoaded = true;

      // Session storage fallback
      if (typeof Storage !== "undefined") {
        try {
          sessionStorage.setItem(
            this.DASHBOARD_CACHE_KEY,
            JSON.stringify(cacheData)
          );
          sessionStorage.setItem(this.DASHBOARD_LOADED_KEY, "true");
        } catch {
          // Silent fail for storage quota exceeded
        }
      }

      // Global fallback
      const windowWithGlobals = window as Window & NovaAdminGlobals;
      windowWithGlobals.novaAdminCache = cacheData;
      windowWithGlobals.novaAdminLoaded = true;
    } catch (error) {
      console.error("Cache save failed:", error);
    }
  }

  static loadDashboardData(): {
    stats: DashboardStats | null;
    activities: RecentActivity[] | null;
    isLoaded: boolean;
  } {
    try {
      let cacheData: CacheData | null = null;
      let isLoaded = false;

      // Try memory first
      if (window.dashboardCache && window.dashboardLoaded) {
        cacheData = window.dashboardCache;
        isLoaded = window.dashboardLoaded;
      }
      // Fallback to session storage
      else if (typeof Storage !== "undefined") {
        try {
          const cachedString = sessionStorage.getItem(this.DASHBOARD_CACHE_KEY);
          const loadedString = sessionStorage.getItem(
            this.DASHBOARD_LOADED_KEY
          );

          if (cachedString && loadedString) {
            cacheData = JSON.parse(cachedString) as CacheData;
            isLoaded = loadedString === "true";

            // Restore to memory
            window.dashboardCache = cacheData;
            window.dashboardLoaded = isLoaded;
          }
        } catch {
          // Silent fail for parsing errors
        }
      }
      // Final fallback to globals
      else {
        const windowWithGlobals = window as Window & NovaAdminGlobals;
        if (
          windowWithGlobals.novaAdminCache &&
          windowWithGlobals.novaAdminLoaded
        ) {
          cacheData = windowWithGlobals.novaAdminCache;
          isLoaded = windowWithGlobals.novaAdminLoaded;
        }
      }

      if (cacheData && isLoaded) {
        const cacheAge = Date.now() - cacheData.timestamp;
        if (cacheAge < CACHE_DURATION) {
          return {
            stats: cacheData.stats,
            activities: cacheData.activities,
            isLoaded: true,
          };
        } else {
          this.clearDashboardCache();
        }
      }

      return { stats: null, activities: null, isLoaded: false };
    } catch (error) {
      console.error("Cache load failed:", error);
      return { stats: null, activities: null, isLoaded: false };
    }
  }

  static clearDashboardCache(): void {
    try {
      // Clear memory
      window.dashboardCache = undefined;
      window.dashboardLoaded = false;

      // Clear session storage
      if (typeof Storage !== "undefined") {
        try {
          sessionStorage.removeItem(this.DASHBOARD_CACHE_KEY);
          sessionStorage.removeItem(this.DASHBOARD_LOADED_KEY);
        } catch {
          // Silent fail
        }
      }

      // Clear globals
      const windowWithGlobals = window as Window & NovaAdminGlobals;
      windowWithGlobals.novaAdminCache = undefined;
      windowWithGlobals.novaAdminLoaded = false;
    } catch (error) {
      console.error("Cache clear failed:", error);
    }
  }
}

// Utility Functions
const getActivityIcon = (type: string) => {
  const iconMap: Record<string, React.ElementType> = {
    user: Users,
    order: ShoppingCart,
    product: Package,
    payment: IndianRupee,
    system: Settings,
    default: Activity,
  };
  return iconMap[type] || iconMap.default;
};

const getPriorityColor = (priority: string = "medium") => {
  const colorMap: Record<string, string> = {
    high: "bg-red-500",
    medium: "bg-yellow-500",
    low: "bg-green-500",
  };
  return colorMap[priority] || colorMap.medium;
};

// Check if notification popup should be shown
const shouldShowNotificationPopup = (): boolean => {
  // Don't show if already granted or denied
  if (hasNotificationPermission() || Notification.permission === "denied") {
    return false;
  }

  // Don't show if user dismissed in this session
  if (sessionStorage.getItem("fcm_popup_dismissed") === "true") {
    return false;
  }

  // Don't show if permission was previously denied
  if (localStorage.getItem("fcm_permission_denied") === "true") {
    return false;
  }

  // Don't show if setup was recently completed
  if (shouldSkipNotificationSetup()) {
    return false;
  }

  return true;
};

// Global cache declaration
declare global {
  interface Window extends NovaAdminGlobals {
    dashboardCache?: CacheData;
    dashboardLoaded?: boolean;
  }
}

const AdminDashboard = () => {
  // Initialize with cached data
  const cachedData = CacheManager.loadDashboardData();

  // State Management
  const [stats, setStats] = useState<DashboardStats>(
    cachedData.stats || {
      totalProducts: { count: 0, change: "+0%" },
      totalUsers: { count: 0, change: "+0%" },
      totalRevenue: { amount: 0, change: "+0%" },
      totalOrders: { count: 0, completed: 0, change: "+0%" },
    }
  );

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    cachedData.activities || []
  );

  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<
    "granted" | "denied" | "default"
  >(Notification.permission as "granted" | "denied" | "default");
  const [loading, setLoading] = useState(!cachedData.isLoaded);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string>("");
  const [hasInitialData, setHasInitialData] = useState(cachedData.isLoaded);
  const [isMounted, setIsMounted] = useState(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [revenueVisible, setRevenueVisible] = useState(false);

  const navigate = useNavigate();
  const animationInProgress = useRef(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const notificationPopupTimeout = useRef<NodeJS.Timeout>();

  // Animation handler for stats counters
  const animateStats = useCallback(
    (targetStats: DashboardStats) => {
      if (hasInitialData || animationInProgress.current) {
        setStats(targetStats);
        return;
      }

      animationInProgress.current = true;
      const targets = {
        totalProducts: targetStats.totalProducts.count,
        totalUsers: targetStats.totalUsers.count,
        totalRevenue: targetStats.totalRevenue.amount,
        totalOrders: targetStats.totalOrders.count,
      };

      Object.entries(targets).forEach(([key, target]) => {
        let current = 0;
        const increment = Math.max(target / 50, 1);
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }

          setStats((prev) => ({
            ...prev,
            [key]: {
              ...prev[key as keyof DashboardStats],
              count:
                key === "totalRevenue"
                  ? Math.floor(current)
                  : Math.floor(current),
              amount: key === "totalRevenue" ? Math.floor(current) : undefined,
            },
          }));
        }, STATS_ANIMATION_SPEED);
      });

      setTimeout(() => {
        animationInProgress.current = false;
      }, ANIMATION_DURATION);
    },
    [hasInitialData]
  );

  // Setup notifications function with first-time check
  const setupNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No admin token found for notification setup");
        return;
      }

      console.log("Setting up Firebase admin notifications...");
      const result = await requestNotificationPermission(token);

      if (result.success) {
        console.log("Admin notifications setup successful");

        // Start listening to foreground messages
        listenToForegroundMessages();

        // Only show success notification for first-time setup
        if (result.isFirstTimeSetup) {
          // Check if notifications are supported and permission is granted
          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            new Notification("Diwanu Admin Portal", {
              body: "Firebase push notifications are now active for your admin account",
              icon: "/favicon.ico",
              badge: "/favicon.ico",
            });
          }
        }
      } else {
        console.error("Failed to setup admin notifications:", result.error);
      }
    } catch (error) {
      console.error("Error setting up Firebase notifications:", error);
    }
  }, []);

  // API call handler
  const fetchDashboardStats = useCallback(
    async (isManualRefresh = false, forceRefresh = false) => {
      try {
        if (hasInitialData && !isManualRefresh && !forceRefresh) {
          return;
        }

        if (!hasInitialData && !forceRefresh) {
          setLoading(true);
        } else if (isManualRefresh) {
          setIsRefreshing(true);
        }

        setError("");

        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/admin/login");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/admin/dashboard-stats`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("admin");
            localStorage.removeItem("token");
            CacheManager.clearDashboardCache();
            navigate("/admin/login");
            return;
          }
          throw new Error(data.message || "Failed to fetch dashboard stats");
        }

        if (data.success) {
          const newStats = data.stats;
          const newActivities = data.recentActivities || [];

          CacheManager.saveDashboardData(newStats, newActivities);
          setRecentActivities(newActivities);

          if (hasInitialData) {
            setStats(newStats);
          } else {
            animateStats(newStats);
            setHasInitialData(true);
          }
        } else {
          throw new Error(data.message || "Failed to load stats");
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        setError(errorMessage);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [API_BASE_URL, navigate, animateStats, hasInitialData]
  );

  // Effects
  useEffect(() => {
    setIsMounted(true);

    // Setup notifications if permission is already granted
    if (hasNotificationPermission()) {
      setupNotifications();
    } else if (Notification.permission === "default") {
      // Check if we should show the popup
      if (shouldShowNotificationPopup()) {
        notificationPopupTimeout.current = setTimeout(() => {
          setShowNotificationPopup(true);
        }, NOTIFICATION_POPUP_DELAY);
      }
    } else if (Notification.permission === "denied") {
      // Remember that permission was denied
      localStorage.setItem("fcm_permission_denied", "true");
    }

    if (!hasInitialData) {
      fetchDashboardStats();
    }

    return () => {
      setIsMounted(false);
      if (notificationPopupTimeout.current) {
        clearTimeout(notificationPopupTimeout.current);
      }
    };
  }, [fetchDashboardStats, hasInitialData, setupNotifications]);

  // Event Handlers
  const handleLogout = () => {
    CacheManager.clearDashboardCache();
    localStorage.removeItem("admin");
    localStorage.removeItem("token");
    navigate("/admin/login");
  };

  const handleManualRefresh = () => {
    fetchDashboardStats(true);
  };

  const handleForceRefresh = () => {
    CacheManager.clearDashboardCache();
    setHasInitialData(false);
    setStats({
      totalProducts: { count: 0, change: "+0%" },
      totalUsers: { count: 0, change: "+0%" },
      totalRevenue: { amount: 0, change: "+0%" },
      totalOrders: { count: 0, completed: 0, change: "+0%" },
    });
    setRecentActivities([]);
    fetchDashboardStats(false, true);
  };

  const handleNotificationPermission = async () => {
    if ("Notification" in window) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationStatus(permission as "granted" | "denied" | "default");
        setShowNotificationPopup(false);

        if (permission === "granted") {
          await setupNotifications();
          // Remember when setup was completed
          localStorage.setItem(
            "fcm_admin_setup_timestamp",
            Date.now().toString()
          );
          localStorage.removeItem("fcm_permission_denied");
        } else if (permission === "denied") {
          // Remember that permission was denied
          localStorage.setItem("fcm_permission_denied", "true");
        }
      } catch (error) {
        console.error("Error requesting notification permission:", error);
        setShowNotificationPopup(false);
      }
    }
  };

  const handleNotificationDismiss = () => {
    setShowNotificationPopup(false);
    // Remember that user dismissed the popup for this session
    sessionStorage.setItem("fcm_popup_dismissed", "true");
  };

  const handleNavigation = (id: string) => {
    setActiveTab(id);
    setSidebarOpen(false);

    switch (id) {
      case "dashboard":
        // Stay on dashboard
        break;
      case "products":
        navigate("/admin/products");
        break;
      case "users":
        navigate("/admin/users");
        break;
      case "analytics":
        navigate("/admin/analytics");
        break;
      case "settings":
        navigate("/admin/settings");
        break;
      default:
        break;
    }
  };

  const toggleRevenueVisibility = () => {
    setRevenueVisible(!revenueVisible);
  };

  // Configuration Data
  const sidebarItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      color: "text-primary",
    },
    { id: "products", label: "Products", icon: Package, color: "text-accent" },
    { id: "users", label: "Users", icon: Users, color: "text-blue-400" },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      color: "text-purple-400",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      color: "text-muted-foreground",
    },
  ];

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts.count,
      icon: Package,
      gradient: "from-blue-500 to-blue-600",
      change: stats.totalProducts.change,
      description: "Active listings",
    },
    {
      title: "Total Users",
      value: stats.totalUsers.count,
      icon: Users,
      gradient: "from-emerald-500 to-emerald-600",
      change: stats.totalUsers.change,
      description: "Registered members",
    },
    {
      title: "Revenue",
      value: revenueVisible
        ? `$${stats.totalRevenue.amount.toLocaleString()}`
        : "•••••••",
      icon: revenueVisible ? DollarSign : Lock,
      gradient: "from-purple-500 to-purple-600",
      change: revenueVisible ? stats.totalRevenue.change : "••••",
      description: revenueVisible ? "Total earnings" : "Confidential data",
      isRevenue: true,
    },
    {
      title: "Orders",
      value: stats.totalOrders.count,
      icon: ShoppingCart,
      gradient: "from-orange-500 to-orange-600",
      change: stats.totalOrders.change,
      description: `${stats.totalOrders.completed} completed`,
    },
  ];

  // Loading State
  if (loading && !hasInitialData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-lg text-muted-foreground">Loading Dashboard...</p>
          <p className="text-sm text-muted-foreground">
            Fetching latest data...
          </p>
        </div>
      </div>
    );
  }

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
      <aside
        className={`fixed inset-y-0 left-0 w-72 glass-card border-r border-border/50 z-50 transform transition-transform duration-300 ease-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gradient">
                    Admin Portal
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Diwanu Admin Portal
                  </p>
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
                  onClick={() => handleNavigation(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 group ${
                    isActive
                      ? "bg-gradient-primary text-white shadow-premium scale-105"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  }`}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animation: isMounted
                      ? "slide-up 0.3s ease-out forwards"
                      : "none",
                    opacity: isMounted ? 1 : 0,
                    transform: isMounted ? "translateY(0)" : "translateY(10px)",
                  }}
                >
                  <Icon
                    className={`w-5 h-5 transition-colors duration-200 ${
                      isActive ? "text-white" : item.color
                    }`}
                  />
                  <span className="font-medium">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              );
            })}
          </nav>

          {/* Footer */}
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
                  Welcome back! Diwanu CodeMarket Admin Portal.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="hover:bg-secondary/50"
                title="Manual refresh data"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline ml-2">
                  {isRefreshing ? "Refreshing..." : "Refresh"}
                </span>
              </Button>

              {/* Notification Status */}
              {notificationStatus === "granted" ? (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm">
                  <BellRing className="w-4 h-4" />
                  <span className="hidden sm:inline">Notifications Active</span>
                </div>
              ) : notificationStatus === "denied" ? (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm">
                  <BellOff className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    Notifications Blocked
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (shouldShowNotificationPopup()) {
                      setShowNotificationPopup(true);
                    } else {
                      // If popup shouldn't be shown, directly request permission
                      handleNotificationPermission();
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 text-muted-foreground text-sm hover:bg-primary/10 hover:text-primary transition-all duration-200 cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  <span className="hidden sm:inline">Enable Notifications</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-4 lg:p-8 space-y-8">
          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg border border-destructive/20 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  Error loading dashboard data
                </p>
                <p className="text-xs opacity-80 mt-1">{error}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleManualRefresh}
                className="text-destructive hover:bg-destructive/20"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          )}

          {/* Stats Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card, index) => {
              const Icon = card.icon;
              const isRevenueCard = card.isRevenue;
              return (
                <Card
                  key={index}
                  className="glass-card border-0 shadow-premium hover:shadow-accent transition-all duration-300 hover:scale-105 group"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animation: isMounted
                      ? "scale-in 0.4s ease-out forwards"
                      : "none",
                    opacity: isMounted ? 1 : 0,
                    transform: isMounted ? "scale(1)" : "scale(0.95)",
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-muted-foreground">
                            {card.title}
                          </p>
                          {isRevenueCard && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={toggleRevenueVisibility}
                              className="h-6 w-6 p-0 hover:bg-white/10 transition-all duration-300"
                            >
                              {revenueVisible ? (
                                <EyeOff className="w-3 h-3 text-muted-foreground" />
                              ) : (
                                <Eye className="w-3 h-3 text-muted-foreground" />
                              )}
                            </Button>
                          )}
                        </div>
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
                      <div
                        className={`p-3 rounded-xl bg-gradient-to-r ${
                          card.gradient
                        } group-hover:scale-110 transition-transform duration-300 ${
                          isRevenueCard && !revenueVisible ? "opacity-60" : ""
                        }`}
                      >
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
            {/* Compact Premium Recent Activity */}
            <Card
              className="glass-card border-0 shadow-premium overflow-hidden bg-gradient-to-br from-background via-background/95 to-secondary/5"
              style={{
                animation: isMounted
                  ? "fade-in 0.5s ease-out forwards"
                  : "none",
                opacity: isMounted ? 1 : 0,
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-3 px-4 bg-gradient-to-r from-primary/5 via-transparent to-accent/5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm border border-primary/20">
                    <Activity className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-foreground font-bold text-sm">
                      Recent Activity
                    </CardTitle>
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      Live updates
                    </p>
                  </div>
                </div>
                {isRefreshing && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 border border-primary/20">
                    <RefreshCw className="w-3 h-3 animate-spin text-primary" />
                    <span className="text-xs text-primary font-medium hidden sm:inline">
                      Syncing
                    </span>
                  </div>
                )}
              </CardHeader>

              <CardContent className="px-0 pb-3">
                {recentActivities.length > 0 ? (
                  <div className="max-h-64 sm:max-h-72 overflow-y-auto px-4 space-y-2 custom-scrollbar">
                    {recentActivities.map((activity, index) => {
                      const ActivityIcon = getActivityIcon(activity.type);
                      const gradients = {
                        user: "from-blue-500 to-cyan-500",
                        order: "from-emerald-500 to-teal-500",
                        product: "from-purple-500 to-pink-500",
                        payment: "from-amber-500 to-orange-500",
                        system: "from-gray-500 to-slate-500",
                        default: "from-primary to-accent",
                      };

                      return (
                        <div
                          key={`${activity.time}-${index}`}
                          className="group relative flex items-start gap-3 p-3 rounded-xl bg-gradient-to-br from-white/[0.06] via-white/[0.03] to-transparent backdrop-blur-sm border border-white/[0.08] hover:border-white/[0.15] transition-all duration-300 hover:scale-[1.01] hover:shadow-lg"
                          style={{
                            animationDelay: `${index * 0.05}s`,
                            animation: isMounted
                              ? "slide-up 0.3s ease-out forwards"
                              : "none",
                            opacity: isMounted ? 1 : 0,
                            transform: isMounted
                              ? "translateY(0)"
                              : "translateY(10px)",
                          }}
                        >
                          {/* Compact Timeline Connector */}
                          {index < recentActivities.length - 1 && (
                            <div className="absolute left-6 top-10 w-px h-4 bg-gradient-to-b from-border/40 to-transparent hidden sm:block"></div>
                          )}

                          {/* Compact Premium Icon */}
                          <div className="flex-shrink-0 relative z-10">
                            <div
                              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br ${
                                gradients[
                                  activity.type as keyof typeof gradients
                                ] || gradients.default
                              } flex items-center justify-center shadow-md group-hover:scale-105 transition-all duration-300`}
                            >
                              <ActivityIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white drop-shadow-sm" />
                            </div>

                            {/* Compact Priority Indicator */}
                            {activity.priority === "high" && (
                              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-gradient-to-br from-red-400 to-red-600 rounded-full border border-background animate-pulse">
                                <div className="absolute inset-0.5 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>

                          {/* Compact Activity Content */}
                          <div className="flex-1 min-w-0 relative z-10">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="text-xs sm:text-sm font-medium text-foreground leading-relaxed group-hover:text-primary transition-colors duration-300 line-clamp-2">
                                {activity.message}
                              </p>
                            </div>

                            {/* Compact Footer */}
                            <div className="flex items-center justify-between gap-2 mt-2">
                              <div className="flex items-center gap-2 text-xs">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-xs font-medium capitalize bg-gradient-to-r ${
                                    gradients[
                                      activity.type as keyof typeof gradients
                                    ] || gradients.default
                                  } text-white shadow-sm`}
                                >
                                  {activity.type}
                                </span>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  <span className="text-xs truncate max-w-20 sm:max-w-none">
                                    {activity.time}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {/* Live Indicator */}
                                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                                  <span className="text-xs text-emerald-400 font-medium hidden sm:inline">
                                    Live
                                  </span>
                                </div>

                                {/* Activity Number */}
                                <div className="text-xs text-muted-foreground/60 font-mono">
                                  #{String(index + 1).padStart(2, "0")}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12 px-4">
                    <div className="relative mx-auto mb-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/[0.1] shadow-lg">
                        <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground/60" />
                      </div>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-foreground mb-1">
                      All Quiet
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground/80 mb-3">
                      No recent activity
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-secondary/50 to-secondary/30 border border-border/50 text-xs text-muted-foreground">
                      <Zap className="w-3 h-3" />
                      <span className="hidden sm:inline">
                        Activity will appear here
                      </span>
                      <span className="sm:hidden">Waiting for activity</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card
              className="glass-card border-0 shadow-premium"
              style={{
                animation: isMounted
                  ? "fade-in 0.5s ease-out forwards"
                  : "none",
                opacity: isMounted ? 1 : 0,
              }}
            >
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
                    onClick={() => navigate("/admin/analytics")}
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

      {/* Notification Permission Popup */}
      {showNotificationPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div
            className="bg-background/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
            style={{
              animation: "popup-scale 0.3s ease-out forwards",
            }}
          >
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 p-6 border-b border-border/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    Enable Notifications
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Stay updated with real-time alerts
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center mt-1">
                    <Activity className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      Real-time Updates
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Get instant alerts for new orders, user registrations, and
                      system events
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mt-1">
                    <AlertCircle className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      Important Alerts
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Never miss critical system notifications or urgent admin
                      tasks
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mt-1">
                    <Settings className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Full Control</p>
                    <p className="text-sm text-muted-foreground">
                      You can disable notifications anytime from your browser
                      settings
                    </p>
                  </div>
                </div>
              </div>

              {/* Privacy Note */}
              <div className="bg-muted/20 rounded-lg p-3 mb-6 border border-border/30">
                <div className="flex items-center gap-2 mb-1">
                  <BadgeCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium text-foreground">
                    Privacy Protected
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  We only send essential admin notifications. No marketing or
                  promotional messages.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleNotificationPermission}
                  className="flex-1 btn-primary text-white hover:scale-105 transition-all duration-300"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Enable Notifications
                </Button>
                <Button
                  onClick={handleNotificationDismiss}
                  variant="outline"
                  className="px-6 border-border/50 hover:bg-secondary/50"
                >
                  Maybe Later
                </Button>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary"></div>
          </div>
        </div>
      )}

      {/* Add CSS for smooth animations */}
      <style>
        {`
          @keyframes slide-up {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes scale-in {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          @keyframes fade-in {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          
          @keyframes popup-scale {
            from {
              opacity: 0;
              transform: scale(0.9) translateY(-10px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default AdminDashboard;