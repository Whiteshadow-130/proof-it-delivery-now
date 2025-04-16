
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const ThankYou = () => {
  const location = useLocation();
  const { toast } = useToast();
  const orderNumber = new URLSearchParams(location.search).get("order") || "Unknown";
  
  useEffect(() => {
    // Notify the user that the video was successfully uploaded
    toast({
      title: "Video uploaded successfully",
      description: "Thank you for providing delivery verification",
    });
  }, [toast]);
  
  const handleDownloadReceipt = () => {
    // In a real app, we would generate a receipt PDF or open a download URL
    toast({
      title: "Receipt downloaded",
      description: "Your delivery confirmation receipt has been downloaded",
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-brand-blue text-white py-4 px-6 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold">Proof-It</h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Thank You!</h1>
          <p className="text-gray-600 mb-6">
            Your delivery verification video has been successfully uploaded.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium flex items-center justify-center">
              <Package className="h-5 w-5 mr-2 text-brand-accent" />
              Order Details
            </h3>
            <div className="mt-3">
              <p className="text-sm text-gray-500">Order Number</p>
              <p className="font-medium">{orderNumber}</p>
            </div>
            <div className="mt-3">
              <p className="text-sm text-gray-500">Verification Date</p>
              <p className="font-medium">{new Date().toLocaleDateString()}</p>
            </div>
            <div className="mt-3">
              <p className="text-sm text-gray-500">Verification ID</p>
              <p className="font-medium">VID-{Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center"
              onClick={handleDownloadReceipt}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Confirmation
            </Button>
            
            <p className="text-sm text-gray-500">
              A copy of this confirmation has also been sent to the seller.
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t py-4 px-6">
        <div className="container mx-auto text-center text-sm text-gray-500">
          <p>Powered by Proof-It | Secure Delivery Verification</p>
          <p className="mt-1">
            <a href="/" className="text-brand-accent hover:underline">
              Return to Home
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ThankYou;
