
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import OtpVerification from "@/components/verification/OtpVerification";
import Instructions from "@/components/video/Instructions";
import Countdown from "@/components/video/Countdown";
import VideoPreview from "@/components/video/VideoPreview";
import { useCamera } from "@/hooks/useCamera";
import { useVideoRecorder } from "@/hooks/useVideoRecorder";

const VideoRecording = () => {
  const [step, setStep] = useState<"verification" | "instructions" | "countdown" | "recording" | "preview" | "uploading">("verification");
  const [countdown, setCountdown] = useState(3);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoAlreadyUploaded, setVideoAlreadyUploaded] = useState(false);
  const [verified, setVerified] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const orderNumber = new URLSearchParams(location.search).get("order") || "Unknown";
  
  const { 
    hasPermission,
    permissionError,
    videoRef,
    streamRef,
    requestCameraPermission,
    switchCamera
  } = useCamera();

  const {
    recordingTime,
    recordedVideo,
    MAX_RECORDING_TIME,
    startRecording,
    stopRecording,
    retakeVideo
  } = useVideoRecorder(streamRef, videoRef);

  // Check if order exists and if video already uploaded
  useEffect(() => {
    checkVideoUploaded();
    fetchOrderDetails();
  }, [orderNumber]);

  const checkVideoUploaded = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('video_uploaded')
        .eq('order_number', orderNumber)
        .single();

      if (error) throw error;

      if (data?.video_uploaded) {
        setVideoAlreadyUploaded(true);
        toast.info("You've already recorded and uploaded a video for this order.");
      }
    } catch (err) {
      console.error("Error checking video upload status:", err);
    }
  };

  const fetchOrderDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber)
        .single();

      if (error) {
        console.error("Error fetching order:", error);
        toast.error("Could not find order details");
        return;
      }

      console.log("Found order data:", data);
      setOrderData(data);
      
      if (data.verified) {
        console.log("Order is already verified");
        setVerified(true);
        setStep("instructions");
      }
    } catch (error) {
      console.error("Error in fetchOrderDetails:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const handleVerificationSuccess = () => {
    console.log("Verification successful");
    setVerified(true);
    setStep("instructions");
    toast.success("Verification successful. You can now record your video.");
  };

  const startCountdown = async () => {
    console.log("Starting countdown");
    if (!verified) {
      toast.error("Verification required. Please verify your mobile number before recording a video.");
      return;
    }
    
    if (videoAlreadyUploaded) {
      toast.error("You've already recorded and uploaded a video for this order.");
      return;
    }
    
    console.log("Requesting camera permission");
    const hasAccess = await requestCameraPermission();
    if (!hasAccess) {
      console.error("Camera access denied");
      return;
    }

    setStep("countdown");
    
    let count = 3;
    setCountdown(count);
    
    const countdownInterval = setInterval(() => {
      count -= 1;
      setCountdown(count);
      
      if (count <= 0) {
        clearInterval(countdownInterval);
        setStep("recording");
        console.log("Starting recording");
        startRecording();
      }
    }, 1000);
  };

  const uploadVideo = async () => {
    setStep("uploading");
    setUploadProgress(0);
    
    try {
      // Simulate upload for demo
      const interval = setInterval(async () => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          if (newProgress >= 100) {
            clearInterval(interval);
            
            updateVideoStatus();
            
            setTimeout(() => {
              navigate(`/thank-you?order=${orderNumber}`);
            }, 500);
            
            return 100;
          }
          return newProgress;
        });
      }, 300);
      
      // In a real implementation, we would upload the video to Supabase storage here
      if (recordedVideo) {
        // Fetch the video blob
        const response = await fetch(recordedVideo);
        const blob = await response.blob();
        
        // Upload to Supabase storage
        const fileName = `${Date.now()}_${orderNumber}.webm`;
        const filePath = `${orderNumber}/${fileName}`;
        
        const { error } = await supabase.storage
          .from('videos')
          .upload(filePath, blob, {
            contentType: 'video/webm',
          });
          
        if (error) {
          console.error("Error uploading video:", error);
          toast.error("Video upload failed, but we've saved your verification status.");
        }
      }
    } catch (error) {
      console.error("Error in uploadVideo:", error);
      toast.error("An error occurred during upload.");
    }
  };

  const updateVideoStatus = async () => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          video_uploaded: true,
          status: 'Video Received' 
        })
        .eq('order_number', orderNumber);

      if (error) throw error;
      
      setVideoAlreadyUploaded(true);
    } catch (err) {
      console.error("Error updating video status:", err);
      toast.error("Failed to update video status");
    }
  };

  console.log("Current step:", step);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-brand-blue text-white py-4 px-6 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold">Proof-It</h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {step === "verification" && (
            <OtpVerification 
              orderNumber={orderNumber} 
              onVerificationSuccess={handleVerificationSuccess} 
            />
          )}
          
          {step === "instructions" && (
            <Instructions
              orderNumber={orderNumber}
              videoAlreadyUploaded={videoAlreadyUploaded}
              permissionError={permissionError}
              onStartRecording={startCountdown}
            />
          )}
          
          {step === "countdown" && (
            <Countdown countdown={countdown} />
          )}
          
          {(step === "recording" || step === "preview" || step === "uploading") && (
            <VideoPreview
              step={step}
              videoRef={videoRef}
              recordingTime={recordingTime}
              maxRecordingTime={MAX_RECORDING_TIME}
              uploadProgress={uploadProgress}
              onStopRecording={stopRecording}
              onRetake={() => {
                retakeVideo();
                setStep("instructions");
              }}
              onUpload={uploadVideo}
              onSwitchCamera={switchCamera}
            />
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

export default VideoRecording;
