
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Order {
  id: string;
  awb: string;
  customer: string;
  date: string;
  status: string;
}

const RecentOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch recent orders from Supabase
  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        setLoading(true);
        
        // Get the current user's ID
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.error("No authenticated user found");
          // Continue to render UI with empty state
          setLoading(false);
          return;
        }
        
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)  // Filter by the current user's ID
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (error) throw error;
        
        // Transform the data to match our Order interface
        const transformedOrders = data.map(order => ({
          id: order.order_number,
          awb: order.awb,
          customer: order.customer_name,
          date: new Date(order.created_at).toISOString().split('T')[0],
          status: order.status
        }));
        
        setOrders(transformedOrders);
      } catch (error) {
        console.error("Error fetching recent orders:", error);
        // Fallback to empty state if there's an error
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecentOrders();
  }, []);

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>AWB</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    Loading recent orders...
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    No orders found. Create a new order to get started.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-gray-50">
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.awb}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-brand-accent"
                        onClick={() => handleViewAction(order)}
                      >
                        {getButtonText(order.status)}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentOrders;
