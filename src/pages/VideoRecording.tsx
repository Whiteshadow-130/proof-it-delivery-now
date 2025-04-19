
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
  
  // For anonymous uploads
  const tempUserId = "anonymous";
  const tempCompanyId = "default";
  
  const navigate = useNavigate();
  const location = useLocation();
  const orderNumber = new URLSearchParams(location.search).get("order") || "Unknown";
  
  // Initialize camera system
  const { 
    hasPermission,
    permissionError,
    videoRef,
    streamRef,
    requestCameraPermission,
    switchCamera
  } = useCamera();

  // Initialize video recorder
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

  // Check if order exists and if video already uploaded
  useEffect(() => {
    checkVideoUploaded();
    fetchOrderDetails();
  }, [orderNumber]);

  // Log state changes to help with debugging
  useEffect(() => {
    console.log("State updated - step:", step, "isRecording:", isRecording, "showUpload:", showUpload);
  }, [step, isRecording, showUpload]);

  const checkVideoUploaded = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('video_uploaded')
        .eq('order_number', orderNumber)
        .single();

      if (error) {
        console.error("Error checking video upload status:", error);
        return;
      }

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

  // Handle stopping the recording
  const handleStopRecording = () => {
    console.log("Handling stop recording");
    stopRecording();
    setStep("preview");
  };

  const handleRetake = () => {
    retakeVideo();
    setStep("instructions");
  };

  const uploadVideo = async () => {
    console.log("Starting upload for order:", orderNumber);
    
    if (!recordedVideo) {
      toast.error("No video recorded");
      return;
    }
    
    if (!orderNumber) {
      toast.error("Missing order number for upload");
      return;
    }
    
    if (!orderData) {
      toast.error("Missing order data for upload");
      return;
    }
    
    setStep("uploading");
    setUploadProgress(0);
    
    try {
      // Fetch the video blob
      const response = await fetch(recordedVideo);
      const blob = await response.blob();
      
      if (!blob || blob.size === 0) {
        toast.error("Video data is empty or corrupted");
        return;
      }
      
      // Generate a unique filename with order number
      const timestamp = Date.now();
      const fileName = `${timestamp}_${orderNumber}.webm`;
      
      // Create storage path that includes company_id and order_number
      const filePath = `videos/${tempCompanyId}/${orderNumber}/${fileName}`;
      
      console.log("Uploading video to path:", filePath);
      
      // Simulate upload progress
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
        toast.error("Video upload failed: " + uploadError.message);
        clearInterval(interval);
        return;
      }
      
      console.log("Upload successful:", uploadData);
      
      // Get the public URL of the uploaded video
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);
      
      console.log("Video public URL:", publicUrl);
      
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
      
      // Redirect to thank you page
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
              onStopRecording={handleStopRecording}
              onRetake={handleRetake}
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
