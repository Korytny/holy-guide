import { useState, useCallback, useEffect } from "react";
import { type AuthContextType } from "@/context/AuthContext";
import { type LanguageContextType } from "@/context/LanguageContext";
import { City, Place, Route, Event, Language, PlannedItem } from "@/types";
import { format, addDays, eachDayOfInterval } from "date-fns";
import { getCitiesByIds, fetchPlaceData, getRoutesByIds, getEventsByIds } from '@/services/api';
import { getPlacesByCityId, getPlacesByRouteId, getPlacesByRouteIdWithoutOrder } from '@/services/placesApi';
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
  const [searchResultsOrder, setSearchResultsOrder] = useState<string[]>([]); // Сохраняем порядок результатов поиска

  // Эффект для сортировки элементов для отображения
  // ВРЕМЕННО ОТКЛЮЧЕН для отладки drag-and-drop
  // useEffect(() => {
  //   console.log('🔄 plannedItems useEffect - sorting items:', {
  //     itemCount: plannedItems.length,
  //     itemsBefore: plannedItems.map(item => ({ id: item.data.id, orderIndex: item.orderIndex }))
  //   });

  //   const finalSortedList = [...plannedItems].sort((a, b) => a.orderIndex - b.orderIndex);
  //   setSortedItemsForDisplay(finalSortedList);

  //   console.log('🔄 sortedItemsForDisplay after sort:', {
  //     itemsAfter: finalSortedList.map(item => ({ id: item.data.id, orderIndex: item.orderIndex }))
  //   });
  // }, [plannedItems]);

  // Временно используем plannedItems напрямую для отображения
  useEffect(() => {
    setSortedItemsForDisplay(plannedItems);
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
    searchResultsOrder,

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
    setStagedForPlanningCities,
    setSearchResultsOrder
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
  selectedRoute: Route | null;
  selectedRoutePlaces: Place[];
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
  setSearchResultsOrder: React.Dispatch<React.SetStateAction<string[]>>;
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
  filteredPlaces,
  filteredEvents,
  availableRoutes,
  selectedRoute,
  selectedRoutePlaces,
  cityPlaceSuggestions,
  currentLoadedGoalId,
  goalNameForInput,
  stagedForPlanningCities,
  showSearchResults,
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
  setSavedGoals,
  setSearchResultsOrder
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

  const distributeDatesForFilteredItems = (filteredPlaces: Place[], filteredEvents: Event[], dateRange?: any) => {
    console.log('distributeDatesForFilteredItems called:', { dateRange, filteredPlacesLength: filteredPlaces.length, filteredEventsLength: filteredEvents.length });

    if (!dateRange || !dateRange.from) {
      console.log('No date range available');
      return { places: filteredPlaces, events: filteredEvents };
    }

    const startDate = dateRange.from;
    const endDate = dateRange.to || dateRange.from;
    const intervalDays = eachDayOfInterval({ start: startDate, end: endDate });

    console.log('Date interval calculated:', { startDate, endDate, intervalDays });

    if (intervalDays.length === 0) {
      console.log('No days in interval');
      return { places: filteredPlaces, events: filteredEvents };
    }

    const allItems = [...filteredPlaces, ...filteredEvents];
    const itemsCount = allItems.length;
    const daysCount = intervalDays.length;

    console.log('Distribution params:', { itemsCount, daysCount });

    // Создаем копии с обновленными датами
    const updatedPlaces = [...filteredPlaces];
    const updatedEvents = [...filteredEvents];

    if (itemsCount <= daysCount) {
      // Если элементов меньше или равно чем дней, распределяем равномерно
      const step = daysCount / itemsCount;

      allItems.forEach((item, itemIndex) => {
        const dayIndex = Math.min(Math.floor(itemIndex * step), daysCount - 1);
        const targetDate = intervalDays[dayIndex];
        const formattedDate = format(targetDate, 'yyyy-MM-dd');

        // Находим соответствующий элемент в массивах и обновляем дату
        const placeIndex = updatedPlaces.findIndex(p => p.id === item.id);
        const eventIndex = updatedEvents.findIndex(e => e.id === item.id);

        if (placeIndex !== -1) {
          updatedPlaces[placeIndex] = { ...updatedPlaces[placeIndex], date: formattedDate };
        } else if (eventIndex !== -1) {
          updatedEvents[eventIndex] = { ...updatedEvents[eventIndex], date: formattedDate };
        }
      });
    } else {
      // Если элементов больше чем дней, группируем по дням
      const itemsPerDay = Math.ceil(itemsCount / daysCount);
      let currentItemIndex = 0;

      for (let dayIndex = 0; dayIndex < daysCount && currentItemIndex < itemsCount; dayIndex++) {
        const itemsForThisDay = Math.min(itemsPerDay, itemsCount - currentItemIndex);
        const targetDate = intervalDays[dayIndex];
        const formattedDate = format(targetDate, 'yyyy-MM-dd');

        for (let i = 0; i < itemsForThisDay && currentItemIndex < itemsCount; i++) {
          const item = allItems[currentItemIndex];

          // Находим соответствующий элемент в массивах и обновляем дату
          const placeIndex = updatedPlaces.findIndex(p => p.id === item.id);
          const eventIndex = updatedEvents.findIndex(e => e.id === item.id);

          if (placeIndex !== -1) {
            updatedPlaces[placeIndex] = { ...updatedPlaces[placeIndex], date: formattedDate };
          } else if (eventIndex !== -1) {
            updatedEvents[eventIndex] = { ...updatedEvents[eventIndex], date: formattedDate };
          }

          currentItemIndex++;
        }
      }
    }

    return { places: updatedPlaces, events: updatedEvents };
  };

  // Основные обработчики
  const handleSearch = useCallback(() => {
    let cityIdsToConsider = new Set(filterControlSelectedCityIds);

    // Фильтрация мест
    let tempFilteredPlaces: Place[] = [];
    if (availablePlaces.length > 0 && cityIdsToConsider.size > 0 && selectedPlaceSubtypes.length > 0) {
      const placeTypeMap: Record<number, string> = { 1: 'temple', 2: 'samadhi', 3: 'kunda', 4: 'sacred_site' };
      tempFilteredPlaces = availablePlaces.filter(p =>
        cityIdsToConsider.has(p.cityId) &&
        selectedPlaceSubtypes.includes(placeTypeMap[p.type])
      );
    }

    // Фильтрация событий
    let tempFilteredEvents: Event[] = [];
    if (availableEvents.length > 0 && cityIdsToConsider.size > 0 && selectedEventSubtypes.length > 0) {
      tempFilteredEvents = availableEvents.filter(e =>
        cityIdsToConsider.has(e.cityId) &&
        e.eventTypeField && selectedEventSubtypes.includes(e.eventTypeField)
      );
    }

    // Фильтрация маршрутов (если нужна)
    let tempFilteredRoutes: Route[] = [];
    if (availableRoutes.length > 0 && cityIdsToConsider.size > 0) {
        tempFilteredRoutes = availableRoutes.filter(route => cityIdsToConsider.has(route.cityId));
    }

    // Распределяем даты, если указан диапазон дат
    if (selectedDateRange && selectedDateRange.from && (tempFilteredPlaces.length > 0 || tempFilteredEvents.length > 0)) {
      const { places: placesWithDates, events: eventsWithDates } = distributeDatesForFilteredItems(tempFilteredPlaces, tempFilteredEvents, selectedDateRange);
      setFilteredPlaces(placesWithDates);
      setFilteredEvents(eventsWithDates);
    } else {
      setFilteredPlaces(tempFilteredPlaces);
      setFilteredEvents(tempFilteredEvents);
    }

    setFilteredRoutes(tempFilteredRoutes);

    if (tempFilteredPlaces.length === 0 && tempFilteredEvents.length === 0) {
        toast({ title: t('no_items_match_current_filters'), variant: "saffron" });
    }

    // Очищаем предпросмотр маршрута, чтобы не было конфликта
    setSelectedRoute(null);
    setSelectedRoutePlaces([]);

    // Показываем результаты
    setShowSearchResults(true);

  }, [
    filterControlSelectedCityIds,
    selectedPlaceSubtypes,
    selectedEventSubtypes,
    availablePlaces,
    availableEvents,
    availableRoutes,
    selectedDateRange,
    setFilteredPlaces,
    setFilteredEvents,
    setFilteredRoutes,
    setShowSearchResults,
    setSelectedRoute,
    setSelectedRoutePlaces,
    t,
    toast
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
        const placesData = await getPlacesByCityId(cityId);
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
      const placesData = await getPlacesByCityId(cityId);
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

  // Функция для перераспределения дат в существующих элементах
  const autoDistributeDatesForExistingItems = useCallback((items: PlannedItem[], dateRange: any) => {
    if (!dateRange || !dateRange.from || items.length === 0) {
      return items;
    }

    const startDate = dateRange.from;
    const endDate = dateRange.to || dateRange.from;
    const intervalDays = eachDayOfInterval({ start: startDate, end: endDate });

    if (intervalDays.length === 0) {
      return items;
    }

    const itemsCount = items.length;
    const daysCount = intervalDays.length;

    // Создаем копию с обновленными датами
    const updatedItems = items.map((item, index) => ({ ...item }));

    if (itemsCount <= daysCount) {
      // Если элементов меньше или равно чем дней, распределяем равномерно
      const step = daysCount / itemsCount;

      updatedItems.forEach((item, itemIndex) => {
        const dayIndex = Math.min(Math.floor(itemIndex * step), daysCount - 1);
        const targetDate = intervalDays[dayIndex];
        const formattedDate = format(targetDate, 'yyyy-MM-dd');

        // Обновляем дату напрямую в копии
        item.date = formattedDate;
      });
    } else {
      // Если элементов больше чем дней, группируем по дням
      const itemsPerDay = Math.ceil(itemsCount / daysCount);
      let currentItemIndex = 0;

      for (let dayIndex = 0; dayIndex < daysCount && currentItemIndex < itemsCount; dayIndex++) {
        const itemsForThisDay = Math.min(itemsPerDay, itemsCount - currentItemIndex);
        const targetDate = intervalDays[dayIndex];
        const formattedDate = format(targetDate, 'yyyy-MM-dd');

        for (let i = 0; i < itemsForThisDay && currentItemIndex < itemsCount; i++) {
          const item = updatedItems[currentItemIndex];
          item.date = formattedDate;
          currentItemIndex++;
        }
      }
    }

    return updatedItems;
  }, []);

  const handleDateRangeChange = useCallback((range: any) => {
    console.log('handleDateRangeChange called with:', range);

    // Сначала обновляем состояние диапазона
    setSelectedDateRange(range);

    // Перераспределяем даты только когда есть полный диапазон дат (начало и конец)
    if (range && range.from && range.to !== undefined) {
      console.log('Valid date range, redistributing dates:', range);

      // Используем таймаут чтобы гарантировать что состояние обновится
      setTimeout(() => {
        // Используем функциональное обновление чтобы получить актуальное состояние
        setPlannedItems(currentItems => {
          if (currentItems.length > 0) {
            // Перераспределяем даты для основных элементов плана
            const updatedItems = autoDistributeDatesForExistingItems(currentItems, range);

            // Показываем уведомление о перераспределении дат
            toast({
              title: t('dates_auto_distributed', {
                defaultValue: 'Dates have been automatically distributed for existing items.'
              }),
              variant: "default"
            });

            return updatedItems;
          }
          return currentItems;
        });

        // Обрабатываем результаты поиска отдельно
        if (showSearchResults && (filteredPlaces.length > 0 || filteredEvents.length > 0)) {
          // Перераспределяем даты для результатов поиска
          const { places: placesWithDates, events: eventsWithDates } = distributeDatesForFilteredItems(filteredPlaces, filteredEvents, range);
          setFilteredPlaces(placesWithDates);
          setFilteredEvents(eventsWithDates);

          // Показываем уведомление о перераспределении дат
          toast({
            title: t('dates_auto_distributed', {
              defaultValue: 'Dates have been automatically distributed for search results.'
            }),
            variant: "default"
          });
        }
      }, 0);
    } else {
      console.log('Skipping date redistribution - incomplete date range');
    }
  }, [setSelectedDateRange, showSearchResults, filteredPlaces, filteredEvents, autoDistributeDatesForExistingItems, distributeDatesForFilteredItems, toast, t]);

  const handleUpdatePlannedItemDateTime = useCallback((itemId: string, itemType: string, newDate: string, newTime: string) => {
    // В режиме поиска обновляем отфильтрованные результаты
    if (showSearchResults) {
      setFilteredPlaces(prev => prev.map(item => {
        if (item.id === itemId && itemType === 'place') {
          return { ...item, date: newDate };
        }
        return item;
      }));

      setFilteredEvents(prev => prev.map(item => {
        if (item.id === itemId && itemType === 'event') {
          return { ...item, date: newDate, time: newTime };
        }
        return item;
      }));
    } else {
      // В обычном режиме обновляем plannedItems
      setPlannedItems(prev => prev.map(item => {
        if (item.data.id === itemId && item.type === itemType) {
          return { ...item, date: newDate, time: newTime };
        }
        return item;
      }));
    }
  }, [setPlannedItems, setFilteredPlaces, setFilteredEvents, showSearchResults]);

  const handleClearPlan = useCallback(() => {
    setPlannedItems([]);
    setShowSearchResults(false);
  }, [setPlannedItems, setShowSearchResults]);



  const handleRouteClick = useCallback(async (route: Route) => {
    const primaryCityId = route.city_id && route.city_id[0];
    if (!primaryCityId) {
      console.error("Route object is missing a valid city_id array:", route);
      toast({ title: "Invalid route data", variant: "destructive" });
      return;
    }

    // Очищаем предыдущие результаты поиска, чтобы не было конфликта
    setFilteredPlaces([]);
    setFilteredEvents([]);
    setFilteredRoutes([]);

    try {
      const places = await getPlacesByRouteIdWithoutOrder(route.id);
      // Сортируем места по полю order из spot_route
      const sortedPlaces = (places || []).sort((a, b) => {
        const orderA = a.order ?? Infinity;
        const orderB = b.order ?? Infinity;
        return orderA - orderB;
      });
      setSelectedRoute(route);
      setSelectedRoutePlaces(sortedPlaces);
      setShowSearchResults(true);

      // Добавляем маршрут и его места в plannedItems для сохранения
      const routeCityId = route.city_id && route.city_id[0] ? route.city_id[0] : '';

      // Находим город в availableCities
      const routeCity = availableCities.find(city => city.id === routeCityId);

      const routePlannedItems: PlannedItem[] = [];

      // Добавляем город маршрута, если нашли его
      if (routeCity) {
        routePlannedItems.push({
          type: 'city',
          data: routeCity,
          city_id_for_grouping: routeCityId,
          time: getRandomTime(),
          orderIndex: getNextOrderIndex(plannedItems),
        });
      }

      // Добавляем сам маршрут
      routePlannedItems.push({
        type: 'route',
        data: route,
        city_id_for_grouping: routeCityId,
        time: getRandomTime(),
        orderIndex: getNextOrderIndex(plannedItems) + (routeCity ? 1 : 0),
      });

      // Добавляем места маршрута
      routePlannedItems.push(...sortedPlaces.map((place, index) => ({
        type: 'place',
        data: place,
        city_id_for_grouping: routeCityId,
        time: getRandomTime(),
        orderIndex: getNextOrderIndex(plannedItems) + (routeCity ? 1 : 0) + 1 + index,
      })));

      setPlannedItems(prev => [...prev, ...routePlannedItems]);

      toast({
        title: t('route_loaded_for_preview', { defaultValue: 'Route loaded for preview' }),
        variant: "default"
      });

    } catch (error) {
      console.error("Error loading route places for preview:", error);
      toast({
        title: t('error_loading_route_places', { defaultValue: 'Error loading route places' }),
        variant: "destructive"
      });
    }
  }, [
    setFilteredPlaces, 
    setFilteredEvents, 
    setFilteredRoutes, 
    setSelectedRoute, 
    setSelectedRoutePlaces, 
    setShowSearchResults, 
    t, 
    toast
  ]);

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
      let itemsToSave: PlannedItem[] = [];

      if (selectedRoute && selectedRoutePlaces.length > 0) {
        // Проверяем, есть ли у мест маршрута распределенные даты
        const hasDistributedDates = selectedRoutePlaces.some(place => place.date);

        if (hasDistributedDates) {
          // Используем распределенные даты из selectedRoutePlaces
          itemsToSave = selectedRoutePlaces.map((place, index) => ({
            type: 'place' as const,
            data: place,
            city_id_for_grouping: place.cityId,
            time: null,
            orderIndex: index,
            date: place.date || null // Используем распределенную дату
          }));
        } else {
          // Распределяем даты по местам маршрута
          const routeCityId = selectedRoutePlaces[0]?.cityId;
          const routeCity = routeCityId ? availableCities.find(c => c.id === routeCityId) : null;

          const routeItems: PlannedItem[] = [];

          // Добавляем город если есть
          if (routeCity) {
            routeItems.push({
              type: 'city' as const,
              data: routeCity,
              city_id_for_grouping: routeCityId,
              time: null,
              orderIndex: 0,
              date: null
            });
          }

          // Добавляем сам маршрут
          routeItems.push({
            type: 'route' as const,
            data: selectedRoute,
            city_id_for_grouping: routeCityId,
            time: null,
            orderIndex: routeItems.length,
            date: null
          });

          // Добавляем места маршрута с датами
          const placesWithDates = selectedDateRange && selectedDateRange.from
            ? autoDistributeDatesForExistingItems(selectedRoutePlaces, selectedDateRange)
            : selectedRoutePlaces;

          routeItems.push(...placesWithDates.map((place, index) => ({
            type: 'place' as const,
            data: place,
            city_id_for_grouping: place.cityId,
            time: null,
            orderIndex: routeItems.length + index,
            date: place.date || null
          })));

          itemsToSave = routeItems;
        }
      } else if (showSearchResults) {
        // Автоматически добавляем города для результатов поиска
        const enhancedItems: PlannedItem[] = [];
        const cityMap = new Map<string, City>();

        // Сначала добавляем все уникальные города для мест и событий
        [...filteredPlaces, ...filteredEvents].forEach(item => {
          const cityId = item.cityId;
          if (cityId && !cityMap.has(cityId)) {
            const city = availableCities.find(c => c.id === cityId);
            if (city) {
              cityMap.set(cityId, city);
              enhancedItems.push({
                type: 'city',
                data: city,
                city_id_for_grouping: cityId,
                time: null,
                orderIndex: enhancedItems.length,
                dates: []
              });
            }
          }
        });

        // Затем добавляем места с их распределенными датами
        const searchPlaces = filteredPlaces.map((place, index) => ({
          type: 'place' as const,
          data: place,
          city_id_for_grouping: place.cityId,
          time: null,
          orderIndex: enhancedItems.length + index,
          date: place.date || null // Используем распределенную дату из place.date
        }));

        // Затем добавляем события с их распределенными датами
        const searchEvents = filteredEvents.map((event, index) => ({
          type: 'event' as const,
          data: event,
          city_id_for_grouping: event.cityId,
          time: event.time || null,
          orderIndex: enhancedItems.length + searchPlaces.length + index,
          date: event.date || null // Используем распределенную дату из event.date
        }));

        itemsToSave = [...enhancedItems, ...searchPlaces, ...searchEvents];
      } else {
        // Для сохраненных мест автоматически добавляем города
        const enhancedPlannedItems: PlannedItem[] = [];
        const cityMap = new Map<string, City>();

        // Сначала добавляем все уникальные города, которые нужны для мест
        plannedItems.forEach(item => {
          if (item.type === 'place' && item.city_id_for_grouping) {
            if (!cityMap.has(item.city_id_for_grouping)) {
              const city = availableCities.find(c => c.id === item.city_id_for_grouping);
              if (city) {
                cityMap.set(item.city_id_for_grouping, city);
                enhancedPlannedItems.push({
                  type: 'city',
                  data: city,
                  city_id_for_grouping: city.id,
                  time: null,
                  orderIndex: enhancedPlannedItems.length,
                  date: null
                });
              }
            }
          }
        });

        // Затем добавляем все элементы в правильном порядке с их распределенными датами
        enhancedPlannedItems.push(...plannedItems);
        itemsToSave = enhancedPlannedItems;
      }
      
  
      const cleanedItemsToSave = itemsToSave.map(item => ({
        id: item.data.id,
        type: item.type,
        date: item.date || null // Сохраняем дату из поля date, а не из dates
      }));

      const goalData = {
        title: goalNameForInput.trim(),
        planned_items: cleanedItemsToSave, // Сохраняем очищенный массив
        user_id: authContext.auth.user.id,
      };

  
      let result;
      if (currentLoadedGoalId) {
          result = await supabase
          .from('goals')
          .update(goalData)
          .eq('id', currentLoadedGoalId)
          .select();
      } else {
        result = await supabase
          .from('goals')
          .insert([goalData])
          .select();
      }

    
      if (result.error) {
        throw result.error;
      }

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

      if (!currentLoadedGoalId && result.data && result.data[0]) {
        setCurrentLoadedGoalId(result.data[0].id);
      }

    } catch (error) {
      console.error("Error saving goal:", error);
      toast({
        title: t('error_saving_goal', { defaultValue: 'Error saving goal' }),
        variant: "destructive"
      });
    }
  }, [authContext.auth.user, goalNameForInput, plannedItems, selectedDateRange, currentLoadedGoalId, t, setSavedGoals, setGoalNameForInput, selectedRoute, selectedRoutePlaces, showSearchResults, filteredPlaces, filteredEvents]);

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
      const { data: goal, error } = await supabase
        .from('goals')
        .select('*')
        .eq('id', goalId)
        .single();

      if (error) throw error;
      if (!goal || !goal.planned_items) {
        console.error('Goal data or planned_items are missing', goal);
        return;
      }

      const itemsToLoad = goal.planned_items as { id: string; type: string; date: string | null }[];

      // Группируем ID по типам, чтобы сделать пакетные запросы
      const cityIds = itemsToLoad.filter(i => i.type === 'city').map(i => i.id);
      const placeIds = itemsToLoad.filter(i => i.type === 'place').map(i => i.id);
      const eventIds = itemsToLoad.filter(i => i.type === 'event').map(i => i.id);
      const routeIds = itemsToLoad.filter(i => i.type === 'route').map(i => i.id);

      // Выполняем все запросы к API параллельно
      const [citiesData, placesData, eventsData, routesData] = await Promise.all([
        cityIds.length > 0 ? getCitiesByIds(cityIds) : Promise.resolve([]),
        placeIds.length > 0 ? fetchPlaceData(placeIds) : Promise.resolve([]),
        eventIds.length > 0 ? getEventsByIds(eventIds) : Promise.resolve([]),
        routeIds.length > 0 ? getRoutesByIds(routeIds) : Promise.resolve([]),
      ]);

      // Создаем словари для быстрого доступа к полным данным
      const citiesMap = new Map(citiesData.map(c => [c.id, c]));
      const placesMap = new Map(placesData.map(p => [p.id, p]));
      const eventsMap = new Map(eventsData.map(e => [e.id, e]));
      const routesMap = new Map(routesData.map(r => [r.id, r]));

      // Собираем финальный массив plannedItems
      const loadedPlannedItems: PlannedItem[] = itemsToLoad.map((item, index) => {
        let data: City | Place | Event | Route | null = null;
        switch (item.type) {
          case 'city':
            data = citiesMap.get(item.id) || null;
            break;
          case 'place':
            data = placesMap.get(item.id) || null;
            break;
          case 'event':
            data = eventsMap.get(item.id) || null;
            break;
          case 'route':
            data = routesMap.get(item.id) || null;
            break;
        }

        if (!data) {
          console.warn(`Could not find full data for item type '${item.type}' with id '${item.id}'`);
          return null;
        }

        return {
          type: item.type as 'city' | 'place' | 'event' | 'route',
          data: data,
          city_id_for_grouping: (data as any).cityId || (data as any).city_id || null,
          time: null, // Время можно будет установить позже
          orderIndex: index, // Сохраняем исходный порядок
          date: item.date || null // Устанавливаем дату из сохраненного значения
        };
      }).filter((item): item is PlannedItem => item !== null);

      // Проверяем, является ли загруженная цель маршрутом
      const routeItems = loadedPlannedItems.filter(item => item.type === 'route');
      const routePlaces = loadedPlannedItems.filter(item => item.type === 'place');

    
      // Если это маршрут, загружаем его в selectedRoute и selectedRoutePlaces
      if (routeItems.length > 0) {
        const routeItem = routeItems[0]; // Берем первый (и обычно единственный) маршрут
        const route = routeItem.data as Route;

        // Загружаем места для этого маршрута
        const routePlacesData = await getPlacesByRouteId(route.id);
        const sortedRoutePlaces = (routePlacesData || []).sort((a, b) => {
          const orderA = a.order ?? Infinity;
          const orderB = b.order ?? Infinity;
          return orderA - orderB;
        });

        // Устанавливаем маршрут и его места
        setSelectedRoute(route);
        setSelectedRoutePlaces(sortedRoutePlaces);
        setShowSearchResults(true);

        // Также добавляем в plannedItems для сохранения/редактирования
        setPlannedItems(loadedPlannedItems);

        toast({
          title: t('goal_loaded_successfully', { defaultValue: 'Goal loaded successfully' }),
          variant: "default"
        });
      } else if (routePlaces.length > 0) {
        // Это сохраненные места (не маршрут)

        // Загружаем в plannedItems
        setPlannedItems(loadedPlannedItems);
        setSelectedDateRange(undefined); // Сбрасываем диапазон дат
        setGoalNameForInput(goal.title);
        setCurrentLoadedGoalId(goalId);
        setShowSearchResults(true); // Показываем в режиме поиска для лучшей группировки

        toast({
          title: t('goal_loaded_successfully', { defaultValue: 'Goal loaded successfully' }),
          variant: "default"
        });
      } else {
        // Пустой план - загружаем в plannedItems
        setPlannedItems(loadedPlannedItems);
        setSelectedDateRange(undefined); // Сбрасываем диапазон дат
        setGoalNameForInput(goal.title);
        setCurrentLoadedGoalId(goalId);
        setShowSearchResults(false); // Выходим из режима поиска

        toast({
          title: t('goal_loaded_successfully', { defaultValue: 'Goal loaded successfully' }),
          variant: "default"
        });
      }

    } catch (error) {
      console.error("Error loading goal:", error);
      toast({
        title: t('error_loading_goal', { defaultValue: 'Error loading goal' }),
        variant: "destructive"
      });
    }
  }, [t, setPlannedItems, setSelectedDateRange, setGoalNameForInput, setCurrentLoadedGoalId, setShowSearchResults, setSelectedRoute, setSelectedRoutePlaces]);

  const handleAddFavoritesToPlan = useCallback(() => {
    // TODO: Implement adding favorites to plan
    toast({
      title: t('feature_coming_soon', { defaultValue: 'Feature coming soon' }),
      variant: "saffron"
    });
  }, [t]);



  const handlePlannedItemsReorder = useCallback((reorderedItems: PlannedItem[], isSearchMode: boolean) => {
    const updatedItems = reorderedItems.map((item, index) => ({
      ...item,
      orderIndex: index
    }));

    // В режиме поиска обновляем отфильтрованные результаты, в обычном режиме - plannedItems
    if (isSearchMode) {
      // Разделяем элементы на места и события
      const reorderedPlaces = updatedItems.filter(item => item.type === 'place').map(item => item.data as Place);
      const reorderedEvents = updatedItems.filter(item => item.type === 'event').map(item => item.data as Event);

      // Сохраняем порядок элементов
      const newOrder = updatedItems.map(item => `${item.type}-${item.data.id}`);
      setSearchResultsOrder(newOrder);

      setFilteredPlaces(reorderedPlaces);
      setFilteredEvents(reorderedEvents);
    } else {
      setPlannedItems(updatedItems);
    }
  }, [setPlannedItems, setFilteredPlaces, setFilteredEvents, setSearchResultsOrder]);

  const handleReorderRoutePlaces = useCallback((routeId: string, reorderedPlaces: Place[]) => {
    // Обновляем порядок мест в выбранном маршруте
    setSelectedRoutePlaces(reorderedPlaces);

    // Обновляем orderIndex для перерисовки компонентов
    const updatedPlaces = reorderedPlaces.map((place, index) => ({
      ...place,
      order: index
    }));

    // Здесь можно добавить логику для сохранения нового порядка в базу данных
    // Например, обновление таблицы spot_route
  }, [setSelectedRoutePlaces]);

  const handleRemovePreviewItem = useCallback((itemToRemove: Place | Event) => {
    // Если активен предпросмотр маршрута, удаляем из его списка
    if (selectedRoute) {
      setSelectedRoutePlaces(prev => prev.filter(p => p.id !== itemToRemove.id));
      return;
    }

    // Иначе, удаляем из списков отфильтрованных результатов
    if ('eventTypeField' in itemToRemove) { // Это Event
      setFilteredEvents(prev => prev.filter(e => e.id !== itemToRemove.id));
    } else { // Это Place
      setFilteredPlaces(prev => prev.filter(p => p.id !== itemToRemove.id));
    }
  }, [selectedRoute, setSelectedRoutePlaces, setFilteredEvents, setFilteredPlaces]);

  const handleResetFilters = useCallback(() => {
    setFilterControlSelectedCityIds([]);
    setSelectedPlaceSubtypes(['temple', 'samadhi', 'kunda', 'sacred_site']);
    setSelectedEventSubtypes(['festival', 'practice', 'retreat', 'vipassana', 'puja', 'lecture', 'guru_festival', 'visit']);
    setShowSearchResults(false);
    setSelectedRoute(null);
    setSelectedRoutePlaces([]);
    setFilteredPlaces([]);
    setFilteredEvents([]);
    setFilteredRoutes([]);
    toast({
      title: t('filters_reset', { defaultValue: 'Filters have been reset.' }),
      variant: "default"
    });
  }, [
    setFilterControlSelectedCityIds,
    setSelectedPlaceSubtypes,
    setSelectedEventSubtypes,
    setFilteredPlaces,
    setFilteredEvents,
    setFilteredRoutes,
    setShowSearchResults,
    setSelectedRoute,
    setSelectedRoutePlaces,
    t,
    toast
  ]);

  const handleFullReset = useCallback(() => {
    // Сброс основного плана
    setPlannedItems([]);
    
    // Сброс результатов поиска и предпросмотра
    setShowSearchResults(false);
    setSelectedRoute(null);
    setSelectedRoutePlaces([]);
    setFilteredPlaces([]);
    setFilteredEvents([]);
    setFilteredRoutes([]);

    // Сброс контролов фильтрации
    setFilterControlSelectedCityIds([]);
    setSelectedPlaceSubtypes(['temple', 'samadhi', 'kunda', 'sacred_site']);
    setSelectedEventSubtypes(['festival', 'practice', 'retreat', 'vipassana', 'puja', 'lecture', 'guru_festival', 'visit']);
    setSelectedDateRange(undefined);

    // Сброс информации о загруженной цели
    setCurrentLoadedGoalId(null);
    setGoalNameForInput('');

    toast({
      title: t('plan_cleared', { defaultValue: 'Plan has been cleared.' }),
      variant: "default"
    });
  }, [
    setPlannedItems,
    setShowSearchResults,
    setSelectedRoute,
    setSelectedRoutePlaces,
    setFilteredPlaces,
    setFilteredEvents,
    setFilteredRoutes,
    setFilterControlSelectedCityIds,
    setSelectedPlaceSubtypes,
    setSelectedEventSubtypes,
    setSelectedDateRange,
    setCurrentLoadedGoalId,
    setGoalNameForInput,
    t,
    toast
  ]);

  return {
    // Обработчики
    handleSearch,
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
    handleRouteClick,
    handleSaveOrUpdateGoal,
    handleDeleteGoal,
    handleLoadGoal,
    handleAddFavoritesToPlan,
    handlePlannedItemsReorder,
    handleReorderRoutePlaces,
    handleRemovePreviewItem,
    handleResetFilters,
    handleFullReset, // <-- Добавляем новую функцию

    // Вспомогательные функции
    getRandomTime,
    getNextOrderIndex,
  };
};
