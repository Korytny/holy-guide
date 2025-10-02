import { useState, useCallback, useEffect } from "react";
import { type AuthContextType } from "@/context/AuthContext";
import { type LanguageContextType } from "@/context/LanguageContext";
import { City, Place, Route, Event, Language, PlannedItem } from "@/types";
import { format, addDays, eachDayOfInterval } from "date-fns";
import { getCitiesByIds, fetchPlaceData, getRoutesByIds, getEventsByIds } from '@/services/api';
import { getPlacesByRouteId } from '@/services/placesApi';
import { supabase } from '@/integrations/supabase/client';
import { getLocalizedText } from '@/utils/languageUtils';

interface CitySuggestionState {
  places: Place[];
  currentIndex: number;
  fullyLoaded: boolean;
}

// Хук для управления состоянием
export const usePilgrimagePlannerState = () => {
  const [availableCities, setAvailableCities] = useState<City[]>([]);
  const [stagedForPlanningCities, setStagedForPlanningCities] = useState<City[]>([]);
  const [plannedItems, setPlannedItems] = useState<PlannedItem[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<any>(undefined);
  const [sortedItemsForDisplay, setSortedItemsForDisplay] = useState<PlannedItem[]>([]);
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  const [cityPlaceSuggestions, setCityPlaceSuggestions] = useState<Record<string, CitySuggestionState>>({});
  const [savedGoals, setSavedGoals] = useState<any[]>([]);
  const [goalNameForInput, setGoalNameForInput] = useState('');
  const [currentLoadedGoalId, setCurrentLoadedGoalId] = useState<string | null>(null);
  const [filterControlSelectedCityIds, setFilterControlSelectedCityIds] = useState<string[]>([]); 
  const [selectedPlaceSubtypes, setSelectedPlaceSubtypes] = useState<any[]>(['temple', 'samadhi', 'kunda', 'sacred_site']);
  const [selectedEventSubtypes, setSelectedEventSubtypes] = useState<any[]>(['festival', 'practice', 'retreat', 'vipassana', 'puja', 'lecture', 'guru_festival', 'visit']);
  const [availablePlaces, setAvailablePlaces] = useState<Place[]>([]);
  const [availableEvents, setAvailableEvents] = useState<Event[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [availableRoutes, setAvailableRoutes] = useState<Route[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [selectedRoutePlaces, setSelectedRoutePlaces] = useState<Place[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(true);
  const [isLoadingPlacesAndEvents, setIsLoadingPlacesAndEvents] = useState(true);

  // Эффект для сортировки элементов для отображения
  useEffect(() => {
    const finalSortedList = [...plannedItems].sort((a, b) => a.orderIndex - b.orderIndex);
    setSortedItemsForDisplay(finalSortedList);
  }, [plannedItems]);

  return {
    // Состояние
    availableCities,
    plannedItems,
    selectedDateRange,
    sortedItemsForDisplay,
    showSearchResults,
    filterControlSelectedCityIds,
    selectedPlaceSubtypes,
    selectedEventSubtypes,
    availablePlaces,
    availableEvents,
    filteredPlaces,
    filteredEvents,
    availableRoutes,
    filteredRoutes,
    selectedRoute,
    selectedRoutePlaces,
    isLoadingCities,
    isLoadingPlacesAndEvents,
    savedGoals,
    goalNameForInput,
    currentLoadedGoalId,
    cityPlaceSuggestions,
    stagedForPlanningCities,

    // Сеттеры состояния
    setAvailableCities,
    setPlannedItems,
    setSelectedDateRange,
    setShowSearchResults,
    setFilterControlSelectedCityIds,
    setSelectedPlaceSubtypes,
    setSelectedEventSubtypes,
    setAvailablePlaces,
    setAvailableEvents,
    setFilteredPlaces,
    setFilteredEvents,
    setAvailableRoutes,
    setFilteredRoutes,
    setSelectedRoute,
    setSelectedRoutePlaces,
    setIsLoadingCities,
    setIsLoadingPlacesAndEvents,
    setSavedGoals,
    setGoalNameForInput,
    setCurrentLoadedGoalId,
    setCityPlaceSuggestions,
    setStagedForPlanningCities
  };
};

// Хук для обработчиков
interface UsePilgrimagePlannerHandlersProps {
  authContext: AuthContextType;
  language: Language;
  t: LanguageContextType['t'];
  toast: any;
  // Состояние
  availableCities: City[];
  plannedItems: PlannedItem[];
  selectedDateRange: any;
  filterControlSelectedCityIds: string[];
  selectedPlaceSubtypes: any[];
  selectedEventSubtypes: any[];
  availablePlaces: Place[];
  availableEvents: Event[];
  filteredPlaces: Place[];
  filteredEvents: Event[];
  availableRoutes: Route[];
  cityPlaceSuggestions: Record<string, CitySuggestionState>;
  currentLoadedGoalId: string | null;
  goalNameForInput: string;
  stagedForPlanningCities: City[];
  // Сеттеры состояния
  setPlannedItems: React.Dispatch<React.SetStateAction<PlannedItem[]>>;
  setSelectedDateRange: React.Dispatch<React.SetStateAction<any>>;
  setShowSearchResults: React.Dispatch<React.SetStateAction<boolean>>;
  setFilterControlSelectedCityIds: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedPlaceSubtypes: React.Dispatch<React.SetStateAction<any[]>>;
  setSelectedEventSubtypes: React.Dispatch<React.SetStateAction<any[]>>;
  setFilteredPlaces: React.Dispatch<React.SetStateAction<Place[]>>;
  setFilteredEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  setFilteredRoutes: React.Dispatch<React.SetStateAction<Route[]>>;
  setSelectedRoute: React.Dispatch<React.SetStateAction<Route | null>>;
  setSelectedRoutePlaces: React.Dispatch<React.SetStateAction<Place[]>>;
  setCurrentLoadedGoalId: React.Dispatch<React.SetStateAction<string | null>>;
  setGoalNameForInput: React.Dispatch<React.SetStateAction<string>>;
  setCityPlaceSuggestions: React.Dispatch<React.SetStateAction<Record<string, CitySuggestionState>>>;
  setStagedForPlanningCities: React.Dispatch<React.SetStateAction<City[]>>;
  setSavedGoals: React.Dispatch<React.SetStateAction<any[]>>;
}

export const usePilgrimagePlannerHandlers = ({
  authContext,
  language,
  t,
  toast,
  // Состояние
  availableCities,
  plannedItems,
  selectedDateRange,
  filterControlSelectedCityIds,
  selectedPlaceSubtypes,
  selectedEventSubtypes,
  availablePlaces,
  availableEvents,
  availableRoutes,
  cityPlaceSuggestions,
  currentLoadedGoalId,
  goalNameForInput,
  stagedForPlanningCities,
  // Сеттеры состояния
  setPlannedItems,
  setSelectedDateRange,
  setShowSearchResults,
  setFilterControlSelectedCityIds,
  setSelectedPlaceSubtypes,
  setSelectedEventSubtypes,
  setFilteredPlaces,
  setFilteredEvents,
  setFilteredRoutes,
  setSelectedRoute,
  setSelectedRoutePlaces,
  setCurrentLoadedGoalId,
  setGoalNameForInput,
  setCityPlaceSuggestions,
  setStagedForPlanningCities,
  setSavedGoals
}: UsePilgrimagePlannerHandlersProps) => {

  // Вспомогательные функции
  const getRandomTime = () => {
    const hour = Math.floor(Math.random() * 12) + 8;
    const minute = Math.floor(Math.random() * 4) * 15;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const getNextOrderIndex = (items: PlannedItem[]): number => {
    if (items.length === 0) return 0;
    return Math.max(...items.map(item => item.orderIndex)) + 1;
  };

  // Основные обработчики
  const handleAddFilteredItemsToPlan = useCallback(() => {
    console.log('=== handleAddFilteredItemsToPlan called ===');
    
    const onlyCitiesSelected =
      filterControlSelectedCityIds.length > 0 &&
      selectedPlaceSubtypes.length === 0 &&
      selectedEventSubtypes.length === 0;

    let itemsForPlan: PlannedItem[] = [];

    if (onlyCitiesSelected) {
      const cityItemsToAdd = availableCities
        .filter(city => filterControlSelectedCityIds.includes(city.id))
        .map((cityData) => ({
          type: 'city' as 'city',
          data: cityData,
          city_id_for_grouping: cityData.id,
          time: getRandomTime(),
          orderIndex: 0,
        }));
      itemsForPlan = cityItemsToAdd;

      if (itemsForPlan.length === 0) {
        toast({
          title: t('no_cities_selected_or_found', { defaultValue: 'Selected cities were not found.' }),
          variant: "destructive"
        });
        setPlannedItems([]);
        return;
      }
    } else {
      const newPlaceItems: PlannedItem[] = availablePlaces.map((place: Place) => ({
        type: 'place',
        data: place,
        city_id_for_grouping: place.cityId,
        time: getRandomTime(),
        orderIndex: 0,
      }));

      const newEventItems: PlannedItem[] = availableEvents.map((event: Event) => ({
        type: 'event',
        data: event,
        city_id_for_grouping: event.cityId,
        time: event.time || getRandomTime(),
        orderIndex: 0,
        date: event.date ? event.date.split('T')[0] : undefined,
      }));

      const allNewSubItems = [...newPlaceItems, ...newEventItems];

      if (allNewSubItems.length === 0 && filterControlSelectedCityIds.length > 0) {
        const cityItemsToAdd = availableCities
          .filter(city => filterControlSelectedCityIds.includes(city.id))
          .map((cityData) => ({
            type: 'city' as 'city',
            data: cityData,
            city_id_for_grouping: cityData.id,
            time: getRandomTime(),
            orderIndex: 0,
          }));
        
        if (cityItemsToAdd.length > 0) {
          itemsForPlan = cityItemsToAdd;
        } else {
          toast({
            title: t('no_cities_selected_or_found', { defaultValue: 'Selected cities were not found.' }),
            variant: "destructive"
          });
          setPlannedItems([]);
          return;
        }
      }
      
      if (allNewSubItems.length > 0) {
        const cityIdsOfNewSubItems = new Set<string>();
        allNewSubItems.forEach(item => {
          if (item.city_id_for_grouping) {
            cityIdsOfNewSubItems.add(item.city_id_for_grouping);
          }
        });

        const cityItemsForNewPlan: PlannedItem[] = [];
        const sourceCityPool = filterControlSelectedCityIds.length > 0
          ? availableCities.filter(c => filterControlSelectedCityIds.includes(c.id))
          : [];
        
        sourceCityPool.forEach(cityData => {
          if (cityIdsOfNewSubItems.has(cityData.id)) {
            cityItemsForNewPlan.push({
              type: 'city',
              data: cityData,
              city_id_for_grouping: cityData.id,
              time: getRandomTime(),
              orderIndex: 0,
            });
          }
        });
        itemsForPlan = [...cityItemsForNewPlan, ...allNewSubItems];
      } else {
        if (selectedPlaceSubtypes.length > 0 || selectedEventSubtypes.length > 0) {
             toast({
               title: t('no_items_match_current_filters', { defaultValue: 'No items match the current filters.' }),
               variant: "saffron"
             });
        } else {
             toast({
               title: t('no_items_match_current_filters_or_no_filters_applied', { defaultValue: 'No items match the current filters, or no filters were applied to yield results.' }),
               variant: "saffron"
             });
        }
        setPlannedItems([]);
        return;
      }
    }

    let currentOrderIndex = 0;
    const finalSortedItems = itemsForPlan
      .sort((a, b) => {
        if (a.type === 'city' && b.type !== 'city') return -1;
        if (a.type !== 'city' && b.type === 'city') return 1;
        
        if (a.city_id_for_grouping && b.city_id_for_grouping) {
          const cityGroupCompare = a.city_id_for_grouping.localeCompare(b.city_id_for_grouping);
          if (cityGroupCompare !== 0) return cityGroupCompare;
        }
        
        if (a.type === 'place' && b.type === 'event') return -1;
        if (a.type === 'event' && b.type === 'place') return 1;
        
        return 0;
      })
      .map(item => ({ ...item, orderIndex: currentOrderIndex++ }));
    
    setPlannedItems(finalSortedItems);
    setShowSearchResults(true);
    
    if (selectedDateRange && selectedDateRange.from && finalSortedItems.length > 0) {
      distributeDatesForItems(finalSortedItems);
    }
  }, [
    availableCities, 
    filterControlSelectedCityIds, 
    selectedPlaceSubtypes, 
    selectedEventSubtypes, 
    selectedDateRange, 
    t, 
    setPlannedItems, 
    setShowSearchResults,
    availablePlaces,
    availableEvents
  ]);

  const distributeDatesForItems = (itemsToDistribute: PlannedItem[]) => {
    if (!selectedDateRange || !selectedDateRange.from) {
      toast({
        title: t('please_select_date_range_first'),
        variant: "saffron"
      });
      return;
    }
    if (itemsToDistribute.length === 0) {
      toast({
        title: t('please_add_cities_to_plan_first'),
        variant: "saffron"
      });
      return;
    }
    
    const startDate = selectedDateRange.from;
    const endDate = selectedDateRange.to || selectedDateRange.from;
    const intervalDays = eachDayOfInterval({ start: startDate, end: endDate });
    if (intervalDays.length === 0) return;
    
    const updatedPlannedItems = itemsToDistribute.map(pItem => ({ ...pItem }));
    const itemsCount = itemsToDistribute.length;
    const daysCount = intervalDays.length;
    
    if (itemsCount <= daysCount) {
      const step = daysCount / itemsCount;
      
      itemsToDistribute.forEach((item, itemIndex) => {
        const dayIndex = Math.min(Math.floor(itemIndex * step), daysCount - 1);
        const targetDate = intervalDays[dayIndex];
        
        const itemInUpdateArray = updatedPlannedItems.find(pi => 
          pi.type === item.type && pi.data.id === item.data.id
        );
        
        if (itemInUpdateArray) {
          itemInUpdateArray.date = format(targetDate, 'yyyy-MM-dd');
        }
      });
    } else {
      const itemsPerDay = Math.ceil(itemsCount / daysCount);
      let currentItemIndex = 0;
      
      for (let dayIndex = 0; dayIndex < daysCount && currentItemIndex < itemsCount; dayIndex++) {
        const itemsForThisDay = Math.min(itemsPerDay, itemsCount - currentItemIndex);
        
        for (let i = 0; i < itemsForThisDay && currentItemIndex < itemsCount; i++) {
          const item = itemsToDistribute[currentItemIndex];
          const targetDate = intervalDays[dayIndex];
          
          const itemInUpdateArray = updatedPlannedItems.find(pi => 
            pi.type === item.type && pi.data.id === item.data.id
          );
          
          if (itemInUpdateArray) {
            itemInUpdateArray.date = format(targetDate, 'yyyy-MM-dd');
          }
          
          currentItemIndex++;
        }
      }
    }
    
    setPlannedItems(updatedPlannedItems);
  };

  const handleAddPlacesForCity = useCallback(async (cityId: string) => {
    let currentSuggestions = cityPlaceSuggestions[cityId];
    if (!currentSuggestions || !currentSuggestions.fullyLoaded) {
      try {
        const placesData = await getPlacesByRouteId(cityId);
        if (!placesData) throw new Error("Failed to fetch places.");
        const sortedPlaces = [...placesData].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        currentSuggestions = { places: sortedPlaces, currentIndex: 0, fullyLoaded: true };
        setCityPlaceSuggestions(prev => ({ ...prev, [cityId]: currentSuggestions! }));
      } catch (error) {
        console.error("Error fetching or sorting places for city:", cityId, error);
        toast({
          title: t('error_fetching_places_for_city', { city: cityId, defaultValue: `Error fetching places for city ${cityId}.` }),
          variant: "destructive"
        });
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
      const dateOfCity = plannedItems.find(item => item.type === 'city' && item.city_id_for_grouping === cityId)?.date;
      
      const newPlannedItem: PlannedItem = {
        type: 'place',
        data: placeToAdd,
        city_id_for_grouping: cityId,
        time: getRandomTime(),
        orderIndex: getNextOrderIndex(plannedItems),
        date: dateOfCity,
      };

      setPlannedItems(prev => [...prev, newPlannedItem]);
      setCityPlaceSuggestions(prev => ({
        ...prev,
        [cityId]: { ...currentSuggestions!, currentIndex: nextIndex + 1 }
      }));

      toast({
        title: t('place_added_to_plan', { defaultValue: 'Place added to plan' }),
        variant: "default"
      });
    } else {
      toast({
        title: t('no_more_places_to_add_for_city', { defaultValue: 'No more places to add for this city' }),
        variant: "saffron"
      });
    }
  }, [plannedItems, cityPlaceSuggestions, t, setPlannedItems, setCityPlaceSuggestions]);

  const handleSearchAndAddPlace = useCallback(async (cityId: string, searchTerm: string): Promise<Place[]> => {
    try {
      const placesData = await getPlacesByRouteId(cityId);
      if (!placesData) throw new Error("Failed to fetch places.");
      
      const matchingPlaces = placesData.filter(place => 
        getLocalizedText(place.name, language).toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (matchingPlaces.length === 0) {
        toast({
          title: t('no_places_found_matching_search', { defaultValue: 'No places found matching your search' }),
          variant: "saffron"
        });
        return [];
      }

      const placeToAdd = matchingPlaces[0];
      const dateOfCity = plannedItems.find(item => item.type === 'city' && item.city_id_for_grouping === cityId)?.date;
      
      const newPlannedItem: PlannedItem = {
        type: 'place',
        data: placeToAdd,
        city_id_for_grouping: cityId,
        time: getRandomTime(),
        orderIndex: getNextOrderIndex(plannedItems),
        date: dateOfCity,
      };

      setPlannedItems(prev => [...prev, newPlannedItem]);
      toast({
        title: t('place_added_to_plan', { defaultValue: 'Place added to plan' }),
        variant: "default"
      });

      return matchingPlaces;
    } catch (error) {
      console.error("Error searching and adding place:", error);
      toast({
        title: t('error_searching_places', { defaultValue: 'Error searching places' }),
        variant: "destructive"
      });
      return [];
    }
  }, [plannedItems, language, t, setPlannedItems]);

  const handleAddSpecificPlace = useCallback((place: Place, cityId: string) => {
    const dateOfCity = plannedItems.find(item => item.type === 'city' && item.city_id_for_grouping === cityId)?.date;
    
    const newPlannedItem: PlannedItem = {
      type: 'place',
      data: place,
      city_id_for_grouping: cityId,
      time: getRandomTime(),
      orderIndex: getNextOrderIndex(plannedItems),
      date: dateOfCity,
    };

    setPlannedItems(prev => [...prev, newPlannedItem]);
    toast({
      title: t('place_added_to_plan', { defaultValue: 'Place added to plan' }),
      variant: "default"
    });
  }, [plannedItems, t, setPlannedItems]);

  const handleDistributeDates = useCallback(() => {
    distributeDatesForItems(plannedItems);
  }, [plannedItems, selectedDateRange]);

  const handleStageCityForPlanning = useCallback((city: City) => {
    setStagedForPlanningCities(prev => [...prev, city]);
  }, [setStagedForPlanningCities]);

  const handleRemoveStagedCity = useCallback((cityId: string) => {
    setStagedForPlanningCities(prev => prev.filter(city => city.id !== cityId));
  }, [setStagedForPlanningCities]);

  const handleAddStagedCitiesToMainPlan = useCallback(() => {
    const newCityItems: PlannedItem[] = stagedForPlanningCities.map(city => ({
      type: 'city',
      data: city,
      city_id_for_grouping: city.id,
      time: getRandomTime(),
      orderIndex: getNextOrderIndex(plannedItems),
    }));

    setPlannedItems(prev => [...prev, ...newCityItems]);
    setStagedForPlanningCities([]);
    setShowSearchResults(true);
  }, [stagedForPlanningCities, plannedItems, setPlannedItems, setStagedForPlanningCities, setShowSearchResults]);

  const handleRemovePlannedItem = useCallback((itemId: string, itemType: string) => {
    setPlannedItems(prev => prev.filter(item => 
      !(item.data.id === itemId && item.type === itemType)
    ));
  }, [setPlannedItems]);

  const handleDateRangeChange = useCallback((range: any) => {
    setSelectedDateRange(range);
  }, [setSelectedDateRange]);

  const handleUpdatePlannedItemDateTime = useCallback((itemId: string, itemType: string, newDate: string, newTime: string) => {
    setPlannedItems(prev => prev.map(item => {
      if (item.data.id === itemId && item.type === itemType) {
        return { ...item, date: newDate, time: newTime };
      }
      return item;
    }));
  }, [setPlannedItems]);

  const handleClearPlan = useCallback(() => {
    setPlannedItems([]);
    setShowSearchResults(false);
  }, [setPlannedItems, setShowSearchResults]);

  const handleClearSearch = useCallback(() => {
    setShowSearchResults(false);
  }, [setShowSearchResults]);

  const handleRouteClick = useCallback(async (route: Route) => {
    setSelectedRoute(route);
    try {
      const places = await getPlacesByRouteId(route.id);
      setSelectedRoutePlaces(places || []);
      
      // Добавляем маршрут в план
      const routeItems: PlannedItem[] = [];
      
      // Проверяем, есть ли уже город в плане
      const existingCity = plannedItems.find(item => 
        item.type === 'city' && item.city_id_for_grouping === route.cityId
      );
      
      // Добавляем город маршрута только если его еще нет
      if (!existingCity) {
        const cityItem: PlannedItem = {
          type: 'city',
          data: availableCities.find(c => c.id === route.cityId) || route,
          city_id_for_grouping: route.cityId,
          time: getRandomTime(),
          orderIndex: getNextOrderIndex(plannedItems),
        };
        routeItems.push(cityItem);
      }
      
      // Добавляем места маршрута
      if (places && places.length > 0) {
        let currentOrderIndex = getNextOrderIndex(plannedItems) + routeItems.length;
        places.forEach(place => {
          const placeItem: PlannedItem = {
            type: 'place',
            data: place,
            city_id_for_grouping: route.cityId,
            time: getRandomTime(),
            orderIndex: currentOrderIndex++,
            date: existingCity?.date,
          };
          routeItems.push(placeItem);
        });
      }
      
      setPlannedItems(prev => [...prev, ...routeItems]);
      setShowSearchResults(true);
      
      console.log('✅ Route added to plan:', {
        routeId: route.id,
        cityId: route.cityId,
        placesCount: places?.length || 0,
        routeItems: routeItems,
        existingCity: !!existingCity,
        plannedItemsBefore: plannedItems.length,
        plannedItemsAfter: plannedItems.length + routeItems.length
      });
      
      toast({
        title: t('route_added_to_plan', { defaultValue: 'Route added to plan' }),
        variant: "default"
      });
    } catch (error) {
      console.error("Error loading route places:", error);
      toast({
        title: t('error_loading_route_places', { defaultValue: 'Error loading route places' }),
        variant: "destructive"
      });
    }
  }, [availableCities, plannedItems, t, setSelectedRoute, setSelectedRoutePlaces, setPlannedItems, setShowSearchResults]);

  const handleSaveOrUpdateGoal = useCallback(async () => {
    if (!authContext.auth.user) {
      toast({
        title: t('please_login_to_save_goals', { defaultValue: 'Please login to save goals' }),
        variant: "destructive"
      });
      return;
    }

    if (!goalNameForInput.trim()) {
      toast({
        title: t('please_enter_goal_name', { defaultValue: 'Please enter a goal name' }),
        variant: "destructive"
      });
      return;
    }

    try {
      const goalData = {
        name: goalNameForInput.trim(),
        planned_items: plannedItems,
        user_id: authContext.auth.user.id,
        date_range: selectedDateRange,
      };

      let result;
      if (currentLoadedGoalId) {
        // Обновляем существующую цель
        result = await supabase
          .from('goals')
          .update(goalData)
          .eq('id', currentLoadedGoalId)
          .select();
      } else {
        // Создаем новую цель
        result = await supabase
          .from('goals')
          .insert([goalData])
          .select();
      }

      if (result.error) throw result.error;

      // Обновляем список сохраненных целей
      const goalsResult = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', authContext.auth.user.id)
        .order('created_at', { ascending: false });

      if (goalsResult.data) {
        setSavedGoals(goalsResult.data);
      }

      toast({
        title: currentLoadedGoalId 
          ? t('goal_updated_successfully', { defaultValue: 'Goal updated successfully' })
          : t('goal_saved_successfully', { defaultValue: 'Goal saved successfully' }),
        variant: "default"
      });

      if (!currentLoadedGoalId) {
        setGoalNameForInput('');
      }
    } catch (error) {
      console.error("Error saving goal:", error);
      toast({
        title: t('error_saving_goal', { defaultValue: 'Error saving goal' }),
        variant: "destructive"
      });
    }
  }, [authContext.auth.user, goalNameForInput, plannedItems, selectedDateRange, currentLoadedGoalId, t, setSavedGoals, setGoalNameForInput]);

  const handleDeleteGoal = useCallback(async (goalId: string) => {
    if (!authContext.auth.user) return;

    try {
      const result = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', authContext.auth.user.id);

      if (result.error) throw result.error;

      // Обновляем список сохраненных целей
      const goalsResult = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', authContext.auth.user.id)
        .order('created_at', { ascending: false });

      if (goalsResult.data) {
        setSavedGoals(goalsResult.data);
      }

      if (currentLoadedGoalId === goalId) {
        setCurrentLoadedGoalId(null);
        setGoalNameForInput('');
      }

      toast({
        title: t('goal_deleted_successfully', { defaultValue: 'Goal deleted successfully' }),
        variant: "default"
      });
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast({
        title: t('error_deleting_goal', { defaultValue: 'Error deleting goal' }),
        variant: "destructive"
      });
    }
  }, [authContext.auth.user, currentLoadedGoalId, t, setSavedGoals, setCurrentLoadedGoalId, setGoalNameForInput]);

  const handleLoadGoal = useCallback(async (goalId: string) => {
    try {
      const result = await supabase
        .from('goals')
        .select('*')
        .eq('id', goalId)
        .single();

      if (result.error) throw result.error;

      setPlannedItems(result.data.planned_items || []);
      setSelectedDateRange(result.data.date_range);
      setGoalNameForInput(result.data.name);
      setCurrentLoadedGoalId(goalId);
      setShowSearchResults(true);

      toast({
        title: t('goal_loaded_successfully', { defaultValue: 'Goal loaded successfully' }),
        variant: "default"
      });
    } catch (error) {
      console.error("Error loading goal:", error);
      toast({
        title: t('error_loading_goal', { defaultValue: 'Error loading goal' }),
        variant: "destructive"
      });
    }
  }, [t, setPlannedItems, setSelectedDateRange, setGoalNameForInput, setCurrentLoadedGoalId, setShowSearchResults]);

  const handleAddFavoritesToPlan = useCallback(() => {
    // TODO: Implement adding favorites to plan
    toast({
      title: t('feature_coming_soon', { defaultValue: 'Feature coming soon' }),
      variant: "saffron"
    });
  }, [t]);

  const handleAddRouteToPlan = useCallback((route: Route) => {
    handleRouteClick(route);
  }, [handleRouteClick]);

  const handlePlannedItemsReorder = useCallback((reorderedItems: PlannedItem[]) => {
    const updatedItems = reorderedItems.map((item, index) => ({
      ...item,
      orderIndex: index
    }));
    setPlannedItems(updatedItems);
  }, [setPlannedItems]);

  return {
    // Обработчики
    handleAddFilteredItemsToPlan,
    handleAddPlacesForCity,
    handleSearchAndAddPlace,
    handleAddSpecificPlace,
    handleDistributeDates,
    handleStageCityForPlanning,
    handleRemoveStagedCity,
    handleAddStagedCitiesToMainPlan,
    handleRemovePlannedItem,
    handleDateRangeChange,
    handleUpdatePlannedItemDateTime,
    handleClearPlan,
    handleClearSearch,
    handleRouteClick,
    handleSaveOrUpdateGoal,
    handleDeleteGoal,
    handleLoadGoal,
    handleAddFavoritesToPlan,
    handleAddRouteToPlan,
    handlePlannedItemsReorder,

    // Вспомогательные функции
    getRandomTime,
    getNextOrderIndex,
  };
};
