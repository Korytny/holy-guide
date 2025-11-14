import { supabase } from '../integrations/supabase/client';

export interface GpsTrackPoint {
  id: string;
  created_at: string;
  point: string; // PostGIS EWKB format
  route: string;
  order: number;
}

export interface GpsTrackStats {
  totalPoints: number;
  startTime: string | null;
  endTime: string | null;
  points: GpsTrackPoint[];
}

export interface GpsCoordinate {
  lat: number;
  lng: number;
}

class RouteTrackApi {
  // Get all track points for a route
  async getRouteTrack(routeId: string): Promise<GpsTrackPoint[]> {
    if (!supabase) {
      console.error('[RouteTrackAPI] Supabase client not available');
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('route_track')
        .select('*')
        .eq('route', routeId)
        .order('order', { ascending: true });

      if (error) {
        console.error('Error getting route track:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getRouteTrack:', error);
      return [];
    }
  }

  // Get track statistics for a route
  async getTrackStats(routeId: string): Promise<GpsTrackStats> {
    if (!supabase) {
      console.error('[RouteTrackAPI] Supabase client not available');
      return {
        totalPoints: 0,
        startTime: null,
        endTime: null,
        points: []
      };
    }

    try {
      const { data, error } = await supabase
        .from('route_track')
        .select('id, created_at, point')
        .eq('route', routeId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error getting track stats:', error);
        return {
          totalPoints: 0,
          startTime: null,
          endTime: null,
          points: []
        };
      }

      const points = data || [];
      return {
        totalPoints: points.length,
        startTime: points.length > 0 ? points[0].created_at : null,
        endTime: points.length > 0 ? points[points.length - 1].created_at : null,
        points: points
      };
    } catch (error) {
      console.error('Error in getTrackStats:', error);
      return {
        totalPoints: 0,
        startTime: null,
        endTime: null,
        points: []
      };
    }
  }

  // Convert GPS track points to coordinates for map display
  convertTrackToCoordinates(points: GpsTrackPoint[]): GpsCoordinate[] {
    if (!points || points.length === 0) {
      return [];
    }

    const coords = points
      .filter(point => point && point.point)
      .map((point) => {
        try {
          const pointData = point.point;

          // Handle different coordinate formats
          if (typeof pointData === 'object' && pointData !== null) {
            let lng, lat;

            if (typeof pointData.x !== 'undefined' && typeof pointData.y !== 'undefined') {
              lng = pointData.x;
              lat = pointData.y;
            } else if (typeof pointData.lng !== 'undefined' && typeof pointData.lat !== 'undefined') {
              lng = pointData.lng;
              lat = pointData.lat;
            } else if (typeof pointData.longitude !== 'undefined' && typeof pointData.latitude !== 'undefined') {
              lng = pointData.longitude;
              lat = pointData.latitude;
            } else if (pointData.type === 'Point' && Array.isArray(pointData.coordinates) && pointData.coordinates.length >= 2) {
              // GeoJSON format: [lng, lat]
              lng = pointData.coordinates[0];
              lat = pointData.coordinates[1];
            } else {
              return null;
            }

            if (!isNaN(lng) && !isNaN(lat) && lng !== 0 && lat !== 0) {
              return { lat, lng };
            }
          }
          return null;
        } catch (error) {
          console.warn('Error parsing GPS point:', error);
          return null;
        }
      })
      .filter(Boolean) as GpsCoordinate[];

    console.log('🛣️ Converted GPS coordinates:', coords.length, 'from', points.length, 'points');
    return coords;
  }

  // Get GPS coordinates as [lat, lng] array for Leaflet
  async getGpsCoordinatesForMap(routeId: string): Promise<[number, number][]> {
    const stats = await this.getTrackStats(routeId);
    const coordinates = this.convertTrackToCoordinates(stats.points);

    // Convert to [lat, lng] format for Leaflet
    return coordinates.map(coord => [coord.lat, coord.lng] as [number, number]);
  }
}

export const routeTrackApi = new RouteTrackApi();