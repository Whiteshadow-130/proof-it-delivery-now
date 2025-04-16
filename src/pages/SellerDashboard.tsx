
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BarChart,
  QrCode,
  Package,
  Video,
  PackageCheck,
  PackageX,
  Plus,
  Download,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

// Mock data for demo
const mockRecentOrders = [
  {
    id: "ORD-12345",
    awb: "AWB123456789",
    customer: "John Doe",
    date: "2025-04-15",
    status: "Video Received",
  },
  {
    id: "ORD-12346",
    awb: "AWB123456790",
    customer: "Jane Smith",
    date: "2025-04-15",
    status: "QR Generated",
  },
  {
    id: "ORD-12347",
    awb: "AWB123456791",
    customer: "Bob Johnson",
    date: "2025-04-14",
    status: "Video Received",
  },
  {
    id: "ORD-12348",
    awb: "AWB123456792",
    customer: "Alice Brown",
    date: "2025-04-14",
    status: "Video Pending",
  },
  {
    id: "ORD-12349",
    awb: "AWB123456793",
    customer: "Charlie Wilson",
    date: "2025-04-13",
    status: "Video Received",
  },
];

const SellerDashboard = () => {
  const [newOrderDialog, setNewOrderDialog] = useState(false);
  const [newOrderData, setNewOrderData] = useState({
    orderId: "",
    awb: "",
    customerName: "",
    channel: "",
  });
  const { toast } = useToast();

  const handleNewOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewOrderData({
      ...newOrderData,
      [name]: value,
    });
  };

  const handleNewOrderSubmit = () => {
    // Would connect to database in a real implementation
    toast({
      title: "Order created",
      description: `QR code generated for order ${newOrderData.orderId}`,
    });
    setNewOrderDialog(false);
    setNewOrderData({
      orderId: "",
      awb: "",
      customerName: "",
      channel: "",
    });
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <p className="text-xs text-muted-foreground">
              +14% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Videos Received
            </CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">69% completion rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Successful Deliveries
            </CardTitle>
            <PackageCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75</div>
            <p className="text-xs text-muted-foreground">
              +5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Issues Reported
            </CardTitle>
            <PackageX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              -40% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="mr-3 bg-green-100 p-2 rounded-full">
                  <Video className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Video uploaded</p>
                  <p className="text-sm text-gray-500">
                    Order #ORD-12345 • 12 minutes ago
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="mr-3 bg-blue-100 p-2 rounded-full">
                  <QrCode className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">QR code generated</p>
                  <p className="text-sm text-gray-500">
                    Order #ORD-12346 • 1 hour ago
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="mr-3 bg-green-100 p-2 rounded-full">
                  <Video className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Video uploaded</p>
                  <p className="text-sm text-gray-500">
                    Order #ORD-12347 • 3 hours ago
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="mr-3 bg-blue-100 p-2 rounded-full">
                  <QrCode className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">QR code generated</p>
                  <p className="text-sm text-gray-500">
                    Order #ORD-12348 • 5 hours ago
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Weekly Statistics</CardTitle>
          </CardHeader>
          <CardContent className="px-2">
            <div className="h-[200px] flex items-center justify-center">
              <BarChart className="h-16 w-16 text-gray-300" />
              <p className="text-gray-500 ml-4">
                Chart data visualization would go here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Order ID</th>
                  <th className="text-left py-3 px-4 font-medium">AWB</th>
                  <th className="text-left py-3 px-4 font-medium">Customer</th>
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockRecentOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{order.id}</td>
                    <td className="py-3 px-4">{order.awb}</td>
                    <td className="py-3 px-4">{order.customer}</td>
                    <td className="py-3 px-4">{order.date}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === "Video Received"
                            ? "bg-green-100 text-green-800"
                            : order.status === "QR Generated"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-brand-accent"
                      >
                        {order.status === "Video Received" ? "View Video" : "View QR"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={newOrderDialog} onOpenChange={setNewOrderDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle>
            <DialogDescription>
              Enter the order details to generate a QR code for delivery verification.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="orderId" className="text-right">
                Order ID
              </Label>
              <Input
                id="orderId"
                name="orderId"
                className="col-span-3"
                value={newOrderData.orderId}
                onChange={handleNewOrderChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="awb" className="text-right">
                AWB Number
              </Label>
              <Input
                id="awb"
                name="awb"
                className="col-span-3"
                value={newOrderData.awb}
                onChange={handleNewOrderChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customerName" className="text-right">
                Customer
              </Label>
              <Input
                id="customerName"
                name="customerName"
                className="col-span-3"
                value={newOrderData.customerName}
                onChange={handleNewOrderChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="channel" className="text-right">
                Channel
              </Label>
              <Input
                id="channel"
                name="channel"
                placeholder="Amazon, Shopify, etc."
                className="col-span-3"
                value={newOrderData.channel}
                onChange={handleNewOrderChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOrderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleNewOrderSubmit}>Generate QR Code</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default SellerDashboard;
