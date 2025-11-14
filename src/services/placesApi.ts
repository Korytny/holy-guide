import { supabase } from '../integrations/supabase/client';
import { transformPlace } from '@/services/apiUtils';
import { Place } from '@/types'; // Import Place type

export const fetchPlaceData = async (ids: string[]) => {
  try {
    const { data, error } = await supabase
      .from('spots')
      .select('*')
      .in('id', ids);

    if (error) {
      console.error('Error fetching place data:', error);
      return [];
    }

    return data ? data.map(transformPlace) : [];
  } catch (error) {
    console.error('Error in fetchPlaceData:', error);
    return [];
  }
};


export const getPlacesByCityId = async (cityId: string): Promise<Place[]> => {
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

export const getPlaceById = async (id: string): Promise<Place | null> => {
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

export const getPlacesByRouteId = async (routeId: string): Promise<Place[]> => {
  try {
    // Fetch spots data directly joined with the order from spot_route
    const { data: spotsData, error: spotsError } = await supabase
      .from('spots')
      .select(`
        *,
        spot_route!inner (order)
      `)
      .eq('spot_route.route_id', routeId)
      .order('order', { foreignTable: 'spot_route', ascending: true });

    if (spotsError) {
      console.error('Error fetching spots for route:', spotsError);
      return [];
    }

    // Transform the data, including the order
    const transformedPlaces = spotsData ? spotsData.map(spot => {
      const transformed = transformPlace(spot);
      // Extract the order from the nested structure
      const orderData = Array.isArray(spot.spot_route) ? spot.spot_route[0] : spot.spot_route;
      if (orderData && typeof orderData.order === 'number') {
        transformed.order = orderData.order;
      }
      return transformed;
    }) : [];


    return transformedPlaces;

  } catch (error) {
    console.error('Error in getPlacesByRouteId:', error);
    return [];
  }
};

export const getPlacesByRouteIdWithoutOrder = async (routeId: string): Promise<Place[]> => {
  try {
    // Fetch spots data for route without sorting by order
    const { data: spotsData, error: spotsError } = await supabase
      .from('spots')
      .select(`
        *,
        spot_route!inner (order)
      `)
      .eq('spot_route.route_id', routeId);

    if (spotsError) {
      console.error('Error fetching spots for route:', spotsError);
      return [];
    }

    // Transform the data, including the order (for user modifications)
    const transformedPlaces = spotsData ? spotsData.map(spot => {
      const transformed = transformPlace(spot);
      // Extract the order from the nested structure
      const orderData = Array.isArray(spot.spot_route) ? spot.spot_route[0] : spot.spot_route;
      if (orderData && typeof orderData.order === 'number') {
        transformed.order = orderData.order;
      }
      return transformed;
    }) : [];


    return transformedPlaces;

  } catch (error) {
    console.error('Error in getPlacesByRouteIdWithoutOrder:', error);
    return [];
  }
};

export const getPlacesByEventId = async (eventId: string): Promise<Place[]> => {
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