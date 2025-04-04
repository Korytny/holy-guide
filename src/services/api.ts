
import { createClient } from '@supabase/supabase-js';
import { City, Place, Route, Event, Language } from '../types';

// This will be replaced with actual Supabase credentials
const supabaseUrl = 'https://your-supabase-project-url.supabase.co';
const supabaseKey = 'your-supabase-anon-key';

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

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
  
  return data as City[];
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
  
  return data as City;
};

// Get places by city ID
export const getPlacesByCityId = async (cityId: string) => {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('cityId', cityId);
  
  if (error) {
    console.error('Error fetching places:', error);
    return [];
  }
  
  return data as Place[];
};

// Get place by ID
export const getPlaceById = async (id: string) => {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching place:', error);
    return null;
  }
  
  return data as Place;
};

// Get routes by city ID
export const getRoutesByCityId = async (cityId: string) => {
  const { data, error } = await supabase
    .from('routes')
    .select('*')
    .eq('cityId', cityId);
  
  if (error) {
    console.error('Error fetching routes:', error);
    return [];
  }
  
  return data as Route[];
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
  
  return data as Route;
};

// Get events by city ID
export const getEventsByCityId = async (cityId: string) => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('cityId', cityId);
  
  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }
  
  return data as Event[];
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
  
  return data as Event;
};

// Get translations by language
export const getTranslations = async (language: Language) => {
  const { data, error } = await supabase
    .from('translations')
    .select('*')
    .eq('language', language);
  
  if (error) {
    console.error('Error fetching translations:', error);
    return {};
  }
  
  // Transform array to object for easy lookup
  const translations = data.reduce((acc, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {} as Record<string, string>);
  
  return translations;
};

// Search functionality
export const search = async (term: string, type: 'cities' | 'places' | 'routes' | 'events') => {
  const { data, error } = await supabase
    .from(type)
    .select('*')
    .or(`name.ilike.%${term}%,description.ilike.%${term}%`);
  
  if (error) {
    console.error(`Error searching ${type}:`, error);
    return [];
  }
  
  return data;
};
