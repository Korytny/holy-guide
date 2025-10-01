
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
import { getLocalizedText } from '../../utils/languageUtils';

import { PilgrimagePlannerControls, PlaceSubtype, EventSubtype } from "./PilgrimagePlannerControls";
import { PilgrimagePlanDisplay } from "./PilgrimagePlanDisplay";
import PilgrimageRouteMap from "./PilgrimageRouteMap";
import { FilteredResults } from "./FilteredResults";
import { Button } from "@/components/ui/button";

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
  const [showSearchResults, setShowSearchResults] = useState<boolean>(false);
  const [cityPlaceSuggestions, setCityPlaceSuggestions] = useState<Record<string, CitySuggestionState>>({});
  const [savedGoals, setSavedGoals] = useState<any[]>([]);
  const [goalNameForInput, setGoalNameForInput] = useState('');
  const [currentLoadedGoalId, setCurrentLoadedGoalId] = useState<string | null>(null);
  const [filterControlSelectedCityIds, setFilterControlSelectedCityIds] = useState<string[]>([]); 
 
  const [selectedPlaceSubtypes, setSelectedPlaceSubtypes] = useState<PlaceSubtype[]>(['temple', 'samadhi', 'kunda', 'sacred_site']);
  const [selectedEventSubtypes, setSelectedEventSubtypes] = useState<EventSubtype[]>(['festival', 'practice', 'lecture', 'puja', 'guru_festival']);

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
    console.log('=== handleAddFilteredItemsToPlan called ===');
    console.log('filterControlSelectedCityIds:', filterControlSelectedCityIds);
    console.log('selectedPlaceSubtypes:', selectedPlaceSubtypes);
    console.log('selectedEventSubtypes:', selectedEventSubtypes);
    console.log('availablePlaces count:', availablePlaces.length);
    console.log('availableEvents count:', availableEvents.length);
    console.log('filteredPlaces count:', filteredPlaces.length);
    console.log('filteredEvents count:', filteredEvents.length);
    console.log('isLoadingPlacesAndEvents:', isLoadingPlacesAndEvents);
    
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

      // Если выбраны города в контролах, но по категориям для них ничего не нашлось,
      // добавляем только сами города (это лучше, чем показывать ошибку)
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
          // Это маловероятный сценарий, но на всякий случай оставляем обработку
          alert(t('no_cities_selected_or_found', { defaultValue: 'Selected cities were not found.' }));
          setPlannedItems([]);
          return;
        }
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
    setShowSearchResults(true); // Показываем результаты поиска
    
    // Автоматически распределяем даты, если выбран диапазон и есть элементы
    if (selectedDateRange && selectedDateRange.from && finalSortedItems.length > 0) {
      distributeDatesForItems(finalSortedItems);
    }
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

  const handleSearchAndAddPlace = async (cityId: string, searchTerm: string) => {
    try {
      const placesData = await getPlacesByCityId(cityId);
      
      if (!placesData || placesData.length === 0) {
        return [];
      }

      const searchLower = searchTerm.toLowerCase().trim();
      
      if (!searchLower) {
        return [];
      }

      const filteredPlaces = placesData.filter(place => {
        // Поиск по названию (проверяем на всех языках)
        const nameEn = typeof place.name === 'string' ? place.name.toLowerCase() : (place.name?.en || '').toLowerCase();
        const nameRu = typeof place.name === 'string' ? place.name.toLowerCase() : (place.name?.ru || '').toLowerCase();
        const nameHi = typeof place.name === 'string' ? place.name.toLowerCase() : (place.name?.hi || '').toLowerCase();
        const primaryName = getLocalizedText(place.name, language).toLowerCase();
        
          
        // Поиск по описанию
        const description = getLocalizedText(place.description, language).toLowerCase();
        
        // Поиск по типу места (если есть)
        const typeName = place.type ? 
          ['', 'temple', 'samadhi', 'kunda', 'sacred_site'][place.type] || '' : '';
        
        // Ищем вхождение в любом из полей на всех языках
        const nameMatch = primaryName.includes(searchLower) || 
                         nameEn.includes(searchLower) || 
                         nameRu.includes(searchLower) || 
                         nameHi.includes(searchLower);
        
        const descMatch = description.includes(searchLower);
        const typeMatch = typeName.includes(searchLower);
        
        // Дополнительные проверки для разных типов мест
        const typeKeywords = {
          1: ['храм', 'temple', 'mandir', 'मंदिर'],
          2: ['самадхи', 'samadhi', 'समाधि'],
          3: ['кунда', 'kunda', 'कुंड'],
          4: ['святое место', 'sacred site', 'पवित्र स्थल']
        };
        
        const isCurrentType = place.type && typeKeywords[place.type as keyof typeof typeKeywords]?.some(keyword => 
          primaryName.includes(keyword) || 
          nameEn.includes(keyword) || 
          nameRu.includes(keyword) || 
          nameHi.includes(keyword) ||
          description.includes(keyword)
        );
        
        const searchInTypeKeywords = Object.values(typeKeywords).flat().some(keyword => keyword.includes(searchLower));
        
        const matches = nameMatch || descMatch || typeMatch || (isCurrentType && searchInTypeKeywords);
        
          
        return matches;
      });

      // Сортируем по релевантности
      const sortedPlaces = filteredPlaces.sort((a, b) => {
        const aName = getLocalizedText(a.name, language).toLowerCase();
        const bName = getLocalizedText(b.name, language).toLowerCase();
        
        const aStartsWith = aName.startsWith(searchLower);
        const bStartsWith = bName.startsWith(searchLower);
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        return (b.rating || 0) - (a.rating || 0);
      });

      return sortedPlaces;
    } catch (error) {
      console.error("Error searching places for city:", cityId, error);
      return [];
    }
  };

  const handleAddSpecificPlace = (place: Place, cityId: string) => {
    const dateOfCity = plannedItems.find(item => item.type === 'city' && item.data.id === cityId)?.date;
    const newPlannedItem: PlannedItem = {
      type: 'place',
      data: place,
      city_id_for_grouping: cityId,
      time: getRandomTime(),
      date: dateOfCity,
      orderIndex: getNextOrderIndex(plannedItems),
    };
    setPlannedItems(prevItems => [...prevItems, newPlannedItem]);
  };

  const handleDistributeDates = () => {
    if (!selectedDateRange || !selectedDateRange.from) {
      alert(t('please_select_date_range_first'));
      return;
    }
    if (plannedItems.length === 0) {
      alert(t('please_add_cities_to_plan_first'));
      return;
    }
    distributeDatesForItems(plannedItems);
  };

  const distributeDatesForItems = (itemsToDistribute: PlannedItem[]) => {
    if (!selectedDateRange || !selectedDateRange.from) {
      alert(t('please_select_date_range_first'));
      return;
    }
    if (itemsToDistribute.length === 0) {
      alert(t('please_add_cities_to_plan_first'));
      return;
    }
    
    const startDate = selectedDateRange.from;
    const endDate = selectedDateRange.to || selectedDateRange.from;
    const intervalDays = eachDayOfInterval({ start: startDate, end: endDate });
    if (intervalDays.length === 0) return;
    
    const updatedPlannedItems = itemsToDistribute.map(pItem => ({ ...pItem }));
    const itemsCount = itemsToDistribute.length;
    const daysCount = intervalDays.length;
    
    // Calculate even distribution
    if (itemsCount <= daysCount) {
      // If we have fewer items than days, distribute them evenly
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
      // If we have more items than days, distribute multiple items per day
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
    setSelectedPlaceSubtypes(['temple', 'samadhi', 'kunda', 'sacred_site']);
    setSelectedEventSubtypes(['festival', 'practice', 'lecture', 'puja', 'guru_festival']);
    setFilteredPlaces([]);
    setFilteredEvents([]);
    setCityPlaceSuggestions({});
    setShowSearchResults(false); // Скрываем результаты поиска
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
        console.log('📂 Загруженные цели:', data);
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
    console.log('💾 Начало сохранения цели:', currentGoalName);
    console.log('📋 PlannedItems для сохранения:', plannedItems);
    
    if (!authContext?.auth?.user?.id) {
      console.error('❌ Пользователь не аутентифицирован');
      alert(t('user_not_authenticated_error_message', {defaultValue: 'User not authenticated.'}));
      return;
    }
    
    const itemsToSave = plannedItems.map((item, index) => ({
      ...item,
      orderIndex: item.orderIndex ?? index 
    }));
    
    console.log('🔄 ItemsToSave:', itemsToSave);
    
    // Separate items by type for the existing schema
    const cities = itemsToSave
      .filter(item => item.type === 'city')
      .map(item => ({
        id: item.data.id,
        name: getLocalizedText((item.data as any).name, language),
        imageUrl: (item.data as City).imageUrl,
        dates: item.date ? [item.date] : [],
        orderIndex: item.orderIndex,
        time: item.time
      }));
    
    const places = itemsToSave
      .filter(item => item.type === 'place')
      .map(item => ({
        id: item.data.id,
        name: getLocalizedText((item.data as any).name, language),
        city_id: item.city_id_for_grouping,
        dates: item.date ? [item.date] : [],
        orderIndex: item.orderIndex,
        time: item.time,
        location: (item.data as Place).location
      }));
    
    const routes = itemsToSave
      .filter(item => item.type === 'route')
      .map(item => ({
        id: item.data.id,
        name: getLocalizedText((item.data as any).name, language),
        city_id: item.city_id_for_grouping,
        dates: item.date ? [item.date] : [],
        orderIndex: item.orderIndex,
        time: item.time
      }));
    
    const events = itemsToSave
      .filter(item => item.type === 'event')
      .map(item => ({
        id: item.data.id,
        name: getLocalizedText((item.data as any).name, language),
        city_id: item.city_id_for_grouping,
        dates: item.date ? [item.date] : [],
        orderIndex: item.orderIndex,
        time: item.time,
        location: (item.data as Event).location
      }));
    
    // Also keep the planned_items structure for potential future migration
    const planned_items = itemsToSave.map(pi => {
        const itemData = {
            type: pi.type, 
            data_id: pi.data.id,
            city_id_for_grouping: pi.city_id_for_grouping,
            date: pi.date,
            time: pi.time,
            orderIndex: pi.orderIndex,
            name: getLocalizedText((pi.data as any).name, language), 
            location: pi.type === 'place' || pi.type === 'event' ? (pi.data as Place | Event).location : undefined
        };
        console.log(`📝 Processing item ${pi.type}:`, itemData);
        return itemData;
    });
    
    const goalData = {
        user_id: authContext.auth.user.id,
        title: currentGoalName.trim() || `Паломничество ${format(new Date(), 'dd.MM.yyyy')}`,
        cities: cities.length > 0 ? cities : null,
        places: places.length > 0 ? places : null,
        routes: routes.length > 0 ? routes : null,
        events: events.length > 0 ? events : null,
        start_date: selectedDateRange?.from ? format(selectedDateRange.from, 'yyyy-MM-dd') : null,
        end_date: selectedDateRange?.to ? format(selectedDateRange.to, 'yyyy-MM-dd') : null,
        total_items: itemsToSave.length,
        // Note: planned_items, selected_place_subtypes, and selected_event_subtypes 
        // are not included as they don't exist in the current database schema
      };

    try {
      console.log('📤 Отправка данных в Supabase:', {
        hasUserId: !!goalData.user_id,
        title: goalData.title,
        itemsCount: goalData.total_items,
        isUpdate: !!currentLoadedGoalId
      });
      
      if (currentLoadedGoalId) {
        console.log('🔄 Обновление существующей цели:', currentLoadedGoalId);
        const { error } = await supabase.from('goals').update(goalData).eq('id', currentLoadedGoalId).eq('user_id', authContext.auth.user.id);
        if (error) {
          console.error('❌ Ошибка обновления цели:', error);
          throw error;
        }
        console.log('✅ Цель успешно обновлена');
        alert(t('goal_updated_successfully', {defaultValue: 'Goal updated successfully.'}));
      } else {
        console.log('🆕 Создание новой цели');
        const { data: insertedGoal, error } = await supabase.from('goals').insert([goalData]).select();
        if (error) {
          console.error('❌ Ошибка создания цели:', error);
          throw error;
        }
        if (insertedGoal && insertedGoal.length > 0) {
            console.log('✅ Цель успешно создана:', insertedGoal[0].id);
            setCurrentLoadedGoalId(insertedGoal[0].id);
        }
        alert(t('goal_saved_successfully'));
      }
      console.log('📂 Обновление списка целей');
      fetchGoals();
    } catch (error) {
      console.error("❌ Error saving/updating goal:", error);
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
      
      console.log('📂 Загрузка цели:', goal);
      
      // Try to load from planned_items first (new format)
      let loadedPlannedItemsStubs = goal.planned_items || [];
      
      // If planned_items is empty, try to reconstruct from separate columns (old format)
      if (loadedPlannedItemsStubs.length === 0) {
        console.log('🔄 Восстановление из отдельных колонок...');
        const reconstructedStubs: any[] = [];
        
        // Reconstruct cities
        if (goal.cities && Array.isArray(goal.cities)) {
          goal.cities.forEach((city: any) => {
            reconstructedStubs.push({
              type: 'city',
              data_id: city.id,
              city_id_for_grouping: city.id,
              date: city.dates?.[0],
              time: city.time,
              orderIndex: city.orderIndex || 0
            });
          });
        }
        
        // Reconstruct places
        if (goal.places && Array.isArray(goal.places)) {
          goal.places.forEach((place: any) => {
            reconstructedStubs.push({
              type: 'place',
              data_id: place.id,
              city_id_for_grouping: place.city_id,
              date: place.dates?.[0],
              time: place.time,
              orderIndex: place.orderIndex || 0
            });
          });
        }
        
        // Reconstruct routes
        if (goal.routes && Array.isArray(goal.routes)) {
          goal.routes.forEach((route: any) => {
            reconstructedStubs.push({
              type: 'route',
              data_id: route.id,
              city_id_for_grouping: route.city_id,
              date: route.dates?.[0],
              time: route.time,
              orderIndex: route.orderIndex || 0
            });
          });
        }
        
        // Reconstruct events
        if (goal.events && Array.isArray(goal.events)) {
          goal.events.forEach((event: any) => {
            reconstructedStubs.push({
              type: 'event',
              data_id: event.id,
              city_id_for_grouping: event.city_id,
              date: event.dates?.[0],
              time: event.time,
              orderIndex: event.orderIndex || 0
            });
          });
        }
        
        loadedPlannedItemsStubs = reconstructedStubs;
        console.log('📝 Восстановленные элементы:', loadedPlannedItemsStubs);
      }
      
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
    <div className="flex flex-col h-screen">
      {/* Основной контент с трехколоночной структурой */}
      {!isLoadingCities && !isLoadingPlacesAndEvents && (
        <div className="grid grid-cols-1 xl:grid-cols-10 gap-0 flex-1">
          {/* Левая колонка - Фильтры (30%) */}
          <div className="xl:col-span-3 order-1 h-full flex flex-col min-h-0">
            <PilgrimagePlannerControls
              availableCities={availableCities}
              filterSelectedCityIds={filterControlSelectedCityIds}
              onFilterSelectedCityIdsChange={setFilterControlSelectedCityIds}
              plannedItems={plannedItems}
              selectedDateRange={selectedDateRange}
              language={language}
              t={t}
              onDateRangeChange={handleDateRangeChange}
              onDistributeDates={handleDistributeDates}
              onAddFavoritesToPlan={handleAddFavoritesToPlan}
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
              isLoadingData={isLoadingCities || isLoadingPlacesAndEvents}
            />
          </div>

          {/* Средняя колонка - Список городов и мест (30%) */}
          <div className="xl:col-span-3 order-2 border-l border-gray-200 h-full flex flex-col">
            {showSearchResults ? (
              <PilgrimagePlanDisplay
                plannedItems={sortedItemsForDisplay}
                language={language}
                t={t}
                onUpdateDateTime={handleUpdatePlannedItemDateTime}
                onRemoveItem={handleRemovePlannedItem}
                onAddPlacesForCity={handleAddPlacesForCity}
                onSearchAndAddPlace={handleSearchAndAddPlace}
                onAddSpecificPlace={handleAddSpecificPlace}
                onReorderItems={handlePlannedItemsReorder}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 bg-gray-50 p-4">
                <div className="text-center">
                  <div className="text-2xl mb-2">📍</div>
                  <p className="text-sm">
                    {t('press_find_to_see_plan', { defaultValue: 'Нажмите "Найти", чтобы увидеть список городов и мест' })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Правая колонка - Карта (40%) */}
          <div className="xl:col-span-4 order-3 border-l border-gray-200 h-full flex flex-col min-h-0">
            <div className="flex-1 min-h-0">
              <PilgrimageRouteMap plannedItems={plannedItems.length > 0 ? sortedItemsForDisplay : []} />
            </div>
          </div>
        </div>
      )}

  
      {(isLoadingCities || isLoadingPlacesAndEvents) && (
        <div className="text-center p-4">
          {t('loading_data', { defaultValue: 'Loading data...'})}
        </div>
      )}
    </div>
  );
}
