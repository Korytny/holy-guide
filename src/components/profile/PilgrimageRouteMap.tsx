import React, { useState, useEffect, useRef } from 'react';
import { PlannedItem, Place as PlaceType, City, Event, Route } from '@/types';
import PilgrimageMapView from './PilgrimageMapView';
import { useLanguage } from '@/context/LanguageContext';

interface PilgrimageRouteMapProps {
  plannedItems: PlannedItem[];
  filteredItems?: (PlaceType | City | Event | Route)[]; // Отфильтрованные элементы для показа на карте
  showFilteredItems?: boolean; // Показывать ли отфильтрованные элементы вместо plannedItems
}

const PilgrimageRouteMap: React.FC<PilgrimageRouteMapProps> = ({ 
  plannedItems, 
  filteredItems = [], 
  showFilteredItems = false 
}) => {
  const { t } = useLanguage();
  const [mapShouldMaintainZoom, setMapShouldMaintainZoom] = useState(false);
  const previousPlannedItemsRef = useRef<string>();
  const [mapKey, setMapKey] = useState(0); // State for the map key

  // Определяем, какие элементы показывать на карте
  const itemsToShow = showFilteredItems ? filteredItems : plannedItems;
  
  // Преобразуем все элементы с координатами в формат Place для карты
  const itemsForMap: PlaceType[] = (itemsToShow || [])
    .filter(item => {
      try {
        let data: any;
        let itemType: string;
        
        if (showFilteredItems) {
          // Для filteredItems - это прямые объекты Place, City, Event, Route
          data = item;
          itemType = (item as any).type || 'unknown';
        } else {
          // Для plannedItems - это PlannedItem с data внутри
          data = (item as PlannedItem).data;
          itemType = (item as PlannedItem).type;
        }
        
        const hasLocation = data?.location?.latitude != null && data?.location?.longitude != null;
        
        console.log('🔍 Processing item for map:', {
          type: itemType,
          id: data?.id,
          name: data?.name,
          hasLocation: hasLocation,
          lat: data?.location?.latitude,
          lng: data?.location?.longitude,
          showFilteredItems
        });
        
        return hasLocation;
      } catch (e) {
        console.error('Error processing item for map:', item, e);
        return false;
      }
    })
    .map((item) => {
      try {
        let data: any;
        let itemType: string;
        
        if (showFilteredItems) {
          // Для filteredItems - это прямые объекты Place, City, Event, Route
          data = item;
          itemType = (item as any).type || 'unknown';
        } else {
          // Для plannedItems - это PlannedItem с data внутри
          data = (item as PlannedItem).data;
          itemType = (item as PlannedItem).type;
        }
        
        return {
          id: data.id,
          name: data.name,
          description: data.description,
          imageUrl: data.imageUrl,
          type: data.type || itemType,
          location: data.location,
          cityId: data.cityId,
          order: showFilteredItems ? undefined : (item as PlannedItem).orderIndex,
        } as PlaceType;
      } catch (e) {
        console.error('Error mapping item for map:', item, e);
        return null;
      }
    })
    .filter(Boolean) as PlaceType[];

  // Отладочная информация
  console.log('🗺️ PilgrimageRouteMap debug:', {
    plannedItemsCount: plannedItems?.length || 0,
    itemsForMapCount: itemsForMap.length,
    plannedItemsTypes: plannedItems?.map(item => item.type),
    itemsForMapDetails: itemsForMap.map(item => ({
      name: item.name,
      type: item.type,
      lat: item.location?.latitude,
      lng: item.location?.longitude,
      order: item.order
    }))
  });

  useEffect(() => {
    // Create a string representation of essential parts of plannedItems for comparison.
    // This helps in determining if the actual list of items or their core properties have changed.
    const currentPlannedItemsSignature = JSON.stringify(
      plannedItems.map(p => ({ 
        id: p.data?.id, 
        type: p.type, 
        date: p.date, 
        time: p.time, 
        order: p.orderIndex 
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

  if (itemsForMap.length === 0) {
    console.log('❌ No items with coordinates for map. Planned items:', plannedItems);
    
    return (
      <div className="h-full flex items-center justify-center text-center">
        <p>{t('no_route_items_for_map', { defaultValue: 'Нет элементов для отображения маршрута на карте.'})}</p>
      </div>
    );
  }

  // Создаем точки для полилинии (маршрута)
  const polylinePoints = itemsForMap
    .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))
    .map(item => [item.location?.latitude, item.location?.longitude] as [number, number])
    .filter(point => point[0] && point[1]);

  console.log('🗺️ PilgrimageRouteMap polyline points:', {
    pointsCount: polylinePoints.length,
    points: polylinePoints
  });

  return (
    <div className="pilgrimage-route-map-container h-full w-full">
      {/* Apply the key to the PilgrimageMapView component */}
      <PilgrimageMapView 
        locations={itemsForMap.map(item => ({
          id: item.id,
          latitude: item.location?.latitude || 0,
          longitude: item.location?.longitude || 0,
          name: item.name,
          type: item.type,
          imageUrl: item.imageUrl,
          description: item.description,
          order: item.order
        }))}
        polylinePoints={polylinePoints}
        maintainZoom={mapShouldMaintainZoom}
        key={mapKey}
      />
    </div>
  );
};

export default PilgrimageRouteMap;
