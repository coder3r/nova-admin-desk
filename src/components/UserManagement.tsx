import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  Mail,
  Package,
  Pencil,
  RefreshCw,
  Search,
  Send,
  Users,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

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

interface LinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (link: string) => void;
  title: string;
  placeholder: string;
  defaultValue?: string;
  email: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const API_SOCKET_URL = import.meta.env.VITE_API_SOCKET_URL || "";

const playNotificationSound = () => {
  const audio = new Audio("/sounds/notify.mp3");
  audio.play().catch((err) => console.warn("🔇 Sound error:", err));
};

const LinkDialog = ({ isOpen, onClose, onSubmit, title, placeholder, defaultValue = "", email }: LinkDialogProps) => {
  const [link, setLink] = useState(defaultValue);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!link.trim()) return;
    
    setIsSubmitting(true);
    await onSubmit(link.trim());
    setIsSubmitting(false);
    setLink("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md mx-auto animate-scale-in">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-secondary/50"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Sending to:</p>
            <div className="flex items-center gap-2 p-2 bg-secondary/30 rounded-lg">
              <Mail className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">{email}</span>
            </div>
          </div>

          <div onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder={placeholder}
                className="h-12 bg-secondary/30 border-border/50 focus:border-primary focus:ring-primary/20"
                autoFocus
              />
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 h-11 border-border/50"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 h-11 btn-primary text-white"
                disabled={!link.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Send Link
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserManagement = () => {
  const [tempLinks, setTempLinks] = useState<TempLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState<{
    isVisible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    isVisible: false,
    message: '',
    type: 'success'
  });
  const [linkDialog, setLinkDialog] = useState<{
    isOpen: boolean;
    type: 'send' | 'edit';
    email: string;
    token?: string;
    productId?: string;
    currentLink?: string;
  }>({
    isOpen: false,
    type: 'send',
    email: ''
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchTempLinks();
    
    // Socket connection for real-time updates
    if (API_SOCKET_URL) {
      const socket = io(API_SOCKET_URL);

      socket.on("newTempLink", (newLink) => {
        playNotificationSound();
        showNotification(`New user waiting for drive link: ${newLink.email}`, 'success');
        setTempLinks((prev) => [newLink, ...prev]);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, []);

  const fetchTempLinks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/temp/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTempLinks(data.links);
        }
      }
    } catch (error) {
      console.error("Error fetching temp links:", error);
      toast({
        title: "Error",
        description: "Failed to load user requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendDriveLink = (token: string, email: string) => {
    setLinkDialog({
      isOpen: true,
      type: 'send',
      email,
      token
    });
  };

  const handleEditDriveLink = (email: string, productId: string, currentLink: string | null) => {
    setLinkDialog({
      isOpen: true,
      type: 'edit',
      email,
      productId,
      currentLink: currentLink || ''
    });
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ isVisible: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, isVisible: false }));
    }, 4000);
  };

  const submitDriveLink = async (link: string) => {
    try {
      const token = localStorage.getItem("token");
      
      if (linkDialog.type === 'send' && linkDialog.token) {
        const response = await fetch(`${API_BASE_URL}/temp/${linkDialog.token}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ driveLink: link }),
        });

        const data = await response.json();
        if (data.success) {
          setTempLinks((prev) =>
            prev.map((item) =>
              item.token === linkDialog.token
                ? { ...item, driveLink: link, status: "🚀 Link Sent" }
                : item
            )
          );
          showNotification(`Drive link sent successfully to ${linkDialog.email}!`, 'success');
          playNotificationSound();
        } else {
          throw new Error(data.message || "Failed to send drive link");
        }
      } else if (linkDialog.type === 'edit' && linkDialog.productId) {
        const userId = tempLinks.find(
          (item) => item.email === linkDialog.email && item.productId === linkDialog.productId
        )?.userId;

        if (!userId) {
          throw new Error("User ID not found");
        }

        const response = await fetch(
          `${API_BASE_URL}/drive/update/${userId}/${linkDialog.productId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ driveLink: link }),
          }
        );

        const data = await response.json();
        if (data.success) {
          setTempLinks((prev) =>
            prev.map((item) =>
              item.email === linkDialog.email && item.productId === linkDialog.productId
                ? { ...item, driveLink: link }
                : item
            )
          );
          showNotification(`Drive link updated successfully for ${linkDialog.email}!`, 'success');
        } else {
          throw new Error(data.message || "Failed to update drive link");
        }
      }
    } catch (error) {
      console.error(`Error ${linkDialog.type}ing drive link:`, error);
      showNotification(`Failed to ${linkDialog.type} drive link. Please try again.`, 'error');
    }
  };

  const refreshData = () => {
    fetchTempLinks();
  };

  const filtered = tempLinks.filter(
    (link) =>
      link.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.token.includes(searchTerm) ||
      link.productTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    if (status.includes("Expired")) return <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
    if (status.includes("Link Sent")) return <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
    return <Clock className="w-3 h-3 sm:w-4 sm:h-4" />;
  };

  const getStatusColor = (status: string) => {
    if (status.includes("Expired")) return "bg-red-100 text-red-700 border-red-200";
    if (status.includes("Link Sent")) return "bg-green-100 text-green-700 border-green-200";
    return "bg-yellow-100 text-yellow-700 border-yellow-200";
  };

  const getStatusText = (status: string, driveLink: string | null) => {
    if (status.includes("Expired")) return "Expired";
    if (status.includes("Link Sent") && driveLink) return "Delivered";
    if (status.includes("Pending")) return "Awaiting";
    return status;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass border-b border-border/50 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              onClick={() => navigate("/admin/dashboard")}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 hover:bg-secondary/50 transition-all duration-200 h-8 px-2 sm:h-9 sm:px-3"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground truncate">
                  User Management
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  Manage pending drive links and user requests
                </p>
              </div>
            </div>

            <Button
              onClick={refreshData}
              variant="outline"
              size="sm"
              disabled={loading}
              className="border-border/50 hover:bg-secondary/50 h-8 px-2 sm:h-9 sm:px-3 flex-shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline ml-2">Refresh</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Search Bar */}
        <Card className="glass-card border-0 shadow-premium animate-fade-in">
          <CardContent className="p-3 sm:p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by email, token, or product name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 sm:h-12 bg-secondary/30 border-border/50 focus:border-primary focus:ring-primary/20"
              />
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 animate-slide-up">
          <Card className="glass-card border-0 shadow-premium">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">{tempLinks.length}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 shadow-premium">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">
                    {tempLinks.filter(l => l.status.includes("Pending")).length}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Pending Links</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 shadow-premium">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">
                    {tempLinks.filter(l => l.status.includes("Link Sent")).length}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Table Card */}
        <Card className="glass-card border-0 shadow-premium animate-scale-in">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-foreground">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
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
                {/* Mobile Cards View */}
                <div className="block sm:hidden space-y-3 p-3">
                  {filtered.map((link, index) => (
                    <Card key={link.token} className="bg-secondary/20 border border-border/30 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                      <CardContent className="p-4 space-y-3">
                        {/* User Info */}
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 border-2 border-primary/20">
                            <AvatarFallback className="bg-gradient-primary text-white font-medium text-sm">
                              {link.email[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-foreground text-sm flex items-center gap-2 truncate">
                              <Mail className="w-3 h-3 text-primary flex-shrink-0" />
                              {link.email}
                            </p>
                            <p className="text-xs text-muted-foreground">ID: {link.userId}</p>
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="space-y-1">
                          <p className="font-medium text-foreground text-sm">{link.productTitle}</p>
                          <p className="text-xs text-muted-foreground">#{link.productId}</p>
                        </div>

                        {/* Status and Expiry */}
                        <div className="flex items-center justify-between gap-2">
                          <Badge className={`${getStatusColor(link.status)} border font-medium text-xs px-2 py-1`}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(link.status)}
                              <span>{getStatusText(link.status, link.driveLink)}</span>
                            </div>
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {new Date(link.expiresAt).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          {!link.driveLink && !link.status.includes("Expired") ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSendDriveLink(link.token, link.email)}
                              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white border-0 hover:scale-105 flex-1 h-9"
                            >
                              <Send className="w-3 h-3" />
                              Send Link
                            </Button>
                          ) : link.driveLink ? (
                            <div className="flex items-center gap-2 text-xs text-green-600 px-3 py-2 bg-green-50 rounded-lg flex-1 text-center border border-green-200">
                              <CheckCircle className="w-3 h-3" />
                              <span className="font-medium">Successfully Delivered</span>
                            </div>
                          ) : (
                            <div className="text-xs text-red-600 px-3 py-2 bg-red-50 rounded-lg flex-1 text-center border border-red-200 font-medium">
                              Request Expired
                            </div>
                          )}

                          {link.driveLink && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditDriveLink(link.email, link.productId, link.driveLink)}
                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 px-3 h-9"
                              >
                                <Pencil className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(link.driveLink!, '_blank')}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 h-9"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Desktop Table View */}
                <table className="w-full text-sm hidden sm:table">
                  <thead className="bg-secondary/30 border-b border-border/50">
                    <tr>
                      <th className="text-left p-3 sm:p-4 font-medium text-foreground">User</th>
                      <th className="text-left p-3 sm:p-4 font-medium text-foreground">Product</th>
                      <th className="text-left p-3 sm:p-4 font-medium text-foreground hidden lg:table-cell">Token</th>
                      <th className="text-left p-3 sm:p-4 font-medium text-foreground hidden md:table-cell">Expires</th>
                      <th className="text-left p-3 sm:p-4 font-medium text-foreground">Status</th>
                      <th className="text-left p-3 sm:p-4 font-medium text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((link, index) => (
                      <tr 
                        key={link.token} 
                        className="border-b border-border/30 hover:bg-secondary/20 transition-all duration-200 animate-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <td className="p-3 sm:p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-primary/20">
                              <AvatarFallback className="bg-gradient-primary text-white font-medium">
                                {link.email[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-medium text-foreground flex items-center gap-2">
                                <Mail className="w-3 h-3 text-primary" />
                                <span className="truncate">{link.email}</span>
                              </p>
                              <p className="text-xs text-muted-foreground">ID: {link.userId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 sm:p-4">
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">{link.productTitle}</p>
                            <p className="text-xs text-muted-foreground">#{link.productId}</p>
                          </div>
                        </td>
                        <td className="p-3 sm:p-4 hidden lg:table-cell">
                          <code className="text-xs bg-secondary/50 px-2 py-1 rounded border">
                            {link.token.substring(0, 16)}...
                          </code>
                        </td>
                        <td className="p-3 sm:p-4 text-muted-foreground hidden md:table-cell">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(link.expiresAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-3 sm:p-4">
                          <Badge className={`${getStatusColor(link.status)} border font-medium text-xs px-2 py-1`}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(link.status)}
                              <span className="hidden sm:inline">{getStatusText(link.status, link.driveLink)}</span>
                              <span className="sm:hidden">{getStatusText(link.status, link.driveLink)}</span>
                            </div>
                          </Badge>
                        </td>
                        <td className="p-3 sm:p-4">
                          <div className="flex gap-1 sm:gap-2 flex-wrap">
                            {!link.driveLink && !link.status.includes("Expired") ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSendDriveLink(link.token, link.email)}
                                className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white border-0 hover:scale-105 h-8 px-2 sm:px-3"
                              >
                                <Send className="w-3 h-3" />
                                <span className="hidden sm:inline">Send</span>
                              </Button>
                            ) : link.driveLink ? (
                              <span className="text-xs text-green-600 px-2 py-1 bg-green-50 rounded text-center border border-green-200 font-medium">
                                Delivered
                              </span>
                            ) : (
                              <span className="text-xs text-red-600 px-2 py-1 bg-red-50 rounded text-center border border-red-200 font-medium">
                                Expired
                              </span>
                            )}

                            {link.driveLink && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditDriveLink(link.email, link.productId, link.driveLink)}
                                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 h-8 px-2"
                                >
                                  <Pencil className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(link.driveLink!, '_blank')}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 px-2"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filtered.length === 0 && (
                  <div className="p-12 text-center">
                    <div className="space-y-3">
                      <Users className="w-12 h-12 text-muted-foreground/50 mx-auto" />
                      <p className="text-muted-foreground">No user requests found</p>
                      <p className="text-sm text-muted-foreground/70">
                        {searchTerm ? "Try adjusting your search terms" : "New requests will appear here"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Custom Link Dialog */}
      <LinkDialog
        isOpen={linkDialog.isOpen}
        onClose={() => setLinkDialog({ ...linkDialog, isOpen: false })}
        onSubmit={submitDriveLink}
        title={linkDialog.type === 'send' ? 'Send Drive Link' : 'Edit Drive Link'}
        placeholder="Enter Google Drive link (e.g., https://drive.google.com/file/d/...)"
        defaultValue={linkDialog.currentLink}
        email={linkDialog.email}
      />

      {/* Beautiful Notification Toast */}
      {notification.isVisible && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className={`
            flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md border
            ${notification.type === 'success' 
              ? 'bg-green-50/95 border-green-200 text-green-800' 
              : 'bg-red-50/95 border-red-200 text-red-800'
            }
            max-w-sm w-full animate-bounce-in
          `}>
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
              ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}
            `}>
              {notification.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-white" />
              ) : (
                <AlertCircle className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{notification.message}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotification(prev => ({ ...prev, isVisible: false }))}
              className="h-6 w-6 p-0 hover:bg-white/20 flex-shrink-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;