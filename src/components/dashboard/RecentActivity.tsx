
import { Video, QrCode } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ActivityItem from "./ActivityItem";

const RecentActivity = () => {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ActivityItem
            icon={Video}
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
            title="Video uploaded"
            description="Order #ORD-12345 • 12 minutes ago"
          />
          <ActivityItem
            icon={QrCode}
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
            title="QR code generated"
            description="Order #ORD-12346 • 1 hour ago"
          />
          <ActivityItem
            icon={Video}
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
            title="Video uploaded"
            description="Order #ORD-12347 • 3 hours ago"
          />
          <ActivityItem
            icon={QrCode}
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
            title="QR code generated"
            description="Order #ORD-12348 • 5 hours ago"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;

