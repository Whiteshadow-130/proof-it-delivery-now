
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
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: deviceId ? 
          { deviceId: { exact: deviceId } } : 
          { facingMode: "environment" }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current?.play();
          } catch (e) {
            console.error("Error playing video:", e);
          }
        };
      }
      
      setHasPermission(true);
      setPermissionError(null);
      return true;
    } catch (err) {
      console.error("Error starting camera stream:", err);
      try {
        const simpleConstraints: MediaStreamConstraints = {
          audio: true,
          video: true
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(simpleConstraints);
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = async () => {
            try {
              await videoRef.current?.play();
            } catch (e) {
              console.error("Error playing video with fallback:", e);
            }
          };
        }
        
        setHasPermission(true);
        setPermissionError(null);
        return true;
      } catch (fallbackErr) {
        console.error("Fallback camera access also failed:", fallbackErr);
        setHasPermission(false);
        setPermissionError("Camera access failed. Please check your device permissions.");
        return false;
      }
    }
  };

  const requestCameraPermission = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setCameras(videoDevices);
      
      const backCameraIndex = videoDevices.findIndex(
        device => device.label.toLowerCase().includes('back') || 
                  device.label.toLowerCase().includes('rear')
      );
      
      const initialCameraIndex = backCameraIndex !== -1 ? backCameraIndex : 0;
      setCurrentCameraIndex(initialCameraIndex);
      
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
