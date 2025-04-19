
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
import VideoProof from "./pages/VideoProof";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected seller/admin routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <SellerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            } />
            <Route path="/qr-codes" element={
              <ProtectedRoute>
                <QrCodes />
              </ProtectedRoute>
            } />
            <Route path="/wallet" element={
              <ProtectedRoute>
                <Wallet />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/video-proof" element={
              <ProtectedRoute>
                <VideoProof />
              </ProtectedRoute>
            } />
            
            {/* Public routes for customer video recording */}
            <Route path="/proof" element={
              <ProtectedRoute allowUnauthenticated={true}>
                <OrderDetails />
              </ProtectedRoute>
            } />
            <Route path="/record" element={
              <ProtectedRoute allowUnauthenticated={true}>
                <VideoRecording />
              </ProtectedRoute>
            } />
            <Route path="/thank-you" element={
              <ProtectedRoute allowUnauthenticated={true}>
                <ThankYou />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
