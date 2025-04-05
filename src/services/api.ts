
import { supabase } from '../integrations/supabase/client';
import { City, Place, Route, Event, Language, UserProfile } from '../types';

// Helper functions to transform database objects to our app models
const transformCity = (dbCity: any): City => ({
  id: dbCity.id,
  name: typeof dbCity.name === 'string' ? dbCity.name : dbCity.name?.en || '',
  description: dbCity.info?.description?.en || '',
  imageUrl: Array.isArray(dbCity.images) && dbCity.images.length > 0 
    ? dbCity.images[0] 
    : dbCity.images?.main || 'https://via.placeholder.com/300',
  country: dbCity.country || '',
  events_count: dbCity.events_count,
  routes_count: dbCity.routes_count,
  spots_count: dbCity.spots_count,
  info: dbCity.info,
  images: dbCity.images
});

const transformPlace = (dbPlace: any): Place => ({
  id: dbPlace.id,
  name: typeof dbPlace.name === 'string' ? dbPlace.name : dbPlace.name?.en || '',
  description: dbPlace.info?.description?.en || '',
  imageUrl: Array.isArray(dbPlace.images) && dbPlace.images.length > 0 
    ? dbPlace.images[0] 
    : dbPlace.images?.main || 'https://via.placeholder.com/300',
  cityId: dbPlace.city || '',
  location: {
    latitude: dbPlace.coordinates?.lat || 0,
    longitude: dbPlace.coordinates?.lng || 0
  },
  city: dbPlace.city,
  coordinates: dbPlace.coordinates,
  info: dbPlace.info,
  images: dbPlace.images,
  type: dbPlace.type,
  point: dbPlace.point,
  created_at: dbPlace.created_at
});

const transformRoute = (dbRoute: any): Route => ({
  id: dbRoute.id,
  name: typeof dbRoute.name === 'string' ? dbRoute.name : dbRoute.name?.en || '',
  description: dbRoute.info?.description?.en || '',
  imageUrl: Array.isArray(dbRoute.images) && dbRoute.images.length > 0 
    ? dbRoute.images[0] 
    : dbRoute.images?.main || 'https://via.placeholder.com/300',
  cityId: dbRoute.cityId || '',
  placeIds: [], // We'll need to fetch related spots separately
  eventIds: [], // We'll need to fetch related events separately
  info: dbRoute.info,
  images: dbRoute.images
});

const transformEvent = (dbEvent: any): Event => ({
  id: dbEvent.id,
  name: typeof dbEvent.name === 'string' ? dbEvent.name : dbEvent.name?.en || '',
  description: dbEvent.info?.description?.en || '',
  imageUrl: Array.isArray(dbEvent.images) && dbEvent.images.length > 0 
    ? dbEvent.images[0] 
    : dbEvent.images?.main || 'https://via.placeholder.com/300',
  cityId: '', // We may need to fetch this separately
  placeIds: [], // We'll need to fetch related spots separately
  routeIds: [], // We'll need to fetch related routes separately
  date: dbEvent.time,
  time: dbEvent.time,
  info: dbEvent.info,
  images: dbEvent.images,
  type: dbEvent.type
});

// Get all cities with optional filters
export const getCities = async (search?: string, filters?: Record<string, any>) => {
  try {
    let query = supabase.from('cities').select('*');
    
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value && Array.isArray(value) && value.length > 0) {
          query = query.in(key, value);
        } else if (value && !Array.isArray(value)) {
          query = query.eq(key, value);
        }
      });
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching cities:', error);
      return [];
    }
    
    return data ? data.map(transformCity) : [];
  } catch (error) {
    console.error('Error in getCities:', error);
    return [];
  }
};

// Get city by ID
export const getCityById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching city:', error);
      return null;
    }
    
    return data ? transformCity(data) : null;
  } catch (error) {
    console.error('Error in getCityById:', error);
    return null;
  }
};

// Get places by city ID
export const getPlacesByCityId = async (cityId: string) => {
  try {
    const { data, error } = await supabase
      .from('spots')
      .select('*')
      .eq('city', cityId);
    
    if (error) {
      console.error('Error fetching places:', error);
      return [];
    }
    
    return data ? data.map(transformPlace) : [];
  } catch (error) {
    console.error('Error in getPlacesByCityId:', error);
    return [];
  }
};

// Get place by ID
export const getPlaceById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('spots')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching place:', error);
      return null;
    }
    
    return data ? transformPlace(data) : null;
  } catch (error) {
    console.error('Error in getPlaceById:', error);
    return null;
  }
};

// Get routes by city ID
export const getRoutesByCityId = async (cityId: string) => {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('cityId', cityId);
    
    if (error) {
      console.error('Error fetching routes:', error);
      return [];
    }
    
    return data ? data.map(transformRoute) : [];
  } catch (error) {
    console.error('Error in getRoutesByCityId:', error);
    return [];
  }
};

// Get route by ID
export const getRouteById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching route:', error);
      return null;
    }
    
    return data ? transformRoute(data) : null;
  } catch (error) {
    console.error('Error in getRouteById:', error);
    return null;
  }
};

// Get events by city ID
export const getEventsByCityId = async (cityId: string) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('cityId', cityId);
    
    if (error) {
      console.error('Error fetching events:', error);
      return [];
    }
    
    return data ? data.map(transformEvent) : [];
  } catch (error) {
    console.error('Error in getEventsByCityId:', error);
    return [];
  }
};

// Get event by ID
export const getEventById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching event:', error);
      return null;
    }
    
    return data ? transformEvent(data) : null;
  } catch (error) {
    console.error('Error in getEventById:', error);
    return null;
  }
};

// Get translations
export const getTranslations = async (language: Language) => {
  console.log('Getting translations for language:', language);
  return {};
};

// Search functionality
export const search = async (term: string, type: 'cities' | 'spots' | 'routes' | 'events') => {
  try {
    let tableName = type;
    if (type === 'spots') {
      tableName = 'spots'; // Use 'spots' table for places
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

// User authentication and profile functions
export const getUserProfile = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
      
      if (data) {
        return {
          id: data.id,
          fullName: data.full_name,
          avatarUrl: data.avatar_url,
          updatedAt: data.updated_at
        };
      }
      
      if (error || !data) {
        console.log('Profile not found, creating new profile');
        
        try {
          // Call the edge function with proper authorization
          const { data: createResult, error: funcError } = await supabase.functions.invoke(
            'create-profile', 
            {
              body: { 
                user_id: session.user.id,
                full_name: session.user.user_metadata.full_name || session.user.user_metadata.name || 'User',
                avatar_url: session.user.user_metadata.avatar_url || null
              },
              headers: {
                Authorization: `Bearer ${session.access_token}`
              }
            }
          );
          
          if (funcError) throw funcError;
          
          const { data: createdProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (createdProfile) {
            return {
              id: createdProfile.id,
              fullName: createdProfile.full_name,
              avatarUrl: createdProfile.avatar_url,
              updatedAt: createdProfile.updated_at
            };
          }
        } catch (rpcError) {
          console.error('Error creating profile:', rpcError);
          throw rpcError;
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
};

export const updateUserProfile = async (updates: { full_name?: string, avatar_url?: string }) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Not authenticated');
    }
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', session.user.id);
      
    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  try {
    console.log('Attempting to sign in with Google...');
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    console.log('Sign in attempt result:', { data, error });
    
    if (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to sign in with Google:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error in signOut:', error);
    throw error;
  }
};
