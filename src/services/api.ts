
import { supabase } from '../integrations/supabase/client';
// Removed unused Language type import
import { UserProfile } from '../types'; 
// Individual API file imports
import { getEventById, getEventsByPlaceId, getEventsByRouteId, getEventsByIds } from './eventsApi'; 
import { getPlaceById, getPlacesByRouteId, getPlacesByEventId, fetchPlaceData } from './placesApi'; 
import { getRouteById, getRoutesByPlaceId, getRoutesByEventId, getRoutesByIds } from './routesApi'; 
import { getCityById, getCities, getCitiesByIds, searchCities } from './citiesApi'; 
// Removed getUserProfile from this import
import { signInWithGoogle, signOut } from './authApi'; 

// Re-export all functions for external use
export {
  getEventById,
  getEventsByPlaceId,
  getEventsByRouteId,
  getEventsByIds,
  getPlaceById,
  getPlacesByRouteId,
  getPlacesByEventId,
  fetchPlaceData,
  getRouteById,
  getRoutesByPlaceId,
  getRoutesByEventId,
  getRoutesByIds,
  getCityById,
  getCities,
  getCitiesByIds,
  searchCities,
  signInWithGoogle,
  signOut,
  // getUserProfile is defined below, no need to export from here if defined locally
};

// --- Timeout helper (Removed as it caused type issues with Supabase builder) ---
// function promiseWithTimeout<T>(promise: Promise<T>, ms: number, timeoutError = new Error('Promise timed out')): Promise<T> { ... }

// Generic function to fetch profile - used by getUserProfile below
// Make it internal if only used here, or keep export if needed elsewhere
const fetchUserProfile = async (userId: string) => {
   if (!supabase) {
    console.error('[API fetchUserProfile] Supabase client not available');
    return null;
  }
  try {
      // Removed promiseWithTimeout wrapper
      const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

      if (error) {
        console.error('[API fetchUserProfile] Error fetching profile DB:', error);
        return null; 
      }
      return profile;
  } catch(error) {
       // Catch potential errors during the await
       console.error('[API fetchUserProfile] Exception fetching profile:', error);
       return null;
  }
};

// Generic function to update favorites - used by functions below
export const updateFavorites = async (userId: string, field: string, currentLikes: string[], itemId: string, add: boolean) => {
   if (!supabase) {
    console.error('[API updateFavorites] Supabase client not available');
    throw new Error('Supabase client not initialized');
  }
  let updatedLikes;
  if (add) {
    if (!currentLikes.includes(itemId)) {
      updatedLikes = [...currentLikes, itemId];
    } else {
      return true; // Already liked
    }
  } else {
    updatedLikes = currentLikes.filter(id => id !== itemId);
    if (updatedLikes.length === currentLikes.length) {
      return true; // Was not liked
    }
  }
  
  try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ [field]: updatedLikes })
        .eq('id', userId);

      if (updateError) {
        console.error(`[API updateFavorites] Supabase Error updating ${field}:`, updateError);
        throw updateError;
      }
      return true;
   } catch (error) {
        console.error(`[API updateFavorites] Exception during update for ${field}:`, error);
        throw error;
   }
};

// --- Specific Favorite Functions --- 

export const addCityToFavorites = async (cityId: string) => {
   if (!supabase) throw new Error('Supabase client not initialized');
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  const profile = await fetchUserProfile(session.user.id);
   if (!profile) throw new Error('User profile not found');
  const currentLikes = profile.cities_like || [];
  return updateFavorites(session.user.id, 'cities_like', currentLikes, cityId, true);
};

export const removeCityFromFavorites = async (cityId: string) => {
   if (!supabase) throw new Error('Supabase client not initialized');
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  const profile = await fetchUserProfile(session.user.id);
   if (!profile) throw new Error('User profile not found');
  const currentLikes = profile.cities_like || [];
  return updateFavorites(session.user.id, 'cities_like', currentLikes, cityId, false);
};

export const addRouteToFavorites = async (routeId: string) => {
   if (!supabase) throw new Error('Supabase client not initialized');
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  const profile = await fetchUserProfile(session.user.id);
   if (!profile) throw new Error('User profile not found');
  const currentLikes = profile.routes_like || [];
  return updateFavorites(session.user.id, 'routes_like', currentLikes, routeId, true);
};

export const removeRouteFromFavorites = async (routeId: string) => {
   if (!supabase) throw new Error('Supabase client not initialized');
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  const profile = await fetchUserProfile(session.user.id);
   if (!profile) throw new Error('User profile not found');
  const currentLikes = profile.routes_like || [];
  return updateFavorites(session.user.id, 'routes_like', currentLikes, routeId, false);
};

