import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  Send, 
  Pencil, 
  Users, 
  Search, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Mail,
  Package,
  Calendar
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface TempLink {
  _id: string;
  email: string;
  token: string;
  productId: string;
  productTitle: string;
  driveLink: string | null;
  expiresAt: string;
  status: string;
  userId: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const playNotificationSound = () => {
  const audio = new Audio("/sounds/notify.mp3");
  audio.play().catch((err) => console.warn("🔇 Sound error:", err));
};

const UserManagement = () => {
  const [tempLinks, setTempLinks] = useState<TempLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate fetching data with loading animation
    setTimeout(() => {
      // Mock data for demonstration
      const mockData: TempLink[] = [
        {
          _id: "1",
          email: "user1@example.com",
          token: "tok_1234567890abcdef",
          productId: "prod_123",
          productTitle: "Premium Web Template",
          driveLink: null,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          status: "🔄 Awaiting Drive Link",
          userId: "user_123"
        },
        {
          _id: "2",
          email: "user2@example.com",
          token: "tok_0987654321fedcba",
          productId: "prod_456",
          productTitle: "React Dashboard Kit",
          driveLink: "https://drive.google.com/file/d/example",
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          status: "📦 Ready",
          userId: "user_456"
        }
      ];
      setTempLinks(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSendDriveLink = async (token: string, email: string) => {
    const link = prompt(`Enter Drive Link for ${email}`);
    if (!link) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert("✅ Drive link sent successfully!");
      playNotificationSound();
      
      setTempLinks((prev) =>
        prev.map((item) =>
          item.token === token
            ? { ...item, driveLink: link, status: "📦 Ready" }
            : item
        )
      );
    } catch (error) {
      console.error("❌ Error sending drive link:", error);
      alert("❌ Failed to send drive link.");
    }
  };

  const handleEditDriveLink = async (
    email: string,
    productId: string,
    currentLink: string | null
  ) => {
    const newLink = prompt("Enter new drive link:", currentLink || "");
    if (!newLink || newLink === currentLink) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert("✅ Drive link updated and confirmation sent!");
      
      setTempLinks((prev) =>
        prev.map((item) =>
          item.email === email && item.productId === productId
            ? { ...item, driveLink: newLink }
            : item
        )
      );
    } catch (error) {
      console.error("❌ Error updating drive link:", error);
      alert("❌ Failed to update drive link.");
    }
  };

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const filtered = tempLinks.filter(
    (link) =>
      link.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.token.includes(searchTerm) ||
      link.productTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    if (status.includes("Expired")) return <AlertCircle className="w-4 h-4" />;
    if (status.includes("Ready")) return <CheckCircle className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  const getStatusColor = (status: string) => {
    if (status.includes("Expired")) return "bg-destructive/10 text-destructive border-destructive/20";
    if (status.includes("Ready")) return "bg-emerald-100 text-emerald-700 border-emerald-200";
    return "bg-amber-100 text-amber-700 border-amber-200";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass border-b border-border/50 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate("/admin/dashboard")}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 hover:bg-secondary/50 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-foreground">
                  User Management
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage pending drive links and user requests
                </p>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button
                onClick={refreshData}
                variant="outline"
                size="sm"
                disabled={loading}
                className="border-border/50 hover:bg-secondary/50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline ml-2">Refresh</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-6">
        {/* Search Bar */}
        <Card className="glass-card border-0 shadow-premium animate-fade-in">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by email, token, or product name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 bg-secondary/30 border-border/50 focus:border-primary focus:ring-primary/20"
              />
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-slide-up">
          <Card className="glass-card border-0 shadow-premium">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{tempLinks.length}</p>
                  <p className="text-sm text-muted-foreground">Total Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 shadow-premium">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {tempLinks.filter(l => l.status.includes("Awaiting")).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Pending Links</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 shadow-premium">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {tempLinks.filter(l => l.status.includes("Ready")).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Table Card */}
        <Card className="glass-card border-0 shadow-premium animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Package className="w-5 h-5 text-primary" />
              Recent Purchases & Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-muted-foreground">Loading user requests...</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/30 border-b border-border/50">
                    <tr>
                      <th className="text-left p-4 font-medium text-foreground">User</th>
                      <th className="text-left p-4 font-medium text-foreground">Product</th>
                      <th className="text-left p-4 font-medium text-foreground hidden lg:table-cell">Token</th>
                      <th className="text-left p-4 font-medium text-foreground hidden md:table-cell">Expires</th>
                      <th className="text-left p-4 font-medium text-foreground">Status</th>
                      <th className="text-left p-4 font-medium text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((link, index) => (
                      <tr 
                        key={link.token} 
                        className="border-b border-border/30 hover:bg-secondary/20 transition-all duration-200 animate-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 border-2 border-primary/20">
                              <AvatarFallback className="bg-gradient-primary text-white font-medium">
                                {link.email[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground flex items-center gap-2">
                                <Mail className="w-3 h-3 text-primary" />
                                {link.email}
                              </p>
                              <p className="text-xs text-muted-foreground">ID: {link.userId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">{link.productTitle}</p>
                            <p className="text-xs text-muted-foreground">#{link.productId}</p>
                          </div>
                        </td>
                        <td className="p-4 hidden lg:table-cell">
                          <code className="text-xs bg-secondary/50 px-2 py-1 rounded border">
                            {link.token.substring(0, 16)}...
                          </code>
                        </td>
                        <td className="p-4 text-muted-foreground hidden md:table-cell">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(link.expiresAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={`${getStatusColor(link.status)} border font-medium`}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(link.status)}
                              {link.status}
                            </div>
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2 flex-wrap">
                            {!link.driveLink && !link.status.includes("Expired") ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSendDriveLink(link.token, link.email)}
                                className="flex items-center gap-1 btn-primary text-white border-0 hover:scale-105"
                              >
                                <Send className="w-3 h-3" />
                                <span className="hidden sm:inline">Send Link</span>
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground px-2 py-1 bg-secondary/30 rounded">
                                {link.driveLink ? "✅ Sent" : "⛔ Expired"}
                              </span>
                            )}

                            {link.driveLink && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleEditDriveLink(
                                    link.email,
                                    link.productId,
                                    link.driveLink
                                  )
                                }
                                className="text-accent hover:text-accent/80 hover:bg-accent/10"
                              >
                                <Pencil className="w-3 h-3" />
                                <span className="hidden sm:inline ml-1">Edit</span>
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-12 text-center">
                          <div className="space-y-3">
                            <Users className="w-12 h-12 text-muted-foreground/50 mx-auto" />
                            <p className="text-muted-foreground">No user requests found</p>
                            <p className="text-sm text-muted-foreground/70">
                              {searchTerm ? "Try adjusting your search terms" : "New requests will appear here"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default UserManagement;