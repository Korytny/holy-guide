import { useEffect, useState, useCallback } from "react";
import { type AuthContextType } from "../../context/AuthContext";
import { type LanguageContextType } from "../../context/LanguageContext";
import { City, Place, Route, Event, Language, PlannedItem } from "../../types";
import { getCities } from "../../services/citiesApi";
import { format, addDays, eachDayOfInterval } from "date-fns";
import { enUS, ru, hi, type Locale as DateFnsLocale } from "date-fns/locale";
import { getCitiesByIds, fetchPlaceData, getRoutesByIds, getEventsByIds } from '../../services/api';

import { PilgrimagePlannerControls } from "./PilgrimagePlannerControls";
import { PilgrimagePlanDisplay } from "./PilgrimagePlanDisplay";

const dateFnsLocales: Record<string, DateFnsLocale> = {
  en: enUS, ru: ru, hi: hi,
};

interface PilgrimagePlannerProps {
  auth: AuthContextType;
  language: Language;
  t: LanguageContextType['t'];
}

const getRandomTime = () => {
  const hour = Math.floor(Math.random() * 12) + 8;
  const minute = Math.floor(Math.random() * 60);
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

export const PilgrimagePlanner: React.FC<PilgrimagePlannerProps> = ({ auth: authContext, language, t }) => {
  const [availableCities, setAvailableCities] = useState<City[]>([]);
  const [stagedForPlanningCities, setStagedForPlanningCities] = useState<City[]>([]);
  const [plannedItems, setPlannedItems] = useState<PlannedItem[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<import("react-day-picker").DateRange | undefined>(undefined);
  const [cityDurationSums, setCityDurationSums] = useState<Record<string, number>>({});
  const [sortedItemsForDisplay, setSortedItemsForDisplay] = useState<PlannedItem[]>([]);
  const [isPlanInitiated, setIsPlanInitiated] = useState<boolean>(false);

  useEffect(() => {
    const fetchCities = async () => {
      const response = await getCities();
      if (response) setAvailableCities(response);
    };
    fetchCities();
  }, []);

  useEffect(() => {
    const newCityDurationSums: Record<string, number> = {};
    const cityItems = plannedItems.filter(item => item.type === 'city');
    cityItems.forEach(cityItem => {
      let durationSum = 0;
      plannedItems.forEach(item => {
        if (item.type !== 'city' && item.city_id_for_grouping === cityItem.data.id) {
          durationSum += 30;
        }
      });
      newCityDurationSums[cityItem.data.id] = durationSum;
    });
    setCityDurationSums(newCityDurationSums);

    const finalSortedList: PlannedItem[] = [];
    const processedItemIds = new Set<string>();
    const sortedCities = cityItems.sort((a,b) => (a.time || a.data.id).localeCompare(b.time || b.data.id));
    sortedCities.forEach(cityItem => {
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
    const remainingItems = plannedItems.filter(item => !processedItemIds.has(item.data.id + '-' + item.type));
    remainingItems.sort((a,b) => (a.time || "").localeCompare(b.time || ""));
    finalSortedList.push(...remainingItems);
    setSortedItemsForDisplay(finalSortedList);

    // Update isPlanInitiated based on whether there are any items to display
    // This ensures the plan section is shown if there are items, and hidden if not (unless explicitly kept open)
    if (finalSortedList.length > 0 ){
        if(!isPlanInitiated) setIsPlanInitiated(true);
    } else {
        // Optionally hide if all items are removed after being initiated:
        // if(isPlanInitiated) setIsPlanInitiated(false);
    }

  }, [plannedItems]); // Removed isPlanInitiated to avoid re-triggering on its own change

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

  const handleAddFavoritesToPlan = async () => {
    if (!authContext || !authContext.auth || !authContext.auth.user) {
      console.error("User data not available"); return;
    }
    const { cities_like, places_like, routes_like, events_like } = authContext.auth.user;
    const itemsToAdd: PlannedItem[] = [];
    let baseTime = 8;
    const generateSequentialTime = () => {
      const hour = Math.floor(baseTime);
      const minute = Math.floor((baseTime % 1) * 60);
      baseTime += 0.5;
      if (baseTime >= 23.5) baseTime = 8;
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    };

    if (cities_like && cities_like.length > 0) {
      const favCities = await getCitiesByIds(cities_like);
      favCities.forEach(city => itemsToAdd.push({ type: 'city', data: city, city_id_for_grouping: city.id, time: generateSequentialTime() }));
    }
    if (places_like && places_like.length > 0) {
      const favPlaces = await fetchPlaceData(places_like);
      favPlaces.forEach(place => itemsToAdd.push({ type: 'place', data: place, city_id_for_grouping: place.cityId, time: generateSequentialTime() }));
    }
    if (routes_like && routes_like.length > 0) {
      const favRoutes = await getRoutesByIds(routes_like);
      favRoutes.forEach(route => itemsToAdd.push({ type: 'route', data: route, city_id_for_grouping: route.cityId, time: generateSequentialTime() }));
    }
    if (events_like && events_like.length > 0) {
      const favEvents = await getEventsByIds(events_like);
      favEvents.forEach(event => itemsToAdd.push({ type: 'event', data: event, city_id_for_grouping: event.cityId, time: generateSequentialTime() }));
    }
    
    if (itemsToAdd.length > 0) {
        setPlannedItems(prevItems => {
            const currentItemSignature = new Set(prevItems.map(item => `${item.type}-${item.data.id}`));
            const uniqueNewItems = itemsToAdd.filter(newItem => !currentItemSignature.has(`${newItem.type}-${newItem.data.id}`));
            return [...prevItems, ...uniqueNewItems];
        });
    }
  };
  
  // This useEffect now solely controls the visibility of the plan display area
  useEffect(() => {
    if (plannedItems.length > 0) {
      setIsPlanInitiated(true);
    } else {
      // Decide if you want to hide it again if all items are removed
      // setIsPlanInitiated(false); 
    }
  }, [plannedItems]);

  const currentLocale = dateFnsLocales[language] || enUS;
  const displayedDateRange = selectedDateRange?.from ? 
    (selectedDateRange.to ? 
      `${format(selectedDateRange.from, "PPP", { locale: currentLocale })} - ${format(selectedDateRange.to, "PPP", { locale: currentLocale })}` 
      : format(selectedDateRange.from, "PPP", { locale: currentLocale })) 
    : t('select_dates_placeholder');

  return (
    <>
      <PilgrimagePlannerControls
        availableCities={availableCities}
        stagedCities={stagedForPlanningCities}
        onRemoveStagedCity={handleRemoveStagedCity}
        selectedDateRange={selectedDateRange}
        displayedDateRange={displayedDateRange}
        language={language}
        t={t}
        onDateRangeChange={handleDateRangeChange}
        onCitySelect={handleStageCityForPlanning} 
        onAddFavoritesToPlan={handleAddFavoritesToPlan}
        onAddStagedCities={handleAddStagedCitiesToMainPlan} 
        onDistributeDates={handleDistributeDates}
      />
      {isPlanInitiated && (
        <PilgrimagePlanDisplay
            plannedItems={sortedItemsForDisplay}
            cityDurationSums={cityDurationSums}
            language={language}
            t={t}
            onUpdateDateTime={handleUpdatePlannedItemDateTime}
            onRemoveItem={handleRemovePlannedItem}
        />
      )}
    </>
  );
}
