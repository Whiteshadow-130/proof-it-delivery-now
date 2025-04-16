
import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode, Plus, Download, Copy, Share2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";

// Sample QR code URLs
const mockQrCodes = [
  {
    id: "QR-12345",
    orderId: "ORD-12345",
    awb: "AWB123456789",
    customer: "John Doe",
    date: "2025-04-15",
    url: "https://proof-it.com/proof?order=ORD-12345&token=abc123",
  },
  {
    id: "QR-12346",
    orderId: "ORD-12346",
    awb: "AWB123456790",
    customer: "Jane Smith",
    date: "2025-04-15",
    url: "https://proof-it.com/proof?order=ORD-12346&token=def456",
  },
  {
    id: "QR-12347",
    orderId: "ORD-12347",
    awb: "AWB123456791",
    customer: "Bob Johnson",
    date: "2025-04-14",
    url: "https://proof-it.com/proof?order=ORD-12347&token=ghi789",
  },
  {
    id: "QR-12348",
    orderId: "ORD-12348",
    awb: "AWB123456792",
    customer: "Alice Brown",
    date: "2025-04-14",
    url: "https://proof-it.com/proof?order=ORD-12348&token=jkl012",
  },
];

const QrCodes = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter QR codes based on search
  const filteredQrCodes = mockQrCodes.filter(
    (qr) =>
      searchTerm === "" ||
      qr.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qr.awb.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qr.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard");
  };

  const handleGenerateNewQR = () => {
    toast.success("Redirecting to new order creation");
    // In a real app, this would redirect to or open the create order dialog
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
                  <QrCode className="h-24 w-24 text-brand-blue" />
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
                >
                  <Download className="h-3 w-3 mr-1" /> Download QR
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs"
                >
                  <Share2 className="h-3 w-3 mr-1" /> Share
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default QrCodes;
