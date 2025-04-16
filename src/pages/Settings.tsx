
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { User, Mail, Building, Globe, Bell, Shield, UserPlus, CreditCard } from "lucide-react";

const Settings = () => {
  const [companySettings, setCompanySettings] = useState({
    companyName: "Demo Company",
    email: "demo@proof-it.com",
    phone: "+1 (555) 123-4567",
    website: "www.democompany.com",
    address: "123 Business St, Suite 100\nSan Francisco, CA 94107",
    logoUrl: "",
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    orderUpdates: true,
    videoUploads: true,
    billingAlerts: true,
    marketingEmails: false,
  });

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCompanySettings({
      ...companySettings,
      [name]: value,
    });
  };

  const handleNotificationChange = (setting: string) => {
    setNotifications({
      ...notifications,
      [setting]: !notifications[setting as keyof typeof notifications],
    });
  };

  const handleSaveCompanySettings = () => {
    toast.success("Company settings saved successfully");
  };

  const handleSaveNotifications = () => {
    toast.success("Notification preferences updated");
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-flex">
          <TabsTrigger value="company">Company Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="team">Team Members</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        {/* Company Profile Tab */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="companyName">Company Name</Label>
                  </div>
                  <Input
                    id="companyName"
                    name="companyName"
                    value={companySettings.companyName}
                    onChange={handleCompanyChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="email">Email Address</Label>
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={companySettings.email}
                    onChange={handleCompanyChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="website">Website</Label>
                  </div>
                  <Input
                    id="website"
                    name="website"
                    value={companySettings.website}
                    onChange={handleCompanyChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="phone">Phone Number</Label>
                  </div>
                  <Input
                    id="phone"
                    name="phone"
                    value={companySettings.phone}
                    onChange={handleCompanyChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Business Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  rows={3}
                  value={companySettings.address}
                  onChange={handleCompanyChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Company Logo</Label>
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 border rounded flex items-center justify-center bg-gray-50">
                    {companySettings.logoUrl ? (
                      <img
                        src={companySettings.logoUrl}
                        alt="Company logo"
                        className="max-h-full max-w-full"
                      />
                    ) : (
                      <Building className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      id="logoUrl"
                      name="logoUrl"
                      placeholder="Upload a company logo"
                      type="file"
                      accept="image/*"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended: 400x400px PNG or JPG
                    </p>
                  </div>
                </div>
              </div>
              
              <Button onClick={handleSaveCompanySettings}>
                Save Company Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center">
                      <Bell className="h-4 w-4 text-gray-500 mr-2" />
                      <Label>Email Notifications</Label>
                    </div>
                    <p className="text-sm text-gray-500">
                      Receive all notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={() => handleNotificationChange("emailNotifications")}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Order Updates</Label>
                    <p className="text-sm text-gray-500">
                      Get notified when orders are created or updated
                    </p>
                  </div>
                  <Switch
                    checked={notifications.orderUpdates}
                    onCheckedChange={() => handleNotificationChange("orderUpdates")}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Video Uploads</Label>
                    <p className="text-sm text-gray-500">
                      Get notified when customers upload videos
                    </p>
                  </div>
                  <Switch
                    checked={notifications.videoUploads}
                    onCheckedChange={() => handleNotificationChange("videoUploads")}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Billing Alerts</Label>
                    <p className="text-sm text-gray-500">
                      Get notified about wallet balance and payments
                    </p>
                  </div>
                  <Switch
                    checked={notifications.billingAlerts}
                    onCheckedChange={() => handleNotificationChange("billingAlerts")}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-gray-500">
                      Receive product updates and marketing newsletters
                    </p>
                  </div>
                  <Switch
                    checked={notifications.marketingEmails}
                    onCheckedChange={() => handleNotificationChange("marketingEmails")}
                  />
                </div>
                
                <Button onClick={handleSaveNotifications}>
                  Save Notification Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Team Members</CardTitle>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" /> Add Team Member
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-500">
                  Manage team members who can access your Proof-It dashboard.
                </p>
                
                <div className="border rounded-lg divide-y">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 rounded-full p-2 text-blue-600">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Demo Admin</p>
                        <p className="text-sm text-gray-500">demo@proof-it.com</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full mr-2">
                        Admin
                      </span>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-gray-100 rounded-full p-2 text-gray-600">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Support Agent</p>
                        <p className="text-sm text-gray-500">agent@proof-it.com</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full mr-2">
                        Support
                      </span>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 rounded-full p-2 text-green-600">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Current Plan: Pro</p>
                    <p className="text-sm text-gray-500">500 video uploads per month</p>
                    <p className="text-sm text-gray-500 mt-1">Next billing date: May 16, 2025</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium flex items-center">
                  <CreditCard className="h-4 w-4 mr-2 text-gray-500" /> Payment Method
                </h3>
                
                <div className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 rounded-full p-2 text-blue-600">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Credit Card</p>
                      <p className="text-sm text-gray-500">Ending in 4242</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Change
                  </Button>
                </div>
                
                <Button variant="outline" className="w-full">
                  View Billing History
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Settings;
