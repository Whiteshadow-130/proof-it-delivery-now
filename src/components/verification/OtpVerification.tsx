
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  InputOTP, 
  InputOTPGroup, 
  InputOTPSlot 
} from "@/components/ui/input-otp";
import { toast } from "@/components/ui/sonner";
import { CheckCircle, RefreshCw } from "lucide-react";

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
  
  // Get customer mobile from localStorage
  useEffect(() => {
    if (orderNumber) {
      const mobile = localStorage.getItem(`mobile_${orderNumber}`);
      setCustomerMobile(mobile);
    }
  }, [orderNumber]);
  
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
      // In a real app, this would be an API call to your backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate OTP generation
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Save OTP in localStorage (in a real app, this would be saved on your backend)
      localStorage.setItem(`otp_${orderNumber}`, otp);
      console.log("Generated OTP:", otp); // For demo purposes only
      
      setOtpSent(true);
      setCountdown(30);
      
      toast.success(`OTP sent to your mobile XXXXX${customerMobile?.slice(-5) || "XXXXX"}`);
    } catch (error) {
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
      // In a real app, this would be an API call to verify the OTP
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, we'll verify against our saved OTP
      const savedOtp = localStorage.getItem(`otp_${orderNumber}`);
      
      if (savedOtp && savedOtp === otpValue) {
        // Set verification status in localStorage
        localStorage.setItem(`otp_verified_${orderNumber}`, "true");
        
        toast.success("Mobile number verified successfully");
        onVerificationSuccess();
      } else {
        toast.error("Invalid OTP. Please try again.");
      }
    } catch (error) {
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

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Verify Your Mobile Number</h2>
        <p className="text-gray-600 mt-2">
          {customerMobile && `We'll send an OTP to XXXXX${customerMobile.slice(-5)}`}
        </p>
      </div>
      
      {!otpSent ? (
        <Button 
          className="w-full" 
          onClick={sendOtp} 
          disabled={loading}
        >
          {loading ? "Sending..." : "Send OTP"}
        </Button>
      ) : (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Enter 6-digit OTP
            </label>
            <InputOTP 
              maxLength={6}
              value={otpValue}
              onChange={setOtpValue}
              render={({ slots }) => (
                <InputOTPGroup>
                  {slots.map((slot, index) => (
                    <InputOTPSlot key={index} {...slot} index={index} />
                  ))}
                </InputOTPGroup>
              )}
            />
            <p className="text-xs text-gray-500">
              OTP will expire in 5 minutes
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              className="w-full" 
              onClick={verifyOtp}
              disabled={otpValue.length !== 6 || verifying}
            >
              {verifying ? "Verifying..." : "Verify OTP"}
              <CheckCircle className="ml-2 h-4 w-4" />
            </Button>
            
            <div className="text-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs"
                onClick={resendOtp}
                disabled={countdown > 0}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OtpVerification;
