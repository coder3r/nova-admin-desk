import {
  ArrowLeft,
  Bell,
  Check,
  Database,
  Globe,
  Key,
  Mail,
  Palette,
  Save,
  Settings,
  Shield,
  User,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SettingsData {
  general: {
    siteName: string;
    siteDescription: string;
    adminEmail: string;
    timezone: string;
    language: string;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    ipWhitelist: string[];
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    orderNotifications: boolean;
    userNotifications: boolean;
  };
  appearance: {
    theme: string;
    primaryColor: string;
    secondaryColor: string;
    darkMode: boolean;
  };
  api: {
    apiKey: string;
    webhookUrl: string;
    rateLimit: number;
  };
}

const AdminSettings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState<SettingsData>({
    general: {
      siteName: "Diwanu CodeMarket",
      siteDescription: "Premium source code marketplace for developers",
      adminEmail: "admin@diwanu.com",
      timezone: "UTC+0",
      language: "English",
    },
    security: {
      twoFactorEnabled: true,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      ipWhitelist: ["192.168.1.1", "10.0.0.1"],
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      orderNotifications: true,
      userNotifications: true,
    },
    appearance: {
      theme: "default",
      primaryColor: "#3B82F6",
      secondaryColor: "#8B5CF6",
      darkMode: false,
    },
    api: {
      apiKey: "sk_live_**********************",
      webhookUrl: "https://api.diwanu.com/webhooks",
      rateLimit: 1000,
    },
  });

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 1000);
  };

  const handleInputChange = (section: keyof SettingsData, field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const settingsTabs = [
    {
      id: "general",
      label: "General",
      icon: Settings,
      color: "text-primary",
    },
    {
      id: "security",
      label: "Security",
      icon: Shield,
      color: "text-red-400",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      color: "text-yellow-400",
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: Palette,
      color: "text-purple-400",
    },
    {
      id: "api",
      label: "API & Integrations",
      icon: Key,
      color: "text-blue-400",
    },
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="siteName">Site Name</Label>
          <Input
            id="siteName"
            value={settings.general.siteName}
            onChange={(e) => handleInputChange("general", "siteName", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="adminEmail">Admin Email</Label>
          <Input
            id="adminEmail"
            type="email"
            value={settings.general.adminEmail}
            onChange={(e) => handleInputChange("general", "adminEmail", e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="siteDescription">Site Description</Label>
        <Textarea
          id="siteDescription"
          value={settings.general.siteDescription}
          onChange={(e) => handleInputChange("general", "siteDescription", e.target.value)}
          className="mt-1"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="timezone">Timezone</Label>
          <select
            id="timezone"
            value={settings.general.timezone}
            onChange={(e) => handleInputChange("general", "timezone", e.target.value)}
            className="mt-1 w-full p-2 border border-border/50 rounded-lg bg-background"
          >
            <option value="UTC+0">UTC+0 (London)</option>
            <option value="UTC-5">UTC-5 (New York)</option>
            <option value="UTC+5:30">UTC+5:30 (India)</option>
            <option value="UTC+8">UTC+8 (Singapore)</option>
          </select>
        </div>
        <div>
          <Label htmlFor="language">Language</Label>
          <select
            id="language"
            value={settings.general.language}
            onChange={(e) => handleInputChange("general", "language", e.target.value)}
            className="mt-1 w-full p-2 border border-border/50 rounded-lg bg-background"
          >
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg border border-border/30">
          <div>
            <p className="font-medium text-foreground">Two-Factor Authentication</p>
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security to your account
            </p>
          </div>
          <button
            onClick={() => handleInputChange("security", "twoFactorEnabled", !settings.security.twoFactorEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.security.twoFactorEnabled ? "bg-primary" : "bg-secondary"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.security.twoFactorEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
          <Input
            id="sessionTimeout"
            type="number"
            value={settings.security.sessionTimeout}
            onChange={(e) => handleInputChange("security", "sessionTimeout", parseInt(e.target.value))}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
          <Input
            id="maxLoginAttempts"
            type="number"
            value={settings.security.maxLoginAttempts}
            onChange={(e) => handleInputChange("security", "maxLoginAttempts", parseInt(e.target.value))}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="ipWhitelist">IP Whitelist (one per line)</Label>
        <Textarea
          id="ipWhitelist"
          value={settings.security.ipWhitelist.join("\n")}
          onChange={(e) => handleInputChange("security", "ipWhitelist", e.target.value.split("\n"))}
          className="mt-1"
          rows={4}
          placeholder="192.168.1.1&#10;10.0.0.1"
        />
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      {Object.entries(settings.notifications).map(([key, value]) => (
        <div key={key} className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg border border-border/30">
          <div>
            <p className="font-medium text-foreground capitalize">
              {key.replace(/([A-Z])/g, " $1").toLowerCase()}
            </p>
            <p className="text-sm text-muted-foreground">
              {key === "emailNotifications" && "Receive updates via email"}
              {key === "pushNotifications" && "Browser push notifications"}
              {key === "smsNotifications" && "SMS alerts for critical events"}
              {key === "orderNotifications" && "New order notifications"}
              {key === "userNotifications" && "User registration alerts"}
            </p>
          </div>
          <button
            onClick={() => handleInputChange("notifications", key, !value)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              value ? "bg-primary" : "bg-secondary"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                value ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="theme">Theme</Label>
        <select
          id="theme"
          value={settings.appearance.theme}
          onChange={(e) => handleInputChange("appearance", "theme", e.target.value)}
          className="mt-1 w-full p-2 border border-border/50 rounded-lg bg-background"
        >
          <option value="default">Default</option>
          <option value="minimal">Minimal</option>
          <option value="modern">Modern</option>
          <option value="classic">Classic</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="primaryColor">Primary Color</Label>
          <div className="flex items-center gap-2 mt-1">
            <Input
              id="primaryColor"
              type="color"
              value={settings.appearance.primaryColor}
              onChange={(e) => handleInputChange("appearance", "primaryColor", e.target.value)}
              className="w-12 h-10 p-1 border-none"
            />
            <Input
              value={settings.appearance.primaryColor}
              onChange={(e) => handleInputChange("appearance", "primaryColor", e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="secondaryColor">Secondary Color</Label>
          <div className="flex items-center gap-2 mt-1">
            <Input
              id="secondaryColor"
              type="color"
              value={settings.appearance.secondaryColor}
              onChange={(e) => handleInputChange("appearance", "secondaryColor", e.target.value)}
              className="w-12 h-10 p-1 border-none"
            />
            <Input
              value={settings.appearance.secondaryColor}
              onChange={(e) => handleInputChange("appearance", "secondaryColor", e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg border border-border/30">
        <div>
          <p className="font-medium text-foreground">Dark Mode</p>
          <p className="text-sm text-muted-foreground">
            Switch to dark theme for better night viewing
          </p>
        </div>
        <button
          onClick={() => handleInputChange("appearance", "darkMode", !settings.appearance.darkMode)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            settings.appearance.darkMode ? "bg-primary" : "bg-secondary"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.appearance.darkMode ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );

  const renderApiSettings = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="apiKey">API Key</Label>
        <div className="flex items-center gap-2 mt-1">
          <Input
            id="apiKey"
            value={settings.api.apiKey}
            onChange={(e) => handleInputChange("api", "apiKey", e.target.value)}
            className="flex-1"
            type="password"
          />
          <Button variant="outline" size="sm">
            Regenerate
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Keep this key secure. It provides full access to your API.
        </p>
      </div>

      <div>
        <Label htmlFor="webhookUrl">Webhook URL</Label>
        <Input
          id="webhookUrl"
          value={settings.api.webhookUrl}
          onChange={(e) => handleInputChange("api", "webhookUrl", e.target.value)}
          className="mt-1"
          placeholder="https://your-app.com/webhooks"
        />
      </div>

      <div>
        <Label htmlFor="rateLimit">Rate Limit (requests per hour)</Label>
        <Input
          id="rateLimit"
          type="number"
          value={settings.api.rateLimit}
          onChange={(e) => handleInputChange("api", "rateLimit", parseInt(e.target.value))}
          className="mt-1"
        />
      </div>

      <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <h3 className="font-medium text-blue-400 mb-2">API Documentation</h3>
        <p className="text-sm text-blue-300/80 mb-3">
          Access comprehensive API documentation and examples.
        </p>
        <Button variant="outline" size="sm" className="border-blue-500/30 text-blue-400">
          View Documentation
        </Button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return renderGeneralSettings();
      case "security":
        return renderSecuritySettings();
      case "notifications":
        return renderNotificationSettings();
      case "appearance":
        return renderAppearanceSettings();
      case "api":
        return renderApiSettings();
      default:
        return renderGeneralSettings();
    }
  };

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
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                  <p className="text-muted-foreground text-sm">
                    Manage your admin preferences
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary text-white"
            >
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </div>
              ) : saved ? (
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Saved!
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </div>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <Card className="glass-card border-0 shadow-premium h-fit">
            <CardHeader>
              <CardTitle className="text-base">Settings Categories</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {settingsTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-primary text-white"
                          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? "text-white" : tab.color
                        }`}
                      />
                      <span className="font-medium text-sm">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <Card className="glass-card border-0 shadow-premium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {(() => {
                    const activeTabData = settingsTabs.find((tab) => tab.id === activeTab);
                    if (activeTabData) {
                      const Icon = activeTabData.icon;
                      return <Icon className="w-5 h-5 text-primary" />;
                    }
                    return null;
                  })()}
                  {settingsTabs.find((tab) => tab.id === activeTab)?.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  {renderTabContent()}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;