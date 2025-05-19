import { supabase } from '../integrations/supabase/client';
import { Event, EventType, Language, LocalizedText } from '../types';

export interface EventFilters {
  cityId?: string;
  eventCategory?: string;
  culture?: string;
  hasOnlineStream?: boolean;
}

const mapDbEventToEvent = (dbEvent: any): Event => {
  const event: Partial<Event> = {
    ...dbEvent,
    // Explicitly map city_id to cityId
    cityId: dbEvent.city_id,
    // Explicitly map culture to cultureField
    cultureField: dbEvent.culture,
  };
  if (dbEvent.event_category) {
    event.eventTypeField = dbEvent.event_category as EventType;
  }
  if (dbEvent.info) { 
    event.description = dbEvent.info; 
  }
  if (dbEvent.images && Array.isArray(dbEvent.images) && dbEvent.images.length > 0) {
    event.imageUrl = dbEvent.images[0]; 
  } else if (typeof dbEvent.images === 'string') { 
    event.imageUrl = dbEvent.images;
  }
  return event as Event;
};

export const getEvents = async (filters?: EventFilters): Promise<Event[]> => {
  try {
    let query = supabase.from('events').select('*, event_category, info, images');
    if (filters) {
      if (filters.cityId && filters.cityId !== 'all') query = query.eq('city_id', filters.cityId);
      if (filters.eventCategory) query = query.eq('event_category', filters.eventCategory);
      if (filters.culture) query = query.eq('culture', filters.culture);
      if (filters.hasOnlineStream !== undefined) query = query.eq('has_online_stream', filters.hasOnlineStream);
    }
    query = query.order('time', { ascending: true });
    const { data, error } = await query;
    if (error) throw error;
    if (!data) return [];
    return data.map(mapDbEventToEvent);
  } catch (error) {
    console.error(`Error in getEvents: ${error.message}`, error);
    return [];
  }
};

export const getEventById = async (id: string): Promise<Event | null> => {
  if (!id) return null;
  try {
    const { data: dbEvent, error } = await supabase.from('events').select('*, event_category, info, images').eq('id', id).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error(`Error in getEventById (${id}): ${error.message}`, error);
      throw error;
    }
    return dbEvent ? mapDbEventToEvent(dbEvent) : null;
  } catch (error) {
    console.error(`Catch Error in getEventById (${id}): ${error.message}`, error);
    return null;
  }
};

export const getEventsByIds = async (ids: string[]): Promise<Event[]> => {
  console.log('[eventsApi] getEventsByIds CALLED with ids:', ids);
  if (!ids || ids.length === 0) {
    console.log('[eventsApi] getEventsByIds: no IDs provided or empty array, returning [].');
    return [];
  }
  try {
    const { data, error } = await supabase.from('events').select('*, event_category, info, images').in('id', ids);
    if (error) {
      console.error(`[eventsApi] Error in getEventsByIds for IDs (${ids.join(',')}): ${error.message}`, error);
      throw error;
    }
    if (!data) {
      console.log('[eventsApi] getEventsByIds: no data returned from Supabase for IDs.');
      return [];
    }
    const mappedData = data.map(mapDbEventToEvent);
    console.log('[eventsApi] getEventsByIds: mapped data:', mappedData);
    return mappedData;
  } catch (error) {
    console.error(`[eventsApi] Catch Error in getEventsByIds: ${error.message}`, error);
    return [];
  }
};

