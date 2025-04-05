import type { City, Place, Route, Event } from '../types';

export function transformCity(dbCity: any): City {
  return {
    id: dbCity.id,
    name: (() => {
      if (typeof dbCity.name === 'object') return dbCity.name;
      try {
        const parsed = JSON.parse(dbCity.name);
        return typeof parsed === 'object' ? parsed : { en: dbCity.name || '' };
      } catch {
        return { en: dbCity.name || '' };
      }
    })(),
    imageUrl: Array.isArray(dbCity.images) && dbCity.images.length > 0 
      ? dbCity.images[0] 
      : dbCity.images?.main || 'https://via.placeholder.com/300',
    country: dbCity.country || '',
    eventsCount: dbCity.events_count || 0,
    routesCount: dbCity.routes_count || 0,
    spotsCount: dbCity.spots_count || 0,
    info: (() => {
      if (typeof dbCity.info === 'object') return dbCity.info;
      try {
        return dbCity.info ? JSON.parse(dbCity.info) : {};
      } catch {
        return {};
      }
    })(),
    images: dbCity.images || {},
    createdAt: new Date(dbCity.created_at || Date.now()),
    updatedAt: new Date(dbCity.updated_at || Date.now())
  };
}

export function transformPlace(dbPlace: any): Place {
  return {
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
    location: {
      latitude: dbPlace.point?.coordinates?.[1] || dbPlace.coordinates?.lat || 0,
      longitude: dbPlace.point?.coordinates?.[0] || dbPlace.coordinates?.lng || 0
    },
    city: dbPlace.city,
    coordinates: dbPlace.coordinates || {},
    info: dbPlace.info || {},
    images: dbPlace.images || {},
    type: dbPlace.type,
    point: dbPlace.point,
    created_at: dbPlace.created_at,
    events: dbPlace.events || [],
    routes: dbPlace.routes || []
  };
}

export function transformRoute(dbRoute: any): Omit<Route, 'places' | 'events'> {
  return {
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
    images: dbRoute.images || {}
  };
}

export function transformEvent(dbEvent: any): Omit<Event, 'places' | 'routes'> {
  return {
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
    type: dbEvent.type
  };
}