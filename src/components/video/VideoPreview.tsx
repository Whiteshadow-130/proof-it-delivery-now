
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, CheckCircle, RotateCcw, Upload, RefreshCw } from "lucide-react";
import { formatTime } from "@/utils/timeFormat";

interface VideoPreviewProps {
  step: "recording" | "preview" | "uploading";
  videoRef: React.RefObject<HTMLVideoElement>;
  recordingTime?: number;
  maxRecordingTime?: number;
  uploadProgress?: number;
  onStopRecording?: () => void;
  onRetake?: () => void;
  onUpload?: () => void;
  onSwitchCamera?: () => void;
  showUpload?: boolean;
}

const VideoPreview = ({
  step,
  videoRef,
  recordingTime = 0,
  maxRecordingTime = 90,
  uploadProgress = 0,
  onStopRecording,
  onRetake,
  onUpload,
  onSwitchCamera,
  showUpload = false
}: VideoPreviewProps) => {
  
  // Log component rendering with important props
  useEffect(() => {
    console.log(`VideoPreview rendered with step: ${step}, showUpload: ${showUpload}`);
  }, [step, showUpload]);
  
  return (
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

      <div className="video-container bg-gray-900 rounded-lg overflow-hidden relative aspect-video">
        <video
          ref={videoRef}
          muted={step === "recording"}
          playsInline
          autoPlay={step === "recording"}
          controls={step === "preview"}
          className="w-full h-full object-cover"
        />
        
        {step === "recording" && (
          <>
            <div className="absolute top-2 right-2 z-10">
              <Button 
                size="sm" 
                variant="secondary"
                className="h-8 w-8 p-0 rounded-full"
                onClick={onSwitchCamera}
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
            <span>{formatTime(maxRecordingTime)}</span>
          </div>
          <Progress value={(recordingTime / maxRecordingTime) * 100} className="h-2" />
          
          <Button 
            className="w-full bg-red-500 hover:bg-red-600"
            onClick={onStopRecording}
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
              onClick={onRetake}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Retake
            </Button>
            <Button 
              className="w-full"
              onClick={onUpload}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Video
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
  );
};

export default VideoPreview;
