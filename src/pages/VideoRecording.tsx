
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
      // Get current user if not already fetched
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("You must be logged in to upload a video");
          return;
        }
        setUserId(user.id);
      }
      
      // Fetch the video blob
      const response = await fetch(recordedVideo);
      const blob = await response.blob();
      
      // Generate a unique filename
      const timestamp = Date.now();
      const fileName = `${timestamp}_${orderNumber}.webm`;
      
      // Create storage path that includes user_id and company_id for better organization
      let filePath = `orders/${orderNumber}`;
      if (userId) filePath = `users/${userId}/${filePath}`;
      if (companyId) filePath = `companies/${companyId}/${filePath}`;
      
      const fullFilePath = `${filePath}/${fileName}`;
      
      let uploadProgress = 0;
      const interval = setInterval(() => {
        uploadProgress += Math.random() * 10;
        if (uploadProgress > 95) uploadProgress = 95;
        setUploadProgress(uploadProgress);
      }, 300);
      
      // Upload to Supabase storage
      const { error } = await supabase.storage
        .from('videos')
        .upload(fullFilePath, blob, {
          contentType: 'video/webm',
          cacheControl: '3600',
          upsert: false,
        });
          
      if (error) {
        console.error("Error uploading video:", error);
        toast.error("Video upload failed");
        clearInterval(interval);
        return;
      }
      
      // Get the public URL of the uploaded video
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(fullFilePath);
      
      // Update order status with video URL and user/company information
      await updateVideoStatus(publicUrl);
      
      clearInterval(interval);
      setUploadProgress(100);
      
      setTimeout(() => {
        navigate(`/thank-you?order=${orderNumber}`);
      }, 500);
    } catch (error) {
      console.error("Error in uploadVideo:", error);
      toast.error("An error occurred during upload.");
    }
  };

  const updateVideoStatus = async (videoUrl?: string) => {
    try {
      // Get user info if not already available
      let currentUserId = userId;
      let currentCompanyId = companyId;
      
      if (!currentUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          currentUserId = user.id;
          
          // Get company_id if not already fetched
          if (!currentCompanyId) {
            const { data: userData } = await supabase
              .from('users')
              .select('company_id')
              .eq('id', user.id)
              .single();
              
            currentCompanyId = userData?.company_id || null;
          }
        }
      }
      
      const updateData: any = {
        video_uploaded: true,
        status: 'Video Received',
        verified: true // Auto-verify without OTP
      };
      
      // Add video URL to order record if provided
      if (videoUrl) {
        updateData.video_url = videoUrl;
      }
      
      // Add user_id and company_id if not already set on the order
      if (currentUserId && !orderData?.user_id) {
        updateData.user_id = currentUserId;
      }
      
      if (currentCompanyId && !orderData?.company_id) {
        updateData.company_id = currentCompanyId;
      }
      
      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('order_number', orderNumber);

      if (error) throw error;
      
      setVideoAlreadyUploaded(true);
      toast.success("Video uploaded successfully");
    } catch (err) {
      console.error("Error updating video status:", err);
      toast.error("Failed to update video status");
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
