import { supabase } from '../integrations/supabase/client';
import { transformRoute } from '@/services/apiUtils';
import { Route } from '@/types';

export const getAllRoutes = async (): Promise<Route[]> => {
  if (!supabase) {
    console.error('[RoutesAPI] Supabase client not available');
    return [];
  }
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching all routes:', error);
      return [];
    }
    return data ? data.map(transformRoute) : [];
  } catch (error) {
    console.error('Error in getAllRoutes:', error);
    return [];
  }
};

export const getRoutesByCityId = async (cityId: string): Promise<Route[]> => {
  if (!supabase) {
    console.error('[RoutesAPI] Supabase client not available');
    return [];
  }
  try {
    // This logic seems complex and potentially inefficient.
    // A direct query using foreign relationships or RPC might be better if performance is an issue.
    
    // First get all spots in this city
    const { data: spots, error: spotsError } = await supabase
      .from('spots')
      .select('id')
      .eq('city', cityId);

    if (spotsError || !spots?.length) {
       if (spotsError) console.error('Error fetching spots for city routes:', spotsError);
      return [];
    }

    const spotIds = spots.map(s => s.id);

    // Then get distinct route IDs associated with these spots
    const { data: joinData, error: joinError } = await supabase
      .from('spot_route')
      .select('route_id')
      .in('spot_id', spotIds);
      
    if (joinError || !joinData?.length) {
       if (joinError) console.error('Error fetching spot_route links:', joinError);
      return [];
    }

    // Get unique route IDs
    const routeIds = [...new Set(joinData.map(item => item.route_id))];
    if (routeIds.length === 0) return [];

    // Finally fetch full route data
    const { data: routes, error: routesError } = await supabase
      .from('routes')
      .select('*')
      .in('id', routeIds);

    if (routesError) {
      console.error('Error fetching routes by city:', routesError);
      return [];
    }

    return routes ? routes.map(transformRoute) : [];
  } catch (error) {
    console.error('Error in getRoutesByCityId:', error);
    return [];
  }
};

export const getRouteById = async (id: string): Promise<Route | null> => {
  if (!supabase) {
    console.error('[RoutesAPI] Supabase client not available');
    return null;
  }
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

export const getRoutesByIds = async (ids: string[]): Promise<Route[]> => {
  if (!supabase || !ids || ids.length === 0) {
    return [];
  }
  try {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .in('id', ids);

    if (error) {
      console.error('Error fetching routes by IDs:', error);
      return [];
    }
    return data ? data.map(transformRoute) : [];
  } catch (error) {
    console.error('Error in getRoutesByIds:', error);
    return [];
  }
};

export const getRoutesByPlaceId = async (placeId: string): Promise<Route[]> => {
  if (!supabase) {
    console.error('[RoutesAPI] Supabase client not available');
    return [];
  }
  try {
    const { data: joinData, error: joinError } = await supabase
      .from('spot_route')
      .select('route_id')
      .eq('spot_id', placeId);

    if (joinError || !joinData?.length) {
      if (joinError) console.error('Error fetching spot_route for place:', joinError);
      return [];
    }

    const routeIds = [...new Set(joinData.map(item => item.route_id))];
     if (routeIds.length === 0) return [];

    const { data: routesData, error: routesError } = await supabase
      .from('routes')
      .select('*')
      .in('id', routeIds);

    if (routesError) {
      console.error('Error fetching routes for place:', routesError);
      return [];
    }

    return routesData ? routesData.map(transformRoute) : [];
  } catch (error) {
    console.error('Error in getRoutesByPlaceId:', error);
    return [];
  }
};

export const getRoutesByEventId = async (eventId: string): Promise<Route[]> => {
   if (!supabase) {
    console.error('[RoutesAPI] Supabase client not available');
    return [];
  }
  try {
    const { data: joinData, error: joinError } = await supabase
      .from('route_event')
      .select('route_id')
      .eq('event_id', eventId);

    if (joinError || !joinData?.length) {
       if (joinError) console.error('Error fetching route_event links:', joinError);
      return [];
    }

    const routeIds = [...new Set(joinData.map(item => item.route_id))];
     if (routeIds.length === 0) return [];

    const { data: routes, error: routesError } = await supabase
      .from('routes')
      .select('*')
      .in('id', routeIds);

    if (routesError) {
      console.error('Error fetching routes for event:', routesError);
      return [];
    }

    return routes ? routes.map(transformRoute) : [];
  } catch (error) {
    console.error('Error in getRoutesByEventId:', error);
    return [];
  }
};