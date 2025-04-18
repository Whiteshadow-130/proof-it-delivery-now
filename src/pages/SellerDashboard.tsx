
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/dashboard/StatCard";
import RecentActivity from "@/components/dashboard/RecentActivity";
import WeeklyStats from "@/components/dashboard/WeeklyStats";
import RecentOrders from "@/components/dashboard/RecentOrders";
import NewOrderDialog from "@/components/dashboard/NewOrderDialog";
import { Package, Video, PackageCheck, PackageX } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const SellerDashboard = () => {
  const [newOrderDialog, setNewOrderDialog] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    videosReceived: 0,
    successfulDeliveries: 0,
    issuesReported: 0
  });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Get current user and company ID
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.error("User not authenticated");
          return;
        }
        
        setUserId(user.id);
        
        // Get user's company_id
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('company_id')
          .eq('id', user.id)
          .single();
          
        if (userError) {
          console.error("Error fetching user data:", userError);
          return;
        }
        
        setCompanyId(userData?.company_id || null);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };
    
    fetchUserInfo();
  }, []);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        
        // Fetch all orders for the current user/company
        const query = supabase
          .from('orders')
          .select('*');
          
        // Filter by user ID or company ID
        if (companyId) {
          query.eq('company_id', companyId);
        } else {
          query.eq('user_id', userId);
        }
        
        const { data: orders, error } = await query;
        
        if (error) throw error;
        
        if (orders) {
          const videosReceived = orders.filter(order => order.status === "Video Received").length;
          const successfulDeliveries = orders.filter(order => order.verified).length;
          // For issues, calculate based on non-verified videos that were uploaded
          const issuesReported = orders.filter(order => order.video_uploaded && !order.verified).length;
          
          setStats({
            totalOrders: orders.length,
            videosReceived,
            successfulDeliveries,
            issuesReported: issuesReported || 0
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [userId, companyId]);

  const handleNewOrderSubmit = async (orderData: any) => {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to create an order");
        return;
      }
      
      // Generate a unique order number
      const orderNumber = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
      
      // Save to Supabase with user_id and company_id
      const { data, error } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          awb: orderData.awb,
          customer_name: orderData.customerName,
          customer_mobile: orderData.customerMobile,
          channel: orderData.channel,
          status: 'QR Generated',
          user_id: user.id,
          company_id: companyId
        });
      
      if (error) throw error;
      
      toast.success(`Order for ${orderData.customerName} has been created successfully.`);
      
      // Update the stats
      setStats(prevStats => ({
        ...prevStats,
        totalOrders: prevStats.totalOrders + 1
      }));
      
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order. Please try again.");
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button onClick={() => setNewOrderDialog(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Order
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Total Orders"
          value={loading ? "..." : stats.totalOrders}
          change="+14% from last month"
          icon={Package}
        />
        <StatCard
          title="Videos Received"
          value={loading ? "..." : stats.videosReceived}
          change={`${loading ? "..." : Math.round((stats.videosReceived / (stats.totalOrders || 1)) * 100)}% completion rate`}
          icon={Video}
        />
        <StatCard
          title="Successful Deliveries"
          value={loading ? "..." : stats.successfulDeliveries}
          change="+5% from last month"
          icon={PackageCheck}
        />
        <StatCard
          title="Issues Reported"
          value={loading ? "..." : stats.issuesReported}
          change="-40% from last month"
          icon={PackageX}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <RecentActivity />
        <WeeklyStats />
      </div>

      <RecentOrders />

      <NewOrderDialog
        open={newOrderDialog}
        onOpenChange={setNewOrderDialog}
        onSubmit={handleNewOrderSubmit}
      />
    </DashboardLayout>
  );
};

export default SellerDashboard;
