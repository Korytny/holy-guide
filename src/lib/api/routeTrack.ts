import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const routeTrackApi = {
  // Start recording route track
  async startTrackRecording(routeId: string) {
    try {
      const { data, error } = await supabase
        .from('route_track')
        .insert({
          route: routeId,
          order: 0
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error starting track recording:', error);
      throw error;
    }
  },

  // Add GPS point to route track
  async addTrackPoint(routeId: string, point: { lat: number; lng: number }, order: number) {
    try {
      const { data, error } = await supabase
        .from('route_track')
        .insert({
          route: routeId,
          point: `POINT(${point.lng} ${point.lat})`,
          order
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding track point:', error);
      throw error;
    }
  },

  // Get all track points for a route
  async getRouteTrack(routeId: string) {
    try {
      const { data, error } = await supabase
        .from('route_track')
        .select('*')
        .eq('route', routeId)
        .order('order', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting route track:', error);
      throw error;
    }
  },

  // Delete all track points for a route
  async deleteRouteTrack(routeId: string) {
    try {
      const { error } = await supabase
        .from('route_track')
        .delete()
        .eq('route', routeId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting route track:', error);
      throw error;
    }
  },

  // Get track statistics
  async getTrackStats(routeId: string) {
    try {
      const { data, error } = await supabase
        .from('route_track')
        .select('id, created_at, point')
        .eq('route', routeId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return {
        totalPoints: data?.length || 0,
        startTime: data?.[0]?.created_at,
        endTime: data?.[data.length - 1]?.created_at,
        points: data
      };
    } catch (error) {
      console.error('Error getting track stats:', error);
      throw error;
    }
  }
};