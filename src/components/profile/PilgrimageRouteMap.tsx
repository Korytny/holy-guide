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
  const [mapKey, setMapKey] = useState(0); // State for the map key

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
    // Create a string representation of essential parts of plannedItems for comparison.
    // This helps in determining if the actual list of items or their core properties have changed.
    const currentPlannedItemsSignature = JSON.stringify(
      plannedItems.map(p => ({ 
        id: p.data.id, 
        type: p.type, 
        date: p.date, 
        time: p.time, 
        order: p.order 
      }))
    );

    if (previousPlannedItemsRef.current !== currentPlannedItemsSignature) {
      // Items have fundamentally changed (e.g., new goal loaded, item added/removed).
      // Map should re-fit bounds to the new set of items.
      setMapShouldMaintainZoom(false);
      // Force re-render of RouteMap by changing its key
      setMapKey(prevKey => prevKey + 1);
    } else {
      // Items signature is the same as last render. This could mean either:
      // 1. No change at all.
      // 2. An internal property of an item changed that is not part of the signature 
      //    (e.g., a description, but map primarily cares about locations/order).
      // In this case, we might want to maintain zoom if the user was interacting with the map.
      setMapShouldMaintainZoom(true);
    }
    previousPlannedItemsRef.current = currentPlannedItemsSignature;
  }, [plannedItems]); // Dependency array ensures this runs when plannedItems prop changes.

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
        {/* Apply the key to the RouteMap component */}
        <RouteMap places={placesForRoute} maintainZoom={mapShouldMaintainZoom} key={mapKey} />
      </div>
    </div>
  );
};

export default PilgrimageRouteMap;
