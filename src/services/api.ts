import { supabase } from '../integrations/supabase/client';
import { City, Place, Route, Event, Language, UserProfile } from '../types';
import { getLocalizedText } from '../utils/languageUtils';

// Helper function to transform database objects to our app models
const transformCity = (dbCity: any): City => ({
  id: dbCity.id,
  name: typeof dbCity.name === 'object' 
    ? dbCity.name 
    : { en: dbCity.name || '' },
  description: typeof dbCity.info?.description === 'object' 
    ? dbCity.info.description 
    : { en: dbCity.info?.description || '' },
  imageUrl: Array.isArray(dbCity.images) && dbCity.images.length > 0 
    ? dbCity.images[0] 
    : dbCity.images?.main || 'https://via.placeholder.com/300',
  country: dbCity.country || '',
  events_count: dbCity.events_count || 0,
  routes_count: dbCity.routes_count || 0,
  spots_count: dbCity.spots_count || 0,
  info: dbCity.info || {},
  images: dbCity.images || {}
});

const transformPlace = (dbPlace: any): Place => ({
  id: dbPlace.id,
  name: typeof dbPlace.name === 'object' 
    ? dbPlace.name 
    : { en: dbPlace.name || '' },
  description: typeof dbPlace.info?.description === 'object' 
    ? dbPlace.info.description 
    : { en: dbPlace.info?.description || '' },
  imageUrl: Array.isArray(dbPlace.images) && dbPlace.images.length > 0 
    ? dbPlace.images[0] 
    : dbPlace.images?.main || 'https://via.placeholder.com/300',
  cityId: dbPlace.city || '',
  location: dbPlace.point ? {
    // Extract coordinates from the geometry point
    latitude: dbPlace.point.coordinates[1],  // Y coordinate (latitude)
    longitude: dbPlace.point.coordinates[0]  // X coordinate (longitude)
  } : {
    // Fallback to coordinates object if point is not available
    latitude: dbPlace.coordinates?.lat || 0,
    longitude: dbPlace.coordinates?.lng || 0
  },
  city: dbPlace.city,
  coordinates: dbPlace.coordinates || {},
  info: dbPlace.info || {},
  images: dbPlace.images || {},
  type: dbPlace.type,
  point: dbPlace.point,
  created_at: dbPlace.created_at,
  // Prevent circular references by not including fully populated routes and events
  events: dbPlace.events || [],
  routes: dbPlace.routes || []
});

const transformRoute = (dbRoute: any): Route => ({
  id: dbRoute.id,
  name: typeof dbRoute.name === 'object' 
    ? dbRoute.name 
    : { en: dbRoute.name || '' },
  description: typeof dbRoute.info?.description === 'object' 
    ? dbRoute.info.description 
    : { en: dbRoute.info?.description || '' },
  imageUrl: Array.isArray(dbRoute.images) && dbRoute.images.length > 0 
    ? dbRoute.images[0] 
    : dbRoute.images?.main || 'https://via.placeholder.com/300',
  cityId: dbRoute.city || '',
  placeIds: dbRoute.spots || [],
  eventIds: dbRoute.events || [],
  info: dbRoute.info || {},
  images: dbRoute.images || {},
  // Prevent circular references
  places: [],
  events: []
});

const transformEvent = (dbEvent: any): Event => ({
  id: dbEvent.id,
  name: typeof dbEvent.name === 'object' 
    ? dbEvent.name 
    : { en: dbEvent.name || '' },
  description: typeof dbEvent.info?.description === 'object' 
    ? dbEvent.info.description 
    : { en: dbEvent.info?.description || '' },
  imageUrl: Array.isArray(dbEvent.images) && dbEvent.images.length > 0 
    ? dbEvent.images[0] 
    : dbEvent.images?.main || 'https://via.placeholder.com/300',
  cityId: dbEvent.city || '',
  placeIds: dbEvent.spots || [],
  routeIds: dbEvent.routes || [],
  date: dbEvent.time,
  time: dbEvent.time,
  info: dbEvent.info || {},
  images: dbEvent.images || {},
  type: dbEvent.type,
  // Prevent circular references
  places: [],
  routes: []
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
      .eq('city', cityId);
    
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
      .eq('city', cityId);
    
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

// Add city to favorites
export const addCityToFavorites = async (cityId: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Not authenticated');
    }
    
    // First check if the cities_like column exists, if not, create it
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();
      
    if (fetchError) {
      console.error('Error fetching profile:', fetchError);
      throw fetchError;
    }
    
    // Update favorites - add city if not already there
    let currentLikes = profile?.cities_like || [];
    
    // If the column doesn't exist in the record, make sure it's an array
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

// Remove city from favorites
export const removeCityFromFavorites = async (cityId: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Not authenticated');
    }
    
    // Get current favorites
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();
      
    if (fetchError) {
      console.error('Error fetching profile:', fetchError);
      throw fetchError;
    }
    
    // Update favorites - remove city
    let currentLikes = profile?.cities_like || [];
    
    // If the column doesn't exist in the record, just return
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

// Check if city is in user's favorites
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
    
    // If the column doesn't exist in the record, return false
    if (!Array.isArray(currentLikes)) {
      return false;
    }
    
    return currentLikes.includes(cityId);
  } catch (error) {
    console.error('Error in isCityFavorite:', error);
    return false;
  }
};

