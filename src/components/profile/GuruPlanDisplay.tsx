import React from 'react';
import { useFont } from '@/context/FontContext';
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'; 
import { Language, PlannedItem, Event, City, EventType } from '../../types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, GripVertical } from 'lucide-react';
import { getLocalizedText } from '../../utils/languageUtils';
import { cn } from '@/lib/utils';

export interface EventGroup {
  id: EventType;
  titleKey: string;
  items: PlannedItem[];
  order: number;
}

interface GuruPlanDisplayProps {
  planGroups: EventGroup[]; 
  availableCities: City[];
  language: Language;
  t: (key: string, options?: any) => string;
  onUpdateDateTime: (itemToUpdate: PlannedItem, date?: string, time?: string) => void;
  onRemoveItem: (itemToRemove: PlannedItem, group: EventGroup) => void; 
  onReorder: (result: DropResult) => void; // Changed to pass the full DropResult
}

const formatTimeToHHMM = (timeString?: string): string => {
  if (!timeString) return '';
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeString)) return timeString.substring(0, 5);
  if (timeString.includes('T')) {
    try {
      const date = new Date(timeString);
      const hours = date.getUTCHours().toString().padStart(2, '0');
      const minutes = date.getUTCMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (error) { /* fallback */ }
  }
  const match = timeString.match(/(\d{2}:\d{2})/);
  return match ? match[0] : '';
};

export const GuruPlanDisplay: React.FC<GuruPlanDisplayProps> = ({
  planGroups,
  availableCities,
  language,
  t,
  onUpdateDateTime,
  onRemoveItem,
  onReorder, // Destructure the updated onReorder
}) => {
  const { fonts } = useFont();

  // onDragEnd now directly calls onReorder with the full result object
  const handleOnDragEnd = (result: DropResult) => {
    // Basic checks are done in the parent now, but can also be here if preferred
    if (!result.destination) return;
    if (result.destination.droppableId === result.source.droppableId && 
        result.destination.index === result.source.index) {
      return;
    }
    onReorder(result); 
  };

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <div className="border rounded-md p-0 bg-white overflow-hidden h-full">
        <h3 className={`text-xl font-bold mb-0 p-4 sticky top-0 bg-white z-10 ${fonts.heading.className}`} style={{ fontFamily: fonts.heading.name }}>
          {t('guru_planner_main_title')}
        </h3>
        {planGroups.length === 0 ? (
          <div className="p-4 text-gray-500">{t('guru_plan_placeholder')}</div>
        ) : (
          <Droppable droppableId="all-groups" type="group" direction="vertical">
            {(provided) => (
              <div 
                {...provided.droppableProps} 
                ref={provided.innerRef}
                className="overflow-y-auto h-[calc(100%-theme(space.16))] p-2 space-y-3"
              >
                {planGroups.map((group, groupIndex) => (
                  <Draggable key={group.id} draggableId={group.id} index={groupIndex}>
                    {(providedDraggableGroup) => (
                      <div
                        ref={providedDraggableGroup.innerRef}
                        {...providedDraggableGroup.draggableProps}
                        className="bg-slate-50 p-2 rounded-md border"
                      >
                        <div className="flex items-center mb-2 cursor-grab" {...providedDraggableGroup.dragHandleProps}>
                           <GripVertical size={20} className="text-gray-500 mr-2" />
                           <h4 className={`text-md font-semibold text-slate-700 ${fonts.subheading.className}`}>{t(group.titleKey, { defaultValue: group.id })}</h4>
                        </div>
                        {/* Changed type to "event-item" for all item droppables */}
                        <Droppable droppableId={group.id} type="event-item"> 
                          {(providedItems) => (
                            <div
                              ref={providedItems.innerRef}
                              {...providedItems.droppableProps}
                              className="pl-4 pr-1 py-1 space-y-2 rounded bg-white border border-slate-200 min-h-[50px]"
                            >
                              {group.items.map((item, itemIndex) => {
                                const eventData = item.data as Event;
                                const itemDraggableId = `item-${group.id}-${eventData.id}-${item.orderIndex}`;
                                const cityName = eventData.cityId && availableCities 
                                  ? getLocalizedText( (availableCities.find(c => c.id === eventData.cityId) || {}).name , language) 
                                  : eventData.cityId;

                                return (
                                  <Draggable key={itemDraggableId} draggableId={itemDraggableId} index={itemIndex}>
                                    {(providedDraggableItem) => (
                                      <div 
                                        ref={providedDraggableItem.innerRef}
                                        {...providedDraggableItem.draggableProps} 
                                        className="flex items-center p-2 bg-gray-50 hover:bg-gray-100 rounded shadow-xs border"
                                      >
                                        <div {...providedDraggableItem.dragHandleProps} className="cursor-grab pr-2">
                                          <GripVertical size={16} className="text-gray-400" />
                                        </div>
                                        <div className="flex-grow">
                                          <Link 
                                            to={`/events/${eventData.id}`}
                                            target="_blank"
                                            className={`text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline ${fonts.body.className}`}
                                          >
                                            {getLocalizedText(eventData.name, language)}
                                          </Link>
                                          {eventData.cityId && (
                                              <p className="text-xs text-gray-500">
                                                  {t('city')}: {cityName || eventData.cityId}
                                              </p>
                                          )}
                                        </div>
                                        <Input 
                                          type="date" 
                                          value={item.date || ''} 
                                          onChange={(e) => onUpdateDateTime(item, e.target.value, item.time)} 
                                          className="w-auto p-1 text-xs ml-2 h-8 border-gray-300 rounded"
                                          placeholder={t('date_placeholder')} 
                                        />
                                        <Input 
                                          type="time" 
                                          value={formatTimeToHHMM(item.time)}
                                          onChange={(e) => onUpdateDateTime(item, item.date, e.target.value)} 
                                          className="w-auto p-1 text-xs ml-2 h-8 border-gray-300 rounded"
                                          placeholder={t('time_placeholder')} 
                                        />
                                        <Button 
                                          variant="ghost" 
                                          size="icon" 
                                          onClick={() => onRemoveItem(item, group)}
                                          className="ml-2 text-red-500 hover:text-red-700 h-8 w-8"
                                          title={t('remove_item_tooltip', {defaultValue: 'Remove event'})}
                                        >
                                          <Trash2 size={16} />
                                        </Button>
                                      </div>
                                    )}
                                  </Draggable>
                                );
                              })}
                              {providedItems.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        )}
      </div>
    </DragDropContext>
  );
};
