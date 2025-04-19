import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode as QrCodeIcon, Plus, Download, Copy, Share2, ArrowLeft, FileText } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import QRCode from "react-qr-code";
import NewOrderDialog from "@/components/dashboard/NewOrderDialog";
import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";

interface QrCode {
  id: string;
  orderId: string;
  awb: string;
  customer: string;
  customerMobile: string;
  date: string;
  url: string;
}

const QrCodes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [qrCodes, setQrCodes] = useState<QrCode[]>([]);
  const [newOrderDialog, setNewOrderDialog] = useState(false);
  const [specificOrderId, setSpecificOrderId] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const qrRefs = useRef<Record<string, SVGSVGElement | null>>({});

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderId = params.get("order");
    if (orderId) {
      setSpecificOrderId(orderId);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchQrCodes = async () => {
      try {
        setLoading(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.error("No authenticated user found");
          toast.error("Please log in to view your QR codes");
          navigate("/login");
          return;
        }
        
        const { data: orders, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const transformedQrCodes = orders.map(order => ({
          id: `QR-${order.order_number.split('-')[1]}`,
          orderId: order.order_number,
          awb: order.awb,
          customer: order.customer_name,
          customerMobile: order.customer_mobile || "N/A",
          date: new Date(order.created_at).toISOString().split('T')[0],
          url: `${window.location.origin}/proof?order=${order.order_number}`,
        }));
        
        setQrCodes(transformedQrCodes);
      } catch (error) {
        console.error("Error fetching QR codes:", error);
        toast.error("Failed to load QR codes. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchQrCodes();
  }, []);

  const filteredQrCodes = qrCodes.filter(
    (qr) => {
      if (specificOrderId && qr.orderId !== specificOrderId) {
        return false;
      }
      
      return (
        searchTerm === "" ||
        qr.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        qr.awb.toLowerCase().includes(searchTerm.toLowerCase()) ||
        qr.customer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  );

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard");
  };

  const handleGenerateNewQR = () => {
    setNewOrderDialog(true);
  };

  const handleNewOrderSubmit = async (orderData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to create orders");
        return;
      }
      
      const newQrCode = {
        id: `QR-${orderData.id.split('-')[1]}`,
        orderId: orderData.id,
        awb: orderData.awb,
        customer: orderData.customerName,
        customerMobile: orderData.customerMobile,
        date: new Date().toISOString().split('T')[0],
        url: `${window.location.origin}/proof?order=${orderData.id}`,
      };
      
      setQrCodes([newQrCode, ...qrCodes]);
      
      toast.success(`QR code generated for order ${orderData.id}`);
    } catch (error) {
      console.error("Error creating new order:", error);
      toast.error("Failed to create new order");
    }
  };

  const handleGenerateQRForOrder = async (orderId: string) => {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderId)
        .single();
      
      if (error) throw error;
      
      if (order) {
        navigate(`/qr-codes?order=${order.order_number}`);
      } else {
        toast.error("Order not found");
      }
    } catch (error) {
      console.error("Error generating QR for order:", error);
      toast.error("Failed to generate QR code");
    }
  };

  const downloadQRCodeAsPNG = (orderId) => {
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

  const downloadQRCodeAsPDF = (qr) => {
    const svg = document.getElementById(`qr-${qr.orderId}`);
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imgData = canvas.toDataURL("image/png");
      
      const pdf = new jsPDF("p", "mm", "a4");
      
      pdf.setFontSize(20);
      pdf.text("Delivery Verification QR Code", 105, 20, { align: "center" });
      
      pdf.setFontSize(12);
      pdf.text(`Order ID: ${qr.orderId}`, 20, 40);
      pdf.text(`AWB: ${qr.awb}`, 20, 50);
      pdf.text(`Customer: ${qr.customer}`, 20, 60);
      pdf.text(`Date: ${qr.date}`, 20, 70);
      
      pdf.setFontSize(14);
      pdf.text("Instructions:", 20, 90);
      pdf.setFontSize(10);
      pdf.text("1. Scan this QR code after receiving your package", 25, 100);
      pdf.text("2. Verify your identity with OTP sent to your mobile", 25, 110);
      pdf.text("3. Record an unboxing video showing the package and contents", 25, 120);
      
      pdf.addImage(imgData, "PNG", 80, 130, 50, 50);
      
      pdf.setFontSize(8);
      pdf.text(qr.url, 105, 190, { align: "center" });
      
      pdf.setFontSize(10);
      pdf.text("Powered by Proof-It | Secure Delivery Verification", 105, 280, { align: "center" });
      
      pdf.save(`qr-${qr.orderId}.pdf`);
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const clearSpecificOrder = () => {
    setSpecificOrderId("");
    navigate("/qr-codes");
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        {specificOrderId ? (
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mr-4"
              onClick={clearSpecificOrder}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to all QR codes
            </Button>
            <h1 className="text-2xl font-bold">QR Code for {specificOrderId}</h1>
          </div>
        ) : (
          <h1 className="text-2xl font-bold">QR Codes</h1>
        )}
        
        <div className="space-x-2">
          {!specificOrderId && (
            <>
              <Button variant="outline" onClick={handleGenerateNewQR}>
                <Plus className="h-4 w-4 mr-2" /> Generate New QR
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" /> Export All
              </Button>
            </>
          )}
        </div>
      </div>

      {!specificOrderId && (
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
      )}

      {loading ? (
        <div className="flex justify-center items-center p-12">
          <p className="text-lg text-gray-500">Loading QR codes...</p>
        </div>
      ) : filteredQrCodes.length === 0 ? (
        <div className="text-center p-12">
          <QrCodeIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No QR Codes Found</h3>
          <p className="text-gray-500 mb-6">
            {specificOrderId 
              ? `No QR code found for order ${specificOrderId}.` 
              : "No QR codes match your search criteria."}
          </p>
          <Button onClick={handleGenerateNewQR}>
            <Plus className="h-4 w-4 mr-2" /> Generate New QR Code
          </Button>
        </div>
      ) : (
        <div className={specificOrderId ? "" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
          {filteredQrCodes.map((qr) => (
            <Card key={qr.id} className={specificOrderId ? "max-w-md mx-auto" : "overflow-hidden"}>
              <CardHeader className="bg-gray-50 pb-2">
                <CardTitle className="text-lg">{qr.orderId}</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex justify-center mb-4">
                  <div className="border border-gray-200 p-3 bg-white rounded-lg">
                    <QRCode
                      id={`qr-${qr.orderId}`}
                      value={qr.url}
                      size={specificOrderId ? 192 : 128}
                      level="M"
                      className={specificOrderId ? "h-48 w-48" : "h-24 w-24"}
                      ref={el => {
                        if (el) {
                          qrRefs.current[qr.orderId] = el;
                        }
                      }}
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
                    <span className="text-sm text-gray-500">Mobile:</span>
                    <span className="text-sm font-medium col-span-2">
                      {qr.customerMobile && qr.customerMobile !== "N/A" ? 
                        `XXXXX${qr.customerMobile.slice(-5)}` : 
                        "N/A"}
                    </span>
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

                <div className="flex flex-wrap gap-2">
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
                    onClick={() => downloadQRCodeAsPNG(qr.orderId)}
                  >
                    <Download className="h-3 w-3 mr-1" /> PNG
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => downloadQRCodeAsPDF(qr)}
                  >
                    <FileText className="h-3 w-3 mr-1" /> PDF
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
      )}

      <NewOrderDialog
        open={newOrderDialog}
        onOpenChange={setNewOrderDialog}
        onSubmit={handleNewOrderSubmit}
      />
    </DashboardLayout>
  );
};

export default QrCodes;
