import type { City, Place, Route, Event, LocalizedText } from '../types';

// Helper to parse localized text which might be JSON string or object
const parseLocalizedText = (field: any): LocalizedText => {
  if (!field) return { en: '' }; // Return empty object if no field

  // If it's already a valid object with language keys, return it
  if (typeof field === 'object' && !Array.isArray(field) && field !== null && (field.en || field.ru || field.hi)) {
    return field;
  }

  // If it's a string, try parsing as JSON
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      // If parsed result is a valid object with language keys, return it
      if (typeof parsed === 'object' && !Array.isArray(parsed) && parsed !== null && (parsed.en || parsed.ru || parsed.hi)) {
        return parsed;
      }
      // If parsed but not localized object, treat as plain string under 'en'
      console.warn('Parsed JSON from string is not a localized object, using original string for en:', field);
      return { en: field }; 
    } catch {
      // JSON parsing failed, treat original string as 'en' fallback
      return { en: field }; 
    }
  }

   // If it's an object but not localized (e.g., a more complex info structure)
   if (typeof field === 'object' && field !== null) {
     // Check if it has a description property inside that IS localized
     if(field.description && typeof field.description === 'object' && (field.description.en || field.description.ru || field.description.hi)) {
        console.warn('Parsing info.description as description');
        return field.description;
     } else if (field.description && typeof field.description === 'string') {
        console.warn('Parsing info.description (string) as description');
        return { en: field.description }; // Use string description from info as fallback
     }
     console.warn('Received non-localized object or object without description for parsing, returning empty:', field);
     return { en: '' }; // Return empty if it's an object we can't handle as description
   }

  // Fallback for other types (numbers, booleans?)
  console.warn('parseLocalizedText received unexpected type:', typeof field, field);
  return { en: String(field) }; 
};


// Helper function to check if a LocalizedText object is effectively empty
const isLocalizedTextEmpty = (text: LocalizedText): boolean => {
    if (!text) return true;
    return !Object.values(text).some(value => value && String(value).trim() !== '');
};


export function transformCity(dbCity: any): City {
  const fallbackImage = '/placeholder.svg';
  const images = dbCity.images || [];
  const mainImageUrl = dbCity.image_url || (Array.isArray(images) && images.length > 0 ? images[0] : fallbackImage);
  const infoObject = typeof dbCity.info === 'object' && dbCity.info !== null ? dbCity.info : {};

  return {
    id: dbCity.id,
    name: parseLocalizedText(dbCity.name),
    imageUrl: mainImageUrl,
    country: dbCity.country || '',
    eventsCount: dbCity.events_count || 0,
    routesCount: dbCity.routes_count || 0,
    spotsCount: dbCity.spots_count || 0,
    // Keep full info for City, as it might have structure beyond just description
    info: infoObject, 
    images: images,
    createdAt: new Date(dbCity.created_at || Date.now()),
    updatedAt: new Date(dbCity.updated_at || Date.now())
  };
}

export function transformPlace(dbPlace: any): Place {
  const fallbackImage = '/placeholder.svg';
  const images = dbPlace.images || [];
  const mainImageUrl = dbPlace.image_url || (Array.isArray(images) && images.length > 0 ? images[0] : fallbackImage);

  return {
    id: dbPlace.id,
    name: parseLocalizedText(dbPlace.name),
    // Assume 'info' field contains the localized description for Places
    description: parseLocalizedText(dbPlace.info), 
    imageUrl: mainImageUrl,
    cityId: dbPlace.city || '',
    location: {
      latitude: dbPlace.point?.coordinates?.[1] || dbPlace.coordinates?.lat || 0,
      longitude: dbPlace.point?.coordinates?.[0] || dbPlace.coordinates?.lng || 0
    },
    // We don't include the raw 'info' field in the transformed Place type anymore
    // if its sole purpose was the description.
    images: images,
    type: dbPlace.type,
    // Other raw fields like city, coordinates, point, created_at are omitted 
    // unless explicitly needed in the Place type for frontend logic.
  };
}

export function transformRoute(dbRoute: any): Omit<Route, 'places' | 'events'> {
  const fallbackImage = '/placeholder.svg';
  const images = dbRoute.images || [];
  const mainImageUrl = dbRoute.image_url || (Array.isArray(images) && images.length > 0 ? images[0] : fallbackImage);

  return {
    id: dbRoute.id,
    name: parseLocalizedText(dbRoute.name),
    // Assume 'info' field contains the localized description for Routes
    description: parseLocalizedText(dbRoute.info),
    imageUrl: mainImageUrl,
    city_id: dbRoute.city_id || [],
    placeIds: dbRoute.spots || [], 
    eventIds: dbRoute.events || [],
    // Omit raw info field
    images: images
  };
}

export function transformEvent(dbEvent: any): Omit<Event, 'places' | 'routes'> {
   const fallbackImage = '/placeholder.svg';
   const images = dbEvent.images || [];
   const mainImageUrl = dbEvent.image_url || (Array.isArray(images) && images.length > 0 ? images[0] : fallbackImage);

  return {
    id: dbEvent.id,
    name: parseLocalizedText(dbEvent.name),
    // Assume 'info' field contains the localized description for Events
    description: parseLocalizedText(dbEvent.info),
    imageUrl: mainImageUrl,
    cityId: dbEvent.city || '',
    placeIds: dbEvent.spots || [],
    routeIds: dbEvent.routes || [],
    date: dbEvent.date || dbEvent.time,
    time: dbEvent.time,
    // Omit raw info field
    images: images,
    type: dbEvent.type
  };
}
