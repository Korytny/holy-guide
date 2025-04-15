
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

// Define accepted favorite types
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

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await getUserProfile();
      setAuth(prev => ({
        ...prev,
        isAuthenticated: !!profile,
        isLoading: false,
        user: profile
      }));
    } catch (error) {
      console.error('Error refreshing profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh profile information.',
        variant: 'destructive'
      });
      setAuth(prev => ({ ...prev, isLoading: false, isAuthenticated: false, user: null }));
    }
  }, [toast]);

  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      try {
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!isMounted) return;
            if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
              await refreshProfile();
            } else if (event === 'SIGNED_OUT') {
              setAuth({
                isAuthenticated: false,
                isLoading: false,
                user: null
              });
            }
          }
        );

        // Initial check
        const { data: { session } } = await supabase.auth.getSession();
        if (session && isMounted) {
          await refreshProfile();
        } else if (isMounted) {
          setAuth({
            isAuthenticated: false,
            isLoading: false,
            user: null
          });
        }

        return () => {
          isMounted = false;
          authListener?.subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (isMounted) {
          setAuth({
            isAuthenticated: false,
            isLoading: false,
            user: null
          });
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [refreshProfile]);

  const isFavorite = useCallback((type: FavoriteType, id: string): boolean => {
    if (!auth.user) return false;
    switch (type) {
      case 'city': return auth.user.cities_like?.includes(id) ?? false;
      case 'route': return auth.user.routes_like?.includes(id) ?? false;
      case 'event': return auth.user.events_like?.includes(id) ?? false;
      case 'place': return auth.user.places_like?.includes(id) ?? false; // Added place
      default: return false;
    }
  }, [auth.user]);

  const toggleFavorite = useCallback(async (type: FavoriteType, id: string) => {
    if (!auth.isAuthenticated || !auth.user) {
      toast({ title: 'Authentication Required', description: 'Please sign in to save favorites.', variant: 'destructive' });
      return;
    }

    const currentlyFavorite = isFavorite(type, id);
    
    // Determine the correct API function based on type
    let action: (itemId: string) => Promise<boolean>;
    switch (type) {
      case 'city': action = currentlyFavorite ? removeCityFromFavorites : addCityToFavorites; break;
      case 'route': action = currentlyFavorite ? removeRouteFromFavorites : addRouteToFavorites; break;
      case 'event': action = currentlyFavorite ? removeEventFromFavorites : addEventToFavorites; break;
      case 'place': action = currentlyFavorite ? removePlaceFromFavorites : addPlaceToFavorites; break; // Added place
      default: console.error('Invalid favorite type'); return;
    }
    
    // Determine the field name for optimistic update
    let field: keyof UserProfile | null = null;
     switch (type) {
      case 'city': field = 'cities_like'; break;
      case 'route': field = 'routes_like'; break;
      case 'event': field = 'events_like'; break;
      case 'place': field = 'places_like'; break; // Added place
    }
    if (!field) return; // Should not happen
    const fieldName = field; // Ensure TS knows it's not null

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

    optimisticUpdate(!currentlyFavorite); // Update UI immediately

    try {
      await action(id);
      // Optionally refresh profile to ensure data consistency, but optimistic update should suffice
      // await refreshProfile(); 
      toast({
        title: currentlyFavorite ? 'Removed from Favorites' : 'Added to Favorites',
        variant: "default"
      });
    } catch (error) {
      console.error(`Error toggling ${type} favorite:`, error);
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
