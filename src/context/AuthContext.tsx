
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
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          // Ensure user exists in users table after sign in
          setTimeout(async () => {
            await ensureUserExists();
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          // Redirect to login page on sign out
          navigate('/login');
        }
      }
    );

    // Then get the initial session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        // Ensure user exists in users table
        await ensureUserExists();
      }
      
      setLoading(false);
    });

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
      
      // Ensure user data exists in our database
      const userData = await ensureUserExists();
      
      if (!userData) {
        console.warn("User authenticated but profile data could not be verified");
      }
      
      toast.success('Login successful');
      
      // Get the redirect path from location state or default to dashboard
      const origin = location.state?.from?.pathname || '/dashboard';
      navigate(origin);
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
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: newUser.id,
            email: email,
            full_name: fullName,
            company_name: companyName,
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
