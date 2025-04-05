import { supabase } from '../integrations/supabase/client';
import { transformRoute } from '@/services/apiUtils';

export const getRoutesByCityId = async (cityId: string) => {
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

    // Then get route IDs from join table
    const { data: joinData, error: joinError } = await supabase
      .from('spot_route')
      .select('route_id')
      .in('spot_id', spotIds);

    if (joinError || !joinData?.length) {
      return [];
    }

    // Finally fetch full route data
    const routeIds = joinData.map(item => item.route_id);
    const { data: routes, error: routesError } = await supabase
      .from('routes')
      .select('*')
      .in('id', routeIds);

    if (routesError) {
      console.error('Error fetching routes:', routesError);
      return [];
    }

    return routes ? routes.map(transformRoute) : [];
  } catch (error) {
    console.error('Error in getRoutesByCityId:', error);
    return [];
  }
};

export const getRouteById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching route:', error);
      return null;
    }
    
    return data ? transformRoute(data) : null;
  } catch (error) {
    console.error('Error in getRouteById:', error);
    return null;
  }
};

export const getRoutesByPlaceId = async (placeId: string) => {
  try {
    // First get route IDs from join table
    const { data: joinData, error: joinError } = await supabase
      .from('spot_route')
      .select('route_id')
      .eq('spot_id', placeId);

    if (joinError || !joinData?.length) {
      return [];
    }

    // Then fetch full route data
    const routeIds = joinData.map(item => item.route_id);
    const { data: routesData, error: routesError } = await supabase
      .from('routes')
      .select('*')
      .in('id', routeIds);

    if (routesError) {
      console.error('Error fetching routes:', routesError);
      return [];
    }

    return routesData ? routesData.map(transformRoute) : [];
  } catch (error) {
    console.error('Error in getRoutesByPlaceId:', error);
    return [];
  }
};

export const getRoutesByEventId = async (eventId: string) => {
  try {
    // First get route IDs from join table
    const { data: joinData, error: joinError } = await supabase
      .from('route_event')
      .select('route_id')
      .eq('event_id', eventId);

    if (joinError || !joinData?.length) {
      return [];
    }

    // Then fetch full route data
    const routeIds = joinData.map(item => item.route_id);
    const { data: routes, error: routesError } = await supabase
      .from('routes')
      .select('*')
      .in('id', routeIds);

    if (routesError) {
      console.error('Error fetching routes:', routesError);
      return [];
    }

    return routes ? routes.map(transformRoute) : [];
  } catch (error) {
    console.error('Error in getRoutesByEventId:', error);
    return [];
  }
};