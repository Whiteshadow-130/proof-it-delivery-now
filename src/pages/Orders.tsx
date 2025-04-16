
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Download, Search, Eye, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import NewOrderDialog from "@/components/dashboard/NewOrderDialog";
import { toast } from "@/components/ui/sonner";

// Mock data for demonstration
const mockOrders = [
  {
    id: "ORD-12345",
    awb: "AWB123456789",
    customer: "John Doe",
    date: "2025-04-15",
    status: "Video Received",
    channel: "Amazon",
  },
  {
    id: "ORD-12346",
    awb: "AWB123456790",
    customer: "Jane Smith",
    date: "2025-04-15",
    status: "QR Generated",
    channel: "Shopify",
  },
  {
    id: "ORD-12347",
    awb: "AWB123456791",
    customer: "Bob Johnson",
    date: "2025-04-14",
    status: "Video Received",
    channel: "Flipkart",
  },
  {
    id: "ORD-12348",
    awb: "AWB123456792",
    customer: "Alice Brown",
    date: "2025-04-14",
    status: "Video Pending",
    channel: "Amazon",
  },
  {
    id: "ORD-12349",
    awb: "AWB123456793",
    customer: "Charlie Wilson",
    date: "2025-04-13",
    status: "Video Received",
    channel: "Meesho",
  },
  {
    id: "ORD-12350",
    awb: "AWB123456794",
    customer: "Eva Green",
    date: "2025-04-13",
    status: "QR Generated",
    channel: "Shopify",
  },
  {
    id: "ORD-12351",
    awb: "AWB123456795",
    customer: "Frank Miller",
    date: "2025-04-12",
    status: "Video Received",
    channel: "Amazon",
  },
  {
    id: "ORD-12352",
    awb: "AWB123456796",
    customer: "Grace Lee",
    date: "2025-04-12",
    status: "Video Pending",
    channel: "Flipkart",
  },
];

const Orders = () => {
  const [orders, setOrders] = useState(mockOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all-statuses");
  const [channelFilter, setChannelFilter] = useState("all-channels");
  const [isNewOrderDialogOpen, setIsNewOrderDialogOpen] = useState(false);
  const navigate = useNavigate();

  // Add a new order
  const addNewOrder = (orderData) => {
    // Create a new order object
    const newOrder = {
      id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      awb: orderData.awb,
      customer: orderData.customerName,
      date: new Date().toISOString().split('T')[0],
      status: "QR Generated",
      channel: orderData.channel,
    };
    
    // Add the new order to the orders array
    setOrders([newOrder, ...orders]);
    toast.success(`New order ${newOrder.id} created successfully`);
  };

  // Handle view actions
  const handleViewAction = (order) => {
    if (order.status === "Video Received") {
      // Redirect to a video player page (in a real app)
      // For now, we'll just show a toast
      toast.info(`Viewing video for order ${order.id}`);
    } else if (order.status === "QR Generated") {
      // Redirect to the QR code page
      navigate(`/qr-codes?order=${order.id}`);
    } else if (order.status === "Video Pending") {
      // Open the recording page in a new tab
      const recordUrl = `${window.location.origin}/proof?order=${order.id}`;
      window.open(recordUrl, '_blank');
    }
  };

  // Filter orders based on search and filters
  const filteredOrders = orders.filter((order) => {
    // Search filter
    const matchesSearch =
      searchTerm === "" ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.awb.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    const matchesStatus = 
      statusFilter === "all-statuses" || order.status === statusFilter;

    // Channel filter
    const matchesChannel = 
      channelFilter === "all-channels" || order.channel === channelFilter;

    return matchesSearch && matchesStatus && matchesChannel;
  });

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsNewOrderDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Create Order
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" /> Export Orders
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Filter Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by order ID, AWB, or customer"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-statuses">All Statuses</SelectItem>
                <SelectItem value="Video Received">Video Received</SelectItem>
                <SelectItem value="QR Generated">QR Generated</SelectItem>
                <SelectItem value="Video Pending">Video Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-channels">All Channels</SelectItem>
                <SelectItem value="Amazon">Amazon</SelectItem>
                <SelectItem value="Shopify">Shopify</SelectItem>
                <SelectItem value="Flipkart">Flipkart</SelectItem>
                <SelectItem value="Meesho">Meesho</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Orders</CardTitle>
          <div className="text-sm text-gray-500">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
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
                  <th className="text-left py-3 px-4 font-medium">Channel</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{order.id}</td>
                    <td className="py-3 px-4">{order.awb}</td>
                    <td className="py-3 px-4">{order.customer}</td>
                    <td className="py-3 px-4">{order.date}</td>
                    <td className="py-3 px-4">{order.channel}</td>
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
                        onClick={() => handleViewAction(order)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
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

      <NewOrderDialog 
        open={isNewOrderDialogOpen} 
        onOpenChange={setIsNewOrderDialogOpen}
        onSubmit={addNewOrder}
      />
    </DashboardLayout>
  );
};

export default Orders;
