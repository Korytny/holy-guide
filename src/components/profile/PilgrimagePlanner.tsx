import { useEffect, useState, useCallback } from "react";
import { type AuthContextType } from "../../context/AuthContext";
import { type LanguageContextType } from "../../context/LanguageContext";
import { City, Place, Route, Event, Language, PlannedItem } from "../../types";
import { getCities } from "../../services/citiesApi";
import { getPlacesByCityId } from "../../services/placesApi";
import { format, addDays, eachDayOfInterval } from "date-fns";
// Removed date-fns/locale imports from here as they are now in PilgrimagePlannerControls
import { getCitiesByIds, fetchPlaceData, getRoutesByIds, getEventsByIds } from '../../services/api';
import { supabase } from '../../integrations/supabase/client';

import { PilgrimagePlannerControls } from "./PilgrimagePlannerControls";
import { PilgrimagePlanDisplay } from "./PilgrimagePlanDisplay";
import PilgrimageRouteMap from "./PilgrimageRouteMap";

// Removed dateFnsLocales as it's moved to PilgrimagePlannerControls

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

export const PilgrimagePlanner: React.FC<PilgrimagePlannerProps> = ({ auth: authContext, language, t, onItemsChange }) => {
  const [availableCities, setAvailableCities] = useState<City[]>([]);
  const [stagedForPlanningCities, setStagedForPlanningCities] = useState<City[]>([]);
  const [plannedItems, setPlannedItems] = useState<PlannedItem[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<import("react-day-picker").DateRange | undefined>(undefined);
  const [sortedItemsForDisplay, setSortedItemsForDisplay] = useState<PlannedItem[]>([]);
  const [isPlanInitiated, setIsPlanInitiated] = useState<boolean>(false);
  const [cityPlaceSuggestions, setCityPlaceSuggestions] = useState<Record<string, CitySuggestionState>>({});

  useEffect(() => {
    if (onItemsChange) {
      onItemsChange(plannedItems);
    }
  }, [plannedItems, onItemsChange]);

  useEffect(() => {
    const fetchCities = async () => {
      const response = await getCities();
      if (response) setAvailableCities(response);
    };
    fetchCities();
  }, []);

  useEffect(() => {
    const finalSortedList: PlannedItem[] = [];
    const processedItemIds = new Set<string>();
    const cityItems = plannedItems.filter(item => item.type === 'city')
                                .sort((a,b) => (a.time || a.data.id).localeCompare(b.time || b.data.id));
    
    cityItems.forEach(cityItem => {
      if (!processedItemIds.has(cityItem.data.id + '-' + cityItem.type)) {
        finalSortedList.push(cityItem);
        processedItemIds.add(cityItem.data.id + '-' + cityItem.type);
        const itemsForThisCity = plannedItems
          .filter(item => item.type !== 'city' && item.city_id_for_grouping === cityItem.data.id)
          .sort((a,b) => (a.time || "").localeCompare(b.time || ""));
        itemsForThisCity.forEach(item => {
          if (!processedItemIds.has(item.data.id + '-' + item.type)) {
            finalSortedList.push(item);
            processedItemIds.add(item.data.id + '-' + item.type);
          }
        });
      }
    });
    const remainingItems = plannedItems.filter(item => !processedItemIds.has(item.data.id + '-' + item.type))
                                   .sort((a,b) => (a.time || "").localeCompare(b.time || ""));
    finalSortedList.push(...remainingItems);
    setSortedItemsForDisplay(finalSortedList);

    if (finalSortedList.length > 0 ){
        if(!isPlanInitiated) setIsPlanInitiated(true);
    } 
  }, [plannedItems]); 

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
        order: nextIndex,
        time: getRandomTime(),
        date: dateOfCity,
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
      if (dayIndex < intervalDays.length) {
        const targetDate = intervalDays[dayIndex];
        const cityItemInUpdateArray = updatedPlannedItems.find(pi => pi.data.id === cityItem.data.id && pi.type === 'city');
        if (cityItemInUpdateArray) {
            cityItemInUpdateArray.date = format(targetDate, 'yyyy-MM-dd');
        }
        dayIndex++;
      } else {
        const lastAvailableDate = intervalDays[intervalDays.length -1];
        const cityItemInUpdateArray = updatedPlannedItems.find(pi => pi.data.id === cityItem.data.id && pi.type === 'city');
        if (cityItemInUpdateArray) {
             cityItemInUpdateArray.date = format(lastAvailableDate, 'yyyy-MM-dd');
        }
      }
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
    const newItemsForPlan: PlannedItem[] = stagedForPlanningCities.map(city => ({
      type: 'city',
      data: city,
      city_id_for_grouping: city.id,
      time: getRandomTime(),
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
    setPlannedItems(prevItems => prevItems.filter(item => 
      !(item.type === itemToRemove.type && item.data.id === itemToRemove.data.id)
    ));
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

  const [savedGoals, setSavedGoals] = useState([]);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        // First check if we have an active session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) {
          console.log('No active session found');
          setSavedGoals([]);
          return;
        }

        // Then fetch goals for the authenticated user
        const { data, error } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching goals:', error);
          return;
        }

        if (data) {
          console.log('Fetched goals:', data.length);
          setSavedGoals(data);
        }
      } catch (error) {
        console.error('Error in fetchGoals:', error);
      }
    };
    
    fetchGoals();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        fetchGoals();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const onSaveAsGoal = async (goalName: string) => {
    if (!authContext?.auth?.user?.id) {
      console.error("User not authenticated");
      return;
    }

    try {
      const { error } = await supabase
        .from('goals')
        .insert({
          user_id: authContext.auth.user.id,
          title: goalName || `Паломничество ${format(new Date(), 'dd.MM.yyyy')}`,
          cities: plannedItems
            .filter(item => item.type === 'city')
            .map(city => ({
              id: city.data.id,
              name: city.data.name,
              dates: [city.date]
            })),
          places: plannedItems
            .filter(item => item.type === 'place')
            .map(place => ({
              id: place.data.id,
              name: place.data.name,
              city_id: place.city_id_for_grouping,
              dates: [place.date]
            })),
          routes: plannedItems
            .filter(item => item.type === 'route')
            .map(route => ({
              id: route.data.id,
              name: route.data.name,
              city_id: route.city_id_for_grouping,
              dates: [route.date]
            })),
          events: plannedItems
            .filter(item => item.type === 'event')
            .map(event => ({
              id: event.data.id,
              name: event.data.name,
              city_id: event.city_id_for_grouping,
              dates: [event.date]
            })),
          start_date: selectedDateRange?.from,
          end_date: selectedDateRange?.to,
          total_items: plannedItems.length
        });

      if (error) throw error;
      alert(t('goal_saved_successfully'));
    } catch (error) {
      console.error("Error saving goal:", error);
      alert(t('error_saving_goal'));
    }
  };

  const handleAddFavoritesToPlan = async () => {
    if (!authContext || !authContext.auth || !authContext.auth.user) {
      console.error("User data not available"); return;
    }
    const { cities_like, places_like, routes_like, events_like } = authContext.auth.user;
    const itemsToAdd: PlannedItem[] = [];
    const cityDatesMap = new Map<string, string | undefined>();
    plannedItems.forEach(item => {
      if (item.type === 'city' && item.date) {
        cityDatesMap.set(item.data.id, item.date);
      }
    });

    if (cities_like && cities_like.length > 0) {
      const favCities = await getCitiesByIds(cities_like);
      favCities.forEach(city => itemsToAdd.push({ type: 'city', data: city, city_id_for_grouping: city.id, time: getRandomTime() }));
    }
    if (places_like && places_like.length > 0) {
      const favPlaces = await fetchPlaceData(places_like);
      favPlaces.forEach(place => itemsToAdd.push({ type: 'place', data: place, city_id_for_grouping: place.cityId, time: getRandomTime(), date: cityDatesMap.get(place.cityId) }));
    }
    if (routes_like && routes_like.length > 0) {
      const favRoutes = await getRoutesByIds(routes_like);
      favRoutes.forEach(route => itemsToAdd.push({ type: 'route', data: route, city_id_for_grouping: route.cityId, time: getRandomTime(), date: cityDatesMap.get(route.cityId) }));
    }
    if (events_like && events_like.length > 0) {
      const favEvents = await getEventsByIds(events_like);
      favEvents.forEach(event => itemsToAdd.push({ type: 'event', data: event, city_id_for_grouping: event.cityId, time: getRandomTime(), date: cityDatesMap.get(event.cityId) }));
    }
    
    if (itemsToAdd.length > 0) {
        setPlannedItems(prevItems => {
            const currentItemSignature = new Set(prevItems.map(item => `${item.type}-${item.data.id}`));
            const uniqueNewItems = itemsToAdd.filter(newItem => !currentItemSignature.has(`${newItem.type}-${newItem.data.id}`));
            return [...prevItems, ...uniqueNewItems];
        });
    }
  };
  
  useEffect(() => {
    if (plannedItems.length > 0) {
      setIsPlanInitiated(true);
    } 
  }, [plannedItems]);

  // Removed displayedDateRange calculation

  return (
    <>
      <PilgrimagePlannerControls
        availableCities={availableCities}
        stagedCities={stagedForPlanningCities}
        onRemoveStagedCity={handleRemoveStagedCity}
        selectedDateRange={selectedDateRange} // Pass selectedDateRange directly
        // displayedDateRange prop removed
        language={language}
        t={t}
        onDateRangeChange={handleDateRangeChange}
        onCitySelect={handleStageCityForPlanning} 
        onAddFavoritesToPlan={handleAddFavoritesToPlan}
        onAddStagedCities={handleAddStagedCitiesToMainPlan} 
        onDistributeDates={handleDistributeDates}
        onSaveAsGoal={onSaveAsGoal}
        onLoadGoal={async (goalId) => {
          try {
            const { data: goal, error } = await supabase
              .from('goals')
              .select('*')
              .eq('id', goalId)
              .single();

            if (error) throw error;
            if (!goal) {
              console.log('Goal not found');
              return;
            }

            // Clear current plan
            setPlannedItems([]);
            
            // Load cities from goal
            const cityItems = (goal.cities || []).map((city: any) => ({
              type: 'city',
              data: {
                id: city.id,
                name: city.name
              },
              city_id_for_grouping: city.id,
              date: city.dates?.[0],
              time: getRandomTime()
            }));

            // Load places from goal
            const placeItems = (goal.places || []).map((place: any) => ({
              type: 'place',
              data: {
                id: place.id,
                name: place.name
              },
              city_id_for_grouping: place.city_id,
              date: place.dates?.[0],
              time: getRandomTime()
            }));

            // Load routes from goal
            const routeItems = (goal.routes || []).map((route: any) => ({
              type: 'route',
              data: {
                id: route.id,
                name: route.name
              },
              city_id_for_grouping: route.city_id,
              date: route.dates?.[0],
              time: getRandomTime()
            }));

            // Load events from goal
            const eventItems = (goal.events || []).map((event: any) => ({
              type: 'event',
              data: {
                id: event.id,
                name: event.name
              },
              city_id_for_grouping: event.city_id,
              date: event.dates?.[0],
              time: getRandomTime()
            }));

            // Combine all items
            setPlannedItems([...cityItems, ...placeItems, ...routeItems, ...eventItems]);
            
            // Update date range if available
            if (goal.start_date || goal.end_date) {
              setSelectedDateRange({
                from: goal.start_date ? new Date(goal.start_date) : undefined,
                to: goal.end_date ? new Date(goal.end_date) : undefined
              });
            }

          } catch (error) {
            console.error('Error loading goal:', error);
          }
        }}
        savedGoals={savedGoals}
      />
      {isPlanInitiated && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"> 
          <div className="md:col-span-1"> 
            <PilgrimagePlanDisplay
                plannedItems={sortedItemsForDisplay}
                language={language}
                t={t}
                onUpdateDateTime={handleUpdatePlannedItemDateTime}
                onRemoveItem={handleRemovePlannedItem}
                onAddPlacesForCity={handleAddPlacesForCity}
            />
          </div>
          <div className="md:col-span-1"> 
            {plannedItems.length > 0 && (
              <PilgrimageRouteMap plannedItems={plannedItems} />
            )}
          </div>
        </div>
      )}
    </>
  );
}
