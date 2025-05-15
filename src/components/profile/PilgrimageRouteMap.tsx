import React from 'react';
import { PlannedItem, Place as PlaceType } from '@/types';
import RouteMap from '@/components/route_detail/RouteMap';
import { useLanguage } from '@/context/LanguageContext';

interface PilgrimageRouteMapProps {
  plannedItems: PlannedItem[];
}

const PilgrimageRouteMap: React.FC<PilgrimageRouteMapProps> = ({ plannedItems }) => {
  const { t } = useLanguage();

  const placesForRoute: PlaceType[] = plannedItems
    .filter(item => 
      item.type === 'place' && 
      item.data && 
      (item.data as PlaceType).location && 
      (item.data as PlaceType).location.latitude != null && 
      (item.data as PlaceType).location.longitude != null
    )
    .map((item, index) => {
      const placeData = item.data as PlaceType;
      return {
        ...placeData,
        order: placeData.order ?? item.order ?? index, 
      };
    });

  if (placesForRoute.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-center py-4 mt-4 border-t"> {/* Added h-full flex items-center justify-center */}
        <p>{t('no_route_items_for_map', { defaultValue: 'Нет элементов для отображения маршрута на карте.'})}</p>
      </div>
    );
  }

  return (
    <div className="pilgrimage-route-map-container mt-8 h-full"> {/* Added h-full */}
      <RouteMap places={placesForRoute} />
    </div>
  );
};

export default PilgrimageRouteMap;
