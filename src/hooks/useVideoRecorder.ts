
import { useState, useRef } from "react";
import { toast } from "sonner";

export const useVideoRecorder = (streamRef: React.RefObject<MediaStream>, videoRef: React.RefObject<HTMLVideoElement>) => {
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const MAX_RECORDING_TIME = 90;

  const startRecording = () => {
    if (!streamRef.current) {
      console.error("No camera stream available");
      toast.error("Could not access camera stream");
      return;
    }
    
    console.log("Starting recording with stream:", streamRef.current);
    setRecordingTime(0);
    setIsRecording(true);
    setShowUpload(false);
    
    if (videoRef.current) {
      console.log("Preparing video element for recording");
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.style.transform = 'scaleX(-1)'; // Mirror the video
      videoRef.current.muted = true; // Prevent feedback
      videoRef.current.play().catch(e => console.error("Error playing video:", e));
    } else {
      console.error("Video element not found for recording");
    }
    
    const mimeTypes = [
      'video/webm;codecs=vp9,opus', 
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4'
    ];
    
    let options = {};
    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        options = { mimeType };
        console.log(`Using MIME type: ${mimeType}`);
        break;
      }
    }
    
    try {
      console.log("Creating MediaRecorder with stream and options", options);
      const mediaRecorder = new MediaRecorder(streamRef.current, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        console.log("Data available event, size:", e.data.size);
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        console.log("MediaRecorder stopped, creating video from chunks");
        setIsRecording(false);
        
        if (chunksRef.current.length === 0) {
          console.error("No video data chunks recorded");
          toast.error("No video data recorded. Please try again.");
          return;
        }
        
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        console.log("Created video blob of size:", blob.size);
        const videoURL = URL.createObjectURL(blob);
        setRecordedVideo(videoURL);
        
        // Explicitly set showUpload to true
        setShowUpload(true);
        console.log("Setting showUpload to true");
        
        if (videoRef.current) {
          console.log("Switching video source to recorded video");
          videoRef.current.srcObject = null;
          videoRef.current.src = videoURL;
          videoRef.current.style.transform = 'scaleX(1)'; // Remove mirroring for playback
          videoRef.current.muted = false; // Enable audio for playback
          videoRef.current.play().catch(e => console.error("Error playing recorded video:", e));
        }
      };
      
      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      console.log("Recording started with mediaRecorder state:", mediaRecorder.state);
      
      // Start timer
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
      toast.error("Could not start recording. Please try again.");
    }
  };

  const stopRecording = () => {
    console.log("Stopping recording");
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        console.log("Stopping mediaRecorder with state:", mediaRecorderRef.current.state);
        mediaRecorderRef.current.stop();
        console.log("Recording stopped");
      } catch (error) {
        console.error("Error stopping mediaRecorder:", error);
      }
    } else {
      console.warn("MediaRecorder is not active or doesn't exist");
    }
  };

  const retakeVideo = () => {
    console.log("Retaking video");
    if (recordedVideo) {
      URL.revokeObjectURL(recordedVideo);
      setRecordedVideo(null);
    }
    setRecordingTime(0);
    setShowUpload(false);
  };

  return {
    recordingTime,
    recordedVideo,
    isRecording,
    showUpload,
    MAX_RECORDING_TIME,
    startRecording,
    stopRecording,
    retakeVideo
  };
};
