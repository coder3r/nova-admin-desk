import {
  ArrowLeft,
  BarChart3,
  Calendar,
  Download,
  Eye,
  Filter,
  LineChart,
  PieChart,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AnalyticsData {
  revenue: {
    total: number;
    growth: number;
    daily: Array<{ date: string; amount: number }>;
  };
  users: {
    total: number;
    active: number;
    new: number;
    growth: number;
  };
  products: {
    views: number;
    sales: number;
    topProducts: Array<{ name: string; sales: number; revenue: number }>;
  };
  traffic: {
    pageViews: number;
    uniqueVisitors: number;
    bounceRate: number;
    avgSessionDuration: string;
  };
}

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    revenue: {
      total: 45680,
      growth: 23.5,
      daily: [
        { date: "2024-01-01", amount: 1200 },
        { date: "2024-01-02", amount: 1450 },
        // ... more data
      ],
    },
    users: {
      total: 1250,
      active: 890,
      new: 156,
      growth: 18.2,
    },
    products: {
      views: 12450,
      sales: 892,
      topProducts: [
        { name: "React Dashboard Pro", sales: 234, revenue: 23400 },
        { name: "Vue E-commerce Kit", sales: 189, revenue: 18900 },
        { name: "Angular Admin Panel", sales: 167, revenue: 16700 },
      ],
    },
    traffic: {
      pageViews: 45670,
      uniqueVisitors: 12340,
      bounceRate: 32.5,
      avgSessionDuration: "3m 24s",
    },
  });

  useEffect(() => {
    // Simulate loading analytics data
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleExportData = () => {
    // Export functionality would go here
    console.log("Exporting analytics data...");
  };

  const periodOptions = [
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" },
    { value: "1y", label: "Last year" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-lg text-muted-foreground">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass border-b border-border/50 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate("/admin/dashboard")}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
                  <p className="text-muted-foreground text-sm">
                    Comprehensive business insights
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-border/50 rounded-lg bg-background text-foreground text-sm"
              >
                {periodOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Button
                onClick={handleExportData}
                variant="outline"
                size="sm"
                className="border-border/50"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-border/50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-8 space-y-8">
        {/* Key Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-card border-0 shadow-premium">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Revenue
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    ${analyticsData.revenue.total.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-emerald-400">
                    <TrendingUp className="w-3 h-3" />
                    +{analyticsData.revenue.growth}%
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 shadow-premium">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Users
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {analyticsData.users.active.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-blue-400">
                    <TrendingUp className="w-3 h-3" />
                    +{analyticsData.users.growth}%
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 shadow-premium">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Page Views
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {analyticsData.traffic.pageViews.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 text-sm text-purple-400">
                    <Eye className="w-3 h-3" />
                    Traffic insights
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600">
                  <Eye className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 shadow-premium">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Bounce Rate
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {analyticsData.traffic.bounceRate}%
                  </p>
                  <div className="flex items-center gap-1 text-sm text-orange-400">
                    <TrendingDown className="w-3 h-3" />
                    -2.3% improvement
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Charts and Detailed Analytics */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Chart */}
          <Card className="glass-card border-0 shadow-premium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5 text-primary" />
                Revenue Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-border/30 rounded-lg">
                <div className="text-center space-y-2">
                  <LineChart className="w-12 h-12 text-muted-foreground/50 mx-auto" />
                  <p className="text-muted-foreground">Revenue Chart</p>
                  <p className="text-sm text-muted-foreground/70">
                    Chart visualization would be integrated here
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Analytics */}
          <Card className="glass-card border-0 shadow-premium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" />
                User Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-border/30 rounded-lg">
                <div className="text-center space-y-2">
                  <PieChart className="w-12 h-12 text-muted-foreground/50 mx-auto" />
                  <p className="text-muted-foreground">User Analytics Chart</p>
                  <p className="text-sm text-muted-foreground/70">
                    Pie chart showing user demographics
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Top Products and Detailed Stats */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Products */}
          <Card className="glass-card border-0 shadow-premium lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Top Performing Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <div className="space-y-4">
                  {analyticsData.products.topProducts.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/20 border border-border/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            #{index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.sales} sales
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">
                          ${product.revenue.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Traffic Sources */}
          <Card className="glass-card border-0 shadow-premium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary" />
                Traffic Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { source: "Direct", percentage: 45, color: "bg-blue-500" },
                  { source: "Google", percentage: 32, color: "bg-green-500" },
                  { source: "Social Media", percentage: 15, color: "bg-purple-500" },
                  { source: "Referrals", percentage: 8, color: "bg-orange-500" },
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground">{item.source}</span>
                      <span className="text-muted-foreground">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-secondary/30 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Detailed Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card border-0 shadow-premium">
            <CardHeader>
              <CardTitle className="text-base">Session Duration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground mb-2">
                  {analyticsData.traffic.avgSessionDuration}
                </p>
                <p className="text-sm text-muted-foreground">Average time</p>
                <div className="mt-4 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <p className="text-emerald-400 text-sm font-medium">+12% from last month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 shadow-premium">
            <CardHeader>
              <CardTitle className="text-base">New vs Returning</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">New Users</span>
                  <span className="font-bold text-foreground">
                    {analyticsData.users.new}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Returning</span>
                  <span className="font-bold text-foreground">
                    {analyticsData.users.total - analyticsData.users.new}
                  </span>
                </div>
                <div className="w-full bg-secondary/30 rounded-full h-2 mt-4">
                  <div
                    className="h-2 rounded-full bg-gradient-primary"
                    style={{
                      width: `${(analyticsData.users.new / analyticsData.users.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 shadow-premium">
            <CardHeader>
              <CardTitle className="text-base">Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground mb-2">7.2%</p>
                <p className="text-sm text-muted-foreground">Purchase rate</p>
                <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <p className="text-blue-400 text-sm font-medium">Industry average: 2.9%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default AdminAnalytics;