// Create user profile function
export const createUserProfile = async (userData: {
  user_id: string;
  full_name?: string;
  avatar_url?: string;
}) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Not authenticated');
    }
    
    // Call create-profile function with authorization
    const { data, error } = await supabase.functions.invoke(
      'create-profile', 
      {
        body: userData,
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      }
    );
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating profile:', error);
    throw error;
  }
};

// Update the getUserProfile function to use the new approach
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
          updatedAt: data.updated_at,
          cities_like: data.cities_like || []
        };
      }
      
      if (error || !data) {
        console.log('Profile not found, creating new profile');
        
        try {
          // Use the createUserProfile function
          await createUserProfile({
            user_id: session.user.id,
            full_name: session.user.user_metadata.full_name || session.user.user_metadata.name || 'User',
            avatar_url: session.user.user_metadata.avatar_url || null
          });
          
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
              updatedAt: createdProfile.updated_at,
              cities_like: createdProfile.cities_like || []
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

// User authentication and profile functions
export const updateUserProfile = async (updates: { full_name?: string, avatar_url?: string, cities_like?: string[] }) => {
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

// Get routes related to a place
export const getRoutesByPlaceId = async (placeId: string) => {
  try {
    // First get the route IDs from the spot_route join table
    const { data: relationData, error: relationError } = await supabase
      .from('spot_route')
      .select('route_id')
      .eq('spot_id', placeId);
    
    if (relationError || !relationData || relationData.length === 0) {
      console.log('No related routes found or error:', relationError);
      return [];
    }
    
    // Extract the route IDs
    const routeIds = relationData.map(rel => rel.route_id);
    
    // Now get the actual route data
    const { data: routesData, error: routesError } = await supabase
      .from('routes')
      .select('*')
      .in('id', routeIds);
    
    if (routesError) {
      console.error('Error fetching related routes:', routesError);
      return [];
    }
    
    return routesData ? routesData.map(transformRoute) : [];
  } catch (error) {
    console.error('Error in getRoutesByPlaceId:', error);
    return [];
  }
};

// Get events related to a place
export const getEventsByPlaceId = async (placeId: string) => {
  try {
    // First get the event IDs from the spot_event join table
    const { data: relationData, error: relationError } = await supabase
      .from('spot_event')
      .select('event_id')
      .eq('spot_id', placeId);
    
    if (relationError || !relationData || relationData.length === 0) {
      console.log('No related events found or error:', relationError);
      return [];
    }
    
    // Extract the event IDs
    const eventIds = relationData.map(rel => rel.event_id);
    
    // Now get the actual event data
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .in('id', eventIds);
    
    if (eventsError) {
      console.error('Error fetching related events:', eventsError);
      return [];
    }
    
    return eventsData ? eventsData.map(transformEvent) : [];
  } catch (error) {
    console.error('Error in getEventsByPlaceId:', error);
    return [];
  }
};

// Get places related to a route
export const getPlacesByRouteId = async (routeId: string) => {
  try {
    // First get the place IDs from the spot_route join table
    const { data: relationData, error: relationError } = await supabase
      .from('spot_route')
      .select('spot_id')
      .eq('route_id', routeId);
    
    if (relationError || !relationData || relationData.length === 0) {
      console.log('No related places found or error:', relationError);
      return [];
    }
    
    // Extract the place IDs
    const placeIds = relationData.map(rel => rel.spot_id);
    
    // Now get the actual place data
    const { data: placesData, error: placesError } = await supabase
      .from('spots')
      .select('*')
      .in('id', placeIds);
    
    if (placesError) {
      console.error('Error fetching related places:', placesError);
      return [];
    }
    
    return placesData ? placesData.map(transformPlace) : [];
  } catch (error) {
    console.error('Error in getPlacesByRouteId:', error);
    return [];
  }
};

// Get events related to a route
export const getEventsByRouteId = async (routeId: string) => {
  try {
    // First get the event IDs from the route_event join table
    const { data: relationData, error: relationError } = await supabase
      .from('route_event')
      .select('event_id')
      .eq('route_id', routeId);
    
    if (relationError || !relationData || relationData.length === 0) {
      console.log('No related events found or error:', relationError);
      return [];
    }
    
    // Extract the event IDs
    const eventIds = relationData.map(rel => rel.event_id);
    
    // Now get the actual event data
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .in('id', eventIds);
    
    if (eventsError) {
      console.error('Error fetching related events:', eventsError);
      return [];
    }
    
    return eventsData ? eventsData.map(transformEvent) : [];
  } catch (error) {
    console.error('Error in getEventsByRouteId:', error);
    return [];
  }
};

// Get places related to an event
export const getPlacesByEventId = async (eventId: string) => {
  try {
    // First get the place IDs from the spot_event join table
    const { data: relationData, error: relationError } = await supabase
      .from('spot_event')
      .select('spot_id')
      .eq('event_id', eventId);
    
    if (relationError || !relationData || relationData.length === 0) {
      console.log('No related places found or error:', relationError);
      return [];
    }
    
    // Extract the place IDs
    const placeIds = relationData.map(rel => rel.spot_id);
    
    // Now get the actual place data
    const { data: placesData, error: placesError } = await supabase
      .from('spots')
      .select('*')
      .in('id', placeIds);
    
    if (placesError) {
      console.error('Error fetching related places:', placesError);
      return [];
    }
    
    return placesData ? placesData.map(transformPlace) : [];
  } catch (error) {
    console.error('Error in getPlacesByEventId:', error);
    return [];
  }
};

// Get routes related to an event
export const getRoutesByEventId = async (eventId: string) => {
  try {
    // First get the route IDs from the route_event join table
    const { data: relationData, error: relationError } = await supabase
      .from('route_event')
      .select('route_id')
      .eq('event_id', eventId);
    
    if (relationError || !relationData || relationData.length === 0) {
      console.log('No related routes found or error:', relationError);
      return [];
    }
    
    // Extract the route IDs
    const routeIds = relationData.map(rel => rel.route_id);
    
    // Now get the actual route data
    const { data: routesData, error: routesError } = await supabase
      .from('routes')
      .select('*')
      .in('id', routeIds);
    
    if (routesError) {
      console.error('Error fetching related routes:', routesError);
      return [];
    }
    
    return routesData ? routesData.map(transformRoute) : [];
  } catch (error) {
    console.error('Error in getRoutesByEventId:', error);
    return [];
  }
};

// Get all routes related to places in a city
export const getRoutesRelatedToCityPlaces = async (cityId: string) => {
  try {
    // First get all places that belong to the city
    const places = await getPlacesByCityId(cityId);
    
    if (!places.length) {
      return [];
    }
    
    // Get all place IDs
    const placeIds = places.map(place => place.id);
    
    // Find all spot_route relations for these places
    const { data: relationData, error: relationError } = await supabase
      .from('spot_route')
      .select('route_id')
      .in('spot_id', placeIds);
    
    if (relationError || !relationData || relationData.length === 0) {
      console.log('No routes related to city places found:', relationError);
      return [];
    }
    
    // Extract the route IDs (with duplicates removed)
    const routeIds = [...new Set(relationData.map(rel => rel.route_id))];
    
    // Now get the actual route data
    const { data: routesData, error: routesError } = await supabase
      .from('routes')
      .select('*')
      .in('id', routeIds);
    
    if (routesError) {
      console.error('Error fetching routes related to city places:', routesError);
      return [];
    }
    
    return routesData ? routesData.map(transformRoute) : [];
  } catch (error) {
    console.error('Error in getRoutesRelatedToCityPlaces:', error);
    return [];
  }
};

// Get all events related to places in a city
export const getEventsRelatedToCityPlaces = async (cityId: string) => {
  try {
    // First get all places that belong to the city
    const places = await getPlacesByCityId(cityId);
    
    if (!places.length) {
      return [];
    }
    
    // Get all place IDs
    const placeIds = places.map(place => place.id);
    
    // Find all spot_event relations for these places
    const { data: relationData, error: relationError } = await supabase
      .from('spot_event')
      .select('event_id')
      .in('spot_id', placeIds);
    
    if (relationError || !relationData || relationData.length === 0) {
      console.log('No events related to city places found:', relationError);
      return [];
    }
    
    // Extract the event IDs (with duplicates removed)
    const eventIds = [...new Set(relationData.map(rel => rel.event_id))];
    
    // Now get the actual event data
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .in('id', eventIds);
    
    if (eventsError) {
      console.error('Error fetching events related to city places:', eventsError);
      return [];
    }
    
    return eventsData ? eventsData.map(transformEvent) : [];
  } catch (error) {
    console.error('Error in getEventsRelatedToCityPlaces:', error);
    return [];
  }
};
