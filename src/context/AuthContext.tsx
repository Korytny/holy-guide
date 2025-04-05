import { createContext, useContext, useEffect, useState, useMemo } from 'react';
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
    const initAuth = async () => {
      try {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              refreshProfile();
            } else if (event === 'SIGNED_OUT') {
              setAuth({
                isAuthenticated: false,
                isLoading: false,
                user: null
              });
            }
          }
        );

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

  const contextValue = useMemo(() => ({ 
    auth, 
    refreshProfile 
  }), [auth, refreshProfile]);
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
