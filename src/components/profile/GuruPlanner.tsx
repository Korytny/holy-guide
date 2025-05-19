
import { useEffect, useState, useCallback, useMemo } from "react";
import { type AuthContextType } from "../../context/AuthContext";
import { type LanguageContextType } from "../../context/LanguageContext";
import { City, Event, Language, PlannedItem, EventType, EventCulture } from "../../types"; 
import { getCities } from "../../services/citiesApi";
import { getEvents, getEventsByIds } from "../../services/eventsApi"; 
import { format, addDays, addMonths } from "date-fns"; 
import { supabase } from '../../integrations/supabase/client';
import { getLocalizedText } from '../../utils/languageUtils';
import { DropResult } from 'react-beautiful-dnd'; // Import DropResult

import { GuruControls, eventCultureOptions } from "./GuruControls"; // Import eventCultureOptions
import { GuruPlanDisplay, EventGroup } from "./GuruPlanDisplay"; 

const eventTypeToTitleKey: Record<EventType, string> = {
  festival: "event_type_festival",
  practice: "event_type_practice",
  retreat: "event_type_retreat",
  vipassana: "event_type_vipassana",
  puja: "event_type_puja",
  lecture: "event_type_lecture",
};

const eventTypeToDefaultDuration: Record<EventType, number> = {
  festival: 120, // 2 hours for festivals
  practice: 60,  // 1 hour for practices
  retreat: 480,  // 8 hours for retreats
  vipassana: 600, // 10 hours for vipassana
  puja: 90,      // 1.5 hours for pujas
  lecture: 45,   // 45 minutes for lectures
};

interface GuruPlannerProps {
  auth: AuthContextType;
  language: Language;
  t: LanguageContextType['t'];
}

