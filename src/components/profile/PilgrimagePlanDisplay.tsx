import React, { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvided, DroppableProvided } from 'react-beautiful-dnd'; 
import { Language, PlannedItem, City, Place, Event, Route } from '../../types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, PlusCircle, GripVertical, Search, Dice5, ChevronDown } from 'lucide-react';
import { getLocalizedText } from '../../utils/languageUtils';
import { cn } from '@/lib/utils';

interface PilgrimagePlanDisplayProps {
  plannedItems: PlannedItem[]; 
  language: Language;
  t: (key: string, options?: any) => string;
  onUpdateDateTime: (itemToUpdate: PlannedItem, date?: string, time?: string) => void;
  onRemoveItem: (itemToRemove: PlannedItem) => void;
  onAddPlacesForCity?: (cityId: string) => void;
  onSearchAndAddPlace?: (cityId: string, searchTerm: string) => Promise<Place[]>;
  onAddSpecificPlace?: (place: Place, cityId: string) => void;
  onReorderItems: (reorderedItems: PlannedItem[]) => void; 
}

interface PlanGroup {
  cityItem: PlannedItem; 
  childItems: PlannedItem[];
}

export const PilgrimagePlanDisplay: React.FC<PilgrimagePlanDisplayProps> = ({
  plannedItems, 
  language,
  t,
  onUpdateDateTime,
  onRemoveItem,
  onAddPlacesForCity,
  onSearchAndAddPlace,
  onAddSpecificPlace,
  onReorderItems,
}) => {
  const searchTimeout = useRef<NodeJS.Timeout>();
  const [searchResultsForCity, setSearchResultsForCity] = useState<Record<string, Place[]>>({});
  const [collapsedCities, setCollapsedCities] = useState<Set<string>>(new Set());

  const toggleCityCollapse = (cityId: string) => {
    setCollapsedCities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cityId)) {
        newSet.delete(cityId);
      } else {
        newSet.add(cityId);
      }
      return newSet;
    });
  };

  const existingPlaceIds = useMemo(() => new Set(
    plannedItems
      .filter(item => item.type === 'place')
      .map(item => item.data.id)
  ), [plannedItems]);

  const groupedItems = useMemo(() => {
    const groups: PlanGroup[] = [];
    const itemMap = new Map<string, PlannedItem[]>();

    plannedItems.forEach(item => {
      if (item.type === 'city') {
        // Ensure cityItem is not undefined by checking item.data
        if (item.data) {
          groups.push({ cityItem: item, childItems: [] });
        } else {
          console.warn("City item without data found, skipping:", item);
        }
      } else if (item.city_id_for_grouping) {
        if (!itemMap.has(item.city_id_for_grouping)) {
          itemMap.set(item.city_id_for_grouping, []);
        }
        itemMap.get(item.city_id_for_grouping)!.push(item);
      }
    });

    return groups.map(group => ({
      ...group,
      childItems: (itemMap.get(group.cityItem.data.id) || []).sort((a,b) => a.orderIndex - b.orderIndex)
    })).filter(group => group.cityItem && group.cityItem.data); // Ensure cityItem and its data exist
  }, [plannedItems]);

  // Cleanup timeout on component unmount
  React.useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  const handleOnDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;
    if (!destination) return;

    let newOrderedItems = Array.from(plannedItems);

    if (type === 'CITY_GROUP') {
      if (source.index === destination.index) return; // No change if dropped in the same place
      const draggedCityGroup = groupedItems[source.index];
      if (!draggedCityGroup || !draggedCityGroup.cityItem) return; // Safety check

      const itemsToMove = [draggedCityGroup.cityItem, ...draggedCityGroup.childItems];
      const otherItems = newOrderedItems.filter(item => !itemsToMove.find(itm => itm.data.id === item.data.id && itm.type === item.type));
      
      let insertAtIndex = 0;
      for (let i = 0; i < destination.index; i++) {
        const group = groupedItems[i];
        if(group.cityItem.data.id === draggedCityGroup.cityItem.data.id) continue;
        insertAtIndex++; // for the city item
        insertAtIndex += group.childItems.length; // for the children of that city
      }
      newOrderedItems = [...otherItems.slice(0, insertAtIndex), ...itemsToMove, ...otherItems.slice(insertAtIndex)];

    } else if (type === 'ITEM_IN_CITY') {
      const sourceDroppableId = source.droppableId; // cityId
      const destinationDroppableId = destination.droppableId; // cityId

      if (sourceDroppableId !== destinationDroppableId) {
        // Moving items BETWEEN cities is more complex: needs to update city_id_for_grouping
        // and then re-calculate orderIndex for items in both source and destination cities.
        // For now, we only support reordering within the same city group.
        console.warn("Moving items between different cities via D&D is not supported in this simplified version.");
        return;
      }
      const cityGroup = groupedItems.find(g => g.cityItem.data.id === sourceDroppableId);
      if (!cityGroup) return;

      const childItemsCopy = Array.from(cityGroup.childItems);
      const [movedItem] = childItemsCopy.splice(source.index, 1);
      childItemsCopy.splice(destination.index, 0, movedItem);

      // Reconstruct the full plannedItems array with the reordered child list for this city
      newOrderedItems = [];
      groupedItems.forEach(group => {
        newOrderedItems.push(group.cityItem);
        if (group.cityItem.data.id === sourceDroppableId) {
          newOrderedItems.push(...childItemsCopy);
        } else {
          newOrderedItems.push(...group.childItems);
        }
      });
    }
    onReorderItems(newOrderedItems);
  };

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <div className="border rounded-md p-0 bg-white h-full">
        {groupedItems.length === 0 && plannedItems.length === 0 ? (
          <div className="p-4 text-gray-500">{t('plan_results_placeholder')}</div>
        ) : (
          <Droppable droppableId="all-cities" type="CITY_GROUP">
            {(providedOuter: DroppableProvided) => (
              <div
                {...providedOuter.droppableProps}
                ref={providedOuter.innerRef}
                className="h-full max-h-[100vh] overflow-y-auto">
                {groupedItems.map((group, cityIndex) => (
                  <Draggable key={group.cityItem.data.id} draggableId={group.cityItem.data.id} index={cityIndex}>
                    {(providedCity: DraggableProvided) => (
                      <div 
                        ref={providedCity.innerRef} 
                        {...providedCity.draggableProps} 
                        className="mb-2 border rounded-md shadow-sm"
                      >
                        <div className="flex items-center justify-between p-2 bg-blue-50 hover:bg-blue-100 rounded-t-md">
                          <div className="flex items-center flex-1 gap-3">
                            <div {...providedCity.dragHandleProps} className="cursor-grab">
                              <GripVertical size={20} className="text-gray-500" />
                            </div>
                            <button 
                              onClick={() => toggleCityCollapse(group.cityItem.data.id)}
                              className="flex items-center gap-2 hover:bg-blue-200 rounded px-2 py-1 transition-colors"
                            >
                              <ChevronDown 
                                size={16} 
                                className={`text-blue-700 transition-transform ${collapsedCities.has(group.cityItem.data.id) ? 'rotate-0' : 'rotate-180'}`}
                              />
                              <span className="font-semibold text-blue-700">
                                <Link 
                                  to={`/cities/${group.cityItem.data.id}`}
                                  target="_blank"
                                  className="hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {getLocalizedText((group.cityItem.data as City).name, language)}
                                </Link>
                              </span>
                            </button>
                            
                            {onSearchAndAddPlace && onAddSpecificPlace && (
                              <>
                              <div className="relative flex-1 max-w-xs">
                                <div className="flex items-center">
                                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                  <Input
                                    type="text"
                                    placeholder={t('search_places_placeholder')}
                                    className="pl-9 w-full text-sm h-8"
                                    onChange={(e) => {
                                      const searchTerm = e.target.value;
                                      
                                      if (searchTimeout.current) {
                                        clearTimeout(searchTimeout.current);
                                      }
                                      
                                      searchTimeout.current = setTimeout(async () => {
                                        if (searchTerm.trim()) {
                                          const results = await onSearchAndAddPlace(group.cityItem.data.id, searchTerm);
                                          setSearchResultsForCity(prev => ({ ...prev, [group.cityItem.data.id]: results }));
                                        } else {
                                          setSearchResultsForCity(prev => ({ ...prev, [group.cityItem.data.id]: [] }));
                                        }
                                      }, 300);
                                    }}
                                  />
                                </div>
                                
                                {searchResultsForCity[group.cityItem.data.id]?.length > 0 && (
                                  <div className="absolute top-full left-0 right-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                                    {searchResultsForCity[group.cityItem.data.id]
                                      .filter(place => !existingPlaceIds.has(place.id))
                                      .map((place) => (
                                        <div
                                          key={place.id}
                                          className="p-3 hover:bg-gray-50 border-b last:border-b-0 cursor-pointer transition-colors"
                                          onClick={() => {
                                            onAddSpecificPlace!(place, group.cityItem.data.id);
                                            // Очищаем поиск и результаты
                                            const inputs = document.querySelectorAll('input');
                                            inputs.forEach(input => {
                                              if (input.placeholder?.includes('Search') || input.placeholder?.includes('search')) {
                                                input.value = '';
                                              }
                                            });
                                            setSearchResultsForCity(prev => ({ ...prev, [group.cityItem.data.id]: [] }));
                                          }}
                                        >
                                          <div className="flex items-start gap-2 mb-1">
                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${
                                              place.type === 1 ? "bg-blue-500" :
                                              place.type === 2 ? "bg-red-500" :
                                              place.type === 3 ? "bg-green-500" :
                                              place.type === 4 ? "bg-yellow-500" :
                                              "bg-indigo-500"
                                            }`}></div>
                                            <div className="flex-1">
                                              <div className={`text-sm font-medium ${
                                                place.type === 1 ? "text-blue-700" :
                                                place.type === 2 ? "text-red-700" :
                                                place.type === 3 ? "text-green-700" :
                                                place.type === 4 ? "text-yellow-700" :
                                                "text-indigo-700"
                                              }`}>
                                                {getLocalizedText(place.name, language)}
                                              </div>
                                              {place.type && (
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                  {t(`place_type_${
                                                    place.type === 1 ? 'temple' :
                                                    place.type === 2 ? 'samadhi' :
                                                    place.type === 3 ? 'kunda' :
                                                    place.type === 4 ? 'sacred_site' : ''
                                                  }`)}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                          {place.description && (
                                            <p className="text-xs text-gray-600 ml-4 line-clamp-2">
                                              {getLocalizedText(place.description, language)}
                                            </p>
                                          )}
                                          {place.rating && (
                                            <div className="text-xs text-gray-500 ml-4 mt-1">
                                              ⭐ {place.rating}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                  </div>
                                )}
                              </div>
                              </>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            {onAddPlacesForCity && (
                              <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => onAddPlacesForCity!(group.cityItem.data.id)} 
                                  className="text-blue-600 hover:text-blue-800 h-8 w-8"
                                  title={t('add_random_place_for_city_tooltip', {defaultValue: 'Add random place for this city'})}
                              >
                                  <Dice5 size={18} />
                              </Button>
                            )}
                            
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => onRemoveItem(group.cityItem)} 
                              className="text-red-500 hover:text-red-700 h-8 w-8"
                              title={t('remove_item_tooltip', {defaultValue: 'Remove city from plan'})}
                            >
                              <Trash2 size={18} />
                            </Button>
                          </div>
                        </div>

                        {!collapsedCities.has(group.cityItem.data.id) && (
                          <Droppable droppableId={group.cityItem.data.id} type="ITEM_IN_CITY">
                            {(providedInner: DroppableProvided) => (
                              <div ref={providedInner.innerRef} {...providedInner.droppableProps} className="p-2 bg-white rounded-b-md min-h-[30px]">
                                {group.childItems.length > 0 ? group.childItems.map((item, itemIndex) => {
                                  const draggableId = `${item.type}-${item.data.id}-${item.orderIndex}`;
                                  return (
                                    <Draggable key={draggableId} draggableId={draggableId} index={itemIndex}>
                                      {(providedItem: DraggableProvided) => (
                                        <div 
                                          ref={providedItem.innerRef} 
                                          {...providedItem.draggableProps} 
                                          className="flex items-center p-1.5 mb-1 bg-gray-50 hover:bg-gray-100 rounded shadow-xs"
                                        >
                                          <div {...providedItem.dragHandleProps} className="cursor-grab pr-3 flex items-center">
                                            <GripVertical size={16} className="text-gray-400" />
                                          </div>
                                          <div className="flex-grow pl-1">
                                            <Link 
                                              to={`/${item.type === 'place' ? 'places' : item.type === 'route' ? 'routes' : 'events'}/${item.data.id}`}
                                              target="_blank"
                                              className={cn(
                                                "text-sm hover:underline",
                                                item.type === 'place' ? (() => {
                                                  const place = item.data as Place;
                                                  if (!place.type) return "text-gray-600 hover:text-gray-800";
                                                  switch(place.type) {
                                                    case 1: return "text-blue-600 hover:text-blue-800"; // temple
                                                    case 2: return "text-red-600 hover:text-red-800"; // samadhi
                                                    case 3: return "text-green-600 hover:text-green-800"; // kunda
                                                    case 4: return "text-yellow-600 hover:text-yellow-800"; // sacred_site
                                                    default: return "text-indigo-600 hover:text-indigo-800";
                                                  }
                                                })() :
                                                item.type === 'route' ? "text-green-600 hover:text-green-800" :
                                                "text-purple-600 hover:text-purple-800"
                                              )}
                                            >
                                              {getLocalizedText((item.data as Place | Route | Event).name, language)}
                                            </Link>
                                          </div>
                                          <Input 
                                            type="date" 
                                            value={item.date || ''} 
                                            onChange={(e) => onUpdateDateTime(item, e.target.value, item.time)} 
                                            className="w-auto p-1 text-xs ml-2 h-7"
                                            placeholder={t('date_placeholder')} 
                                          />
                                          {item.type === 'event' && (
                                            <Input
                                              type="time"
                                              value={item.time || ''}
                                              onChange={(e) => onUpdateDateTime(item, item.date, e.target.value)}
                                              className="w-auto p-1 text-xs ml-2 h-7"
                                              placeholder={t('time_placeholder')}
                                            />
                                          )}
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => onRemoveItem(item)} 
                                            className="ml-1 text-red-400 hover:text-red-600 h-7 w-7"
                                            title={t('remove_item_tooltip', {defaultValue: 'Remove item'})}
                                          >
                                            <Trash2 size={14} />
                                          </Button>
                                        </div>
                                      )}
                                    </Draggable>
                                  );
                                }) : (
                                  <p className="text-xs text-gray-400 px-2 py-1">{t('no_items_for_this_city', {defaultValue: 'No items for this city yet. Drag items here or add new ones.'})}</p>
                                )}
                                {providedInner.placeholder}
                              </div>
                            )}
                          </Droppable>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {providedOuter.placeholder}
              </div>
            )}
          </Droppable>
        )}
      </div>
    </DragDropContext>
  );
};
