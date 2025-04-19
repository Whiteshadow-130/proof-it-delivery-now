
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
      toast.error("Could not access camera stream");
      return;
    }
    
    setRecordingTime(0);
    setIsRecording(true);
    setShowUpload(false);
    
    if (videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.style.transform = 'scaleX(-1)'; // Mirror the video
      videoRef.current.play().catch(e => console.error("Error playing video:", e));
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
      const mediaRecorder = new MediaRecorder(streamRef.current, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        setIsRecording(false);
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const videoURL = URL.createObjectURL(blob);
        setRecordedVideo(videoURL);
        setShowUpload(true);
        
        if (videoRef.current) {
          videoRef.current.srcObject = null;
          videoRef.current.src = videoURL;
          videoRef.current.style.transform = 'scaleX(1)'; // Remove mirroring for playback
          videoRef.current.play().catch(e => console.error("Error playing video:", e));
        }
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
      toast.error("Could not start recording. Please try again.");
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
    
    setIsRecording(false);
  };

  const retakeVideo = () => {
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
