import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
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
  Calendar,
  Link,
  X,
  Loader2
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
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'send' | 'edit'>('send');
  const [currentUser, setCurrentUser] = useState<{email: string; token: string; productId: string; currentLink?: string}>({
    email: '', token: '', productId: '', currentLink: ''
  });
  const [driveLink, setDriveLink] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const openSendDialog = (token: string, email: string) => {
    setCurrentUser({ email, token, productId: '', currentLink: '' });
    setDialogType('send');
    setDriveLink('');
    setShowDialog(true);
  };

  const openEditDialog = (email: string, productId: string, currentLink: string | null) => {
    setCurrentUser({ email, token: '', productId, currentLink: currentLink || '' });
    setDialogType('edit');
    setDriveLink(currentLink || '');
    setShowDialog(true);
  };

  const handleDialogSubmit = async () => {
    if (!driveLink.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid drive link",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (dialogType === 'send') {
        setTempLinks((prev) =>
          prev.map((item) =>
            item.token === currentUser.token
              ? { ...item, driveLink: driveLink, status: "📦 Ready" }
              : item
          )
        );
        toast({
          title: "Success",
          description: `Drive link sent to ${currentUser.email}`,
        });
        playNotificationSound();
      } else {
        setTempLinks((prev) =>
          prev.map((item) =>
            item.email === currentUser.email && item.productId === currentUser.productId
              ? { ...item, driveLink: driveLink }
              : item
          )
        );
        toast({
          title: "Success",
          description: "Drive link updated and confirmation sent!",
        });
      }

      setShowDialog(false);
      setDriveLink('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
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
                          <div className="flex gap-2 flex-wrap items-center">
                            {!link.driveLink && !link.status.includes("Expired") ? (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => openSendDialog(link.token, link.email)}
                                className="btn-primary text-white border-0 hover-scale shadow-glow min-w-[80px] h-8 px-3"
                              >
                                <Send className="w-3.5 h-3.5 shrink-0" />
                                <span className="hidden sm:inline ml-1.5">Send</span>
                              </Button>
                            ) : (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-2.5 py-1.5 bg-secondary/30 rounded-md border">
                                {link.driveLink ? (
                                  <>
                                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                                    <span>Sent</span>
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="w-3 h-3 text-destructive" />
                                    <span>Expired</span>
                                  </>
                                )}
                              </div>
                            )}

                            {link.driveLink && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(link.email, link.productId, link.driveLink)}
                                className="border-border/50 hover:bg-secondary/50 hover-scale min-w-[70px] h-8 px-3"
                              >
                                <Pencil className="w-3.5 h-3.5 shrink-0" />
                                <span className="hidden sm:inline ml-1.5">Edit</span>
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

      {/* Drive Link Input Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md glass-card border-0 shadow-premium">
          <DialogHeader className="space-y-3">
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Link className="w-5 h-5 text-primary" />
              {dialogType === 'send' ? 'Send Drive Link' : 'Edit Drive Link'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {dialogType === 'send' 
                ? `Send a Google Drive link to ${currentUser.email}` 
                : `Update the drive link for ${currentUser.email}`
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="driveLink" className="text-sm font-medium text-foreground">
                Google Drive Link
              </Label>
              <Input
                id="driveLink"
                value={driveLink}
                onChange={(e) => setDriveLink(e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
                className="h-11 bg-secondary/30 border-border/50 focus:border-primary focus:ring-primary/20"
                disabled={actionLoading}
              />
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Important</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Make sure the drive link is publicly accessible and the user has download permissions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={actionLoading}
              className="border-border/50"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDialogSubmit}
              disabled={actionLoading || !driveLink.trim()}
              className="btn-primary text-white hover-scale shadow-glow min-w-[100px]"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {dialogType === 'send' ? 'Sending...' : 'Updating...'}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {dialogType === 'send' ? 'Send Link' : 'Update Link'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;