
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  InputOTP, 
  InputOTPGroup, 
  InputOTPSlot 
} from "@/components/ui/input-otp";
import { toast } from "@/components/ui/sonner";
import { CheckCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface OtpVerificationProps {
  orderNumber: string;
  onVerificationSuccess: () => void;
}

const OtpVerification = ({ orderNumber, onVerificationSuccess }: OtpVerificationProps) => {
  const [otpValue, setOtpValue] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [customerMobile, setCustomerMobile] = useState<string | null>(null);
  
  // Fixed OTP for demo purposes
  const DEMO_OTP = "123456";
  
  // Fetch customer mobile from orders table
  useEffect(() => {
    const fetchCustomerMobile = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('customer_mobile')
          .eq('order_number', orderNumber)
          .single();

        if (error) throw error;

        if (data && data.customer_mobile) {
          setCustomerMobile(data.customer_mobile);
        }
      } catch (error) {
        console.error("Error fetching customer mobile:", error);
      }
    };

    if (orderNumber) {
      fetchCustomerMobile();
    }
  }, [orderNumber]);

  // Auto-verification for the simplified flow
  useEffect(() => {
    // Automatically skip verification for the simplified flow
    handleSkipVerification();
  }, []);
  
  // Handle countdown timer
  useEffect(() => {
    if (otpSent && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [otpSent, countdown]);
  
  const sendOtp = async () => {
    setLoading(true);
    
    try {
      // In development mode, we're using a fixed OTP (123456)
      console.log("Generated OTP:", DEMO_OTP); // For demo purposes only
      
      // Log the OTP in the database
      if (customerMobile) {
        // Get order id from order_number
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('id')
          .eq('order_number', orderNumber)
          .single();
          
        if (orderError) throw orderError;
        
        console.log("Logging OTP for development purposes");
        // Since we don't have a mobile_verifications table in the types,
        // we'll just use the order's verified flag directly
      }
      
      setOtpSent(true);
      setCountdown(30);
      
      toast.success(`OTP sent to your mobile ${customerMobile ? `XXXXX${customerMobile.slice(-5)}` : "XXXXX"}`);
    } catch (error) {
      console.error("Send OTP error:", error);
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const verifyOtp = async () => {
    if (otpValue.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
    
    setVerifying(true);
    
    try {
      // In development, verify against the fixed OTP (123456)
      if (otpValue === DEMO_OTP) {
        // Update verification status in the database
        const { error } = await supabase
          .from('orders')
          .update({ verified: true })
          .eq('order_number', orderNumber);
          
        if (error) throw error;
        
        toast.success("Mobile number verified successfully");
        onVerificationSuccess();
      } else {
        toast.error("Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Verification failed. Please try again.");
    } finally {
      setVerifying(false);
    }
  };
  
  const resendOtp = () => {
    setOtpValue("");
    setCountdown(30);
    sendOtp();
  };

  // Skip verification function for the simplified flow
  const handleSkipVerification = async () => {
    try {
      // Just update the order as verified without OTP
      const { error } = await supabase
        .from('orders')
        .update({ verified: true })
        .eq('order_number', orderNumber);
        
      if (error) throw error;
      
      // Call the success callback
      onVerificationSuccess();
    } catch (error) {
      console.error("Auto verification error:", error);
      // Even if this fails, we'll proceed with the flow
      onVerificationSuccess();
    }
  };

  // For the simplified flow, we'll render a button to skip verification
  return (
    <div className="space-y-6 bg-white rounded-lg p-6 shadow-md">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Verify Your Mobile Number</h2>
        <p className="text-gray-600 mt-2">
          {customerMobile && `We'll send an OTP to XXXXX${customerMobile.slice(-5)}`}
        </p>
      </div>
      
      <Button 
        className="w-full" 
        onClick={handleSkipVerification}
      >
        Skip Verification (Development Mode)
      </Button>
      
      <div className="text-center text-sm text-gray-500">
        <p>OTP verification has been disabled for development purposes.</p>
        <p>Click the button above to proceed directly to recording.</p>
      </div>
    </div>
  );
};

export default OtpVerification;
