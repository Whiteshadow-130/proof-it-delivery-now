
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Package, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import OtpVerification from "@/components/verification/OtpVerification";

const OrderDetails = () => {
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [step, setStep] = useState<"order" | "otp" | "ready">("order");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Check for order number in the URL (from QR code)
    const params = new URLSearchParams(location.search);
    const order = params.get("order");
    if (order) {
      setOrderNumber(order);
      
      // Check if OTP is already verified for this order
      const isVerified = localStorage.getItem(`otp_verified_${order}`) === "true";
      if (isVerified) {
        setVerified(true);
        setStep("ready");
      } else {
        // Check if we have a mobile number for this order
        const hasMobile = !!localStorage.getItem(`mobile_${order}`);
        setStep(hasMobile ? "otp" : "order");
      }
    }
  }, [location]);

  const handleVerifyOrder = async () => {
    if (!orderNumber.trim()) {
      toast({
        variant: "destructive",
        title: "Order number required",
        description: "Please enter the order number to continue",
      });
      return;
    }

    setLoading(true);

    try {
      // Simulate API call to verify order
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // In a real app, we would validate the order number here
      // If mobile number is available for this order, move to OTP step
      const mobile = localStorage.getItem(`mobile_${orderNumber}`);
      
      if (mobile) {
        setStep("otp");
      } else {
        toast({
          variant: "destructive",
          title: "Order not found",
          description: "Could not find a valid order with this number",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not verify order number. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerificationSuccess = () => {
    setVerified(true);
    setStep("ready");
  };

  const handleStartRecording = () => {
    navigate(`/record?order=${orderNumber}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-brand-blue text-white py-4 px-6 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold">Proof-It</h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {step === "order" && (
            <div className="space-y-6">
              <div className="text-center mb-4">
                <div className="bg-blue-100 rounded-full p-4 inline-block mb-4">
                  <Package className="h-8 w-8 text-brand-accent" />
                </div>
                <h1 className="text-2xl font-bold">Delivery Verification</h1>
                <p className="text-gray-600 mt-2">
                  Please confirm your order details before recording your unboxing video
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="orderNumber" className="block text-sm font-medium">
                  Order Number / AWB
                </label>
                <Input
                  id="orderNumber"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="Enter your order number"
                  className="w-full"
                />
                <p className="text-sm text-gray-500">
                  You can find this on your order confirmation or shipping label
                </p>
              </div>

              <Button 
                className="w-full"
                onClick={handleVerifyOrder}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Continue"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === "otp" && (
            <OtpVerification 
              orderNumber={orderNumber}
              onVerificationSuccess={handleOtpVerificationSuccess}
            />
          )}

          {step === "ready" && (
            <div className="space-y-6">
              <div className="text-center mb-4">
                <div className="bg-green-100 rounded-full p-4 inline-block mb-4">
                  <Camera className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold">Start Recording</h1>
                <p className="text-gray-600 mt-2">
                  You're verified and ready to record your unboxing video
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium flex items-center text-brand-blue">
                  <Camera className="h-5 w-5 mr-2" />
                  What happens next?
                </h3>
                <ul className="mt-2 space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="bg-brand-accent text-white rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
                    <span>You'll be asked to record a short unboxing video (30-90 seconds)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-brand-accent text-white rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
                    <span>Show the packaging, shipping label, and the product inside</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-brand-accent text-white rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
                    <span>The video will be securely uploaded to the seller</span>
                  </li>
                </ul>
              </div>

              <Button 
                className="w-full"
                onClick={handleStartRecording}
              >
                Start Recording
                <Camera className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t py-4 px-6">
        <div className="container mx-auto text-center text-sm text-gray-500">
          Powered by Proof-It | Secure Delivery Verification
        </div>
      </footer>
    </div>
  );
};

export default OrderDetails;
