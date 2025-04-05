
import { supabase } from '../integrations/supabase/client';
import { City, Place, Route, Event, Language, Json } from '../types';

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
export const getCities = async (search?: string, filters?: any) => {
  let query = supabase.from('cities').select('*');
  
  if (search) {
    query = query.ilike('name', `%${search}%`);
  }
  
  if (filters) {
    // Apply any additional filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        query = query.eq(key, value);
      }
    });
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
  
  return (data || []).map(transformCity) as City[];
};

// Get city by ID
export const getCityById = async (id: string) => {
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
};

// Get places by city ID
export const getPlacesByCityId = async (cityId: string) => {
  const { data, error } = await supabase
    .from('spots')
    .select('*')
    .eq('city', cityId);
  
  if (error) {
    console.error('Error fetching places:', error);
    return [];
  }
  
  return (data || []).map(transformPlace) as Place[];
};

// Get place by ID
export const getPlaceById = async (id: string) => {
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
};

// Get routes by city ID
export const getRoutesByCityId = async (cityId: string) => {
  // This might need adjustment based on your actual database structure
  const { data, error } = await supabase
    .from('routes')
    .select('*')
    .eq('cityId', cityId);
  
  if (error) {
    console.error('Error fetching routes:', error);
    return [];
  }
  
  return (data || []).map(transformRoute) as Route[];
};

// Get route by ID
export const getRouteById = async (id: string) => {
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
};

// Get events by city ID
export const getEventsByCityId = async (cityId: string) => {
  // This might need adjustment based on your actual database structure
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('cityId', cityId);
  
  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }
  
  return (data || []).map(transformEvent) as Event[];
};

// Get event by ID
export const getEventById = async (id: string) => {
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
};

// Get translations - This function will need to be updated based on how translations are stored
export const getTranslations = async (language: Language) => {
  console.log('Getting translations for language:', language);
  return {};
};

// Search functionality
export const search = async (term: string, type: 'cities' | 'spots' | 'routes' | 'events') => {
  // Adjust the search query based on the database structure
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
  
  switch (type) {
    case 'cities':
      return (data || []).map(transformCity);
    case 'spots':
      return (data || []).map(transformPlace);
    case 'routes':
      return (data || []).map(transformRoute);
    case 'events':
      return (data || []).map(transformEvent);
    default:
      return [];
  }
};

// New functions for user authentication and profile
export const getUserProfile = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return null;
  }
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
    
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return {
    id: data.id,
    fullName: data.full_name,
    avatarUrl: data.avatar_url,
    updatedAt: data.updated_at
  };
};

export const updateUserProfile = async (updates: { full_name?: string, avatar_url?: string }) => {
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
};

export const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  
  if (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};
