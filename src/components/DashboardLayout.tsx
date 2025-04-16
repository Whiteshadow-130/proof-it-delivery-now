
import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  QrCode,
  Package,
  Wallet,
  BarChart,
  Settings,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    // Mock logout - would connect to auth in a real implementation
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    navigate("/");
  };

  const sidebarItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Orders",
      path: "/orders",
      icon: <Package className="h-5 w-5" />,
    },
    {
      name: "QR Codes",
      path: "/qr-codes",
      icon: <QrCode className="h-5 w-5" />,
    },
    {
      name: "Wallet",
      path: "/wallet",
      icon: <Wallet className="h-5 w-5" />,
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <BarChart className="h-5 w-5" />,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-brand-blue text-white p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Proof-It</h1>
        <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="text-white">
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b">
          <div className="p-4 space-y-2">
            <div className="flex items-center space-x-3 p-3 mb-2 bg-gray-50 rounded-md">
              <div className="bg-brand-accent rounded-full p-2 text-white">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Demo Company</p>
                <p className="text-sm text-gray-500">demo@proof-it.com</p>
              </div>
            </div>
            {sidebarItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-md transition-colors",
                  location.pathname === item.path
                    ? "bg-brand-accent text-white"
                    : "hover:bg-gray-100"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
            <Button
              variant="ghost"
              className="flex items-center space-x-3 w-full justify-start p-3 text-red-500 hover:bg-red-50 hover:text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 bg-white border-r shadow-sm">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-brand-blue">Proof-It</h1>
        </div>
        <div className="flex-1 p-4 space-y-6">
          <div className="flex items-center space-x-3 p-3 mb-4 bg-gray-50 rounded-md">
            <div className="bg-brand-accent rounded-full p-2 text-white">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">Demo Company</p>
              <p className="text-sm text-gray-500">demo@proof-it.com</p>
            </div>
          </div>
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-md transition-colors",
                  location.pathname === item.path
                    ? "bg-brand-accent text-white"
                    : "hover:bg-gray-100"
                )}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="flex items-center space-x-3 w-full justify-start p-3 text-red-500 hover:bg-red-50 hover:text-red-600"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
