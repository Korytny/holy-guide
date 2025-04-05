
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { AuthState, UserProfile } from '../types';
import { getUserProfile } from '../services/api';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  auth: AuthState;
  refreshProfile: () => Promise<void>;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null
};

const AuthContext = createContext<AuthContextType>({
  auth: initialState,
  refreshProfile: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>(initialState);
  const { toast } = useToast();

  const refreshProfile = async () => {
    try {
      const profile = await getUserProfile();
      
      if (profile) {
        setAuth({
          isAuthenticated: true,
          isLoading: false,
          user: profile
        });
      } else {
        setAuth({
          isAuthenticated: false,
          isLoading: false,
          user: null
        });
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh profile information.',
        variant: 'destructive'
      });
      setAuth(prev => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    // Initialize auth state
    const initAuth = async () => {
      try {
        // Set up auth state listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            console.log('Auth state changed:', event);
            
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              // Only update on signin or token refresh
              setTimeout(() => {
                refreshProfile();
              }, 0);
            } else if (event === 'SIGNED_OUT') {
              setAuth({
                isAuthenticated: false,
                isLoading: false,
                user: null
              });
            }
          }
        );

        // THEN check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          await refreshProfile();
        } else {
          setAuth({
            isAuthenticated: false,
            isLoading: false,
            user: null
          });
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuth({
          isAuthenticated: false,
          isLoading: false,
          user: null
        });
      }
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ auth, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
