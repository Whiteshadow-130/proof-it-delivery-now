
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
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          // Ensure user exists in users table after sign in
          // Using setTimeout to prevent deadlocks with Supabase auth
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
          // Redirect to login page on sign out
          navigate('/login');
        }
      }
    );

    // Then get the initial session
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Ensure user exists in users table
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

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast.success('Login successful');
      
      // Get the redirect path from location state or default to dashboard
      const origin = location.state?.from?.pathname || '/dashboard';
      navigate(origin);
      
      // Ensure user data exists in our database
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

  // Sign up with email and password
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
      
      // Now insert the user profile data
      const { data: { user: newUser } } = await supabase.auth.getUser();
      
      if (newUser) {
        // Create a company first
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .insert({
            name: companyName,
          })
          .select()
          .single();
        
        if (companyError) {
          console.error('Error creating company:', companyError);
          throw companyError;
        }
        
        const companyId = company?.id;
        
        // Then create the user with the company ID
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: newUser.id,
            email: email,
            full_name: fullName,
            company_id: companyId
          });
        
        if (profileError) throw profileError;
      }
      
      toast.success('Account created successfully', {
        description: 'You can now log in with your credentials',
      });
      
      navigate('/login');
    } catch (error: any) {
      toast.error('Registration failed', {
        description: error.message || 'Please try again with different details',
      });
    }
  };

  // Sign out
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
