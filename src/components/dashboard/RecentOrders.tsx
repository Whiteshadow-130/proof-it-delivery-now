
import { useNavigate } from "react-router-dom";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";

interface Order {
  id: string;
  awb: string;
  customer: string;
  date: string;
  status: string;
}

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

const RecentOrders = () => {
  const navigate = useNavigate();

  const handleViewAction = (order: Order) => {
    if (order.status === "Video Received") {
      // In a real app, navigate to a view video page
      navigate(`/video-proof?order=${order.id}`);
      toast.success(`Viewing video for order ${order.id}`);
    } else if (order.status === "QR Generated") {
      // Redirect to the specific QR code
      navigate(`/qr-codes?order=${order.id}`);
    } else if (order.status === "Video Pending") {
      // Open the recording page for this specific order
      const recordUrl = `${window.location.origin}/proof?order=${order.id}`;
      window.open(recordUrl, '_blank');
    }
  };

  const getButtonText = (status: string) => {
    if (status === "Video Received") return "View Video";
    if (status === "QR Generated") return "View QR";
    if (status === "Video Pending") return "Get Video";
    return "View";
  };

  return (
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
                      onClick={() => handleViewAction(order)}
                    >
                      {getButtonText(order.status)}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentOrders;
