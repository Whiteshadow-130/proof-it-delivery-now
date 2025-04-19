
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase, createCompany, createUser, getUserByEmail } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { v4 as uuidv4 } from 'uuid';

// Define simple user type for our app
interface AppUser {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  company_id?: string | null;
  companies?: {
    name: string;
    website?: string | null;
    phone?: string | null;
    address?: string | null;
    logo_url?: string | null;
  } | null;
}

interface AuthContextType {
  user: AppUser | null;
  session: boolean; // Simplified session concept (just logged in or not)
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, companyName: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local storage keys
const USER_STORAGE_KEY = 'app_user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize auth from local storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setSession(true);
          
          // Verify user still exists in DB (optional validation)
          const dbUser = await getUserByEmail(parsedUser.email);
          if (!dbUser) {
            console.warn('User not found in database, logging out');
            localStorage.removeItem(USER_STORAGE_KEY);
            setUser(null);
            setSession(false);
            
            if (location.pathname !== '/login' && location.pathname !== '/register' && 
                location.pathname !== '/' && !location.pathname.startsWith('/proof')) {
              navigate('/login');
            }
          }
        } else if (location.pathname !== '/login' && location.pathname !== '/register' && 
                  location.pathname !== '/' && !location.pathname.startsWith('/proof')) {
          navigate('/login');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [navigate, location.pathname]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);

      // For simplicity, we're not checking passwords in this version
      // In a real app, you would never store passwords in the database directly
      const userData = await getUserByEmail(email);

      if (!userData) {
        throw new Error('User not found');
      }

      // Store user in local storage
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
      setSession(true);
      
      toast.success('Login successful');
      
      const origin = location.state?.from?.pathname || '/dashboard';
      navigate(origin);
    } catch (error: any) {
      toast.error('Login failed', {
        description: error.message || 'Please check your credentials',
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, companyName: string) => {
    try {
      setLoading(true);
      
      // Check if user already exists
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
      
      // Generate a UUID for the new user
      const userId = uuidv4();
      
      // Create company first
      const companyId = await createCompany(companyName);
      if (!companyId) {
        throw new Error('Failed to create company');
      }
      
      // Create user with reference to company
      const newUser = await createUser(userId, email, fullName, companyId);
      if (!newUser) {
        throw new Error('Failed to create user');
      }
      
      toast.success('Account created successfully', {
        description: 'You can now log in with your email',
      });
      
      navigate('/login');
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error('Registration failed', {
        description: error.message || 'Please try again with different details',
      });
      throw error; // Re-throw to be caught by the form handler
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
      setUser(null);
      setSession(false);
      navigate('/login');
    } catch (error: any) {
      toast.error('Sign out failed', {
        description: error.message,
      });
    }
  };

  const isAuthenticated = !!user;

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
