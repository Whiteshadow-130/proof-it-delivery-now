
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

export const useCamera = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const startCameraStream = async (deviceId?: string) => {
    try {
      console.log("Starting camera stream with deviceId:", deviceId || "default");
      
      // Stop any existing streams first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          console.log("Stopping existing track:", track.kind, track.label);
          track.stop();
        });
        streamRef.current = null;
      }
      
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: deviceId ? 
          { deviceId: { exact: deviceId } } : 
          { facingMode: "environment" }
      };
      
      console.log("Requesting camera with constraints:", JSON.stringify(constraints));
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("Got camera stream with tracks:", stream.getTracks().map(t => `${t.kind}: ${t.label}`).join(', '));
      
      streamRef.current = stream;
      
      if (videoRef.current && stream) {
        console.log("Setting video source object to stream");
        videoRef.current.srcObject = stream;
        videoRef.current.style.transform = 'scaleX(-1)'; // Mirror video
        videoRef.current.style.display = 'block'; // Ensure video element is visible
        videoRef.current.muted = true; // Prevent feedback during recording
        videoRef.current.playsInline = true; // Better mobile support
        
        try {
          await videoRef.current.play();
          console.log("Video is now playing");
        } catch (e) {
          console.error("Error playing video:", e);
        }
      } else {
        console.error("Video ref is null or stream is null, cannot attach stream");
      }
      
      setHasPermission(true);
      setPermissionError(null);
      return true;
    } catch (err) {
      console.error("Error starting camera stream:", err);
      
      // Try with basic constraints as fallback
      try {
        console.log("Falling back to basic video constraints");
        const simpleConstraints: MediaStreamConstraints = {
          audio: true,
          video: true
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(simpleConstraints);
        console.log("Got fallback camera stream:", stream);
        streamRef.current = stream;
        
        if (videoRef.current && stream) {
          console.log("Setting video source with fallback stream");
          videoRef.current.srcObject = stream;
          videoRef.current.style.transform = 'scaleX(-1)'; // Mirror video
          videoRef.current.style.display = 'block';
          videoRef.current.muted = true;
          videoRef.current.playsInline = true;
          
          try {
            await videoRef.current.play();
            console.log("Fallback video is playing");
          } catch (e) {
            console.error("Error playing fallback video:", e);
          }
        }
        
        setHasPermission(true);
        setPermissionError(null);
        return true;
      } catch (fallbackErr) {
        console.error("Fallback camera access also failed:", fallbackErr);
        setHasPermission(false);
        setPermissionError("Camera access failed. Please check your device permissions and ensure no other apps are using your camera.");
        toast.error("Camera access failed. Please check your permissions.");
        return false;
      }
    }
  };

  const requestCameraPermission = async () => {
    try {
      console.log("Requesting camera devices");
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      console.log("Available video devices:", videoDevices.map(d => d.label).join(', '));
      
      setCameras(videoDevices);
      
      const backCameraIndex = videoDevices.findIndex(
        device => device.label.toLowerCase().includes('back') || 
                  device.label.toLowerCase().includes('rear')
      );
      
      // Prefer back camera on mobile if available
      const initialCameraIndex = backCameraIndex !== -1 ? backCameraIndex : 0;
      setCurrentCameraIndex(initialCameraIndex);
      
      // Start with selected camera or default
      return await startCameraStream(videoDevices[initialCameraIndex]?.deviceId);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setHasPermission(false);
      setPermissionError("Camera permission denied. Please allow camera access and try again.");
      toast.error("Camera permission denied");
      return false;
    }
  };

  const switchCamera = async () => {
    if (cameras.length <= 1) {
      toast.info("No additional cameras detected on your device");
      return;
    }
    
    const nextCameraIndex = (currentCameraIndex + 1) % cameras.length;
    console.log(`Switching from camera ${currentCameraIndex} to ${nextCameraIndex}`);
    
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      const success = await startCameraStream(cameras[nextCameraIndex].deviceId);
      
      if (success) {
        setCurrentCameraIndex(nextCameraIndex);
        toast.info(`Switched to ${cameras[nextCameraIndex].label || 'camera ' + (nextCameraIndex + 1)}`);
      }
    } catch (error) {
      console.error("Error switching camera:", error);
      toast.error("Could not switch to the next camera");
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        console.log("Cleaning up camera stream");
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return {
    hasPermission,
    permissionError,
    cameras,
    currentCameraIndex,
    videoRef,
    streamRef,
    requestCameraPermission,
    switchCamera,
    startCameraStream
  };
};
