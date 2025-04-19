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
            console.log('Ensuring user exists after SIGNED_IN event');
            const userData = await ensureUserExists();
            if (!userData) {
              console.warn('User authenticated but profile data could not be created/verified');
              toast.error('There was a problem with your account setup', {
                description: 'Please try signing out and back in'
              });
              // Don't redirect to dashboard if user data not found
            } else {
              console.log('User data verified after sign in:', userData);
              
              // If coming from login page, redirect to dashboard
              if (location.pathname === '/login' || location.pathname === '/register') {
                navigate('/dashboard');
              }
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
          console.log('Ensuring user exists during initialization');
          const userData = await ensureUserExists();
          
          if (!userData) {
            console.warn('User authenticated but profile data could not be created/verified on init');
            
            // If on a protected page, redirect to login
            if (location.pathname !== '/login' && location.pathname !== '/register' && 
                location.pathname !== '/' && !location.pathname.startsWith('/proof')) {
              toast.error('Account setup incomplete', { 
                description: 'Please log in again to complete setup' 
              });
              await supabase.auth.signOut();
              navigate('/login');
            }
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
  }, [navigate, location.pathname]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast.success('Login successful');
      
      // Wait for authentication to register
      setTimeout(async () => {
        console.log('Running ensureUserExists after login');
        const userData = await ensureUserExists();
        
        if (!userData) {
          console.warn("User authenticated but profile data could not be verified");
          toast.error('There was a problem with your account setup', {
            description: 'Please refresh or contact support if issues persist'
          });
        } else {
          const origin = location.state?.from?.pathname || '/dashboard';
          navigate(origin);
        }
      }, 500);
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
      // Create the auth user with metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company_name: companyName,
          },
          emailRedirectTo: `${window.location.origin}/login`
        },
      });

      if (error) throw error;
      
      if (data?.user) {
        toast.success('Account created successfully');
        
        // Don't wait for email verification if unnecessary
        // Uncomment this code if user records need to be created immediately
        /*
        // Force creation of user record
        const companyId = await createCompany(companyName);
        if (companyId) {
          await createUser(data.user.id, email, fullName, companyId);
          navigate('/dashboard');
          return;
        }
        */
        
        // Otherwise use normal flow with email verification
        toast.info('Please check your email for verification and then log in');
        
        // Sign out the user to complete registration flow
        await supabase.auth.signOut();
        navigate('/login');
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error('Registration failed', {
        description: error.message || 'Please try again with different details',
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login');
    } catch (error: any) {
      toast.error('Sign out failed', {
        description: error.message,
      });
    } finally {
      setLoading(false);
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
