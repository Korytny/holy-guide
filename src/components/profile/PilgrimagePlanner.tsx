
import { useEffect, useState, useCallback } from "react";
import { type AuthContextType } from "../../context/AuthContext";
import { type LanguageContextType } from "../../context/LanguageContext";
import { City, Place, Route, Event, Language, PlannedItem, Location } from "../../types";
import { getCities } from "../../services/citiesApi";
import { getPlacesByCityId } from "../../services/placesApi"; 
import { getEvents } from "../../services/eventsApi";
import { format, addDays, eachDayOfInterval } from "date-fns";
import { getCitiesByIds, fetchPlaceData, getRoutesByIds, getEventsByIds } from '../../services/api'; 
import { supabase } from '../../integrations/supabase/client';

import { PilgrimagePlannerControls, PlaceSubtype, EventSubtype } from "./PilgrimagePlannerControls";
import { PilgrimagePlanDisplay } from "./PilgrimagePlanDisplay";
import PilgrimageRouteMap from "./PilgrimageRouteMap";

const placeTypeNumberToSubtypeString: Record<number, PlaceSubtype | undefined> = {
  1: 'temple',
  2: 'samadhi',
  3: 'kunda',
  4: 'sacred_site',
};

interface PilgrimagePlannerProps {
  auth: AuthContextType;
  language: Language;
  t: LanguageContextType['t'];
  onItemsChange?: (items: PlannedItem[]) => void;
}

interface CitySuggestionState {
  places: Place[];
  currentIndex: number;
  fullyLoaded: boolean;
}

const getRandomTime = () => {
  const hour = Math.floor(Math.random() * 12) + 8;
  const minute = Math.floor(Math.random() * 4) * 15;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

const getNextOrderIndex = (items: PlannedItem[]): number => {
  if (items.length === 0) return 0;
  return Math.max(...items.map(item => item.orderIndex)) + 1;
};

export const PilgrimagePlanner: React.FC<PilgrimagePlannerProps> = ({ auth: authContext, language, t, onItemsChange }) => {
  const [availableCities, setAvailableCities] = useState<City[]>([]);
  const [stagedForPlanningCities, setStagedForPlanningCities] = useState<City[]>([]);
  const [plannedItems, setPlannedItems] = useState<PlannedItem[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<import("react-day-picker").DateRange | undefined>(undefined);
  const [sortedItemsForDisplay, setSortedItemsForDisplay] = useState<PlannedItem[]>([]);
  const [isPlanInitiated, setIsPlanInitiated] = useState<boolean>(false);
  const [cityPlaceSuggestions, setCityPlaceSuggestions] = useState<Record<string, CitySuggestionState>>({});
  const [savedGoals, setSavedGoals] = useState<any[]>([]);
  const [goalNameForInput, setGoalNameForInput] = useState('');
  const [currentLoadedGoalId, setCurrentLoadedGoalId] = useState<string | null>(null);
  const [filterControlSelectedCityIds, setFilterControlSelectedCityIds] = useState<string[]>([]); 
 
  const [selectedPlaceSubtypes, setSelectedPlaceSubtypes] = useState<PlaceSubtype[]>(['temple']);
  const [selectedEventSubtypes, setSelectedEventSubtypes] = useState<EventSubtype[]>(['practice', 'retreat', 'vipassana']);

  const [availablePlaces, setAvailablePlaces] = useState<Place[]>([]);
  const [availableEvents, setAvailableEvents] = useState<Event[]>([]);
  
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);

  const [isLoadingCities, setIsLoadingCities] = useState(true);
  const [isLoadingPlacesAndEvents, setIsLoadingPlacesAndEvents] = useState(true);

  useEffect(() => {
    if (onItemsChange) {
      onItemsChange(plannedItems);
    }
  }, [plannedItems, onItemsChange]);

  useEffect(() => {
    const fetchInitialCities = async () => {
      setIsLoadingCities(true);
      const cities = await getCities();
      if (cities) {
        setAvailableCities(cities);
        const rishikeshCity = cities.find(city => 
          city.name?.en?.toLowerCase() === "rishikesh" || 
          city.name?.ru === "Решикешь"
        );
        if (rishikeshCity) {
          setFilterControlSelectedCityIds([rishikeshCity.id]);
        }
      }
      setIsLoadingCities(false);
    };
    fetchInitialCities();
  }, []); 

  useEffect(() => {
    const finalSortedList = [...plannedItems].sort((a, b) => a.orderIndex - b.orderIndex);
    setSortedItemsForDisplay(finalSortedList);
    setIsPlanInitiated(finalSortedList.length > 0);
  }, [plannedItems]);

  useEffect(() => {
    const fetchAllAvailableData = async () => {
      if (isLoadingCities) { // Wait for cities to be loaded first
        setIsLoadingPlacesAndEvents(true); // Ensure this is true if cities are still loading
        return;
      }
      if (availableCities.length === 0) { // No cities found, nothing to fetch for
        setAvailablePlaces([]);
        setAvailableEvents([]);
        setIsLoadingPlacesAndEvents(false);
        return;
      }

      setIsLoadingPlacesAndEvents(true);
      const allEventsPromise = getEvents();
      
      const placesPromises = availableCities.map(city => getPlacesByCityId(city.id));
      const allPlacesNested = await Promise.all(placesPromises);
      const allPlacesAccumulated = allPlacesNested.flat().filter(p => p); // Filter out any null/undefined results from getPlacesByCityId

      const allEvents = await allEventsPromise;

      setAvailableEvents(allEvents || []);
      const uniquePlaces = Array.from(new Map(allPlacesAccumulated.map(p => [p.id, p])).values());
      setAvailablePlaces(uniquePlaces);
      setIsLoadingPlacesAndEvents(false);
    };
    
    fetchAllAvailableData();
  }, [availableCities, isLoadingCities]);

  useEffect(() => {
    let cityIdsToConsider: Set<string>;
    if (filterControlSelectedCityIds.length === 0) {
      cityIdsToConsider = new Set(availableCities.map(c => c.id)); // All available cities
    } else {
      cityIdsToConsider = new Set(filterControlSelectedCityIds); // Specific cities from filter
    }

    let tempFilteredPlaces: Place[] = []; 

    if (availablePlaces.length > 0 && cityIdsToConsider.size > 0) {
      tempFilteredPlaces = availablePlaces.filter(p => {
        if (!cityIdsToConsider.has(p.cityId)) return false; 
        
        if (selectedPlaceSubtypes.length === 0) return true; // No subtype filter: include all from considered cities

        // Subtype filter active:
        if (p.type === undefined) return false; // Place must have a type to match subtype filter
        const subtypeString = placeTypeNumberToSubtypeString[p.type];
        return subtypeString && selectedPlaceSubtypes.includes(subtypeString); 
      });
    }
    setFilteredPlaces(tempFilteredPlaces);
  }, [availablePlaces, selectedPlaceSubtypes, filterControlSelectedCityIds, availableCities]);

  useEffect(() => {
    let cityIdsToConsider: Set<string>;
    if (filterControlSelectedCityIds.length === 0) {
      cityIdsToConsider = new Set(availableCities.map(c => c.id)); // All available cities
    } else {
      cityIdsToConsider = new Set(filterControlSelectedCityIds); // Specific cities from filter
    }

    let tempFilteredEvents: Event[] = []; 

    if (availableEvents.length > 0 && cityIdsToConsider.size > 0) {
      tempFilteredEvents = availableEvents.filter(e => {
        if (!cityIdsToConsider.has(e.cityId)) return false;

        if (selectedEventSubtypes.length === 0) return true; // No subtype filter: include all from considered cities
        
        return e.eventTypeField && selectedEventSubtypes.includes(e.eventTypeField);
      });
    }
    setFilteredEvents(tempFilteredEvents);
  }, [availableEvents, selectedEventSubtypes, filterControlSelectedCityIds, availableCities]);


  const handleAddFilteredItemsToPlan = () => {
    const onlyCitiesSelected =
      filterControlSelectedCityIds.length > 0 &&
      selectedPlaceSubtypes.length === 0 &&
      selectedEventSubtypes.length === 0;

    let itemsForPlan: PlannedItem[] = [];

    if (onlyCitiesSelected) {
      // Случай 1: Выбраны только города в фильтре, категории (подтипы мест/событий) не выбраны.
      // Добавляем только сами объекты городов в план.
      const cityItemsToAdd = availableCities
        .filter(city => filterControlSelectedCityIds.includes(city.id))
        .map((cityData) => ({ // index убран, orderIndex будет назначен в конце
          type: 'city' as 'city',
          data: cityData,
          city_id_for_grouping: cityData.id,
          time: getRandomTime(),
          orderIndex: 0, // Placeholder
        }));
      itemsForPlan = cityItemsToAdd;

      if (itemsForPlan.length === 0) {
        // Это может произойти, если filterControlSelectedCityIds содержал ID, которых нет в availableCities
        alert(t('no_cities_selected_or_found', { defaultValue: 'Selected cities were not found.' }));
        setPlannedItems([]); // Очищаем план
        return;
      }
    } else {
      // Случай 2: Выбраны города И категории, ИЛИ только категории (фильтр по всем городам),
      // ИЛИ вообще ничего не выбрано в контролах (тогда filteredPlaces/Events будут содержать все из всех городов).

      // filteredPlaces и filteredEvents уже обновлены через useEffects на основе
      // filterControlSelectedCityIds, selectedPlaceSubtypes, selectedEventSubtypes.

      const newPlaceItems: PlannedItem[] = filteredPlaces.map((place) => ({
        type: 'place',
        data: place,
        city_id_for_grouping: place.cityId,
        time: getRandomTime(),
        orderIndex: 0, // Placeholder
      }));

      const newEventItems: PlannedItem[] = filteredEvents.map((event) => ({
        type: 'event',
        data: event,
        city_id_for_grouping: event.cityId,
        time: event.time || getRandomTime(),
        orderIndex: 0, // Placeholder
        date: event.date ? event.date.split('T')[0] : undefined,
      }));

      const allNewSubItems = [...newPlaceItems, ...newEventItems];

      // Если выбраны города в контролах, но по категориям для них ничего не нашлось
      if (allNewSubItems.length === 0 && filterControlSelectedCityIds.length > 0) {
        alert(t('no_items_match_filters_for_selected_cities', { defaultValue: 'No places or events match the category filters for the selected cities.' }));
        // Решаем, что делать: можно очистить план, или добавить только города.
        // По ТЗ, если категории выбраны, то должны быть объекты категорий.
        // Если ничего не нашлось, то план будет пуст.
        setPlannedItems([]);
        return;
      }
      
      // Если sub-элементы (места/события) найдены, или если фильтр по городам был пуст (поиск по всем городам)
      // и нашлись какие-то места/события по категориям.
      if (allNewSubItems.length > 0) {
        const cityIdsOfNewSubItems = new Set<string>();
        allNewSubItems.forEach(item => {
          if (item.city_id_for_grouping) {
            cityIdsOfNewSubItems.add(item.city_id_for_grouping);
          }
        });

        const cityItemsForNewPlan: PlannedItem[] = [];
        // Определяем пул городов для поиска родительских:
        // если в контролах выбраны города - то только они, иначе - все доступные.
        const sourceCityPool = filterControlSelectedCityIds.length > 0
          ? availableCities.filter(c => filterControlSelectedCityIds.includes(c.id))
          : availableCities;
        
        sourceCityPool.forEach(cityData => {
          if (cityIdsOfNewSubItems.has(cityData.id)) {
            cityItemsForNewPlan.push({
              type: 'city',
              data: cityData,
              city_id_for_grouping: cityData.id,
              time: getRandomTime(),
              orderIndex: 0, // Placeholder
            });
          }
        });
        itemsForPlan = [...cityItemsForNewPlan, ...allNewSubItems];
      } else {
        // Сюда мы можем попасть, если:
        // 1. filterControlSelectedCityIds пуст (все города) И selectedPlaceSubtypes/selectedEventSubtypes пусты (все категории)
        //    ИЛИ availablePlaces/availableEvents пусты.
        // 2. filterControlSelectedCityIds пуст, категории выбраны, но ничего не нашлось по категориям во всех городах.
        // В этом случае, если пользователь нажал "Найти" без указания конкретных городов и категорий,
        // возможно, он ожидает увидеть все города.
        // Однако, если категории были выбраны, но ничего не нашлось, то сообщение об этом.
        if (selectedPlaceSubtypes.length > 0 || selectedEventSubtypes.length > 0) {
             alert(t('no_items_match_current_filters', { defaultValue: 'No items match the current filters.' }));
        } else {
            // Если вообще ничего не выбрано (ни городов, ни категорий), и мы хотим добавить все города
            // Это поведение отличается от "только город выбран в фильтре".
            // Если здесь нужно добавить ВСЕ города, то:
            // itemsForPlan = availableCities.map((cityData) => ({ ... }));
            // Пока оставим так: если ничего не найдено по фильтрам (даже пустым), то ничего не добавляем.
            // Пользователь сказал: "если ничего не выбрано, то попадает все" - это поведение мы меняем.
            // Новое поведение: если ничего не выбрано в контролах (города, категории), то кнопка "Найти"
            // не должна добавлять "все подряд". Она должна добавлять согласно фильтрам.
            // Если фильтры пусты, и мы здесь, значит filteredPlaces и filteredEvents пусты.
             alert(t('no_items_match_current_filters_or_no_filters_applied', { defaultValue: 'No items match the current filters, or no filters were applied to yield results.' }));
        }
        setPlannedItems([]);
        return;
      }
    }

    // Общая логика для установки отсортированного плана
    // Сортируем так, чтобы города шли первыми, затем их дочерние элементы.
    // Внутри дочерних элементов можно добавить доп. сортировку, если необходимо.
    let currentOrderIndex = 0;
    const finalSortedItems = itemsForPlan
      .sort((a, b) => {
        if (a.type === 'city' && b.type !== 'city') return -1;
        if (a.type !== 'city' && b.type === 'city') return 1;
        
        // Если оба не города или оба города, группируем по city_id_for_grouping
        if (a.city_id_for_grouping && b.city_id_for_grouping) {
          const cityGroupCompare = a.city_id_for_grouping.localeCompare(b.city_id_for_grouping);
          if (cityGroupCompare !== 0) return cityGroupCompare;
        }
        // Если типы одинаковые и городская группа одинаковая, можно добавить сортировку по имени или типу элемента
        // Например, сначала места, потом события внутри одной городской группы
        if (a.type === 'place' && b.type === 'event') return -1;
        if (a.type === 'event' && b.type === 'place') return 1;
        
        return 0; // Сохраняем исходный порядок, если другие критерии равны
      })
      .map(item => ({ ...item, orderIndex: currentOrderIndex++ }));
    
    setPlannedItems(finalSortedItems);
  };

  const handleAddPlacesForCity = async (cityId: string) => {
    let currentSuggestions = cityPlaceSuggestions[cityId];
    if (!currentSuggestions || !currentSuggestions.fullyLoaded) {
      try {
        const placesData = await getPlacesByCityId(cityId);
        if (!placesData) throw new Error("Failed to fetch places.");
        const sortedPlaces = [...placesData].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        currentSuggestions = { places: sortedPlaces, currentIndex: 0, fullyLoaded: true };
        setCityPlaceSuggestions(prev => ({ ...prev, [cityId]: currentSuggestions! }));
      } catch (error) {
        console.error("Error fetching or sorting places for city:", cityId, error);
        alert(t('error_fetching_places_for_city', { city: cityId, defaultValue: `Error fetching places for city ${cityId}.`}));
        return;
      }
    }

    let placeToAdd: Place | null = null;
    let nextIndex = currentSuggestions.currentIndex;
    const plannedPlaceIdsForCity = new Set(
        plannedItems
            .filter(item => item.type === 'place' && item.city_id_for_grouping === cityId)
            .map(item => item.data.id)
    );

    while (nextIndex < currentSuggestions.places.length) {
      const candidatePlace = currentSuggestions.places[nextIndex];
      if (!plannedPlaceIdsForCity.has(candidatePlace.id)) {
        placeToAdd = candidatePlace;
        break;
      }
      nextIndex++;
    }

    if (placeToAdd) {
      const dateOfCity = plannedItems.find(item => item.type === 'city' && item.data.id === cityId)?.date;
      const newPlannedItem: PlannedItem = {
        type: 'place',
        data: placeToAdd,
        city_id_for_grouping: cityId,
        time: getRandomTime(),
        date: dateOfCity,
        orderIndex: getNextOrderIndex(plannedItems),
      };
      setPlannedItems(prevItems => [...prevItems, newPlannedItem]);
      setCityPlaceSuggestions(prev => ({
        ...prev,
        [cityId]: { ...currentSuggestions!, currentIndex: nextIndex + 1 },
      }));
    } else {
      alert(t('no_more_places_to_add_for_city', {city: cityId, defaultValue: `No more available places to add for this city.`}));
    }
  };

  const handleDistributeDates = () => {
    if (!selectedDateRange || !selectedDateRange.from) {
      alert(t('please_select_date_range_first'));
      return;
    }
    const cityItemsInPlan = plannedItems.filter(item => item.type === 'city');
    if (cityItemsInPlan.length === 0) {
      alert(t('please_add_cities_to_plan_first'));
      return;
    }
    const startDate = selectedDateRange.from;
    const endDate = selectedDateRange.to || selectedDateRange.from;
    const intervalDays = eachDayOfInterval({ start: startDate, end: endDate });
    if (intervalDays.length === 0) return;
    const updatedPlannedItems = plannedItems.map(pItem => ({ ...pItem }));
    let dayIndex = 0;
    cityItemsInPlan.forEach(cityItem => {
      const targetDate = intervalDays[dayIndex % intervalDays.length];
      const cityItemInUpdateArray = updatedPlannedItems.find(pi => pi.data.id === cityItem.data.id && pi.type === 'city');
      if (cityItemInUpdateArray) {
          cityItemInUpdateArray.date = format(targetDate, 'yyyy-MM-dd');
      }
      updatedPlannedItems.forEach(item => {
          if (item.city_id_for_grouping === cityItem.data.id && !item.date) { 
              item.date = format(targetDate, 'yyyy-MM-dd');
          }
      });
      dayIndex++;
    });
    setPlannedItems(updatedPlannedItems);
  };

  const handleStageCityForPlanning = (cityId: string) => {
    const selectedCity = availableCities.find(city => city.id === cityId);
    if (selectedCity) {
      setStagedForPlanningCities(prevStagedCities => {
        if (!prevStagedCities.some(city => city.id === selectedCity.id)) {
          return [...prevStagedCities, selectedCity];
        }
        return prevStagedCities;
      });
    }
  };

  const handleRemoveStagedCity = (cityId: string) => {
    setStagedForPlanningCities(prevStagedCities => prevStagedCities.filter(city => city.id !== cityId));
  };

  const handleAddStagedCitiesToMainPlan = () => {
    let currentOrderIndex = getNextOrderIndex(plannedItems);
    const newItemsForPlan: PlannedItem[] = stagedForPlanningCities.map(city => ({
      type: 'city',
      data: city,
      city_id_for_grouping: city.id,
      time: getRandomTime(),
      orderIndex: currentOrderIndex++, 
    }));

    if (newItemsForPlan.length > 0) {
        setPlannedItems(prevItems => {
            const currentCityItemIds = new Set(prevItems.filter(i => i.type === 'city').map(item => item.data.id));
            const uniqueNewCityItems = newItemsForPlan.filter(newItem => !currentCityItemIds.has(newItem.data.id));
            return [...prevItems, ...uniqueNewCityItems];
        });
        setStagedForPlanningCities([]); 
    }
  };

  const handleRemovePlannedItem = (itemToRemove: PlannedItem) => {
    let itemsAfterRemoval = plannedItems.filter(item => 
      !(item.type === itemToRemove.type && item.data.id === itemToRemove.data.id)
    );

    if (itemToRemove.type === 'city') {
      const cityIdToRemove = itemToRemove.data.id;
      itemsAfterRemoval = itemsAfterRemoval.filter(item => 
        item.city_id_for_grouping !== cityIdToRemove
      );
    }
    
    const reIndexedItems = itemsAfterRemoval.map((item, index) => ({ ...item, orderIndex: index }));
    setPlannedItems(reIndexedItems);

    if (reIndexedItems.length === 0) { 
        if(currentLoadedGoalId){
            setCurrentLoadedGoalId(null);
            setGoalNameForInput('');
        }
        // Also clear filters and date range if the plan becomes completely empty
        setSelectedPlaceSubtypes([]);
        setSelectedEventSubtypes([]);
        setSelectedDateRange(undefined);
        // cityPlaceSuggestions are per-city, so they don't need global clear here
    }
  };

  const handleDateRangeChange = (range: import("react-day-picker").DateRange | undefined) => setSelectedDateRange(range);

  const handleUpdatePlannedItemDateTime = (itemToUpdate: PlannedItem, date?: string, time?: string) => {
    setPlannedItems(prevItems =>
      prevItems.map(item => 
        (item.type === itemToUpdate.type && item.data.id === itemToUpdate.data.id) 
          ? { ...item, date: date ?? item.date, time: time ?? item.time } 
          : item
      )
    );
  };

  const handleClearPlan = () => {
    setPlannedItems([]);
    setSelectedDateRange(undefined);
    setStagedForPlanningCities([]);
    setGoalNameForInput('');
    setCurrentLoadedGoalId(null);
    setSelectedPlaceSubtypes([]);
    setSelectedEventSubtypes([]);
    setFilteredPlaces([]);
    setFilteredEvents([]);
    setCityPlaceSuggestions({});
  };

  const fetchGoals = useCallback(async () => {
     try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        setSavedGoals([]);
        return;
      }
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching goals:', error);
        setSavedGoals([]);
        return;
      }
      if (data) {
        setSavedGoals(data);
      }
    } catch (error) {
      console.error('Error in fetchGoals:', error);
      setSavedGoals([]);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || (event === 'INITIAL_SESSION' && session)) {
        fetchGoals();
        // Do not clear plan here, allow loading saved goal first
        // setSelectedPlaceSubtypes([]); // Cleared by handleLoadGoal or handleClearPlan
        // setSelectedEventSubtypes([]);
      } else if (event === 'SIGNED_OUT') {
        handleClearPlan(); 
        setSavedGoals([]); 
      }
    });
    return () => subscription.unsubscribe();
  }, [fetchGoals]); // handleClearPlan is stable, no need to add as dependency if defined outside or via useCallback

  const handleSaveOrUpdateGoal = async (currentGoalName: string) => {
    if (!authContext?.auth?.user?.id) {
      alert(t('user_not_authenticated_error_message', {defaultValue: 'User not authenticated.'}));
      return;
    }
    const itemsToSave = plannedItems.map((item, index) => ({
      ...item,
      orderIndex: item.orderIndex ?? index 
    }));
    const goalData = {
        user_id: authContext.auth.user.id,
        title: currentGoalName.trim() || `Паломничество ${format(new Date(), 'dd.MM.yyyy')}`,
        planned_items: itemsToSave.map(pi => ({ 
            type: pi.type, 
            data_id: pi.data.id,
            city_id_for_grouping: pi.city_id_for_grouping,
            date: pi.date,
            time: pi.time,
            orderIndex: pi.orderIndex,
            name: (pi.data as any).name, 
            location: pi.type === 'place' || pi.type === 'event' ? (pi.data as Place | Event).location : undefined
        })),
        start_date: selectedDateRange?.from ? format(selectedDateRange.from, 'yyyy-MM-dd') : null,
        end_date: selectedDateRange?.to ? format(selectedDateRange.to, 'yyyy-MM-dd') : null,
        selected_place_subtypes: selectedPlaceSubtypes,
        selected_event_subtypes: selectedEventSubtypes,
      };

    try {
      if (currentLoadedGoalId) {
        const { error } = await supabase.from('goals').update(goalData).eq('id', currentLoadedGoalId).eq('user_id', authContext.auth.user.id);
        if (error) throw error;
        alert(t('goal_updated_successfully', {defaultValue: 'Goal updated successfully.'}));
      } else {
        const { data: insertedGoal, error } = await supabase.from('goals').insert([goalData]).select();
        if (error) throw error;
        if (insertedGoal && insertedGoal.length > 0) {
            setCurrentLoadedGoalId(insertedGoal[0].id);
        }
        alert(t('goal_saved_successfully'));
      }
      fetchGoals();
    } catch (error) {
      console.error("Error saving/updating goal:", error);
      alert(t('error_saving_goal'));
    }
  };
  
  const handleDeleteGoal = async (goalId: string) => {
    if (!authContext?.auth?.user?.id) {
        alert(t('user_not_authenticated_error_message', {defaultValue: 'User not authenticated.'}));
        return;
    }
    try {
        const { error } = await supabase.from('goals').delete().eq('user_id', authContext.auth.user.id).eq('id', goalId);
        if (error) throw error;
        setSavedGoals(prevGoals => prevGoals.filter(goal => goal.id !== goalId));
        if (currentLoadedGoalId === goalId) {
          handleClearPlan();
        }
        alert(t('goal_deleted_successfully'));
    } catch (error) {
        console.error('Error deleting goal:', error);
        alert(t('error_deleting_goal'));
    }
  };

  const handleLoadGoal = async (goalId: string) => {
    try {
      const { data: goal, error } = await supabase.from('goals').select('*').eq('id', goalId).single();
      if (error || !goal) {
        alert(t('goal_not_found', {defaultValue: 'Goal not found or data is corrupt.'}));
        return;
      }
      
      const loadedPlannedItemsStubs = goal.planned_items || [];
      const reconstructedItems: PlannedItem[] = [];
      const itemFetchPromises = loadedPlannedItemsStubs.map(async (itemStub: any) => {
        let fullData: City | Place | Route | Event | null = null;
        try {
            if (itemStub.type === 'city') fullData = (await getCitiesByIds([itemStub.data_id]))?.[0];
            else if (itemStub.type === 'place') fullData = (await fetchPlaceData([itemStub.data_id]))?.[0];
            else if (itemStub.type === 'route') fullData = (await getRoutesByIds([itemStub.data_id]))?.[0];
            else if (itemStub.type === 'event') fullData = (await getEventsByIds([itemStub.data_id]))?.[0];
        } catch (fetchError) {
            console.error(`Failed to fetch data for ${itemStub.type} ID ${itemStub.data_id}:`, fetchError);
        }
        
        if (fullData) {
            reconstructedItems.push({
                type: itemStub.type,
                data: fullData,
                city_id_for_grouping: itemStub.city_id_for_grouping,
                date: itemStub.date,
                time: itemStub.time,
                orderIndex: itemStub.orderIndex
            } as PlannedItem);
        } else {
            console.warn(`Could not reconstruct full data for ${itemStub.type} ID ${itemStub.data_id}. Item might be missing or API failed.`);
        }
      });
      await Promise.all(itemFetchPromises);
      
      reconstructedItems.sort((a,b) => (a.orderIndex ?? Infinity) - (b.orderIndex ?? Infinity));

      setPlannedItems(reconstructedItems);
      setIsPlanInitiated(reconstructedItems.length > 0);
      setCurrentLoadedGoalId(goal.id);
      setGoalNameForInput(goal.title || '');
      
      if (goal.start_date || goal.end_date) {
        setSelectedDateRange({
          from: goal.start_date ? new Date(goal.start_date) : undefined,
          to: goal.end_date ? new Date(goal.end_date) : undefined
        });
      } else {
        setSelectedDateRange(undefined); 
      }
      setSelectedPlaceSubtypes(goal.selected_place_subtypes || []);
      setSelectedEventSubtypes(goal.selected_event_subtypes || []);

    } catch (error) {
      console.error('Error loading goal:', error);
      alert(t('error_loading_goal', {defaultValue: 'Error loading goal. Please check console.'}));
    }
  };

  const handleAddFavoritesToPlan = async () => {
    if (!authContext?.auth?.user) {
      console.error("User data not available for adding favorites"); return;
    }
    const { cities_like, places_like, routes_like, events_like } = authContext.auth.user;
    const itemsToAdd: PlannedItem[] = [];
    const cityDatesMap = new Map<string, string | undefined>();
    plannedItems.forEach(item => {
      if (item.type === 'city' && item.date) {
        cityDatesMap.set(item.data.id, item.date);
      }
    });

    let currentFavOrderIndex = getNextOrderIndex(plannedItems);
    const existingItemSignatures = new Set(plannedItems.map(pi => `${pi.type}-${pi.data.id}`));

    if (cities_like && cities_like.length > 0) {
      const favCities = await getCitiesByIds(cities_like);
      favCities.forEach(city => {
        if (!existingItemSignatures.has(`city-${city.id}`)) {
          itemsToAdd.push({ type: 'city', data: city, city_id_for_grouping: city.id, time: getRandomTime(), orderIndex: currentFavOrderIndex++ });
        }
      });
    }
    if (places_like && places_like.length > 0) {
      const favPlaces = await fetchPlaceData(places_like);
      favPlaces.forEach(place => {
         if (!existingItemSignatures.has(`place-${place.id}`)) {
            itemsToAdd.push({ type: 'place', data: place, city_id_for_grouping: place.cityId, time: getRandomTime(), date: cityDatesMap.get(place.cityId), orderIndex: currentFavOrderIndex++ });
        }
      });
    }
    if (routes_like && routes_like.length > 0) {
      const favRoutes = await getRoutesByIds(routes_like);
      favRoutes.forEach(route => {
        if (!existingItemSignatures.has(`route-${route.id}`)) {
            itemsToAdd.push({ type: 'route', data: route, city_id_for_grouping: route.cityId, time: getRandomTime(), date: cityDatesMap.get(route.cityId), orderIndex: currentFavOrderIndex++ });
        }
      });
    }
    if (events_like && events_like.length > 0) {
      const favEvents = await getEventsByIds(events_like);
      favEvents.forEach(event => {
        if (!existingItemSignatures.has(`event-${event.id}`)) {
            itemsToAdd.push({ type: 'event', data: event, city_id_for_grouping: event.cityId, time: event.time || getRandomTime(), date: cityDatesMap.get(event.cityId), orderIndex: currentFavOrderIndex++ });
        }
      });
    }
    
    if (itemsToAdd.length > 0) {
        setPlannedItems(prevItems => [...prevItems, ...itemsToAdd].sort((a,b) => a.orderIndex - b.orderIndex));
    }
  };
  
  const handlePlannedItemsReorder = (newlyOrderedItems: PlannedItem[]) => {
    const finalItems = newlyOrderedItems.map((item, index) => ({ ...item, orderIndex: index }));
    setPlannedItems(finalItems);
  };

  return (
    <>
      <PilgrimagePlannerControls
        availableCities={availableCities}
        filterSelectedCityIds={filterControlSelectedCityIds} // Pass state to controls
        onFilterSelectedCityIdsChange={setFilterControlSelectedCityIds} // Pass setter to controls
        plannedItems={plannedItems} 
        selectedDateRange={selectedDateRange} 
        language={language}
        t={t}
        onDateRangeChange={handleDateRangeChange}
        // onCitySelect, onRemoveStagedCity, onAddStagedCities removed as they are not in PilgrimagePlannerControlsProps
        onAddFavoritesToPlan={handleAddFavoritesToPlan}
        onDistributeDates={handleDistributeDates}
        goalNameValue={goalNameForInput}
        onGoalNameChange={setGoalNameForInput}
        currentLoadedGoalId={currentLoadedGoalId}
        onSaveOrUpdateGoal={handleSaveOrUpdateGoal}
        onLoadGoal={handleLoadGoal}
        onDeleteGoal={handleDeleteGoal}
        savedGoals={savedGoals}
        selectedPlaceSubtypes={selectedPlaceSubtypes}
        selectedEventSubtypes={selectedEventSubtypes}
        onSelectedPlaceSubtypesChange={setSelectedPlaceSubtypes} 
        onSelectedEventSubtypesChange={setSelectedEventSubtypes} 
        onAddFilteredItemsToPlan={handleAddFilteredItemsToPlan}
        onClearPlan={handleClearPlan}
        isLoadingData={isLoadingCities || isLoadingPlacesAndEvents} // Pass combined loading state
      />
      {(isLoadingCities || isLoadingPlacesAndEvents) && <div className="text-center p-4">{t('loading_data', { defaultValue: 'Loading data...'})}</div>}
      {!isLoadingCities && !isLoadingPlacesAndEvents && isPlanInitiated && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"> 
          <div className="md:col-span-1"> 
            <PilgrimagePlanDisplay
                plannedItems={sortedItemsForDisplay}
                language={language}
                t={t}
                onUpdateDateTime={handleUpdatePlannedItemDateTime}
                onRemoveItem={handleRemovePlannedItem} 
                onAddPlacesForCity={handleAddPlacesForCity}
                onReorderItems={handlePlannedItemsReorder}
            />
          </div>
          <div className="md:col-span-1"> 
            {plannedItems.length > 0 && (
              <PilgrimageRouteMap plannedItems={sortedItemsForDisplay} /> 
            )}
          </div>
        </div>
      )}
    </>
  );
}