const getRandomTime = () => {
  const hour = Math.floor(Math.random() * 12) + 8;
  const minute = Math.floor(Math.random() * 4) * 15;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

const getNextOrderIndex = (items: { orderIndex: number }[] | { order: number }[]): number => {
  if (!items || items.length === 0) return 0;
  if (items[0] && 'orderIndex' in items[0]) {
    return Math.max(0, ...items.map(item => (item as { orderIndex: number }).orderIndex)) + 1;
  }
  if (items[0] && 'order' in items[0]) {
    return Math.max(0, ...items.map(item => (item as { order: number }).order)) + 1;
  }
  return 0; 
};

export const GuruPlanner: React.FC<GuruPlannerProps> = ({ auth: authContext, language, t }) => {
  const defaultPlanName = t('event_type_practice', { defaultValue: 'Practice' });

  const [selectedEventTypes, setSelectedEventTypes] = useState<EventType[]>([]);
  const [hasTranslation, setHasTranslation] = useState<boolean | undefined>(undefined);
  const [selectedCultures, setSelectedCultures] = useState<EventCulture[]>([]);
  const [selectedCityIds, setSelectedCityIds] = useState<string[]>([]);

  const [availableEvents, setAvailableEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);   
  
  const [planGroups, setPlanGroups] = useState<EventGroup[]>([{
    id: 'practice',
    titleKey: 'event_type_practice',
    items: [{
      type: 'event',
      data: {
        id: 'test-event-1',
        name: { en: 'Test Event', ru: 'Тестовое событие' },
        cityId: 'test-city',
        placeIds: [],
        routeIds: [],
        eventTypeField: 'practice',
        date: '2025-05-20T10:00:00',
        time: '10:00',
        cultureField: 'buddhism',
        hasOnlineStream: false,
        description: { en: 'Test description', ru: 'Тестовое описание' },
        location: { en: 'Test location', ru: 'Тестовое место' },
        duration: 60,
        price: 0,
        maxParticipants: 10,
        isRecurring: false,
        recurrencePattern: null,
        imageUrl: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as unknown as Event,
      city_id_for_grouping: 'test-city',
      date: '2025-05-20',
      time: '10:00',
      orderIndex: 0
    } as PlannedItem],
    order: 0
  }]);
  const [selectedDateRange, setSelectedDateRange] = useState<import("react-day-picker").DateRange | undefined>(() => {
    const today = new Date();
    return {
      from: today,
      to: addDays(addMonths(today, 1), 7),
    };
  });
  const [isGuruPlanInitiated, setIsGuruPlanInitiated] = useState<boolean>(false);
  
  const [guruPlanNameForInput, setGuruPlanNameForInput] = useState(defaultPlanName);
  const [currentLoadedGuruPlanId, setCurrentLoadedGuruPlanId] = useState<string | null>(null);
  const [savedGuruPlans, setSavedGuruPlans] = useState<any[]>([]); 

  const [availableCities, setAvailableCities] = useState<City[]>([]);

  const eventDatesForCalendar = useMemo(() => {
    const allItems = planGroups.flatMap(group => group.items);
    const dates = allItems
      .map(item => item.date) 
      .filter((date, index, self) => date && self.indexOf(date) === index)
      .map(dateString => new Date(dateString as string));
    return dates;
  }, [planGroups]);

  useEffect(() => {
    const fetchAllCities = async () => {
      const cities = await getCities();
      if (cities) setAvailableCities(cities);
    };
    fetchAllCities();
  }, []);

  useEffect(() => {
    const fetchAllEvents = async () => {
      console.log("Fetching all events for availableEvents...");
      const events = await getEvents(); 
      console.log("Fetched availableEvents:", events);
      if (events) setAvailableEvents(events);
    };
    fetchAllEvents();
  }, []);

  useEffect(() => {
    console.log("GuruPlanner: selectedCityIds changed to:", selectedCityIds); // Log selectedCityIds
    console.log("Recalculating filteredEvents. Available:", availableEvents.length, "Filters:", {selectedCityIds, selectedEventTypes, hasTranslation, selectedCultures});
    let tempFilteredEvents = [...availableEvents];
    if (selectedCityIds.length > 0) {
      tempFilteredEvents = tempFilteredEvents.filter(event => event.cityId && selectedCityIds.includes(event.cityId));
    }
    if (selectedEventTypes.length > 0) {
      tempFilteredEvents = tempFilteredEvents.filter(event => event.eventTypeField && selectedEventTypes.includes(event.eventTypeField));
    }
    if (hasTranslation !== undefined) {
      tempFilteredEvents = tempFilteredEvents.filter(event => event.hasOnlineStream === hasTranslation);
    }
    if (selectedCultures.length > 0) {
      tempFilteredEvents = tempFilteredEvents.filter(event => event.cultureField && selectedCultures.includes(event.cultureField));
    }
    console.log("Resulting filteredEvents:", tempFilteredEvents);
    setFilteredEvents(tempFilteredEvents);
  }, [availableEvents, selectedCityIds, selectedEventTypes, hasTranslation, selectedCultures]);

  useEffect(() => {
    setIsGuruPlanInitiated(planGroups.some(group => group.items.length > 0));
  }, [planGroups]);

  const addEventsToPlan = (eventsToAdd: Event[]) => {
    console.log("addEventsToPlan called with:", eventsToAdd);
    if (!eventsToAdd || eventsToAdd.length === 0) {
        console.log("No events to add, returning.");
        return;
    }

    setPlanGroups(prevGroups => {
      console.log("Current planGroups before adding:", JSON.parse(JSON.stringify(prevGroups)));
      const newGroups = prevGroups ? [...prevGroups] : [];
      let groupsChanged = false;

      eventsToAdd.forEach(event => {
        const eventType = event.eventTypeField;
        console.log(`Processing event: ${getLocalizedText(event.name, language)}, type: ${eventType}`);
        if (!eventType) {
          console.log("Event skipped, no eventTypeField");
          return;
        }

        const alreadyExists = newGroups.some(group => 
          group.items.some(pi => pi.data.id === event.id && pi.type === 'event')
        );
        if (alreadyExists) {
          console.log(`Event ${getLocalizedText(event.name, language)} already in plan.`);
          // alert(t('event_already_in_plan', { eventName: getLocalizedText(event.name, language) })); // Suppress alert for duplicates
          return;
        }
        groupsChanged = true;

        let group = newGroups.find(g => g.id === eventType);
        if (!group) {
          console.log(`Creating new group for type: ${eventType}`);
          group = {
            id: eventType,
            titleKey: eventTypeToTitleKey[eventType] || eventType,
            items: [],
            order: getNextOrderIndex(newGroups),
          };
          newGroups.push(group);
        } else {
          console.log(`Found existing group for type: ${eventType}`);
        }

        const newPlannedItem: PlannedItem = {
          type: 'event',
          data: {
            ...event,
            duration: event.duration || eventTypeToDefaultDuration[eventType] || 60
          },
          city_id_for_grouping: event.cityId,
          time: event.time || getRandomTime(),
          date: event.date ? event.date.split(' ')[0] : undefined,
          orderIndex: getNextOrderIndex(group.items),
        };
        console.log("Adding new planned item:", newPlannedItem);
        group.items.push(newPlannedItem);
        group.items.sort((a,b) => a.orderIndex - b.orderIndex);
      });
      
      if (!groupsChanged) {
        console.log("No changes to groups, returning previous state.");
        return prevGroups;
      }
      newGroups.sort((a,b) => a.order - b.order);
      console.log("Final newGroups state:", JSON.parse(JSON.stringify(newGroups)));
      return newGroups;
    });
  };

  const handleAddFilteredEventsToPlan = () => {
    console.log("handleAddFilteredEventsToPlan clicked. Filtered events:", filteredEvents);
    // Clear existing event items from the plan before adding new filtered events
    setPlanGroups(prevGroups => {
      const groupsWithoutEvents = prevGroups.map(group => ({
        ...group,
        items: group.items.filter(item => item.type !== 'event') // Keep non-event items if any
      })).filter(group => group.items.length > 0); // Remove empty groups
      // If you want to completely reset the plan (including removing the initial test group if it's empty of events):
      // return []; 
      return groupsWithoutEvents; 
    });
    // Add a slight delay or use a useEffect to ensure setPlanGroups has completed
    // before calling addEventsToPlan, or pass the cleared groups to addEventsToPlan.
    // For simplicity now, let's assume setPlanGroups updates reasonably fast.
    // A more robust solution might involve a callback or a different state update pattern.
    addEventsToPlan(filteredEvents); 
  }

  const handleAddFavoriteEventsToPlan = async () => {
    console.log("handleAddFavoriteEventsToPlan clicked.");
    if (!authContext?.auth?.user?.events_like) {
      alert(t('no_favorite_events_to_add'));
      return;
    }
    const favEventIds = authContext.auth.user.events_like;
    if (favEventIds.length === 0) {
        alert(t('no_favorite_events_to_add'));
        return;
    }
    const favoriteEventsData = await getEventsByIds(favEventIds);
    if (favoriteEventsData) addEventsToPlan(favoriteEventsData);
  };

  const handleRemovePlannedEvent = (itemToRemove: PlannedItem, fromGroup: EventGroup) => {
    setPlanGroups(prevGroups => 
      prevGroups.map(group => {
        if (group.id === fromGroup.id) {
          return {
            ...group,
            items: group.items
              .filter(item => !(item.type === itemToRemove.type && item.data.id === itemToRemove.data.id))
              .map((item, index) => ({ ...item, orderIndex: index }))
          };
        }
        return group;
      })
      .filter(group => group.items.length > 0)
      .map((group, index) => ({ ...group, order: index }))
    );
  };

  const handleUpdatePlannedEventDateTime = (itemToUpdate: PlannedItem, date?: string, time?: string) => {
    setPlanGroups(prevGroups =>
      prevGroups.map(group => ({
        ...group,
        items: group.items.map(item => 
          (item.type === itemToUpdate.type && item.data.id === itemToUpdate.data.id) 
            ? { ...item, date: date ?? item.date, time: time ?? item.time } 
            : item
        )
      }))
    );
  };

  const GURU_PLANS_TABLE = 'guru_plans';

  const fetchGuruPlans = useCallback(async () => {
    if (!authContext?.auth?.user?.id) { setSavedGuruPlans([]); return; }
    try {
      const { data, error } = await supabase
        .from(GURU_PLANS_TABLE)
        .select('*')
        .eq('user_id', authContext.auth.user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setSavedGuruPlans(data || []);
    } catch (error) {
      console.error('Error fetching guru plans:', error);
      setSavedGuruPlans([]);
    }
  }, [authContext?.auth?.user?.id]);

  useEffect(() => {
    fetchGuruPlans();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') fetchGuruPlans();
      if (event === 'SIGNED_OUT') {
        setSavedGuruPlans([]);
        setCurrentLoadedGuruPlanId(null);
        setGuruPlanNameForInput(defaultPlanName);
        setPlanGroups([]);
      }
    });
    return () => subscription.unsubscribe();
  }, [fetchGuruPlans, defaultPlanName]);

  const handleSaveOrUpdateGuruPlan = async (planName: string) => {
    if (!authContext?.auth?.user?.id) {
      alert(t('user_not_authenticated_error_message'));
      return;
    }
    const planDataToSave = {
        user_id: authContext.auth.user.id,
        title: planName.trim() || defaultPlanName,
        planned_event_items: planGroups, 
        start_date: selectedDateRange?.from ? format(selectedDateRange.from, 'yyyy-MM-dd') : null,
        end_date: selectedDateRange?.to ? format(selectedDateRange.to, 'yyyy-MM-dd') : null,
    };

    try {
      if (currentLoadedGuruPlanId) {
        const { error } = await supabase.from(GURU_PLANS_TABLE).update(planDataToSave).eq('id', currentLoadedGuruPlanId).eq('user_id', authContext.auth.user.id);
        if (error) throw error;
        alert(t('guru_plan_updated_successfully'));
      } else {
        const { data: insertedData, error } = await supabase.from(GURU_PLANS_TABLE).insert([planDataToSave]).select();
        if (error) throw error;
        if (insertedData && insertedData.length > 0) setCurrentLoadedGuruPlanId(insertedData[0].id);
        alert(t('guru_plan_saved_successfully'));
      }
      fetchGuruPlans();
    } catch (error) {
      console.error("Error saving/updating guru plan:", error);
      alert(t('error_saving_guru_plan'));
    }
  };
  
  const handleDeleteGuruPlan = async (planId: string) => {
    if (!authContext?.auth?.user?.id) { alert(t('user_not_authenticated_error_message')); return; }
    try {
      const { error } = await supabase.from(GURU_PLANS_TABLE).delete().eq('id', planId).eq('user_id', authContext.auth.user.id);
      if (error) throw error;
      setSavedGuruPlans(prev => prev.filter(p => p.id !== planId));
      if (currentLoadedGuruPlanId === planId) {
        setCurrentLoadedGuruPlanId(null);
        setGuruPlanNameForInput(defaultPlanName);
        setPlanGroups([]);
      }
      alert(t('guru_plan_deleted_successfully'));
    } catch (error) {
      console.error('Error deleting guru plan:', error);
      alert(t('error_deleting_guru_plan'));
    }
  };

  const handleLoadGuruPlan = async (planId: string) => {
    if (!authContext?.auth?.user?.id) { alert(t('user_not_authenticated_error_message')); return; }
    try {
      const { data: planFromDb, error } = await supabase.from(GURU_PLANS_TABLE).select('*').eq('id', planId).single();
      if (error) throw error;
      
      const loadedPlanGroups = planFromDb?.planned_event_items as EventGroup[] | undefined;

      if (!planFromDb || !loadedPlanGroups || !Array.isArray(loadedPlanGroups)) {
        console.warn('Loaded plan is corrupt or has no groups. Plan:', planFromDb);
        setPlanGroups([]); 
        alert(t('guru_plan_not_found'));
        return;
      }

      const allEventIds = loadedPlanGroups.flatMap(group => group.items.map(item => item.data.id));
      const uniqueEventIds = Array.from(new Set(allEventIds));
      const fetchedEventsData = uniqueEventIds.length > 0 ? await getEventsByIds(uniqueEventIds) : [];
      const fetchedEventsMap = new Map(fetchedEventsData?.map(e => [e.id, e]));

      const reconstructedGroups: EventGroup[] = loadedPlanGroups.map(group => ({
        ...group,
        items: group.items.map(itemStub => {
          const fullEventData = fetchedEventsMap.get(itemStub.data.id);
          return fullEventData ? {
            ...itemStub,
            data: fullEventData,
            date: itemStub.date ? (itemStub.date as string).split(' ')[0] : undefined,
          } : null;
        }).filter(Boolean) as PlannedItem[]
      })).filter(group => group.items.length > 0);
      
      setPlanGroups(reconstructedGroups.sort((a,b) => a.order - b.order));
      setCurrentLoadedGuruPlanId(planFromDb.id);
      setGuruPlanNameForInput(planFromDb.title || defaultPlanName);
      if (planFromDb.start_date || planFromDb.end_date) {
        setSelectedDateRange({from: planFromDb.start_date ? new Date(planFromDb.start_date) : undefined, to: planFromDb.end_date ? new Date(planFromDb.end_date) : undefined});
      } else {
        setSelectedDateRange(undefined); 
      }
    } catch (error) {
      console.error('Error loading guru plan:', error);
      alert(t('error_loading_guru_plan'));
    }
  };

  const handleReorder = (result: DropResult) => {
    const { source, destination, type } = result;
    console.log("DND Reorder Result:", result);

    if (!destination) {
      console.log("DND: No destination");
      return;
    }

    let newPlanGroups: EventGroup[] = JSON.parse(JSON.stringify(planGroups)); // Deep copy for manipulation

    if (type === 'group') {
      console.log("DND: Reordering GROUP");
      const [reorderedGroup] = newPlanGroups.splice(source.index, 1);
      newPlanGroups.splice(destination.index, 0, reorderedGroup);
      newPlanGroups = newPlanGroups.map((group, index) => ({ ...group, order: index }));
    } else if (type === 'event-item') {
      console.log("DND: Reordering EVENT_ITEM");
      const sourceGroupId = source.droppableId;
      const destinationGroupId = destination.droppableId;
      console.log(`Source Group ID: ${sourceGroupId}, Dest Group ID: ${destinationGroupId}`);

      const sourceGroupIndex = newPlanGroups.findIndex(g => g.id === sourceGroupId);
      const destinationGroupIndex = newPlanGroups.findIndex(g => g.id === destinationGroupId);
      console.log(`Source Group Index: ${sourceGroupIndex}, Dest Group Index: ${destinationGroupIndex}`);


      if (sourceGroupIndex === -1 || destinationGroupIndex === -1) {
        console.error("DND Error: Could not find source or destination group for item dnd");
        return;
      }

      if (sourceGroupId === destinationGroupId) {
        console.log("DND: Moving item WITHIN same group");
        const group = newPlanGroups[sourceGroupIndex];
        const newItems = Array.from(group.items);
        const [movedItem] = newItems.splice(source.index, 1);
        newItems.splice(destination.index, 0, movedItem);
        newPlanGroups[sourceGroupIndex] = {
          ...group,
          items: newItems.map((item, index) => ({ ...item, orderIndex: index }))
        };
      } else {
        console.log("DND: Moving item BETWEEN different groups");
        const sourceGroup = newPlanGroups[sourceGroupIndex];
        const destinationGroup = newPlanGroups[destinationGroupIndex];
        
        const newSourceItems = Array.from(sourceGroup.items);
        const [movedItem] = newSourceItems.splice(source.index, 1);
        
        // Update eventTypeField of the moved item to match the destination group
        // This assumes eventTypeField in Event data should change when group changes
        if (movedItem && movedItem.data && 'eventTypeField' in movedItem.data) {
            (movedItem.data as Event).eventTypeField = destinationGroup.id as EventType;
             console.log(`DND: Updated eventTypeField of moved item to ${destinationGroup.id}`);
        } else {
            console.warn("DND: Moved item or its data is missing eventTypeField property. Cannot update type.");
        }

        const newDestinationItems = Array.from(destinationGroup.items);
        newDestinationItems.splice(destination.index, 0, movedItem);

        newPlanGroups[sourceGroupIndex] = {
          ...sourceGroup,
          items: newSourceItems.map((item, index) => ({ ...item, orderIndex: index }))
        };
        newPlanGroups[destinationGroupIndex] = {
          ...destinationGroup,
          items: newDestinationItems.map((item, index) => ({ ...item, orderIndex: index }))
        };
        
        // Optional: Clean up empty source group and re-order groups
        // This part needs careful consideration based on desired UX
        // if (newPlanGroups[sourceGroupIndex].items.length === 0) {
        //   console.log("DND: Source group is now empty, removing it.");
        //   newPlanGroups.splice(sourceGroupIndex, 1);
        //   newPlanGroups = newPlanGroups.map((g: EventGroup, index: number) => ({ ...g, order: index }));
        // }
      }
    } else {
        console.log("DND: Unknown type", type);
    }
    console.log("DND: Setting new planGroups state:", JSON.parse(JSON.stringify(newPlanGroups)));
    setPlanGroups(newPlanGroups);
  };

  return (
    <>
      <GuruControls
        language={language}
        t={t}
        availableCities={availableCities}
        selectedCityIds={selectedCityIds}
        onSelectedCityIdsChange={setSelectedCityIds}
        selectedEventTypes={selectedEventTypes}
        onSelectedEventTypesChange={setSelectedEventTypes}
        hasTranslation={hasTranslation}
        onHasTranslationChange={setHasTranslation}
        selectedCultures={selectedCultures}
        onSelectedCulturesChange={setSelectedCultures}
        onAddFilteredEventsToPlan={handleAddFilteredEventsToPlan}
        onAddFavoritesToPlan={handleAddFavoriteEventsToPlan}
        selectedDateRange={selectedDateRange}
        onDateRangeChange={setSelectedDateRange}
        guruPlanNameValue={guruPlanNameForInput}
        onGuruPlanNameChange={setGuruPlanNameForInput}
        currentLoadedGuruPlanId={currentLoadedGuruPlanId}
        onSaveOrUpdateGuruPlan={handleSaveOrUpdateGuruPlan}
        onDeleteGuruPlan={handleDeleteGuruPlan}
        onLoadGuruPlan={handleLoadGuruPlan}
        savedGuruPlans={savedGuruPlans}
        eventDatesForCalendar={eventDatesForCalendar}
      />
      {isGuruPlanInitiated && (
        <div className="mt-8">
          <GuruPlanDisplay
              planGroups={planGroups}
              availableCities={availableCities} 
              language={language}
              t={t}
              eventCultureOptions={eventCultureOptions} // Pass eventCultureOptions as prop
              onUpdateDateTime={handleUpdatePlannedEventDateTime}
              onRemoveItem={handleRemovePlannedEvent}
              onReorder={handleReorder} 
          />
        </div>
      )}
    </>
  );
}
