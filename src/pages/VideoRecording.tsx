
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Camera, Video, X, CheckCircle, RotateCcw, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const VideoRecording = () => {
  const [step, setStep] = useState<"instructions" | "countdown" | "recording" | "preview" | "uploading">("instructions");
  const [countdown, setCountdown] = useState(3);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const orderNumber = new URLSearchParams(location.search).get("order") || "Unknown";
  const MAX_RECORDING_TIME = 90; // 90 seconds

  useEffect(() => {
    return () => {
      // Clean up when component unmounts
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      setHasPermission(true);
      setPermissionError(null);
      return true;
    } catch (err) {
      console.error("Error accessing camera:", err);
      setHasPermission(false);
      setPermissionError("Camera access denied. Please allow camera access and try again.");
      return false;
    }
  };

  const startCountdown = async () => {
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
    
    if (videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play();
    }
    
    const mediaRecorder = new MediaRecorder(streamRef.current);
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
        videoRef.current.play();
      }
      
      setStep("preview");
    };
    
    mediaRecorder.start();
    
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= MAX_RECORDING_TIME - 1) {
          stopRecording();
          return MAX_RECORDING_TIME;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
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

  const uploadVideo = () => {
    setStep("uploading");
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          
          // In a real app, we would send the video to the server here
          setTimeout(() => {
            navigate(`/thank-you?order=${orderNumber}`);
          }, 500);
          
          return 100;
        }
        return newProgress;
      });
    }, 300);
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

              {permissionError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
                  <p className="font-medium">Camera permission required</p>
                  <p>{permissionError}</p>
                </div>
              )}

              <Button className="w-full" onClick={startCountdown}>
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

              <div className="video-container bg-gray-900 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  muted={step === "recording"}
                  playsInline
                  className="w-full h-full"
                />
                
                {step === "recording" && (
                  <>
                    <div className="recording-indicator" />
                    <div className="timer">{formatTime(recordingTime)}</div>
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
