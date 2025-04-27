
import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { AuthState, UserProfile, Session } from '../types'; // Import Session
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
  // Make session argument optional in the type definition
  refreshProfile: (session?: Session | null) => Promise<void>; 
  isFavorite: (type: FavoriteType, id: string) => boolean;
  toggleFavorite: (type: FavoriteType, id: string) => Promise<void>;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  session: null, // Initialize session state
};

const AuthContext = createContext<AuthContextType>({
  auth: initialState,
  // Update default value to match optional signature
  refreshProfile: async (_session?: Session | null) => {},
  isFavorite: () => false,
  toggleFavorite: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>(initialState);
  const { toast } = useToast();

  // Log state changes (optional, can be removed if too noisy)
   useEffect(() => {
     console.log('[AuthContext] State updated:', { isLoading: auth.isLoading, isAuthenticated: auth.isAuthenticated, user: !!auth.user, session: !!auth.session });
   }, [auth]);

  // Update function to handle optional session argument
  const refreshProfile = useCallback(async (sessionArg?: Session | null) => {
    let sessionToUse = sessionArg;
    // If session is not provided, try to get it
    if (sessionToUse === undefined) {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            sessionToUse = session;
        } catch (error) {
             console.error('[AuthContext] Error getting session in refreshProfile:', error);
             sessionToUse = null;
        }
    }

    let newAuthState: AuthState;
    if (!sessionToUse) {
        newAuthState = { isAuthenticated: false, isLoading: false, user: null, session: null };
    } else {
         try {
            // getUserProfile should ideally fetch using sessionToUse.user.id internally
            // If not, you might need to pass the user ID here.
            const profile = await getUserProfile(); 
             newAuthState = {
              isAuthenticated: !!profile, // isAuthenticated depends on profile presence
              isLoading: false,
              user: profile,
              session: sessionToUse // Store the session object
            };
          } catch (error) {
            console.error('[AuthContext] Error refreshing profile:', error);
            toast({ title: 'Error', description: 'Failed to refresh profile information.', variant: 'destructive' });
             // Keep session even if profile fetch fails, but mark as not fully authenticated?
             // Or revert to initial state? Let's revert for now.
             newAuthState = { isAuthenticated: false, isLoading: false, user: null, session: sessionToUse }; 
          }
    }

     setAuth(newAuthState);

  }, [toast]); // Added toast to dependencies

  useEffect(() => {
    let isMounted = true;
    let refreshTimeoutId: NodeJS.Timeout | null = null;

    const initAuth = async () => {
      if (!supabase) {
        console.error('[AuthContext] Supabase client not available during init.');
        if (isMounted) setAuth({ isAuthenticated: false, isLoading: false, user: null, session: null });
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
              // Set loading state and session immediately
               if (isMounted) {
                   setAuth(prev => ({
                       ...prev,
                       isLoading: true, // Indicate loading while profile is fetched
                       session: session // Set the session as soon as it's available
                   }));
               }

              // Schedule refreshProfile after a short delay
              refreshTimeoutId = setTimeout(async () => {
                  if (isMounted) {
                      await refreshProfile(session); // Pass the session to refreshProfile
                  }
                  refreshTimeoutId = null;
              }, 200); // Keep the delay

            } else if (event === 'SIGNED_OUT') {
              if (isMounted) setAuth({ isAuthenticated: false, isLoading: false, user: null, session: null }); // Clear all auth state on sign out
            } else {
                 // Handle other events if necessary, e.g., USER_UPDATED
                 console.log('[AuthContext] Auth state change event:', event);
                 // For USER_UPDATED, you might want to refresh the profile
                 if (event === 'USER_UPDATED' && session && isMounted) {
                      refreshProfile(session); 
                 }
            }
          }
        );

         // Also perform an initial check in case onAuthStateChange doesn't fire immediately
         // or the component mounts after the initial session check.
         const { data: { session } } = await supabase.auth.getSession();
         if (isMounted) {
              if (session) {
                  setAuth(prev => ({ ...prev, isLoading: true, session: session }));
                  await refreshProfile(session);
              } else {
                   setAuth({ isAuthenticated: false, isLoading: false, user: null, session: null });
              }
         }

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
           setAuth({ isAuthenticated: false, isLoading: false, user: null, session: null });
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
  }, [refreshProfile]); // Added refreshProfile to dependencies

  const isFavorite = useCallback((type: FavoriteType, id: string): boolean => {
    // Check auth.user (UserProfile) as favorites are stored there
    if (!auth.user) return false;
    switch (type) {
      case 'city': return auth.user.cities_like?.includes(id) ?? false;
      case 'route': return auth.user.routes_like?.includes(id) ?? false;
      case 'event': return auth.user.events_like?.includes(id) ?? false;
      case 'place': return auth.user.places_like?.includes(id) ?? false;
      default: return false;
    }
  }, [auth.user]); // Dependency on auth.user

  const toggleFavorite = useCallback(async (type: FavoriteType, id: string) => {
    // Check for session existence for authentication status
    if (!auth.session || !auth.user) { // Check both session and user profile
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
  }, [auth.session, auth.user, isFavorite, toast]); // Added auth.session to dependencies

  // Pass the refreshProfile function that handles optional session
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
