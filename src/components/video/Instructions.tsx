
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InstructionsProps {
  orderNumber: string;
  videoAlreadyUploaded: boolean;
  permissionError: string | null;
  onStartRecording: () => void;
}

const Instructions = ({ 
  orderNumber, 
  videoAlreadyUploaded, 
  permissionError, 
  onStartRecording 
}: InstructionsProps) => {
  return (
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

      <div className="space-y-3">
        <Button 
          className="w-full" 
          onClick={onStartRecording}
          disabled={videoAlreadyUploaded}
        >
          Start Recording
          <Camera className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Instructions;
