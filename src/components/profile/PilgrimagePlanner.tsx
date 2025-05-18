import { useEffect, useState, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

// Helper function to get the next orderIndex
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

  // useEffect for sorting items for display based on orderIndex
  useEffect(() => {
    const finalSortedList = [...plannedItems].sort((a, b) => a.orderIndex - b.orderIndex);
    setSortedItemsForDisplay(finalSortedList);

    if (finalSortedList.length > 0 && !isPlanInitiated){
        setIsPlanInitiated(true);
    } else if (finalSortedList.length === 0 && isPlanInitiated) {
        setIsPlanInitiated(false);
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
        // order: nextIndex, // Keep or remove based on decision for `order` field
        time: getRandomTime(),
        date: dateOfCity,
        orderIndex: getNextOrderIndex(plannedItems), // Assign orderIndex
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
      const targetDate = intervalDays[dayIndex % intervalDays.length]; // Cycle through days if more cities than days
      const cityItemInUpdateArray = updatedPlannedItems.find(pi => pi.data.id === cityItem.data.id && pi.type === 'city');
      if (cityItemInUpdateArray) {
          cityItemInUpdateArray.date = format(targetDate, 'yyyy-MM-dd');
      }
      // Also update dates for items within this city if they don't have a date yet or should match the city
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
      orderIndex: currentOrderIndex++, // Assign and increment orderIndex
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
    ).map((item, index) => ({ ...item, orderIndex: index })) // Re-index after removal
    );
    if (plannedItems.length === 1 && currentLoadedGoalId) { 
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
    // ... (fetchGoals implementation - assumed correct)
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
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') fetchGoals();
      if (event === 'SIGNED_OUT') {
        setSavedGoals([]);
        setCurrentLoadedGoalId(null);
        setGoalNameForInput('');
      }
    });
    return () => subscription.unsubscribe();
  }, [fetchGoals]);

  const handleSaveOrUpdateGoal = async (currentGoalName: string) => {
    // ... (handleSaveOrUpdateGoal implementation - needs to include orderIndex in saved data)
    if (!authContext?.auth?.user?.id) {
      alert(t('user_not_authenticated_error_message', {defaultValue: 'User not authenticated.'}));
      return;
    }

    // Ensure all items have an orderIndex before saving
    const itemsToSave = plannedItems.map((item, index) => ({
      ...item,
      orderIndex: item.orderIndex ?? index // Fallback if somehow orderIndex is missing
    }));

    const goalData = {
        user_id: authContext.auth.user.id,
        title: currentGoalName.trim() || `Паломничество ${format(new Date(), 'dd.MM.yyyy')}`,
        // Save plannedItems with their orderIndex
        planned_items: itemsToSave.map(pi => ({ 
            type: pi.type, 
            data_id: pi.data.id, // Store only ID, fetch full data on load if needed
            city_id_for_grouping: pi.city_id_for_grouping,
            date: pi.date,
            time: pi.time,
            orderIndex: pi.orderIndex,
            // Store minimal data, reconstruct or fetch full 'data' object on load
            name: (pi.data as any).name, // Assuming name is a common property for display
            location: pi.type === 'place' || pi.type === 'event' ? (pi.data as Place | Event).location : undefined
        })),
        start_date: selectedDateRange?.from ? format(selectedDateRange.from, 'yyyy-MM-dd') : null,
        end_date: selectedDateRange?.to ? format(selectedDateRange.to, 'yyyy-MM-dd') : null,
      };

    try {
      if (currentLoadedGoalId) {
        const { error } = await supabase
          .from('goals')
          .update({ ...goalData, planned_items_structure: goalData.planned_items }) // Use a different field name if `planned_items` column type needs specific JSON structure
          .eq('id', currentLoadedGoalId)
          .eq('user_id', authContext.auth.user.id);
        if (error) throw error;
        alert(t('goal_updated_successfully', {defaultValue: 'Goal updated successfully.'}));
      } else {
        const { error } = await supabase.from('goals').insert([{ ...goalData, planned_items_structure: goalData.planned_items }]);
        if (error) throw error;
        alert(t('goal_saved_successfully'));
      }
      fetchGoals();
    } catch (error) {
      console.error("Error saving/updating goal:", error);
      alert(t('error_saving_goal'));
    }
  };
  
  const handleDeleteGoal = async (goalId: string) => {
    // ... (handleDeleteGoal implementation - assumed correct)
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
    // ... (handleLoadGoal implementation - needs to reconstruct PlannedItem with orderIndex from saved data)
    try {
      const { data: goal, error } = await supabase
        .from('goals')
        .select('*, planned_items_structure:planned_items') // Adjust if you used a different field name like planned_items_structure
        .eq('id', goalId)
        .single();

      if (error) throw error;
      if (!goal || !goal.planned_items_structure) { // Check for planned_items_structure
        alert(t('goal_not_found', {defaultValue: 'Goal not found or data is corrupt.'}));
        setCurrentLoadedGoalId(null); setGoalNameForInput('');
        return;
      }
      
      // Reconstruct plannedItems from goal.planned_items_structure
      // This is a complex step: you need to fetch full City, Place, Route, Event data based on stored IDs
      const reconstructedItems: PlannedItem[] = [];
      let itemFetchPromises = (goal.planned_items_structure as any[]).map(async (itemStub: any) => {
        let fullData: City | Place | Route | Event | null = null;
        // NOTE: This is a simplified fetch. You'll need robust fetching for each type.
        // You might already have functions like getCitiesByIds, fetchPlaceData, etc.
        if (itemStub.type === 'city') fullData = (await getCitiesByIds([itemStub.data_id]))?.[0];
        else if (itemStub.type === 'place') fullData = (await fetchPlaceData([itemStub.data_id]))?.[0];
        // Add similar fetches for Route and Event types
        
        if (fullData) {
            reconstructedItems.push({
                type: itemStub.type,
                data: fullData,
                city_id_for_grouping: itemStub.city_id_for_grouping,
                date: itemStub.date,
                time: itemStub.time,
                orderIndex: itemStub.orderIndex
            } as PlannedItem);
        }
      });
      await Promise.all(itemFetchPromises);
      
      // Sort by orderIndex after all items are fetched and reconstructed
      reconstructedItems.sort((a,b) => a.orderIndex - b.orderIndex);

      setPlannedItems(reconstructedItems);
      
      if (reconstructedItems.length > 0) setIsPlanInitiated(true);
      else setIsPlanInitiated(false);
      
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
      setCurrentLoadedGoalId(null); setGoalNameForInput('');
    }
  };

  const handleAddFavoritesToPlan = async () => {
    // ... (current implementation)
    // Modify to add orderIndex to new items
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

    let currentFavOrderIndex = getNextOrderIndex(plannedItems);

    if (cities_like && cities_like.length > 0) {
      const favCities = await getCitiesByIds(cities_like);
      favCities.forEach(city => itemsToAdd.push({ type: 'city', data: city, city_id_for_grouping: city.id, time: getRandomTime(), orderIndex: currentFavOrderIndex++ }));
    }
    if (places_like && places_like.length > 0) {
      const favPlaces = await fetchPlaceData(places_like);
      favPlaces.forEach(place => itemsToAdd.push({ type: 'place', data: place, city_id_for_grouping: place.cityId, time: getRandomTime(), date: cityDatesMap.get(place.cityId), orderIndex: currentFavOrderIndex++ }));
    }
    if (routes_like && routes_like.length > 0) {
      const favRoutes = await getRoutesByIds(routes_like);
      favRoutes.forEach(route => itemsToAdd.push({ type: 'route', data: route, city_id_for_grouping: route.cityId, time: getRandomTime(), date: cityDatesMap.get(route.cityId), orderIndex: currentFavOrderIndex++ }));
    }
    if (events_like && events_like.length > 0) {
      const favEvents = await getEventsByIds(events_like);
      favEvents.forEach(event => itemsToAdd.push({ type: 'event', data: event, city_id_for_grouping: event.cityId, time: event.time || getRandomTime(), date: cityDatesMap.get(event.cityId), orderIndex: currentFavOrderIndex++ }));
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
    if (plannedItems.length === 0 && currentLoadedGoalId) {
      setCurrentLoadedGoalId(null);
      setGoalNameForInput('');
      // setIsPlanInitiated(false); // Moved to the main sorting useEffect
    }
    // if (plannedItems.length > 0 && !isPlanInitiated) { // Moved to the main sorting useEffect
    //     setIsPlanInitiated(true);
    // }
  }, [plannedItems, currentLoadedGoalId]); // Removed isPlanInitiated from deps here

  // New handler for reordering
  const handlePlannedItemsReorder = (newlyOrderedItems: PlannedItem[]) => {
    // Ensure all items in newlyOrderedItems have a sequential orderIndex starting from 0
    const finalItems = newlyOrderedItems.map((item, index) => ({ ...item, orderIndex: index }));
    setPlannedItems(finalItems);
  };

  const [pilgrimageType, setPilgrimageType] = useState<string>("");

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <Select onValueChange={setPilgrimageType} value={pilgrimageType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('pilgrimage_filter_title')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="temple" className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                {t('place_type_temple')}
              </SelectItem>
              <SelectItem value="samadhi" className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                {t('place_type_samadhi')}
              </SelectItem>
              <SelectItem value="kunda" className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                {t('place_type_kunda')}
              </SelectItem>
              <SelectItem value="ashram" className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                {t('place_type_ashram')}
              </SelectItem>
              <SelectItem value="festival" className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                {t('event_type_festival')}
              </SelectItem>
              <SelectItem value="practice" className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                {t('event_type_practice')}
              </SelectItem>
              <SelectItem value="vipassana" className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-teal-500"></span>
                {t('event_type_vipassana')}
              </SelectItem>
              <SelectItem value="ayurveda" className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                {t('event_type_ayurveda')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{t('selected')}:</span>
          {pilgrimageType && (
            <span className="font-medium">
              {t(pilgrimageType.startsWith('place_') ? 
                `place_type_${pilgrimageType.replace('place_', '')}` : 
                `event_type_${pilgrimageType}`)}
            </span>
          )}
        </div>
      </div>
      <PilgrimagePlannerControls
        // ... (other props)
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
        currentLoadedGoalId={currentLoadedGoalId}
        onSaveOrUpdateGoal={handleSaveOrUpdateGoal}
        onDeleteGoal={handleDeleteGoal}
        onLoadGoal={handleLoadGoal}
        savedGoals={savedGoals}
      />
      {isPlanInitiated && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"> 
          <div className="md:col-span-1"> 
            <PilgrimagePlanDisplay
                plannedItems={sortedItemsForDisplay} // Use sortedItemsForDisplay
                language={language}
                t={t}
                onUpdateDateTime={handleUpdatePlannedItemDateTime}
                onRemoveItem={handleRemovePlannedItem}
                onAddPlacesForCity={handleAddPlacesForCity}
                onReorderItems={handlePlannedItemsReorder} // Pass the new handler
            />
          </div>
          <div className="md:col-span-1"> 
            {plannedItems.length > 0 && (
              // Pass sortedItemsForDisplay if map should also follow this precise order
              <PilgrimageRouteMap plannedItems={sortedItemsForDisplay} /> 
            )}
          </div>
        </div>
      )}
    </>
  );
}
