
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Download, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";

const VideoProof = () => {
  const [loading, setLoading] = useState(true);
  const [videoData, setVideoData] = useState<{
    orderId: string;
    videoId: string;
    videoUrl: string | null;
    uploadDate: string;
    status: string;
  } | null>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const orderId = params.get("order");
  
  useEffect(() => {
    const fetchVideoData = async () => {
      if (!orderId) {
        toast.error("No order ID specified");
        navigate("/dashboard");
        return;
      }

      try {
        setLoading(true);
        
        // Fetch order data from Supabase
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('order_number', orderId)
          .single();
        
        if (error) {
          console.error("Error fetching order data:", error);
          toast.error("Failed to load order data");
          setLoading(false);
          return;
        }
        
        console.log("Fetched order data:", data);
        
        if (data.video_uploaded && data.video_url) {
          setVideoData({
            orderId: data.order_number,
            videoId: `VID-${data.id.substring(0, 8)}`,
            videoUrl: data.video_url,
            uploadDate: new Date(data.created_at).toISOString().split('T')[0],
            status: "Completed"
          });
        } else {
          setVideoData({
            orderId: data.order_number,
            videoId: "Not available",
            videoUrl: null,
            uploadDate: new Date(data.created_at).toISOString().split('T')[0],
            status: "Pending"
          });
        }
      } catch (error) {
        console.error("Error fetching video data:", error);
        toast.error("Failed to load video data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchVideoData();
  }, [orderId, navigate]);
  
  const handleRequestVideo = () => {
    // In a real app, this would send a notification to the customer
    toast.success("Video request notification sent to customer");
  };
  
  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const handleDownloadVideo = () => {
    if (videoData?.videoUrl) {
      window.open(videoData.videoUrl, '_blank');
      toast.success("Downloading video...");
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mr-4"
          onClick={handleBackToDashboard}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Video Proof</h1>
      </div>
      
      {loading ? (
        <Card>
          <CardContent className="p-8">
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Order ID</h3>
                  <p className="font-medium">{videoData?.orderId}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Video ID</h3>
                  <p className="font-medium">{videoData?.videoId}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Upload Date</h3>
                  <p className="font-medium">{videoData?.uploadDate}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        videoData?.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {videoData?.status}
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Video Proof</CardTitle>
            </CardHeader>
            <CardContent>
              {videoData?.videoUrl ? (
                <div className="space-y-4">
                  <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                    <video 
                      src={videoData.videoUrl} 
                      controls 
                      className="w-full h-full"
                      poster="/placeholder.svg"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <div className="flex justify-end">
                    <Button className="ml-auto" onClick={handleDownloadVideo}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Video
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 space-y-4">
                  <p className="text-gray-500">No video has been uploaded for this order yet.</p>
                  <Button onClick={handleRequestVideo}>
                    Request Video from Customer
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </DashboardLayout>
  );
};

export default VideoProof;
