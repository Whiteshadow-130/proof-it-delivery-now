
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowUnauthenticated?: boolean; // For pages that should be accessible without login
}

const ProtectedRoute = ({ children, allowUnauthenticated = false }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // If still loading authentication state, show nothing or a loading indicator
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // If unauthenticated and this route requires authentication
  if (!isAuthenticated && !allowUnauthenticated) {
    // Redirect to the login page, but save the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Either authenticated or the route allows unauthenticated access
  return <>{children}</>;
};

export default ProtectedRoute;
