
import { LucideIcon } from "lucide-react";

interface ActivityItemProps {
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  title: string;
  description: string;
}

const ActivityItem = ({ icon: Icon, iconBgColor, iconColor, title, description }: ActivityItemProps) => {
  return (
    <div className="flex items-center">
      <div className={`mr-3 ${iconBgColor} p-2 rounded-full`}>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
};

export default ActivityItem;

