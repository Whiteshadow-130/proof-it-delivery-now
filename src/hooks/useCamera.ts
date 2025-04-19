
import { useState, useRef, useEffect } from "react";
import { toast } from "@/components/ui/sonner";

export const useCamera = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const startCameraStream = async (deviceId?: string) => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: deviceId ? 
          { deviceId: { exact: deviceId } } : 
          { facingMode: "environment" }
      };
      
      console.log("Requesting camera with constraints:", constraints);
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log("Got camera stream:", stream);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.style.display = 'block'; // Ensure video element is visible
        
        await new Promise<void>((resolve) => {
          if (!videoRef.current) {
            resolve();
            return;
          }
          
          videoRef.current.onloadedmetadata = () => {
            console.log("Video metadata loaded");
            resolve();
          };
        });
        
        if (videoRef.current) {
          try {
            await videoRef.current.play();
            console.log("Video is playing");
          } catch (e) {
            console.error("Error playing video:", e);
          }
        }
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
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.style.display = 'block';
          
          await new Promise<void>((resolve) => {
            if (!videoRef.current) {
              resolve();
              return;
            }
            
            videoRef.current.onloadedmetadata = () => {
              console.log("Fallback video metadata loaded");
              resolve();
            };
          });
          
          if (videoRef.current) {
            try {
              await videoRef.current.play();
              console.log("Fallback video is playing");
            } catch (e) {
              console.error("Error playing fallback video:", e);
            }
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
      console.log("Available video devices:", videoDevices);
      
      setCameras(videoDevices);
      
      const backCameraIndex = videoDevices.findIndex(
        device => device.label.toLowerCase().includes('back') || 
                  device.label.toLowerCase().includes('rear')
      );
      
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
