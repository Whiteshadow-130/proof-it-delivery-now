
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { User, Mail, Building, Globe, Bell, Shield, UserPlus, CreditCard } from "lucide-react";
import { supabase, ensureUserExists } from "@/integrations/supabase/client";

interface CompanySettings {
  companyName: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  logoUrl: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  orderUpdates: boolean;
  videoUploads: boolean;
  billingAlerts: boolean;
  marketingEmails: boolean;
}

interface TeamMember {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
}

const Settings = () => {
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    companyName: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    logoUrl: "",
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    orderUpdates: true,
    videoUploads: true,
    billingAlerts: true,
    marketingEmails: false,
  });
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        setLoading(true);
        
        // Ensure user exists in our database first
        const userData = await ensureUserExists();
        
        if (!userData) {
          toast.error("Could not verify your account", {
            description: "Please log in again",
          });
          return;
        }
        
        setCompanyId(userData?.company_id || null);
        
        let companyData = null;
        if (userData?.company_id) {
          const { data: company, error: companyError } = await supabase
            .from('companies')
            .select('*')
            .eq('id', userData.company_id)
            .maybeSingle();
            
          if (companyError) {
            console.error("Error fetching company:", companyError);
          } else {
            companyData = company;
          }
          
          // Fetch team members if company_id exists
          fetchTeamMembers(userData.company_id);
        }
        
        const { data: settings, error } = await supabase
          .from('settings')
          .select('*')
          .eq('user_id', userData.id)
          .maybeSingle();
        
        if (error && error.code !== 'PGRST116') {
          console.error("Error fetching settings:", error);
          toast("Could not load your settings", {
            description: error.message,
          });
          return;
        }
        
        const userCompanySettings = {
          companyName: companyData?.name || "",
          email: userData?.email || "",
          phone: companyData?.phone || "",
          website: companyData?.website || "",
          address: companyData?.address || "",
          logoUrl: companyData?.logo_url || "",
        };
        
        const userNotificationSettings = {
          emailNotifications: settings?.notification_email ?? true,
          orderUpdates: settings?.order_updates ?? true,
          videoUploads: settings?.video_uploads ?? true,
          billingAlerts: settings?.billing_alerts ?? true,
          marketingEmails: settings?.marketing_emails ?? false,
        };
        
        setCompanySettings(userCompanySettings);
        setNotifications(userNotificationSettings);
      } catch (error) {
        console.error("Error fetching user settings:", error);
        toast("Failed to load your settings", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserSettings();
  }, []);

  const fetchTeamMembers = async (companyId: string) => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('company_id', companyId);
        
      if (error) {
        console.error("Error fetching team members:", error);
        return;
      }
      
      if (data) {
        const formattedTeamMembers = data.map(member => ({
          id: member.id,
          fullName: member.full_name || 'No name',
          email: member.email,
          role: member.role,
          status: member.status
        }));
        
        setTeamMembers(formattedTeamMembers);
      }
    } catch (error) {
      console.error("Error in fetchTeamMembers:", error);
    }
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCompanySettings({
      ...companySettings,
      [name]: value,
    });
  };

  const handleNotificationChange = (setting: keyof NotificationSettings) => {
    setNotifications({
      ...notifications,
      [setting]: !notifications[setting],
    });
  };

  const handleSaveCompanySettings = async () => {
    try {
      // Ensure user exists in our database
      const userData = await ensureUserExists();
      
      if (!userData) {
        toast.error("Could not verify your account", {
          description: "Please try logging in again",
        });
        return;
      }
      
      let currentCompanyId = userData?.company_id;
      
      if (!currentCompanyId) {
        // Create a new company if one doesn't exist
        const { data: newCompany, error: createError } = await supabase
          .from('companies')
          .insert([{
            name: companySettings.companyName,
            website: companySettings.website,
            phone: companySettings.phone,
            address: companySettings.address,
            logo_url: companySettings.logoUrl
          }])
          .select()
          .single();
        
        if (createError) {
          console.error("Error creating company:", createError);
          toast.error("Failed to create company", {
            description: createError.message,
          });
          return;
        }
        
        currentCompanyId = newCompany.id;
        
        // Update the user with the new company_id
        const { error: updateUserError } = await supabase
          .from('users')
          .update({ company_id: currentCompanyId })
          .eq('id', userData.id);
        
        if (updateUserError) {
          console.error("Error updating user with company_id:", updateUserError);
          toast.error("Failed to associate company with your account", {
            description: updateUserError.message,
          });
          return;
        }
        
        setCompanyId(currentCompanyId);
      } else {
        // Update existing company
        const { error: updateCompanyError } = await supabase
          .from('companies')
          .update({
            name: companySettings.companyName,
            website: companySettings.website,
            phone: companySettings.phone,
            address: companySettings.address,
            logo_url: companySettings.logoUrl
          })
          .eq('id', currentCompanyId);
        
        if (updateCompanyError) {
          console.error("Error updating company:", updateCompanyError);
          toast.error("Failed to update company settings", {
            description: updateCompanyError.message,
          });
          return;
        }
      }
      
      toast.success("Company settings saved successfully", {
        description: "Your company information has been updated",
      });
    } catch (error) {
      console.error("Error saving company settings:", error);
      toast.error("Failed to save settings", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleSaveNotifications = async () => {
    try {
      // Ensure user exists in our database
      const userData = await ensureUserExists();
      
      if (!userData) {
        toast.error("You must be logged in to save settings", {
          description: "Authentication required",
        });
        return;
      }
      
      const notificationData = {
        user_id: userData.id,
        company_id: companyId,
        notification_email: notifications.emailNotifications,
        order_updates: notifications.orderUpdates,
        video_uploads: notifications.videoUploads,
        billing_alerts: notifications.billingAlerts,
        marketing_emails: notifications.marketingEmails,
      };
      
      // Check if settings already exist for this user
      const { data: existingSettings } = await supabase
        .from('settings')
        .select('id')
        .eq('user_id', userData.id)
        .maybeSingle();
      
      let result;
      
      if (existingSettings) {
        // Update existing settings
        result = await supabase
          .from('settings')
          .update(notificationData)
          .eq('user_id', userData.id);
      } else {
        // Create new settings
        result = await supabase
          .from('settings')
          .insert([notificationData]);
      }
      
      if (result.error) {
        console.error("Error saving notification settings:", result.error);
        toast.error("Failed to save notification preferences", {
          description: result.error.message,
        });
        return;
      }
      
      toast.success("Notification preferences updated", {
        description: "Your notification settings have been saved",
      });
    } catch (error) {
      console.error("Error saving notification settings:", error);
      toast.error("Failed to save notification preferences", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const renderTeamMembers = () => {
    if (teamMembers.length === 0) {
      return (
        <div className="text-center py-4 text-gray-500">
          No team members found. Add your first team member.
        </div>
      );
    }

    return (
      <div className="border rounded-lg divide-y">
        {teamMembers.map((member) => (
          <div key={member.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`${member.status === 'active' ? "bg-blue-100" : "bg-gray-100"} rounded-full p-2 text-blue-600`}>
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">{member.fullName}</p>
                <p className="text-sm text-gray-500">{member.email}</p>
              </div>
            </div>
            <div className="flex items-center">
              <span className={`${
                member.role === 'admin' 
                  ? "bg-green-100 text-green-800" 
                  : "bg-blue-100 text-blue-800"
              } text-xs px-2.5 py-0.5 rounded-full mr-2`}>
                {member.role}
              </span>
              <Button variant="ghost" size="sm">
                Edit
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
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

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="text-center py-4">Loading your company settings...</div>
              ) : (
                <>
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
                          value={companySettings.logoUrl}
                          onChange={handleCompanyChange}
                          placeholder="Enter logo URL"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter the URL of your company logo
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Button onClick={handleSaveCompanySettings}>
                    Save Company Settings
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading your notification preferences...</div>
              ) : (
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

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
                
                {loading ? (
                  <div className="text-center py-4">Loading team members...</div>
                ) : (
                  renderTeamMembers()
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
