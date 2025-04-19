import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Instructions from "@/components/video/Instructions";
import Countdown from "@/components/video/Countdown";
import VideoPreview from "@/components/video/VideoPreview";
import { useCamera } from "@/hooks/useCamera";
import { useVideoRecorder } from "@/hooks/useVideoRecorder";

const VideoRecording = () => {
  const [step, setStep] = useState<"instructions" | "countdown" | "recording" | "preview" | "uploading">("instructions");
  const [countdown, setCountdown] = useState(3);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoAlreadyUploaded, setVideoAlreadyUploaded] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  
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
    isRecording,
    showUpload,
    MAX_RECORDING_TIME,
    startRecording,
    stopRecording,
    retakeVideo
  } = useVideoRecorder(streamRef, videoRef);

  // Get user ID and company ID
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log("No authenticated user");
          return;
        }
        
        setUserId(user.id);
        
        // Get user's company_id
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('company_id')
          .eq('id', user.id)
          .single();
          
        if (userError) {
          console.error("Error fetching user data:", userError);
          return;
        }
        
        setCompanyId(userData?.company_id || null);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };
    
    getUserInfo();
  }, []);

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
    } catch (error) {
      console.error("Error in fetchOrderDetails:", error);
      toast.error("An unexpected error occurred");
    }
  };

  const startCountdown = async () => {
    console.log("Starting countdown");
    
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
    if (!recordedVideo) {
      toast.error("No video recorded");
      return;
    }
    
    setStep("uploading");
    setUploadProgress(0);
    
    try {
      if (!userId || !companyId || !orderData) {
        toast.error("Missing required data for upload");
        return;
      }
      
      // Fetch the video blob
      const response = await fetch(recordedVideo);
      const blob = await response.blob();
      
      // Generate a unique filename with order number
      const timestamp = Date.now();
      const fileName = `${timestamp}_${orderNumber}.webm`;
      
      // Create storage path that includes user_id and company_id
      const filePath = `companies/${companyId}/users/${userId}/orders/${orderNumber}/${fileName}`;
      
      let uploadProgress = 0;
      const interval = setInterval(() => {
        uploadProgress += Math.random() * 10;
        if (uploadProgress > 95) uploadProgress = 95;
        setUploadProgress(uploadProgress);
      }, 300);
      
      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, blob, {
          contentType: 'video/webm',
          cacheControl: '3600',
          upsert: false,
        });
          
      if (uploadError) {
        console.error("Error uploading video:", uploadError);
        toast.error("Video upload failed");
        clearInterval(interval);
        return;
      }
      
      // Get the public URL of the uploaded video
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);
      
      // Update order with video URL and metadata
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          video_url: publicUrl,
          video_uploaded: true,
          status: 'Video Received'
        })
        .eq('order_number', orderNumber);

      if (updateError) {
        console.error("Error updating order:", updateError);
        toast.error("Failed to update order status");
        clearInterval(interval);
        return;
      }
      
      clearInterval(interval);
      setUploadProgress(100);
      
      setTimeout(() => {
        navigate(`/thank-you?order=${orderNumber}`);
      }, 500);
    } catch (error) {
      console.error("Error in uploadVideo:", error);
      toast.error("An error occurred during upload");
    }
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
              showUpload={showUpload}
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
