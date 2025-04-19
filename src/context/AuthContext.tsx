import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase, ensureUserExists } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, companyName: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          setTimeout(async () => {
            const userData = await ensureUserExists();
            if (!userData) {
              console.warn('User authenticated but profile data could not be created/verified');
              toast.error('There was a problem with your account setup', {
                description: 'Please try signing out and back in'
              });
            } else {
              console.log('User data verified after sign in:', userData);
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          navigate('/login');
        }
      }
    );

    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          const userData = await ensureUserExists();
          
          if (!userData) {
            console.warn('User authenticated but profile data could not be created/verified on init');
          } else {
            console.log('User data verified on init:', userData);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast.success('Login successful');
      
      const origin = location.state?.from?.pathname || '/dashboard';
      navigate(origin);
      
      const userData = await ensureUserExists();
      
      if (!userData) {
        console.warn("User authenticated but profile data could not be verified");
        toast.error('There was a problem with your account setup', {
          description: 'Please refresh or contact support if issues persist'
        });
      }
    } catch (error: any) {
      toast.error('Login failed', {
        description: error.message || 'Please check your credentials',
      });
    }
  };

  const signUp = async (email: string, password: string, fullName: string, companyName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company_name: companyName,
          },
        },
      });

      if (error) throw error;
      
      toast.success('Account created successfully', {
        description: 'Please check your email for verification and then log in',
      });
      
      navigate('/login');
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error('Registration failed', {
        description: error.message || 'Please try again with different details',
      });
      throw error; // Re-throw to be caught by the form handler
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
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
