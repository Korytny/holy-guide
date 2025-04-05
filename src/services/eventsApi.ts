import { supabase } from '../integrations/supabase/client';
import { transformEvent } from '@/services/apiUtils';

export const getEventsByCityId = async (cityId: string) => {
  try {
    // First get all spots in this city
    const { data: spots, error: spotsError } = await supabase
      .from('spots')
      .select('id')
      .eq('city', cityId);

    if (spotsError || !spots?.length) {
      return [];
    }

    const spotIds = spots.map(s => s.id);

    // Then get event IDs from join table
    const { data: joinData, error: joinError } = await supabase
      .from('spot_event')
      .select('event_id')
      .in('spot_id', spotIds);

    if (joinError || !joinData?.length) {
      return [];
    }

    // Finally fetch full event data
    const eventIds = joinData.map(item => item.event_id);
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .in('id', eventIds);

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      return [];
    }

    return events ? events.map(transformEvent) : [];
  } catch (error) {
    console.error('Error in getEventsByCityId:', error);
    return [];
  }
};

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

interface SpotEventJoin {
  event_id: string;
  spot_id: string;
}

export const getEventsByPlaceId = async (placeId: string) => {
  try {
    // First get event IDs from join table
    const { data: joinData, error: joinError } = await supabase
      .from('spot_event')
      .select('event_id')
      .eq('spot_id', placeId);

    if (joinError || !joinData?.length) {
      return [];
    }

    // Then fetch full event data
    const eventIds = joinData.map(item => item.event_id);
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .in('id', eventIds);

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      return [];
    }

    return eventsData ? eventsData.map(transformEvent) : [];
  } catch (error) {
    console.error('Error in getEventsByPlaceId:', error);
    return [];
  }
};

export const getEventsByRouteId = async (routeId: string) => {
  try {
    // First get event IDs from join table
    const { data: joinData, error: joinError } = await supabase
      .from('route_event')
      .select('event_id')
      .eq('route_id', routeId);

    if (joinError || !joinData?.length) {
      return [];
    }

    // Then fetch full event data
    const eventIds = joinData.map(item => item.event_id);
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .in('id', eventIds);

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      return [];
    }

    return events ? events.map(transformEvent) : [];
  } catch (error) {
    console.error('Error in getEventsByRouteId:', error);
    return [];
  }
};