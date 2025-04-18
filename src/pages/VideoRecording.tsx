import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Camera, Video, X, CheckCircle, RotateCcw, Upload, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const VideoRecording = () => {
  const [step, setStep] = useState<"instructions" | "countdown" | "recording" | "preview" | "uploading">("instructions");
  const [countdown, setCountdown] = useState(3);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [videoAlreadyUploaded, setVideoAlreadyUploaded] = useState(false);
  const [verified, setVerified] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const orderNumber = new URLSearchParams(location.search).get("order") || "Unknown";
  const MAX_RECORDING_TIME = 90; // 90 seconds

  useEffect(() => {
    // Check if video was already uploaded for this order
    checkVideoUploaded();
    
    // Fetch order and check verification status
    fetchOrderDetails();

    return () => {
      // Clean up when component unmounts
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [orderNumber]);

  const fetchOrderDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber)
        .single();

      if (error) {
        console.error("Error fetching order:", error);
        toast("Could not find order details");
        return;
      }

      setOrderData(data);
      
      // Check if order is already verified
      if (data.verified) {
        setVerified(true);
      } else {
        // Redirect to verification page if not verified
        toast("Verification required. Please verify your mobile number before recording a video.");
        navigate(`/proof?order=${orderNumber}`);
      }
    } catch (error) {
      console.error("Error in fetchOrderDetails:", error);
    }
  };

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

  const requestCameraPermission = async () => {
    try {
      // Get list of video devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setCameras(videoDevices);
      
      // Default to back camera if available (on mobile)
      const backCameraIndex = videoDevices.findIndex(
        device => device.label.toLowerCase().includes('back') || 
                  device.label.toLowerCase().includes('rear')
      );
      
      const initialCameraIndex = backCameraIndex !== -1 ? backCameraIndex : 0;
      setCurrentCameraIndex(initialCameraIndex);
      
      // Start stream with selected camera
      return await startCameraStream(videoDevices[initialCameraIndex]?.deviceId);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setHasPermission(false);
      setPermissionError("Camera access denied. Please allow camera access and try again.");
      return false;
    }
  };

  const startCameraStream = async (deviceId?: string) => {
    try {
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Create constraints object - force specific facing mode for mobile devices
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: deviceId ? 
          { deviceId: { exact: deviceId } } : 
          { facingMode: { exact: "environment" } }  // Default to back camera
      };
      
      console.log("Using camera constraints:", constraints);
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      // Display camera feed immediately
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(e => {
          console.error("Error playing video:", e);
          throw e;
        });
      }
      
      setHasPermission(true);
      setPermissionError(null);
      return true;
    } catch (err) {
      console.error("Error starting camera stream:", err);
      
      // If exact facing mode fails, try without the "exact" constraint
      if (String(err).includes("facingMode")) {
        try {
          console.log("Trying without exact facingMode constraint");
          const simpleConstraints: MediaStreamConstraints = {
            audio: true,
            video: true
          };
          
          const stream = await navigator.mediaDevices.getUserMedia(simpleConstraints);
          streamRef.current = stream;
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
          }
          
          setHasPermission(true);
          setPermissionError(null);
          return true;
        } catch (fallbackErr) {
          console.error("Fallback camera access also failed:", fallbackErr);
        }
      }
      
      setHasPermission(false);
      setPermissionError("Camera access failed. Please check your device permissions.");
      return false;
    }
  };

  const switchCamera = async () => {
    if (cameras.length <= 1) {
      toast("Camera switching unavailable - No additional cameras detected on your device.");
      return;
    }
    
    const nextCameraIndex = (currentCameraIndex + 1) % cameras.length;
    
    try {
      // Stop current stream before switching
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Start new stream with next camera
      const success = await startCameraStream(cameras[nextCameraIndex].deviceId);
      
      if (success) {
        setCurrentCameraIndex(nextCameraIndex);
        toast(`Camera switched to ${cameras[nextCameraIndex].label || 'camera ' + (nextCameraIndex + 1)}`);
      }
    } catch (error) {
      console.error("Error switching camera:", error);
      toast("Camera switch failed - Could not switch to the next camera");
    }
  };

  const startCountdown = async () => {
    if (!verified) {
      toast("Verification required. Please verify your mobile number before recording a video.");
      navigate(`/proof?order=${orderNumber}`);
      return;
    }
    
    if (videoAlreadyUploaded) {
      toast("You've already recorded and uploaded a video for this order.");
      return;
    }
    
    const hasAccess = await requestCameraPermission();
    if (!hasAccess) return;

    setStep("countdown");
    
    let count = 3;
    setCountdown(count);
    
    const countdownInterval = setInterval(() => {
      count -= 1;
      setCountdown(count);
      
      if (count <= 0) {
        clearInterval(countdownInterval);
        startRecording();
      }
    }, 1000);
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    
    setStep("recording");
    setRecordingTime(0);
    
    // Ensure video element is showing the stream
    if (videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(e => console.error("Error playing video:", e));
    }
    
    // Create media recorder with appropriate settings
    const options = { mimeType: 'video/webm;codecs=vp9,opus' };
    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const videoURL = URL.createObjectURL(blob);
        setRecordedVideo(videoURL);
        
        if (videoRef.current) {
          videoRef.current.srcObject = null;
          videoRef.current.src = videoURL;
          videoRef.current.play().catch(e => console.error("Error playing video:", e));
        }
        
        setStep("preview");
      };
      
      mediaRecorder.start();
      console.log("Recording started with mediaRecorder state:", mediaRecorder.state);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= MAX_RECORDING_TIME - 1) {
            stopRecording();
            return MAX_RECORDING_TIME;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Error starting media recorder:", error);
      toast({
        title: "Recording error",
        description: "Could not start recording. Please try again.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      console.log("Recording stopped");
    }
  };

  const retakeVideo = () => {
    if (recordedVideo) {
      URL.revokeObjectURL(recordedVideo);
      setRecordedVideo(null);
    }
    
    setStep("instructions");
    setRecordingTime(0);
  };

  const uploadVideo = async () => {
    setStep("uploading");
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(async () => {
      setUploadProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          
          // Update video status in Supabase
          updateVideoStatus();
          
          setTimeout(() => {
            navigate(`/thank-you?order=${orderNumber}`);
          }, 500);
          
          return 100;
        }
        return newProgress;
      });
    }, 300);
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
      toast("Failed to update video status");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
            <div className="space-y-6">
              <div className="text-center mb-4">
                <div className="bg-blue-100 rounded-full p-4 inline-block mb-4">
                  <Camera className="h-8 w-8 text-brand-accent" />
                </div>
                <h1 className="text-2xl font-bold">Record Unboxing Video</h1>
                <p className="text-gray-600 mt-2">
                  Order: <span className="font-medium">{orderNumber}</span>
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                <h3 className="font-medium">Important Instructions:</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="text-brand-accent mr-2">•</span>
                    <span>Make sure you have good lighting</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-accent mr-2">•</span>
                    <span>First show the sealed package with shipping label</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-accent mr-2">•</span>
                    <span>Then record opening the package and showing the contents</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brand-accent mr-2">•</span>
                    <span>Video will be 30-90 seconds long</span>
                  </li>
                </ul>
              </div>

              {videoAlreadyUploaded && (
                <div className="bg-yellow-50 text-amber-700 p-4 rounded-lg text-sm">
                  <p className="font-medium">You have already uploaded a video for this order</p>
                  <p>Each order can only have one video submission.</p>
                </div>
              )}

              {permissionError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
                  <p className="font-medium">Camera permission required</p>
                  <p>{permissionError}</p>
                </div>
              )}

              <Button 
                className="w-full" 
                onClick={startCountdown}
                disabled={videoAlreadyUploaded}
              >
                Start Recording
                <Video className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {step === "countdown" && (
            <div className="text-center py-12">
              <div className="mb-6">
                <span className="text-6xl font-bold animate-pulse">{countdown}</span>
              </div>
              <p className="text-xl">Get ready to record...</p>
            </div>
          )}

          {(step === "recording" || step === "preview" || step === "uploading") && (
            <div className="space-y-4">
              {step === "recording" && (
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold">Recording in progress</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Show the package, label and contents clearly
                  </p>
                </div>
              )}

              {step === "preview" && (
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold">Review your video</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Is everything visible and clear?
                  </p>
                </div>
              )}

              {step === "uploading" && (
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold">Uploading video</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Please wait while we upload your video
                  </p>
                </div>
              )}

              <div className="video-container bg-gray-900 rounded-lg overflow-hidden relative">
                <video
                  ref={videoRef}
                  muted={step === "recording"}
                  playsInline
                  autoPlay={step === "recording"}
                  className="w-full h-full"
                  style={{ transform: "scaleX(1)" }} /* Fix for mirrored video */
                />
                
                {step === "recording" && (
                  <>
                    <div className="absolute top-2 right-2 z-10">
                      <Button 
                        size="sm" 
                        variant="secondary"
                        className="h-8 w-8 p-0 rounded-full"
                        onClick={switchCamera}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="recording-indicator absolute top-3 left-3 h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="timer absolute bottom-3 left-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                      {formatTime(recordingTime)}
                    </div>
                  </>
                )}
              </div>

              {step === "recording" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>0:00</span>
                    <span>{formatTime(MAX_RECORDING_TIME)}</span>
                  </div>
                  <Progress value={(recordingTime / MAX_RECORDING_TIME) * 100} className="h-2" />
                  
                  <Button 
                    className="w-full bg-red-500 hover:bg-red-600"
                    onClick={stopRecording}
                  >
                    Stop Recording
                    <X className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {step === "preview" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline"
                      className="w-full" 
                      onClick={retakeVideo}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Retake
                    </Button>
                    <Button 
                      className="w-full"
                      onClick={uploadVideo}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Upload
                    </Button>
                  </div>
                </div>
              )}

              {step === "uploading" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Uploading video...</span>
                    <span className="text-sm font-medium">{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-center text-sm text-gray-500 mt-2">
                    <Upload className="inline-block mr-1 h-4 w-4" />
                    Please don't close this page
                  </p>
                </div>
              )}
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

export default VideoRecording;
