import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Place } from '../types';
import { GpsCoordinate } from '../services/routeTrackApi';
import { cn } from "@/lib/utils";

interface RouteStatsProps {
  places: Place[];
  gpsCoordinates?: [number, number][];
  className?: string;
}

const RouteStats: React.FC<RouteStatsProps> = ({
  places,
  gpsCoordinates,
  className
}) => {
  const { t } = useLanguage();

  // Calculate distance between two coordinates in meters
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  // Calculate route distance from places (planned route)
  const plannedDistance = React.useMemo(() => {
    const validPlaces = places.filter(place => place.location?.latitude && place.location?.longitude);
    const sortedPlaces = validPlaces.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));

    if (sortedPlaces.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 0; i < sortedPlaces.length - 1; i++) {
      const place1 = sortedPlaces[i];
      const place2 = sortedPlaces[i + 1];
      totalDistance += calculateDistance(
        place1.location.latitude,
        place1.location.longitude,
        place2.location.latitude,
        place2.location.longitude
      );
    }

    return totalDistance;
  }, [places]);

  // Calculate GPS track distance
  const gpsTrackDistance = React.useMemo(() => {
    if (!gpsCoordinates || gpsCoordinates.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 0; i < gpsCoordinates.length - 1; i++) {
      const [lat1, lng1] = gpsCoordinates[i];
      const [lat2, lng2] = gpsCoordinates[i + 1];
      totalDistance += calculateDistance(lat1, lng1, lat2, lng2);
    }

    return totalDistance;
  }, [gpsCoordinates]);

  // Format distance for display
  const formatDistance = (distanceInMeters: number): string => {
    if (distanceInMeters >= 1000) {
      return `${(distanceInMeters / 1000).toFixed(1)} ${t('kilometers_abbrev')}`;
    }
    return `${Math.round(distanceInMeters)} ${t('meters_abbrev')}`;
  };

  // Estimate time based on distance (walking speed ~5 km/h)
  const estimateTime = (distanceInMeters: number): string => {
    const walkingSpeedKmh = 5; // 5 km/h average walking speed
    const distanceInKm = distanceInMeters / 1000;
    const timeInHours = distanceInKm / walkingSpeedKmh;

    const hours = Math.floor(timeInHours);
    const minutes = Math.round((timeInHours - hours) * 60);

    if (hours > 0) {
      return `${hours} ${t('hours_abbrev')} ${minutes} ${t('minutes_abbrev')}`;
    }
    return `${minutes} ${t('minutes_abbrev')}`;
  };

  const validPlacesCount = places.filter(place => place.location?.latitude && place.location?.longitude).length;
  const hasStats = validPlacesCount > 0 || gpsTrackDistance > 0;

  if (!hasStats) {
    return null;
  }

  return (
    <div className={cn(
      "bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 space-y-3",
      className
    )}>
      <div className="text-sm font-semibold text-gray-700 border-b pb-2">
        {t('route_statistics')}
      </div>

      {/* Planned Route Statistics */}
      {validPlacesCount > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">
              {t('places_count')}:
            </span>
            <span className="font-medium text-gray-900">
              {validPlacesCount}
            </span>
          </div>

          {plannedDistance > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                {t('planned_route')}:
              </span>
              <div className="text-right">
                <span className="font-medium text-gray-900">
                  {formatDistance(plannedDistance)}
                </span>
                <div className="text-xs text-gray-500">
                  {t('estimated_time')}: {estimateTime(plannedDistance)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* GPS Track Statistics */}
      {gpsTrackDistance > 0 && (
        <div className="border-t pt-2 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">
              {t('real_track')}:
            </span>
            <div className="text-right">
              <span className="font-medium text-blue-600">
                {formatDistance(gpsTrackDistance)}
              </span>
              <div className="text-xs text-gray-500">
                {t('gps_track_points')}: {gpsCoordinates?.length || 0}
              </div>
              <div className="text-xs text-gray-500">
                {t('estimated_time')}: {estimateTime(gpsTrackDistance)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteStats;