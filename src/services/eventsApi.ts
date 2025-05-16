import { supabase } from '../integrations/supabase/client';
import { Event, EventType } from '../types'; // Import EventType as well if needed for casting

export interface EventFilters {
  cityId?: string;
  eventCategory?: string; 
  culture?: string;
  hasOnlineStream?: boolean;
}

export const getEvents = async (filters?: EventFilters): Promise<Event[]> => {
  console.log('getEvents CALLED with filters:', filters);
  try {
    // Ensure you select the database column that holds the event type, e.g., 'event_category'
    // If your DB column is already 'eventTypeField', then 'select("*" )' is fine.
    // Otherwise, you might need to alias or map it.
    let query = supabase.from('events').select('*, event_category'); // Explicitly select event_category

    if (filters) {
      if (filters.cityId && filters.cityId !== 'all') {
        query = query.eq('city_id', filters.cityId);
      }
      // Note: The filter key is eventCategory, but the DB column might be event_category
      if (filters.eventCategory) {
        query = query.eq('event_category', filters.eventCategory);
      }
      if (filters.culture) {
        query = query.eq('culture', filters.culture); // Assuming DB column is 'culture'
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
    console.log('Events fetched from Supabase (raw):', data);

    if (!data) return [];

    // Manual mapping to ensure eventTypeField is populated from event_category
    const mappedData = data.map(dbEvent => {
      const event: Partial<Event> = { ...dbEvent }; // Cast to Partial<Event> initially
      // Assuming your DB column for event type is 'event_category'
      // and your Event interface expects 'eventTypeField'
      if (dbEvent.event_category) {
        event.eventTypeField = dbEvent.event_category as EventType;
      }
      // Ensure other fields are correctly mapped if names differ or types need conversion
      // For example, if your DB stores name as JSON but Event type expects LocalizedText directly:
      // if (typeof dbEvent.name === 'string') { // Basic check, might need robust parsing
      //   try { event.name = JSON.parse(dbEvent.name); } catch (e) { console.error('Failed to parse name', e); event.name = {}; }
      // }
      // if (typeof dbEvent.description === 'string') {
      //   try { event.description = JSON.parse(dbEvent.description); } catch (e) { console.error('Failed to parse description', e); event.description = {}; }
      // }

      return event as Event; // Cast to full Event type after mapping
    });
    console.log('Events mapped with eventTypeField:', mappedData);
    return mappedData;

  } catch (error) {
    console.error('Error in getEvents:', error);
    return [];
  }
};

// ... (rest of the functions: getEventById, getEventsByIds, etc. 
//      should also be checked if they need similar mapping for eventTypeField)

export const getEventById = async (id: string): Promise<Event | null> => {
  console.log('getEventById CALLED with id:', id);
  if (!id) return null;
  try {
    const { data: dbEvent, error } = await supabase
      .from('events')
      .select('*, event_category') // Ensure event_category is selected
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
      .select('*, event_category') // Ensure event_category is selected
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


export const getEventsByPlaceId = async (placeId: string): Promise<Event[]> => {
    console.warn("getEventsByPlaceId is not fully implemented yet. Update with actual Supabase call if needed.");
    return [];
}

export const getEventsByRouteId = async (routeId: string): Promise<Event[]> => {
    console.warn("getEventsByRouteId is not fully implemented yet. Update with actual Supabase call if needed.");
    return [];
}