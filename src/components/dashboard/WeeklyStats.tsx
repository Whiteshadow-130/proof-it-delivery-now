
import { BarChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const WeeklyStats = () => {
  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Weekly Statistics</CardTitle>
      </CardHeader>
      <CardContent className="px-2">
        <div className="h-[200px] flex items-center justify-center">
          <BarChart className="h-16 w-16 text-gray-300" />
          <p className="text-gray-500 ml-4">
            Chart data visualization would go here
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyStats;