export const addEventToFavorites = async (eventId: string) => {
   if (!supabase) throw new Error('Supabase client not initialized');
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  const profile = await fetchUserProfile(session.user.id);
   if (!profile) throw new Error('User profile not found');
  const currentLikes = profile.events_like || [];
  return updateFavorites(session.user.id, 'events_like', currentLikes, eventId, true);
};

export const removeEventFromFavorites = async (eventId: string) => {
   if (!supabase) throw new Error('Supabase client not initialized');
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  const profile = await fetchUserProfile(session.user.id);
   if (!profile) throw new Error('User profile not found');
  const currentLikes = profile.events_like || [];
  return updateFavorites(session.user.id, 'events_like', currentLikes, eventId, false);
};

export const addPlaceToFavorites = async (placeId: string) => {
   if (!supabase) throw new Error('Supabase client not initialized');
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  const profile = await fetchUserProfile(session.user.id);
   if (!profile) throw new Error('User profile not found');
  const currentLikes = profile.places_like || [];
  return updateFavorites(session.user.id, 'places_like', currentLikes, placeId, true);
};

export const removePlaceFromFavorites = async (placeId: string) => {
   if (!supabase) throw new Error('Supabase client not initialized');
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  const profile = await fetchUserProfile(session.user.id);
   if (!profile) throw new Error('User profile not found');
  const currentLikes = profile.places_like || [];
  return updateFavorites(session.user.id, 'places_like', currentLikes, placeId, false);
};

// Get User Profile - Defined locally
export const getUserProfile = async (): Promise<UserProfile | null> => {
  if (!supabase) {
    console.error('[API getUserProfile] Supabase client is null.');
    return null;
  }
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
    if (sessionError) {
      console.error('[API getUserProfile] Error retrieving session:', sessionError);
      return null;
    }
    
    if (!sessionData || !sessionData.session) {
      return null; // No active session
    }
    
    const session = sessionData.session;
    const profile = await fetchUserProfile(session.user.id); // Use the internal helper

    if (!profile) {
      return null; // No profile found
    }

    // Transform raw profile data to UserProfile type
    return {
      id: profile.id,
      fullName: profile.full_name || null,
      avatarUrl: profile.avatar_url || null,
      updatedAt: profile.updated_at,
      cities_like: profile.cities_like || [],
      routes_like: profile.routes_like || [],
      events_like: profile.events_like || [],
      places_like: profile.places_like || []
    };
  } catch (error) {
    console.error('[API getUserProfile] Error:', error);
    return null;
  }
};

// Search 
export const search = async (term: string, type: 'cities' | 'spots' | 'routes' | 'events') => {
   if (!supabase) {
    console.error('[API Search] Supabase client not available');
    return [];
  }
  try {
    let tableName = type === 'spots' ? 'spots' : type;
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .textSearch('name', term); 

    if (error) {
      console.error(`Error searching ${type}:`, error);
      return [];
    }
    if (!data) return [];

    const { transformCity, transformPlace, transformRoute, transformEvent } = await import('./apiUtils');

    switch (type) {
      case 'cities': return data.map(transformCity);
      case 'spots': return data.map(transformPlace);
      case 'routes': return data.map(transformRoute);
      case 'events': return data.map(transformEvent);
      default: return [];
    }
  } catch (error) {
    console.error(`Error in search for ${type}:`, error);
    return [];
  }
};

// getTranslations
export const getTranslations = async (/* language: Language */) => {
  return {}; // Placeholder
};

// Added function to fetch title data
// Interface for multilingual data (adjust languages as needed)
interface MultilingualString {
  en: string; ru: string; hi: string; [key: string]: string;
}
interface TitleData {
  name: MultilingualString | string; 
  description: MultilingualString | string;
}

export async function fetchTitleData(element: string): Promise<TitleData | null> {
  if (!supabase) {
     console.error('[API fetchTitleData] Supabase client not available');
     return null;
   }
  try {
      const { data, error } = await supabase
        .from('titles') // Correct table name
        .select('name, description')
        .eq('element', element)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Code for "Not found"
             console.warn(`[API fetchTitleData] No record found for element "${element}"`);
             return null; // Return null instead of throwing error for not found
        } else {
             console.error(`Error fetching title data for element "${element}":`, error);
             throw error; // Throw other errors
        }
      }
      // Explicitly cast to TitleData, assuming the DB schema matches
      return data as TitleData | null;
  } catch (err) {
       console.error(`[API fetchTitleData] Unexpected error fetching element "${element}":`, err);
       throw err; // Re-throw unexpected errors
  }
}
