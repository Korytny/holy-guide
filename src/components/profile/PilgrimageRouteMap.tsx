import React, { useState, useEffect, useRef } from 'react';
import { PlannedItem, Place as PlaceType } from '@/types';
import RouteMap from '@/components/route_detail/RouteMap';
import { useLanguage } from '@/context/LanguageContext';

interface PilgrimageRouteMapProps {
  plannedItems: PlannedItem[];
}

const PilgrimageRouteMap: React.FC<PilgrimageRouteMapProps> = ({ plannedItems }) => {
  const { t } = useLanguage();
  const [mapShouldMaintainZoom, setMapShouldMaintainZoom] = useState(false);
  const previousPlannedItemsRef = useRef<string>();

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

  useEffect(() => {
    const currentPlannedItemsString = JSON.stringify(plannedItems.map(p => ({id: p.data.id, type: p.type, date: p.date, time: p.time, order: p.order })));
    if (previousPlannedItemsRef.current !== currentPlannedItemsString) {
      // Items have changed, so map should re-fit bounds
      setMapShouldMaintainZoom(false);
    } else {
      // Items are the same as last render, user might be interacting with map
      setMapShouldMaintainZoom(true);
    }
    previousPlannedItemsRef.current = currentPlannedItemsString;
  }, [plannedItems]);

  if (placesForRoute.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-center py-4 mt-4 border-t">
        <p>{t('no_route_items_for_map', { defaultValue: 'Нет элементов для отображения маршрута на карте.'})}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="pilgrimage-route-map-container flex items-start h-full w-full max-w-none ml-0 pl-0 pr-0 mr-0">
        <RouteMap places={placesForRoute} maintainZoom={mapShouldMaintainZoom} />
      </div>
    </div>
  );
};

export default PilgrimageRouteMap;
