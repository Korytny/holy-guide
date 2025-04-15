
import { supabase } from '../integrations/supabase/client';
import { Language, UserProfile } from '../types';
import { getEventById, getEventsByPlaceId, getEventsByRouteId } from './eventsApi';
import { getPlaceById, getPlacesByRouteId, getPlacesByEventId } from './placesApi';
import { getRouteById, getRoutesByPlaceId, getRoutesByEventId } from './routesApi';
import { signInWithGoogle } from './authApi';

export {
  getEventById,
  getEventsByPlaceId,
  getEventsByRouteId,
  getPlaceById,
  getPlacesByRouteId,
  getPlacesByEventId,
  getRouteById,
  getRoutesByPlaceId,
  getRoutesByEventId,
  signInWithGoogle
};
import { getLocalizedText } from '../utils/languageUtils';

// Common utilities that don't belong to specific domains
export const getTranslations = async (language: Language) => {
  console.log('Getting translations for language:', language);
  return {};
};

// Search functionality
export const search = async (term: string, type: 'cities' | 'spots' | 'routes' | 'events') => {
  try {
    let tableName = type;
    if (type === 'spots') {
      tableName = 'spots';
    }

    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .textSearch('name', term);

    if (error) {
      console.error(`Error searching ${type}:`, error);
      return [];
    }

    if (!data) return [];

    // Import transform functions on demand to avoid circular dependencies
    const { transformCity, transformPlace, transformRoute, transformEvent } = await import('./apiUtils');

    switch (type) {
      case 'cities':
        return data.map(transformCity);
      case 'spots':
        return data.map(transformPlace);
      case 'routes':
        return data.map(transformRoute);
      case 'events':
        return data.map(transformEvent);
      default:
        return [];
    }
  } catch (error) {
    console.error(`Error in search for ${type}:`, error);
    return [];
  }
};

// --- User profile related functions ---

// Generic function to fetch profile
const fetchUserProfile = async (userId: string) => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
  return profile;
};

// Generic function to update favorites
const updateFavorites = async (userId: string, field: string, currentLikes: string[], itemId: string, add: boolean) => {
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

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ [field]: updatedLikes })
    .eq('id', userId);

  if (updateError) {
    console.error(`Error updating ${field}:`, updateError);
    throw updateError;
  }
  return true;
};

// City Favorites
export const addCityToFavorites = async (cityId: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  const profile = await fetchUserProfile(session.user.id);
  const currentLikes = profile?.cities_like && Array.isArray(profile.cities_like) ? profile.cities_like : [];
  return updateFavorites(session.user.id, 'cities_like', currentLikes, cityId, true);
};

export const removeCityFromFavorites = async (cityId: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  const profile = await fetchUserProfile(session.user.id);
  const currentLikes = profile?.cities_like && Array.isArray(profile.cities_like) ? profile.cities_like : [];
  return updateFavorites(session.user.id, 'cities_like', currentLikes, cityId, false);
};

// Route Favorites
export const addRouteToFavorites = async (routeId: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  const profile = await fetchUserProfile(session.user.id);
  const currentLikes = profile?.routes_like && Array.isArray(profile.routes_like) ? profile.routes_like : [];
  return updateFavorites(session.user.id, 'routes_like', currentLikes, routeId, true);
};

export const removeRouteFromFavorites = async (routeId: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  const profile = await fetchUserProfile(session.user.id);
  const currentLikes = profile?.routes_like && Array.isArray(profile.routes_like) ? profile.routes_like : [];
  return updateFavorites(session.user.id, 'routes_like', currentLikes, routeId, false);
};

// Event Favorites
export const addEventToFavorites = async (eventId: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  const profile = await fetchUserProfile(session.user.id);
  const currentLikes = profile?.events_like && Array.isArray(profile.events_like) ? profile.events_like : [];
  return updateFavorites(session.user.id, 'events_like', currentLikes, eventId, true);
};

export const removeEventFromFavorites = async (eventId: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  const profile = await fetchUserProfile(session.user.id);
  const currentLikes = profile?.events_like && Array.isArray(profile.events_like) ? profile.events_like : [];
  return updateFavorites(session.user.id, 'events_like', currentLikes, eventId, false);
};

// Place Favorites (Added)
export const addPlaceToFavorites = async (placeId: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  const profile = await fetchUserProfile(session.user.id);
  const currentLikes = profile?.places_like && Array.isArray(profile.places_like) ? profile.places_like : [];
  return updateFavorites(session.user.id, 'places_like', currentLikes, placeId, true);
};

export const removePlaceFromFavorites = async (placeId: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  const profile = await fetchUserProfile(session.user.id);
  const currentLikes = profile?.places_like && Array.isArray(profile.places_like) ? profile.places_like : [];
  return updateFavorites(session.user.id, 'places_like', currentLikes, placeId, false);
};

// Get User Profile (Updated)
export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const profile = await fetchUserProfile(session.user.id);
    if (!profile) return null;

    return {
      id: profile.id,
      fullName: profile.full_name,
      avatarUrl: profile.avatar_url,
      updatedAt: profile.updated_at,
      cities_like: profile.cities_like && Array.isArray(profile.cities_like) ? profile.cities_like : [],
      routes_like: profile.routes_like && Array.isArray(profile.routes_like) ? profile.routes_like : [],
      events_like: profile.events_like && Array.isArray(profile.events_like) ? profile.events_like : [],
      places_like: profile.places_like && Array.isArray(profile.places_like) ? profile.places_like : [] // Added
    };
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};
