import { supabase } from '../integrations/supabase/client';
import { transformEvent } from '@/services/apiUtils';
import { Event } from '@/types';

export const getEventsByCityId = async (cityId: string): Promise<Event[]> => {
  if (!supabase) {
    console.error('[EventsAPI] Supabase client not available');
    return [];
  }
  try {
    // This logic seems complex and potentially inefficient.
    // First get all spots in this city
    const { data: spots, error: spotsError } = await supabase
      .from('spots')
      .select('id')
      .eq('city', cityId);

    if (spotsError || !spots?.length) {
        if (spotsError) console.error('Error fetching spots for city events:', spotsError);
      return [];
    }

    const spotIds = spots.map(s => s.id);

    // Then get distinct event IDs from join table
    const { data: joinData, error: joinError } = await supabase
      .from('spot_event')
      .select('event_id')
      .in('spot_id', spotIds);

    if (joinError || !joinData?.length) {
        if (joinError) console.error('Error fetching spot_event links:', joinError);
      return [];
    }

    const eventIds = [...new Set(joinData.map(item => item.event_id))];
    if (eventIds.length === 0) return [];

    // Finally fetch full event data
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .in('id', eventIds);

    if (eventsError) {
      console.error('Error fetching events by city:', eventsError);
      return [];
    }

    return events ? events.map(transformEvent) : [];
  } catch (error) {
    console.error('Error in getEventsByCityId:', error);
    return [];
  }
};

export const getEventById = async (id: string): Promise<Event | null> => {
  if (!supabase) {
    console.error('[EventsAPI] Supabase client not available');
    return null;
  }
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

export const getEventsByIds = async (ids: string[]): Promise<Event[]> => {
  if (!supabase || !ids || ids.length === 0) {
    return [];
  }
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .in('id', ids);

    if (error) {
      console.error('Error fetching events by IDs:', error);
      return [];
    }
    return data ? data.map(transformEvent) : [];
  } catch (error) {
    console.error('Error in getEventsByIds:', error);
    return [];
  }
};

interface SpotEventJoin {
  event_id: string;
  spot_id: string;
}

export const getEventsByPlaceId = async (placeId: string): Promise<Event[]> => {
  if (!supabase) {
    console.error('[EventsAPI] Supabase client not available');
    return [];
  }
  try {
    const { data: joinData, error: joinError } = await supabase
      .from('spot_event')
      .select('event_id')
      .eq('spot_id', placeId);

    if (joinError || !joinData?.length) {
        if (joinError) console.error('Error fetching spot_event for place:', joinError);
      return [];
    }

    const eventIds = [...new Set(joinData.map(item => item.event_id))];
    if (eventIds.length === 0) return [];

    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .in('id', eventIds);

    if (eventsError) {
      console.error('Error fetching events for place:', eventsError);
      return [];
    }

    return eventsData ? eventsData.map(transformEvent) : [];
  } catch (error) {
    console.error('Error in getEventsByPlaceId:', error);
    return [];
  }
};

export const getEventsByRouteId = async (routeId: string): Promise<Event[]> => {
  if (!supabase) {
    console.error('[EventsAPI] Supabase client not available');
    return [];
  }
  try {
    const { data: joinData, error: joinError } = await supabase
      .from('route_event')
      .select('event_id')
      .eq('route_id', routeId);

    if (joinError || !joinData?.length) {
        if (joinError) console.error('Error fetching route_event links:', joinError);
      return [];
    }

    const eventIds = [...new Set(joinData.map(item => item.event_id))];
     if (eventIds.length === 0) return [];

    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .in('id', eventIds);

    if (eventsError) {
      console.error('Error fetching events for route:', eventsError);
      return [];
    }

    return events ? events.map(transformEvent) : [];
  } catch (error) {
    console.error('Error in getEventsByRouteId:', error);
    return [];
  }
};