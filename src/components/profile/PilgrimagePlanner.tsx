import { useEffect, useState, useCallback } from "react";
import { type AuthContextType } from "../../context/AuthContext";
import { type LanguageContextType } from "../../context/LanguageContext";
import { City, Place, Route, Event, Language, PlannedItem, Location } from "../../types";
import { getCities } from "../../services/citiesApi";
import { getPlacesByCityId } from "../../services/placesApi";
import { format, addDays, eachDayOfInterval } from "date-fns";
import { getCitiesByIds, fetchPlaceData, getRoutesByIds, getEventsByIds } from '../../services/api';
import { supabase } from '../../integrations/supabase/client';

import { PilgrimagePlannerControls } from "./PilgrimagePlannerControls";
import { PilgrimagePlanDisplay } from "./PilgrimagePlanDisplay";
import PilgrimageRouteMap from "./PilgrimageRouteMap";

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
  const [savedGoals, setSavedGoals] = useState<any[]>([]);

  // State for managing loaded goal name and ID
  const [goalNameForInput, setGoalNameForInput] = useState('');
  const [currentLoadedGoalId, setCurrentLoadedGoalId] = useState<string | null>(null);

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

    if (finalSortedList.length > 0 && !isPlanInitiated){
        setIsPlanInitiated(true);
    } 
  }, [plannedItems, isPlanInitiated]); 

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
    // If all items are removed, maybe clear loaded goal info
    if (plannedItems.length === 1) { 
        setCurrentLoadedGoalId(null);
        setGoalNameForInput('');
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        fetchGoals();
      }
      if (event === 'SIGNED_OUT') {
        setSavedGoals([]);
        setCurrentLoadedGoalId(null); // Clear loaded goal on sign out
        setGoalNameForInput('');
      }
    });
    return () => subscription.unsubscribe();
  }, [fetchGoals]);

  const handleSaveOrUpdateGoal = async (currentGoalName: string) => {
    if (!authContext?.auth?.user?.id) {
      alert(t('user_not_authenticated_error_message', {defaultValue: 'User not authenticated.'}));
      return;
    }

    const goalData = {
        user_id: authContext.auth.user.id,
        title: currentGoalName.trim() || `Паломничество ${format(new Date(), 'dd.MM.yyyy')}`,
        cities: plannedItems
          .filter(item => item.type === 'city')
          .map(cityItem => ({
            id: cityItem.data.id,
            name: cityItem.data.name,
            dates: [cityItem.date]
          })),
        places: plannedItems
          .filter(item => item.type === 'place' && item.data)
          .map(placeItem => ({
            id: placeItem.data.id,
            name: placeItem.data.name,
            city_id: placeItem.city_id_for_grouping,
            dates: [placeItem.date],
            location: (placeItem.data as Place).location
          })),
        routes: plannedItems
          .filter(item => item.type === 'route' && item.data)
          .map(routeItem => ({
            id: routeItem.data.id,
            name: routeItem.data.name,
            city_id: routeItem.city_id_for_grouping,
            dates: [routeItem.date]
          })),
        events: plannedItems
          .filter(item => item.type === 'event' && item.data)
          .map(eventItem => ({
            id: eventItem.data.id,
            name: eventItem.data.name,
            city_id: eventItem.city_id_for_grouping,
            dates: [eventItem.date],
            location: (eventItem.data as Event).location
          })),
        start_date: selectedDateRange?.from ? format(selectedDateRange.from, 'yyyy-MM-dd') : null,
        end_date: selectedDateRange?.to ? format(selectedDateRange.to, 'yyyy-MM-dd') : null,
        total_items: plannedItems.length
      };

    try {
      if (currentLoadedGoalId) {
        // Update existing goal
        const { error } = await supabase
          .from('goals')
          .update(goalData)
          .eq('id', currentLoadedGoalId)
          .eq('user_id', authContext.auth.user.id);
        if (error) throw error;
        alert(t('goal_updated_successfully', {defaultValue: 'Goal updated successfully.'}));
      } else {
        // Insert new goal
        const { error } = await supabase.from('goals').insert([goalData]);
        if (error) throw error;
        alert(t('goal_saved_successfully'));
        // For new goals, we might want to clear the input, but not for updates.
        // setCurrentLoadedGoalId(null); // This would be set if a new goal is loaded
        // setGoalNameForInput(''); // Clear input only for new saves that don't load it back
      }
      fetchGoals(); // Refetch goals to update the list in both cases
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
        const { error } = await supabase
            .from('goals')
            .delete()
            .eq('user_id', authContext.auth.user.id) 
            .eq('id', goalId);

        if (error) throw error;
        
        setSavedGoals(prevGoals => prevGoals.filter(goal => goal.id !== goalId));
        // If the deleted goal was the currently loaded one, clear the input fields
        if (currentLoadedGoalId === goalId) {
            setCurrentLoadedGoalId(null);
            setGoalNameForInput('');
        }
        alert(t('goal_deleted_successfully'));
    } catch (error) {
        console.error('Error deleting goal:', error);
        alert(t('error_deleting_goal'));
    }
  };

  const handleLoadGoal = async (goalId: string) => {
    try {
      const { data: goal, error } = await supabase
        .from('goals')
        .select('*')
        .eq('id', goalId)
        .single();

      if (error) throw error;
      if (!goal) {
        alert(t('goal_not_found', {defaultValue: 'Goal not found.'}));
        setCurrentLoadedGoalId(null); // Clear if goal not found
        setGoalNameForInput('');
        return;
      }

      setPlannedItems([]); 
      
      const cityItems = (goal.cities || []).map((city: any) => ({
        type: 'city',
        data: { id: city.id, name: city.name },
        city_id_for_grouping: city.id,
        date: city.dates?.[0],
        time: getRandomTime()
      } as PlannedItem));

      const placeItems = (goal.places || []).map((place: any) => ({
        type: 'place',
        data: { id: place.id, name: place.name, location: place.location as Location }, 
        city_id_for_grouping: place.city_id,
        date: place.dates?.[0],
        time: getRandomTime()
      } as PlannedItem));

      const routeItems = (goal.routes || []).map((route: any) => ({
        type: 'route',
        data: { id: route.id, name: route.name }, 
        city_id_for_grouping: route.city_id,
        date: route.dates?.[0],
        time: getRandomTime()
      } as PlannedItem));

      const eventItems = (goal.events || []).map((event: any) => ({
        type: 'event',
        data: { id: event.id, name: event.name, location: event.location as Location }, 
        city_id_for_grouping: event.city_id,
        date: event.dates?.[0],
        time: getRandomTime()
      } as PlannedItem));

      const newPlannedItems = [...cityItems, ...placeItems, ...routeItems, ...eventItems];
      setPlannedItems(newPlannedItems);
      
      if (newPlannedItems.length > 0) {
          setIsPlanInitiated(true);
      } else {
          setIsPlanInitiated(false); // If goal is empty, set to false
      }
      
      // Set the loaded goal ID and name for the input field
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

    } catch (error) {
      console.error('Error loading goal:', error);
      alert(t('error_loading_goal', {defaultValue: 'Error loading goal. Please check console.'}));
      setCurrentLoadedGoalId(null); // Clear on error
      setGoalNameForInput('');
    }
  };

  const handleAddFavoritesToPlan = async () => {
    if (!authContext || !authContext.auth || !authContext.auth.user) {
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
  
  // Effect to clear loaded goal name if plannedItems become empty and a goal was loaded
  useEffect(() => {
    if (plannedItems.length === 0 && currentLoadedGoalId) {
      setCurrentLoadedGoalId(null);
      setGoalNameForInput('');
      setIsPlanInitiated(false);
    }
    if (plannedItems.length > 0 && !isPlanInitiated) {
        setIsPlanInitiated(true);
    }
  }, [plannedItems, currentLoadedGoalId, isPlanInitiated]);

  return (
    <>
      <PilgrimagePlannerControls
        availableCities={availableCities}
        stagedCities={stagedForPlanningCities}
        plannedItems={plannedItems} 
        onRemoveStagedCity={handleRemoveStagedCity}
        selectedDateRange={selectedDateRange} 
        language={language}
        t={t}
        onDateRangeChange={handleDateRangeChange}
        onCitySelect={handleStageCityForPlanning} 
        onAddFavoritesToPlan={handleAddFavoritesToPlan}
        onAddStagedCities={handleAddStagedCitiesToMainPlan} 
        onDistributeDates={handleDistributeDates}
        
        goalNameValue={goalNameForInput}
        onGoalNameChange={setGoalNameForInput}
        currentLoadedGoalId={currentLoadedGoalId} // Pass this to change button text
        onSaveOrUpdateGoal={handleSaveOrUpdateGoal} // Renamed from onSaveAsGoal
        
        onDeleteGoal={handleDeleteGoal}
        onLoadGoal={handleLoadGoal} // Renamed from original onLoadGoal to make it clear
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
