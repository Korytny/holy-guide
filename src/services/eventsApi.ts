import { supabase } from '../integrations/supabase/client';
import { Event, EventType } from '../types';

export interface EventFilters {
  cityId?: string;
  eventCategory?: string;
  culture?: string;
  hasOnlineStream?: boolean;
}

export const getEvents = async (filters?: EventFilters): Promise<Event[]> => {
  console.log('getEvents CALLED with filters:', filters);
  try {
    let query = supabase.from('events').select('*, event_category');

    if (filters) {
      if (filters.cityId && filters.cityId !== 'all') {
        query = query.eq('city_id', filters.cityId);
      }
      if (filters.eventCategory) {
        query = query.eq('event_category', filters.eventCategory);
      }
      if (filters.culture) {
        query = query.eq('culture', filters.culture);
      }
      if (filters.hasOnlineStream !== undefined) {
        query = query.eq('has_online_stream', filters.hasOnlineStream);
      }
    }
    query = query.order('time', { ascending: true });
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching events:', error.message);
      throw error;
    }
    console.log('Events fetched from Supabase (raw in getEvents):', data);
    if (!data) return [];

    const mappedData = data.map(dbEvent => {
      const event: Partial<Event> = { ...dbEvent };
      if (dbEvent.event_category) {
        event.eventTypeField = dbEvent.event_category as EventType;
      }
      // Add any other necessary field mappings here if DB names differ from Event type
      return event as Event;
    });
    console.log('Events mapped in getEvents:', mappedData);
    return mappedData;
  } catch (error) {
    console.error('Error in getEvents:', error);
    return [];
  }
};

export const getEventById = async (id: string): Promise<Event | null> => {
  console.log('getEventById CALLED with id:', id);
  if (!id) return null;
  try {
    const { data: dbEvent, error } = await supabase
      .from('events')
      .select('*, event_category')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching event with id ${id}:`, error.message);
      if (error.code === 'PGRST116') {
        console.warn(`Event with id ${id} not found.`);
        return null;
      }
      throw error;
    }
    if (!dbEvent) return null;

    const event: Partial<Event> = { ...dbEvent };
    if (dbEvent.event_category) {
      event.eventTypeField = dbEvent.event_category as EventType;
    }
    console.log(`Event with id ${id} fetched and mapped:`, event);
    return event as Event;
  } catch (error) {
    console.error('Error in getEventById:', error);
    return null;
  }
};

export const getEventsByIds = async (ids: string[]): Promise<Event[]> => {
  console.log('getEventsByIds CALLED with ids:', ids);
  if (!ids || ids.length === 0) return [];
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*, event_category')
      .in('id', ids);

    if (error) {
      console.error('Error fetching events by ids:', error.message);
      throw error;
    }
    if (!data) return [];
    const mappedData = data.map(dbEvent => {
      const event: Partial<Event> = { ...dbEvent };
      if (dbEvent.event_category) {
        event.eventTypeField = dbEvent.event_category as EventType;
      }
      return event as Event;
    });
    console.log('Events fetched by IDs and mapped:', mappedData);
    return mappedData;
  } catch (error) {
    console.error('Error in getEventsByIds:', error);
    return [];
  }
};

export const getEventsByCityId = async (cityId: string): Promise<Event[]> => {
  console.log('getEventsByCityId CALLED with cityId:', cityId);
  if (!cityId) {
    console.warn('getEventsByCityId called with no cityId');
    return [];
  }
  try {
    let query = supabase
      .from('events')
      .select('*, event_category')
      .eq('city_id', cityId);

    query = query.order('time', { ascending: true });
    const { data, error } = await query;

    if (error) {
      console.error(`Error fetching events for city ${cityId}:`, error.message);
      throw error;
    }
    console.log(`Raw events for city ${cityId} from Supabase:`, data);
    if (!data) return [];

    const mappedData = data.map(dbEvent => {
      const event: Partial<Event> = { ...dbEvent };
      if (dbEvent.event_category) {
        event.eventTypeField = dbEvent.event_category as EventType;
      }
      return event as Event;
    });
    console.log(`Events for city ${cityId} fetched and mapped:`, mappedData);
    return mappedData;
  } catch (error) {
    console.error('Error in getEventsByCityId:', error);
    return [];
  }
};

export const getEventsByPlaceId = async (placeId: string): Promise<Event[]> => {
  console.warn("getEventsByPlaceId is not implemented yet. Returning empty array.");
  // TODO: Implement if needed, similar to getEventsByCityId but with place_id filter
  // Ensure mapping for eventTypeField if data is fetched.
  return [];
};

export const getEventsByRouteId = async (routeId: string): Promise<Event[]> => {
  console.warn("getEventsByRouteId is not implemented yet. Returning empty array.");
  // TODO: Implement if needed, similar to getEventsByCityId but with route_id filter
  // Ensure mapping for eventTypeField if data is fetched.
  return [];
};
