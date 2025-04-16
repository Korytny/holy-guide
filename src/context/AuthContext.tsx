
import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { AuthState, UserProfile } from '../types';
import {
  getUserProfile,
  addCityToFavorites,
  removeCityFromFavorites,
  addRouteToFavorites,
  removeRouteFromFavorites,
  addEventToFavorites,
  removeEventFromFavorites,
  addPlaceToFavorites,    // Added
  removePlaceFromFavorites // Added
} from '../services/api';
import { useToast } from '@/hooks/use-toast';

type FavoriteType = 'city' | 'route' | 'event' | 'place';

interface AuthContextType {
  auth: AuthState;
  refreshProfile: () => Promise<void>;
  isFavorite: (type: FavoriteType, id: string) => boolean;
  toggleFavorite: (type: FavoriteType, id: string) => Promise<void>;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null
};

const AuthContext = createContext<AuthContextType>({
  auth: initialState,
  refreshProfile: async () => {},
  isFavorite: () => false,
  toggleFavorite: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>(initialState);
  const { toast } = useToast();

  // Log state changes (optional, can be removed if too noisy)
  // useEffect(() => {
  //   console.log('[AuthContext] State updated:', { isLoading: auth.isLoading, isAuthenticated: auth.isAuthenticated, user: !!auth.user });
  // }, [auth]);

  const refreshProfile = useCallback(async () => {
    let newAuthState: AuthState | null = null;
    try {
      const profile = await getUserProfile();
      newAuthState = {
        isAuthenticated: !!profile,
        isLoading: false,
        user: profile
      };
    } catch (error) {
      console.error('[AuthContext] Error refreshing profile:', error);
      toast({ title: 'Error', description: 'Failed to refresh profile information.', variant: 'destructive' });
      newAuthState = { isAuthenticated: false, isLoading: false, user: null };
    } finally {
       if (newAuthState !== null) {
         setAuth(newAuthState);
       }
    }
  }, [toast]);

  useEffect(() => {
    let isMounted = true;
    let refreshTimeoutId: NodeJS.Timeout | null = null;

    const initAuth = async () => {
      if (!supabase) {
        console.error('[AuthContext] Supabase client not available during init.');
        setAuth({ isAuthenticated: false, isLoading: false, user: null });
        return;
      }
      try {
        const { data: authListener } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (!isMounted) return;

            if (refreshTimeoutId) {
                clearTimeout(refreshTimeoutId);
                refreshTimeoutId = null;
            }

            if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
              // Schedule refreshProfile after a short delay
              refreshTimeoutId = setTimeout(async () => {
                  if (isMounted) {
                      await refreshProfile();
                  }
                  refreshTimeoutId = null;
              }, 200); // Keep the delay

            } else if (event === 'SIGNED_OUT') {
              setAuth({ isAuthenticated: false, isLoading: false, user: null });
            }
          }
        );

        // Rely on the listener for initial session check

        return () => {
          if (refreshTimeoutId) {
              clearTimeout(refreshTimeoutId);
          }
          isMounted = false;
          authListener?.subscription.unsubscribe();
        };
      } catch (error) {
        console.error('[AuthContext] Error initializing auth:', error);
        if (isMounted) {
           setAuth({ isAuthenticated: false, isLoading: false, user: null });
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
      if (refreshTimeoutId) {
          clearTimeout(refreshTimeoutId);
      }
    };
  }, [refreshProfile]);

  const isFavorite = useCallback((type: FavoriteType, id: string): boolean => {
    if (!auth.user) return false;
    switch (type) {
      case 'city': return auth.user.cities_like?.includes(id) ?? false;
      case 'route': return auth.user.routes_like?.includes(id) ?? false;
      case 'event': return auth.user.events_like?.includes(id) ?? false;
      case 'place': return auth.user.places_like?.includes(id) ?? false;
      default: return false;
    }
  }, [auth.user]);

  const toggleFavorite = useCallback(async (type: FavoriteType, id: string) => {
    if (!auth.isAuthenticated || !auth.user) {
      toast({ title: 'Authentication Required', description: 'Please sign in to save favorites.', variant: 'destructive' });
      return;
    }

    const currentlyFavorite = isFavorite(type, id);
    let action: (itemId: string) => Promise<boolean>;
    switch (type) {
      case 'city': action = currentlyFavorite ? removeCityFromFavorites : addCityToFavorites; break;
      case 'route': action = currentlyFavorite ? removeRouteFromFavorites : addRouteToFavorites; break;
      case 'event': action = currentlyFavorite ? removeEventFromFavorites : addEventToFavorites; break;
      case 'place': action = currentlyFavorite ? removePlaceFromFavorites : addPlaceToFavorites; break;
      default: console.error('Invalid favorite type'); return;
    }
    
    let field: keyof UserProfile | null = null;
     switch (type) {
      case 'city': field = 'cities_like'; break;
      case 'route': field = 'routes_like'; break;
      case 'event': field = 'events_like'; break;
      case 'place': field = 'places_like'; break;
    }
    if (!field) return;
    const fieldName = field;

    const optimisticUpdate = (add: boolean) => {
      setAuth(prev => {
        if (!prev.user) return prev;
        const currentLikes = (prev.user[fieldName] as string[] | undefined) || [];
        const updatedLikes = add ? [...currentLikes, id] : currentLikes.filter(favId => favId !== id);
        return {
          ...prev,
          user: {
            ...prev.user,
            [fieldName]: updatedLikes
          }
        }
      });
    };

    optimisticUpdate(!currentlyFavorite);

    try {
      await action(id);
      toast({ title: currentlyFavorite ? 'Removed from Favorites' : 'Added to Favorites', variant: "default" });
    } catch (error) {
      console.error(`[AuthContext] Error toggling ${type} favorite:`, error);
      toast({ title: 'Error', description: `Failed to update ${type} favorites.`, variant: 'destructive' });
      optimisticUpdate(currentlyFavorite); // Revert UI on error
    }
  }, [auth.isAuthenticated, auth.user, isFavorite, toast]);

  const contextValue = useMemo(() => ({ 
    auth, 
    refreshProfile,
    isFavorite,
    toggleFavorite
  }), [auth, refreshProfile, isFavorite, toggleFavorite]);
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
