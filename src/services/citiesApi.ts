import { supabase } from '../integrations/supabase/client';
import { City, CityFromDB, LocalizedText, Json } from '../types';
import { getLocalizedText } from '../utils/languageUtils';

const transformCity = (dbCity: CityFromDB): City => {
  const parseText = (text: Json | undefined): LocalizedText => {
    if (!text) return { en: '' };
    if (typeof text === 'object' && !Array.isArray(text)) return text as LocalizedText;
    if (typeof text === 'string') {
      try {
        const parsed = JSON.parse(text);
        return typeof parsed === 'object' ? parsed : { en: text };
      } catch {
        return { en: text };
      }
    }
    return { en: String(text) };
  };

  const parseInfo = (info: Json | undefined): Record<string, any> => {
    if (!info) return {};
    if (typeof info === 'object' && !Array.isArray(info)) return info;
    if (typeof info === 'string') {
      try {
        return JSON.parse(info);
      } catch {
        return {};
      }
    }
    return {};
  };

  const hasValidImages = Array.isArray(dbCity.images) && dbCity.images.length > 0;
  const fallbackImage = '/placeholder.svg';
  
  return {
    id: dbCity.id,
    name: parseText(dbCity.name),
    imageUrl: dbCity.image_url || (hasValidImages ? dbCity.images[0] : fallbackImage),
    country: dbCity.country,
    eventsCount: dbCity.events_count || 0,
    routesCount: dbCity.routes_count || 0,
    spotsCount: dbCity.spots_count || 0,
    info: parseInfo(dbCity.info),
    images: hasValidImages ? dbCity.images : [fallbackImage],
    createdAt: dbCity.created_at ? new Date(dbCity.created_at) : new Date(),
    updatedAt: dbCity.updated_at ? new Date(dbCity.updated_at) : new Date()
  };
};

export const getCities = async (): Promise<City[]> => {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching cities:', error);
    return [];
  }

  return data.map(transformCity);
};

export const getCityById = async (id: string): Promise<City | null> => {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching city ${id}:`, error);
    return null;
  }

  return transformCity(data);
};

export const searchCities = async (search: string): Promise<City[]> => {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .or(`name.ilike.%${search}%,info->>description.ilike.%${search}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching cities:', error);
    return [];
  }

  return data.map(transformCity);
};