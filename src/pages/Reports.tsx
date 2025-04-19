
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  PieChart, 
  Download, 
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

const Reports = () => {
  const [timeframe, setTimeframe] = useState("month");
  const [stats, setStats] = useState({
    totalOrders: 0,
    videoCompletionRate: 0,
    issuesReported: 0,
    avgResponseTime: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch user-specific report data
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setLoading(true);
        
        // Get the current user's ID
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.error("No authenticated user found");
          toast.error("Please log in to view your reports");
          return;
        }
        
        // Fetch orders for this specific user
        const { data: orders, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        // Calculate stats based on user-specific data
        const totalOrders = orders?.length || 0;
        const videosReceived = orders?.filter(order => order.status === "Video Received").length || 0;
        
        // Calculate video completion rate
        const videoCompletionRate = totalOrders > 0 
          ? Math.round((videosReceived / totalOrders) * 100) 
          : 0;
        
        setStats({
          totalOrders,
          videoCompletionRate,
          issuesReported: 3, // Placeholder for now
          avgResponseTime: 1.8 // Placeholder for now
        });
        
      } catch (error) {
        console.error("Error fetching user stats:", error);
        toast.error("Failed to load report data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserStats();
  }, []);

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <div className="flex items-center space-x-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
              <SelectItem value="quarter">Last 90 days</SelectItem>
              <SelectItem value="year">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" /> Custom Range
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" /> Export Report
          </Button>
        </div>
      </div>
      
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-3xl font-bold">{loading ? "..." : stats.totalOrders}</div>
                <div className="flex items-center text-sm">
                  <span className="flex items-center text-green-600 mr-2">
                    <ArrowUpRight className="h-3 w-3 mr-1" /> 14%
                  </span>
                  <span className="text-gray-500">vs previous period</span>
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-full">
                <BarChart className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Video Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-3xl font-bold">{loading ? "..." : `${stats.videoCompletionRate}%`}</div>
                <div className="flex items-center text-sm">
                  <span className="flex items-center text-green-600 mr-2">
                    <ArrowUpRight className="h-3 w-3 mr-1" /> 5.2%
                  </span>
                  <span className="text-gray-500">vs previous period</span>
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Issues Reported</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-3xl font-bold">{loading ? "..." : stats.issuesReported}</div>
                <div className="flex items-center text-sm">
                  <span className="flex items-center text-green-600 mr-2">
                    <ArrowDownRight className="h-3 w-3 mr-1" /> 40%
                  </span>
                  <span className="text-gray-500">vs previous period</span>
                </div>
              </div>
              <div className="bg-red-50 p-3 rounded-full">
                <TrendingDown className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Avg. Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-3xl font-bold">{loading ? "..." : `${stats.avgResponseTime}h`}</div>
                <div className="flex items-center text-sm">
                  <span className="flex items-center text-red-600 mr-2">
                    <ArrowUpRight className="h-3 w-3 mr-1" /> 12%
                  </span>
                  <span className="text-gray-500">vs previous period</span>
                </div>
              </div>
              <div className="bg-purple-50 p-3 rounded-full">
                <PieChart className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Volume Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
            <div className="text-center">
              <BarChart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Chart visualization would go here</p>
              <p className="text-sm text-gray-400">Orders volume over time</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Video Completion by Channel</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
            <div className="text-center">
              <PieChart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Chart visualization would go here</p>
              <p className="text-sm text-gray-400">Video completion rates by sales channel</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Additional reports */}
      <Card>
        <CardHeader>
          <CardTitle>Video Completion by Time of Day</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="text-center">
            <BarChart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Chart visualization would go here</p>
            <p className="text-sm text-gray-400">Analysis of when customers are most likely to complete video uploads</p>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Reports;
