import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvided, DroppableProvided } from 'react-beautiful-dnd'; 
import { Language, PlannedItem, City, Place, Event, Route } from '../../types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, PlusCircle, GripVertical } from 'lucide-react';
import { getLocalizedText } from '../../utils/languageUtils';
import { cn } from '@/lib/utils';

interface PilgrimagePlanDisplayProps {
  plannedItems: PlannedItem[]; 
  language: Language;
  t: (key: string, options?: any) => string;
  onUpdateDateTime: (itemToUpdate: PlannedItem, date?: string, time?: string) => void;
  onRemoveItem: (itemToRemove: PlannedItem) => void;
  onAddPlacesForCity?: (cityId: string) => void;
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
  onReorderItems,
}) => {

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
      <div className="border rounded-md p-0 bg-white overflow-hidden h-full">
        <h3 className="text-lg font-semibold mb-0 p-4 sticky top-0 bg-white z-10">{t('pilgrimage_plan')}</h3>
        {groupedItems.length === 0 && plannedItems.length === 0 ? (
          <div className="p-4 text-gray-500">{t('plan_results_placeholder')}</div>
        ) : (
          <Droppable droppableId="all-cities" type="CITY_GROUP">
            {(providedOuter: DroppableProvided) => (
              <div 
                {...providedOuter.droppableProps} 
                ref={providedOuter.innerRef}
                className="overflow-y-auto h-[calc(100%-theme(space.16))]">
                {groupedItems.map((group, cityIndex) => (
                  <Draggable key={group.cityItem.data.id} draggableId={group.cityItem.data.id} index={cityIndex}>
                    {(providedCity: DraggableProvided) => (
                      <div 
                        ref={providedCity.innerRef} 
                        {...providedCity.draggableProps} 
                        className="mb-2 border rounded-md shadow-sm"
                      >
                        <div {...providedCity.dragHandleProps} className="flex items-center p-2 bg-blue-50 hover:bg-blue-100 cursor-grab rounded-t-md">
                          <GripVertical size={20} className="text-gray-500 mr-2" />
                          <span className="font-semibold text-blue-700">
                            <Link 
                              to={`/cities/${group.cityItem.data.id}`}
                              target="_blank"
                              className="hover:underline"
                            >
                              {getLocalizedText((group.cityItem.data as City).name, language)}
                            </Link>
                          </span>
                          {onAddPlacesForCity && (
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => onAddPlacesForCity!(group.cityItem.data.id)} 
                                className="ml-auto text-green-600 hover:text-green-800 h-7 w-7"
                                title={t('add_places_for_city_tooltip', {defaultValue: 'Add places for this city'})}
                            >
                                <PlusCircle size={18} />
                            </Button>
                          )}
                           <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => onRemoveItem(group.cityItem)} 
                              className="ml-1 text-red-500 hover:text-red-700 h-7 w-7"
                              title={t('remove_item_tooltip', {defaultValue: 'Remove city from plan'})}
                          >
                              <Trash2 size={18} />
                          </Button>
                        </div>

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
                                        <div {...providedItem.dragHandleProps} className="cursor-grab pr-2">
                                          <GripVertical size={16} className="text-gray-400" />
                                        </div>
                                        <div className="flex-grow">
                                          <Link 
                                            to={`/${item.type === 'place' ? 'places' : item.type === 'route' ? 'routes' : 'events'}/${item.data.id}`}
                                            target="_blank"
                                            className="text-sm text-gray-700 hover:text-gray-900 hover:underline"
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
