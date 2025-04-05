import { supabase } from '../integrations/supabase/client';
import { transformPlace } from '@/services/apiUtils';

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

export const getPlacesByRouteId = async (routeId: string) => {
  try {
    // First get spot IDs from join table
    const { data: joinData, error: joinError } = await supabase
      .from('spot_route')
      .select('spot_id')
      .eq('route_id', routeId);

    if (joinError || !joinData?.length) {
      return [];
    }

    // Then fetch full spot data
    const spotIds = joinData.map(item => item.spot_id);
    const { data: spots, error: spotsError } = await supabase
      .from('spots')
      .select('*')
      .in('id', spotIds);

    if (spotsError) {
      console.error('Error fetching spots:', spotsError);
      return [];
    }

    return spots ? spots.map(transformPlace) : [];
  } catch (error) {
    console.error('Error in getPlacesByRouteId:', error);
    return [];
  }
};

export const getPlacesByEventId = async (eventId: string) => {
  try {
    // First get spot IDs from join table
    const { data: joinData, error: joinError } = await supabase
      .from('spot_event')
      .select('spot_id')
      .eq('event_id', eventId);

    if (joinError || !joinData?.length) {
      return [];
    }

    // Then fetch full spot data
    const spotIds = joinData.map(item => item.spot_id);
    const { data: spots, error: spotsError } = await supabase
      .from('spots')
      .select('*')
      .in('id', spotIds);

    if (spotsError) {
      console.error('Error fetching spots:', spotsError);
      return [];
    }

    return spots ? spots.map(transformPlace) : [];
  } catch (error) {
    console.error('Error in getPlacesByEventId:', error);
    return [];
  }
};