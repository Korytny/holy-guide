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

// User profile related functions
export const addCityToFavorites = async (cityId: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Not authenticated');
    }
    
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();
      
    if (fetchError) {
      console.error('Error fetching profile:', fetchError);
      throw fetchError;
    }
    
    let currentLikes = profile?.cities_like || [];
    
    if (!Array.isArray(currentLikes)) {
      currentLikes = [];
    }
    
    if (!currentLikes.includes(cityId)) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          cities_like: [...currentLikes, cityId] 
        })
        .eq('id', session.user.id);
        
      if (updateError) {
        console.error('Error updating favorites:', updateError);
        throw updateError;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in addCityToFavorites:', error);
    throw error;
  }
};

export const removeCityFromFavorites = async (cityId: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Not authenticated');
    }
    
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();
      
    if (fetchError) {
      console.error('Error fetching profile:', fetchError);
      throw fetchError;
    }
    
    let currentLikes = profile?.cities_like || [];
    
    if (!Array.isArray(currentLikes)) {
      return true;
    }
    
    const updatedLikes = currentLikes.filter(id => id !== cityId);
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ cities_like: updatedLikes })
      .eq('id', session.user.id);
      
    if (updateError) {
      console.error('Error updating favorites:', updateError);
      throw updateError;
    }
    
    return true;
  } catch (error) {
    console.error('Error in removeCityFromFavorites:', error);
    throw error;
  }
};

export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return null;
    }
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();
      
    if (error || !profile) {
      return null;
    }
    
    return {
      id: profile.id,
      fullName: profile.full_name,
      avatarUrl: profile.avatar_url,
      updatedAt: profile.updated_at,
      cities_like: profile.cities_like || []
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

export const isCityFavorite = async (cityId: string): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return false;
    }
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();
      
    if (error || !profile) {
      return false;
    }
    
    const currentLikes = profile.cities_like || [];
    
    if (!Array.isArray(currentLikes)) {
      return false;
    }
    
    return currentLikes.includes(cityId);
  } catch (error) {
    console.error('Error in isCityFavorite:', error);
    return false;
  }
};
