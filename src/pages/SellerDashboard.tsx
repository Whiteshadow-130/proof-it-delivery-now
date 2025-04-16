
import { useState } from "react";
import { Plus } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/dashboard/StatCard";
import RecentActivity from "@/components/dashboard/RecentActivity";
import WeeklyStats from "@/components/dashboard/WeeklyStats";
import RecentOrders from "@/components/dashboard/RecentOrders";
import NewOrderDialog from "@/components/dashboard/NewOrderDialog";
import { Package, Video, PackageCheck, PackageX } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const SellerDashboard = () => {
  const [newOrderDialog, setNewOrderDialog] = useState(false);
  const { toast } = useToast();

  const handleNewOrderSubmit = (orderData) => {
    // Handle new order creation in the dashboard
    toast({
      title: "Order Created",
      description: `Order for ${orderData.customerName} has been created successfully.`,
    });
    
    // In a real application, you might want to update some state or make an API call here
    console.log("New order created:", orderData);
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
          value={128}
          change="+14% from last month"
          icon={Package}
        />
        <StatCard
          title="Videos Received"
          value={89}
          change="69% completion rate"
          icon={Video}
        />
        <StatCard
          title="Successful Deliveries"
          value={75}
          change="+5% from last month"
          icon={PackageCheck}
        />
        <StatCard
          title="Issues Reported"
          value={3}
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
