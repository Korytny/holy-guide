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
  const previousDataRef = useRef<string>();
  const [mapKey, setMapKey] = useState(0); // State for the map key

  // Определяем, какие элементы показывать на карте
  let itemsToShow = showFilteredItems ? filteredItems : plannedItems;

  // В режиме предпросмотра маршрута не сортируем элементы - используем порядок, установленный пользователем
  // Сортировка происходит только в обычном режиме для plannedItems

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
  
  useEffect(() => {
    // Create a string representation of essential parts for comparison.
    // We need to track BOTH plannedItems and filteredItems changes.
    const currentDataSignature = JSON.stringify({
      // Track planned items (for regular planning mode)
      plannedItems: plannedItems.map(p => ({
        id: p.data?.id,
        type: p.type,
        date: p.date,
        time: p.time,
        order: p.orderIndex
      })),
      // Track filtered items (for search mode)
      filteredItems: filteredItems.map(f => ({
        id: f.id,
        type: (f as any).type || 'unknown',
        hasLocation: !!(f as any).location?.latitude && !!(f as any).location?.longitude
      })),
      // Track which mode we're in
      showFilteredItems
    });

    if (previousDataRef.current !== currentDataSignature) {
      // Data has fundamentally changed (new search, new filter, items added/removed, mode change).
      // Map should re-fit bounds to the new set of items.
      setMapShouldMaintainZoom(false);
      // Force re-render of RouteMap by changing its key
      setMapKey(prevKey => prevKey + 1);

          } else {
      // Data signature is the same, maintain zoom for better UX
      setMapShouldMaintainZoom(true);
    }
    previousDataRef.current = currentDataSignature;
  }, [plannedItems, filteredItems, showFilteredItems]); // Track all relevant data changes

  if (itemsForMap.length === 0) {

    return (
      <div className="h-full flex items-center justify-center text-center p-3">
        <div className="max-w-2xl">
          <p
            className="text-gray-700 whitespace-pre-line text-left"
                            dangerouslySetInnerHTML={{ __html: t('no_route_items_for_map', { defaultValue: 'Нет элементов для отображения маршрута на карте.'}) }}
                          />
        </div>
      </div>
    );
  }

  
  // Создаем точки для полилинии (маршрута)
  // Для полилинии используем порядок, в котором элементы приходят в массиве
  // В режиме предпросмотра маршрута (showFilteredItems=true) элементы уже в правильном порядке от пользователя
  // В обычном режиме для plannedItems нужно сортировать по orderIndex
  const polylinePoints = (showFilteredItems ? itemsForMap : itemsForMap.sort((a, b) => {
    const orderA = a.order ?? Infinity;
    const orderB = b.order ?? Infinity;
    return orderA - orderB;
  }))
    .map(item => [item.location?.latitude, item.location?.longitude] as [number, number])
    .filter(point => point[0] && point[1]);

  
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
        isRoutePreview={showFilteredItems}
        key={mapKey}
      />
    </div>
  );
};

export default PilgrimageRouteMap;