export const getEventsByCityId = async (cityId: string): Promise<Event[]> => {
  console.log(`[eventsApi] getEventsByCityId CALLED with cityId: ${cityId}`);
  if (!cityId) return [];
  try {
    const { data: directEventsData, error: directEventsError } = await supabase
      .from('events')
      .select('id') 
      .eq('city_id', cityId);

    if (directEventsError) console.error(`[eventsApi] Error fetching direct event IDs for city ${cityId}:`, directEventsError.message);
    const directEventIds = directEventsData?.map(e => e.id) || [];
    console.log(`[eventsApi] Found direct event IDs for city ${cityId}:`, directEventIds);

    const { data: spotsInCity, error: spotsError } = await supabase
      .from('spots')
      .select('id')
      .eq('city', cityId);

    let eventIdsFromSpots: string[] = [];
    if (spotsError) {
      console.error(`[eventsApi] Error fetching spots for city ${cityId}: ${spotsError.message}`);
    } else if (spotsInCity && spotsInCity.length > 0) {
      const spotIdsInCity = spotsInCity.map(s => s.id);
      console.log(`[eventsApi] Found spot IDs in city ${cityId}:`, spotIdsInCity);
      const { data: spotEventsLinks, error: spotEventsLinksError } = await supabase
        .from('spot_event')
        .select('event_id')
        .in('spot_id', spotIdsInCity);
      if (spotEventsLinksError) {
        console.error(`[eventsApi] Error fetching event links for spots:`, spotEventsLinksError.message);
      } else if (spotEventsLinks && spotEventsLinks.length > 0) {
        eventIdsFromSpots = spotEventsLinks.map(se => se.event_id);
        console.log(`[eventsApi] Found event IDs from spots for city ${cityId}:`, eventIdsFromSpots);
      } else {
        console.log('[eventsApi] No event links found for spots in city ', cityId);
      }
    } else {
      console.log(`[eventsApi] No spots found in city ${cityId}.`);
    }
    
    const allRelevantEventIds = [...new Set([...directEventIds, ...eventIdsFromSpots])];
    console.log(`[eventsApi] All unique relevant event IDs for city ${cityId}:`, allRelevantEventIds);

    if (allRelevantEventIds.length === 0) return [];
    
    const finalEvents = await getEventsByIds(allRelevantEventIds);
    console.log("[eventsApi] Final events for city ${cityId} after all processing:", finalEvents);
    return finalEvents;
  } catch (error) {
    console.error(`[eventsApi] General error in getEventsByCityId: ${error.message}`, error);
    return [];
  }
};

export const getEventsByPlaceId = async (placeId: string): Promise<Event[]> => {
  console.log('[eventsApi] getEventsByPlaceId CALLED with placeId:', placeId);
  if (!placeId) return [];
  try {
    const { data: spotEvents, error: spotEventsError } = await supabase
      .from('spot_event')
      .select('event_id')
      .eq('spot_id', placeId);

    if (spotEventsError) {
      console.error(`[eventsApi] Error fetching event_ids for place ${placeId}:`, spotEventsError.message);
      throw spotEventsError;
    }
    if (!spotEvents || spotEvents.length === 0) {
      console.log('[eventsApi] No event_ids found for place', placeId);
      return [];
    }
    const eventIds = spotEvents.map(se => se.event_id);
    console.log('[eventsApi] Event IDs found for place ', placeId, ':', eventIds);
    return getEventsByIds(eventIds);
  } catch (error) {
    console.error(`[eventsApi] Error in getEventsByPlaceId: ${error.message}`, error);
    return [];
  }
};

export const getEventsByRouteId = async (routeId: string): Promise<Event[]> => {
  console.log('[eventsApi] getEventsByRouteId CALLED with routeId:', routeId);
  if (!routeId) return [];
  try {
    const { data: routeEvents, error: routeEventsError } = await supabase
      .from('route_event')
      .select('event_id')
      .eq('route_id', routeId);

    if (routeEventsError) {
      console.error(`[eventsApi] Error fetching event_ids for route ${routeId}:`, routeEventsError.message);
      throw routeEventsError;
    }
    if (!routeEvents || routeEvents.length === 0) {
      console.log('[eventsApi] No event_ids found for route', routeId);
      return [];
    }
    const eventIds = routeEvents.map(re => re.event_id);
    console.log('[eventsApi] Event IDs found for route ', routeId, ':', eventIds);
    return getEventsByIds(eventIds);
  } catch (error) {
    console.error(`[eventsApi] Error in getEventsByRouteId: ${error.message}`, error);
    return [];
  }
};
