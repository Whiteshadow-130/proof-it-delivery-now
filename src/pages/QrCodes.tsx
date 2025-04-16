
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode as QrCodeIcon, Plus, Download, Copy, Share2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import QRCode from "react-qr-code";
import NewOrderDialog from "@/components/dashboard/NewOrderDialog";

// Mock orders data - in a real app, this would come from API/backend
const mockOrders = [
  {
    id: "ORD-12345",
    awb: "AWB123456789",
    customer: "John Doe",
    date: "2025-04-15",
    status: "QR Generated",
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
    status: "QR Generated",
    channel: "Flipkart",
  },
  {
    id: "ORD-12348",
    awb: "AWB123456792",
    customer: "Alice Brown",
    date: "2025-04-14",
    status: "QR Generated",
    channel: "Amazon",
  },
  {
    id: "ORD-12349",
    awb: "AWB123456793",
    customer: "Charlie Wilson",
    date: "2025-04-13",
    status: "QR Generated",
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
    status: "QR Generated",
    channel: "Amazon",
  },
  {
    id: "ORD-12352",
    awb: "AWB123456796",
    customer: "Grace Lee",
    date: "2025-04-12",
    status: "QR Generated",
    channel: "Flipkart",
  },
];

const QrCodes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [qrCodes, setQrCodes] = useState([]);
  const [newOrderDialog, setNewOrderDialog] = useState(false);
  const navigate = useNavigate();

  // Generate QR code URLs and data on component mount
  useEffect(() => {
    // Generate QR codes from orders
    const generatedQrCodes = mockOrders.map(order => ({
      id: `QR-${order.id.split('-')[1]}`,
      orderId: order.id,
      awb: order.awb,
      customer: order.customer,
      date: order.date,
      url: `${window.location.origin}/proof?order=${order.id}`,
    }));
    
    setQrCodes(generatedQrCodes);
  }, []);

  // Filter QR codes based on search
  const filteredQrCodes = qrCodes.filter(
    (qr) =>
      searchTerm === "" ||
      qr.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qr.awb.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qr.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard");
  };

  const handleGenerateNewQR = () => {
    setNewOrderDialog(true);
  };

  const handleNewOrderSubmit = (orderData) => {
    // Create a new order ID
    const newOrderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    
    // Create new QR code
    const newQrCode = {
      id: `QR-${newOrderId.split('-')[1]}`,
      orderId: newOrderId,
      awb: orderData.awb,
      customer: orderData.customerName,
      date: new Date().toISOString().split('T')[0],
      url: `${window.location.origin}/proof?order=${newOrderId}`,
    };
    
    // Add to QR codes list
    setQrCodes([newQrCode, ...qrCodes]);
    
    toast.success(`QR code generated for order ${newOrderId}`);
  };

  const downloadQRCode = (orderId) => {
    const svg = document.getElementById(`qr-${orderId}`);
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      
      const downloadLink = document.createElement("a");
      downloadLink.download = `qr-${orderId}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">QR Codes</h1>
        <div className="space-x-2">
          <Button variant="outline" onClick={handleGenerateNewQR}>
            <Plus className="h-4 w-4 mr-2" /> Generate New QR
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" /> Export All
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Search QR Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search by order ID, AWB, or customer name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="secondary">Search</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQrCodes.map((qr) => (
          <Card key={qr.id} className="overflow-hidden">
            <CardHeader className="bg-gray-50 pb-2">
              <CardTitle className="text-lg">{qr.orderId}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex justify-center mb-4">
                <div className="border border-gray-200 p-3 bg-white rounded-lg">
                  <QRCode
                    id={`qr-${qr.orderId}`}
                    value={qr.url}
                    size={128}
                    level="M"
                    className="h-24 w-24"
                  />
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="grid grid-cols-3">
                  <span className="text-sm text-gray-500">AWB:</span>
                  <span className="text-sm font-medium col-span-2">{qr.awb}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-sm text-gray-500">Customer:</span>
                  <span className="text-sm font-medium col-span-2">{qr.customer}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-sm text-gray-500">Created:</span>
                  <span className="text-sm font-medium col-span-2">{qr.date}</span>
                </div>
                <div className="pt-2">
                  <Input 
                    value={qr.url} 
                    readOnly 
                    className="text-xs bg-gray-50"
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs"
                  onClick={() => handleCopyUrl(qr.url)}
                >
                  <Copy className="h-3 w-3 mr-1" /> Copy URL
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs"
                  onClick={() => downloadQRCode(qr.orderId)}
                >
                  <Download className="h-3 w-3 mr-1" /> Download QR
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs"
                  onClick={() => handleCopyUrl(qr.url)}
                >
                  <Share2 className="h-3 w-3 mr-1" /> Share
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <NewOrderDialog
        open={newOrderDialog}
        onOpenChange={setNewOrderDialog}
        onSubmit={handleNewOrderSubmit}
      />
    </DashboardLayout>
  );
};

export default QrCodes;
