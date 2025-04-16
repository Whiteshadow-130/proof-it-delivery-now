
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SellerDashboard from "./pages/SellerDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VideoRecording from "./pages/VideoRecording";
import OrderDetails from "./pages/OrderDetails";
import ThankYou from "./pages/ThankYou";
import Wallet from "./pages/Wallet";
import Orders from "./pages/Orders";
import QrCodes from "./pages/QrCodes";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<SellerDashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/qr-codes" element={<QrCodes />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/proof" element={<OrderDetails />} />
          <Route path="/record" element={<VideoRecording />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
