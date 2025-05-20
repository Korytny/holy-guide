import React, { useState, useEffect } from 'react';
import { getEventById } from '@/services/eventsApi';
import { useFont } from '@/context/FontContext';
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'; 
import { Language, PlannedItem, Event, City, EventType, EventCulture } from '../../types'; // Import EventCulture
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
  onReorder: (result: DropResult) => void;
  eventCultureOptions: { value: EventCulture; labelKey: string; Icon?: React.ElementType }[]; // Add eventCultureOptions prop
}

const formatDateDisplay = (dateString?: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};

const formatTimeDisplay = (timeString?: string): string => {
  if (!timeString) return '';
  if (timeString.includes('T')) {
    const date = new Date(timeString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  return timeString;
};

export const GuruPlanDisplay: React.FC<GuruPlanDisplayProps> = ({
  planGroups,
  availableCities,
  language,
  t,
  onUpdateDateTime,
  onRemoveItem,
  onReorder,
  eventCultureOptions, // Destructure eventCultureOptions
}) => {
  console.log('GuruPlanDisplay props:', { planGroups, availableCities, eventCultureOptions }); // Log availableCities and eventCultureOptions
  const { fonts } = useFont();
  const [eventsData, setEventsData] = useState<Record<string, Event>>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      const newEventsData: Record<string, Event> = {};
      
      for (const group of planGroups) {
        for (const item of group.items) {
          const event = item.data as Event;
          const eventName = getLocalizedText(event.name, language);
          // Пропускаем тестовые события
          if (event.id && 
              !event.id.startsWith('temp_') && 
              !eventName.toLowerCase().includes('тестовое') &&
              !eventName.toLowerCase().includes('test') &&
              !eventsData[event.id]) {
            newEventsData[event.id] = event;
          }
        }
      }

      setEventsData(prev => ({ ...prev, ...newEventsData }));
      setLoading(false);
    };

    loadEvents();
  }, [planGroups]);

  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.destination.droppableId === result.source.droppableId && 
        result.destination.index === result.source.index) return;
    onReorder(result);
  };

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <div className="rounded-lg shadow-lg p-0 bg-white overflow-hidden h-full"> {/* Applied shadow-lg, rounded-lg, removed border */}
        <h3 className={`text-xl font-bold mb-0 p-2 md:p-4 sticky top-0 bg-transparent md:bg-white z-10 ${fonts.heading.className}`}>
          {t('guru_plan_title')}
        </h3>

        {loading ? (
          <div className="p-4 text-gray-500">Loading events...</div>
        ) : planGroups.length === 0 || planGroups.every(group => 
            group.items.length === 0 || 
            group.items.every(item => {
              const event = item.data as Event;
              const eventName = getLocalizedText(event.name, language);
              return !event.id || 
                     event.id.startsWith('temp_') || 
                     eventName.toLowerCase().includes('тестовое') ||
                     eventName.toLowerCase().includes('test');
            })
          ) ? (
          <div className="p-4 text-gray-500">{t('guru_plan_placeholder')}</div>
        ) : (
          <Droppable droppableId="all-groups" type="group" direction="vertical">
            {(provided) => (
              <div 
                {...provided.droppableProps} 
                ref={provided.innerRef}
                className="overflow-y-auto h-[calc(100%-theme(space.16))] p-2 space-y-3"
              >
                {planGroups
                  .filter(group => group.items.some(item => {
                    const event = item.data as Event;
                    const eventName = getLocalizedText(event.name, language);
                    return event.id && 
                           !event.id.startsWith('temp_') && 
                           !eventName.toLowerCase().includes('тестовое') &&
                           !eventName.toLowerCase().includes('test');
                  }))
                  .map((group, groupIndex) => (
                  <Draggable key={group.id} draggableId={group.id} index={groupIndex}>
                    {(providedDraggableGroup) => (
                      <div
                        ref={providedDraggableGroup.innerRef}
                        {...providedDraggableGroup.draggableProps}
                        className="bg-slate-50 p-2 rounded-md border"
                      >
                        <div className="flex items-center mb-2 cursor-grab" {...providedDraggableGroup.dragHandleProps}>
                          <GripVertical size={20} className="text-gray-500 mr-2" />
                          <h4 className={`text-md font-semibold text-slate-700 ${fonts.subheading.className}`}>
                            {t(group.titleKey, { defaultValue: group.id })}
                          </h4>
                        </div>

                        <Droppable droppableId={group.id} type="event-item"> 
                          {(providedItems) => (
                            <div
                              ref={providedItems.innerRef}
                              {...providedItems.droppableProps}
                              className="pl-4 pr-1 py-1 space-y-2 rounded bg-white border border-slate-200 min-h-[50px]"
                            >
                              {/* {console.log(`Group ${group.id} items BEFORE filter:`, group.items)} */} {/* Commenting out for now to reduce console noise */}
                              {group.items
                                .filter(item => {
                                  const event = item.data as Event;
                                  const eventName = getLocalizedText(event.name, language);
                                  const isTestEvent = !event.id || 
                                                      event.id.startsWith('temp_') || 
                                                      eventName.toLowerCase().includes('тестовое') ||
                                                      eventName.toLowerCase().includes('test');
                                  console.log(`Filtering item ${event.id}: isTestEvent = ${isTestEvent}, Name = "${eventName}"`);
                                  return !isTestEvent;
                                })
                                .map((item, itemIndex) => {
                                  const event = item.data as Event;
                                  const eventData = eventsData[event.id] || event;
                                  {console.log(`Item ${itemIndex}: Event ID: ${eventData.id}, Event City ID: ${eventData.cityId}, Item City ID: ${item.city_id_for_grouping}, Culture Field: ${eventData.cultureField}, Has Online Stream: ${eventData.hasOnlineStream}, Available Cities: ${availableCities ? availableCities.length : 'undefined'}`)} {/* Wrapped in curly braces, added hasOnlineStream */}
                                  const itemDraggableId = `item-${group.id}-${eventData.id}-${item.orderIndex}`;

                                  if ((eventData.cityId || item.city_id_for_grouping) && availableCities) {
                                    const cityIdToFind = eventData.cityId || item.city_id_for_grouping;
                                    const city = availableCities.find(c => c.id === cityIdToFind);
                                    {console.log(`Item ${itemIndex}: Searching for City ID "${cityIdToFind}", Found City: ${city ? getLocalizedText(city.name, language) : 'Not found'}`)} {/* Wrapped in curly braces */}
                                  }


                                return (
                                  <Draggable key={itemDraggableId} draggableId={itemDraggableId} index={itemIndex}>
                                    {(providedDraggableItem) => (
                                      <div
                                        ref={providedDraggableItem.innerRef}
                                        {...providedDraggableItem.draggableProps}
                                        className="grid grid-cols-12 items-center p-2 bg-gray-50 hover:bg-gray-100 rounded shadow-xs border gap-1"
                                      >
                                        {/* 1. Drag Picker */}
                                        <div {...providedDraggableItem.dragHandleProps} className="col-span-1 flex items-center justify-center cursor-grab">
                                          <GripVertical size={16} className="text-gray-400" />
                                        </div>

                                        {/* 2. Date & Time */}
                                        <div className="col-span-2 flex items-center">
                                          <div className="flex items-center gap-0 bg-blue-50 rounded py-1 px-2 w-full">
                                            <span className="text-xs text-blue-700 font-medium whitespace-nowrap">
                                              {item.date ? formatDateDisplay(item.date) :
                                               eventData.time ? formatDateDisplay(eventData.time) :
                                               t('no_date_short', {defaultValue: '-'})}
                                            </span>
                                            {item.time && (
                                              <span className="text-xs text-gray-600 whitespace-nowrap ml-2">
                                                {formatTimeDisplay(item.time)}
                                              </span>
                                            )}
                                          </div>
                                        </div>

                                        {/* 3. City */}
                                        <div className="col-span-1 flex items-center">
                                          {(eventData.cityId || item.city_id_for_grouping) && availableCities && (
                                            <span className={`px-2 py-0.5 text-xs border rounded-full bg-gray-100 text-gray-700 font-medium ${fonts.body.className} whitespace-nowrap truncate block w-full text-center`}>
                                              {getLocalizedText(availableCities.find(city => city.id === (eventData.cityId || item.city_id_for_grouping))?.name, language)}
                                            </span>
                                          )}
                                        </div>

                                        {/* 4. Culture */}
                                        <div className="col-span-1 flex items-center">
                                          {eventData.cultureField && eventCultureOptions && (
                                            <span className={`px-1 py-0.5 text-xs border rounded-full bg-gray-100 text-gray-700 font-medium ${fonts.body.className} whitespace-nowrap truncate block w-full text-center`}>
                                              {t(eventCultureOptions.find(opt => opt.value === eventData.cultureField)?.labelKey || eventData.cultureField, {defaultValue: eventData.cultureField})}
                                            </span>
                                          )}
                                        </div>

                                        {/* Online Indicator */}
                                        <div className="col-span-1 flex items-center justify-center">
                                          {eventData.hasOnlineStream && (
                                            <span className={`px-1 py-0.5 text-xs border rounded-full bg-green-100 text-green-700 font-medium ${fonts.body.className} whitespace-nowrap`}>
                                              {t('online_short', {defaultValue: 'онлайн'})}
                                            </span>
                                          )}
                                        </div>

                                        {/* 5. Name */}
                                        <div className="col-span-5 flex items-center min-w-0">
                                          <Link
                                            to={`/events/${eventData.id}`}
                                            target="_blank"
                                            className={`text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline ${fonts.body.className} truncate block w-full text-left`}
                                            title={getLocalizedText(eventData.name, language)}
                                          >
                                            {getLocalizedText(eventData.name, language)}
                                          </Link>
                                        </div>

                                        {/* 6. Remove Button */}
                                        <div className="col-span-1 flex items-center justify-center">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onRemoveItem(item, group)}
                                            className="text-red-500 hover:text-red-700 h-8 w-8"
                                            title={t('remove_item_tooltip', {defaultValue: 'Remove event'})}
                                          >
                                            <Trash2 size={16} />
                                          </Button>
                                        </div>
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
