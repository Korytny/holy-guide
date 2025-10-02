import { useEffect } from "react";
import { type AuthContextType } from "@/context/AuthContext";
import { type LanguageContextType } from "@/context/LanguageContext";
import { Language } from "@/types";
import { getCities } from "@/services/citiesApi";
import { getEvents } from "@/services/eventsApi";
import { getAllRoutes } from '@/services/routesApi';
import { getPlacesByCityId } from "@/services/placesApi";
import { getLocalizedText } from '@/utils/languageUtils';
import { useToast } from "@/hooks/use-toast";
import { useFont } from '@/context/FontContext';

import { PilgrimagePlannerControls } from "./PilgrimagePlannerControls";
import { PilgrimagePlanDisplay } from "./PilgrimagePlanDisplay";
import PilgrimageRouteMap from "./PilgrimageRouteMap";
import RouteCardMob from '@/components/RouteCardMob';

import { 
  usePilgrimagePlannerState,
  usePilgrimagePlannerHandlers 
} from './PilgrimagePlannerHooks';

import { Place, Route, City, Event } from '@/types';

interface PilgrimagePlannerMainProps {
  auth: AuthContextType;
  language: Language;
  t: LanguageContextType['t'];
  onItemsChange?: (items: any[]) => void;
}

export const PilgrimagePlannerMain: React.FC<PilgrimagePlannerMainProps> = ({ 
  auth: authContext, 
  language, 
  t, 
  onItemsChange 
}) => {
  const { toast } = useToast();
  const { fonts } = useFont();

  // Используем наши кастомные хуки
  const {
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
  } = usePilgrimagePlannerState();

  // Используем обработчики
  const {
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
    handleResetFilters,
    handleSaveOrUpdateGoal,
    handleDeleteGoal,
    handleLoadGoal,
    handleAddFavoritesToPlan,
    handleAddRouteToPlan,
    handlePlannedItemsReorder,
    handleRemovePreviewItem,

    // Вспомогательные функции
    getRandomTime,
    getNextOrderIndex,
  } = usePilgrimagePlannerHandlers({
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
  });

  // Эффект для загрузки городов
  useEffect(() => {
    const fetchInitialCities = async () => {
      setIsLoadingCities(true);
      const cities = await getCities();
      if (cities) {
        setAvailableCities(cities);
      }
      setIsLoadingCities(false);
    };
    fetchInitialCities();
  }, []);

  // Эффект для загрузки всех данных
  useEffect(() => {
    const fetchAllAvailableData = async () => {
      if (isLoadingCities) {
        setIsLoadingPlacesAndEvents(true);
        return;
      }
      if (availableCities.length === 0) {
        setAvailablePlaces([]);
        setAvailableEvents([]);
        setIsLoadingPlacesAndEvents(false);
        return;
      }

      setIsLoadingPlacesAndEvents(true);
      const allEventsPromise = getEvents();
      
      const placesPromises = availableCities.map(city => getPlacesByCityId(city.id));
      const allPlacesNested = await Promise.all(placesPromises);
      const allPlacesAccumulated = allPlacesNested.flat().filter(p => p);

      const allEvents = await allEventsPromise;
      const allRoutes = (await getAllRoutes())?.filter(r => r.city_id && r.city_id.length > 0) || [];

      setAvailableEvents(allEvents || []);
      setAvailableRoutes(allRoutes);
      const uniquePlaces = Array.from(new Map(allPlacesAccumulated.map(p => [p.id, p])).values());
      setAvailablePlaces(uniquePlaces);
      setIsLoadingPlacesAndEvents(false);
    };
    
    fetchAllAvailableData();
  }, [availableCities, isLoadingCities]);

  // Эффект для фильтрации мест
  useEffect(() => {
    let cityIdsToConsider: Set<string>;
    if (filterControlSelectedCityIds.length === 0) {
      cityIdsToConsider = new Set();
    } else {
      cityIdsToConsider = new Set(filterControlSelectedCityIds);
    }

    let tempFilteredPlaces: any[] = []; 

    if (availablePlaces.length > 0 && cityIdsToConsider.size > 0) {
      tempFilteredPlaces = availablePlaces.filter(p => {
        if (!cityIdsToConsider.has(p.cityId)) return false;
        
        if (selectedPlaceSubtypes.length === 0) return false;

        const placeTypeNumberToSubtypeString: Record<number, string | undefined> = {
          1: 'temple',
          2: 'samadhi',
          3: 'kunda',
          4: 'sacred_site',
        };

        if (p.type === undefined) return false;
        const subtypeString = placeTypeNumberToSubtypeString[p.type];
        return subtypeString && selectedPlaceSubtypes.includes(subtypeString as any);
      });
    }
    setFilteredPlaces(tempFilteredPlaces);
  }, [availablePlaces, selectedPlaceSubtypes, filterControlSelectedCityIds, availableCities]);

  // Эффект для фильтрации событий
  useEffect(() => {
    let cityIdsToConsider: Set<string>;
    if (filterControlSelectedCityIds.length === 0) {
      cityIdsToConsider = new Set();
    } else {
      cityIdsToConsider = new Set(filterControlSelectedCityIds);
    }

    let tempFilteredEvents: any[] = []; 

    if (availableEvents.length > 0 && cityIdsToConsider.size > 0) {
      tempFilteredEvents = availableEvents.filter(e => {
        if (!cityIdsToConsider.has(e.cityId)) return false;

        if (selectedEventSubtypes.length === 0) return false;
        
        return e.eventTypeField && selectedEventSubtypes.includes(e.eventTypeField);
      });
    }
    setFilteredEvents(tempFilteredEvents);
  }, [availableEvents, selectedEventSubtypes, filterControlSelectedCityIds, availableCities]);

  // Эффект для фильтрации маршрутов
  useEffect(() => {
    let cityIdsToConsider: Set<string>;
    if (filterControlSelectedCityIds.length === 0) {
      cityIdsToConsider = new Set();
    } else {
      cityIdsToConsider = new Set(filterControlSelectedCityIds);
    }

    let tempFilteredRoutes: any[] = []; 

    if (availableRoutes.length > 0 && cityIdsToConsider.size > 0) {
      tempFilteredRoutes = availableRoutes.filter(route => 
        route.city_id && route.city_id.some(cityId => cityIdsToConsider.has(cityId))
      );
    }
    setFilteredRoutes(tempFilteredRoutes);
  }, [availableRoutes, filterControlSelectedCityIds, availableCities]);

  // Эффект для колбэка изменения элементов
  useEffect(() => {
    if (onItemsChange) {
      onItemsChange(plannedItems);
    }
  }, [plannedItems, onItemsChange]);

  // Определяем, что показывать в списке и на карте
  const getDisplayData = () => {
    // 1. Режим предпросмотра маршрута
    if (showSearchResults && selectedRoute) {
      return {
        listItems: selectedRoutePlaces,
        mapItems: selectedRoutePlaces,
        isPreview: true,
      };
    }
    // 2. Режим результатов поиска
    if (showSearchResults) {
      const searchResults = [...filteredPlaces, ...filteredEvents];
      return {
        listItems: searchResults,
        mapItems: searchResults,
        isPreview: true,
      };
    }
    // 3. Режим отображения плана
    return {
      listItems: sortedItemsForDisplay, // PlannedItem[]
      mapItems: sortedItemsForDisplay.map(item => item.data), // (Place | Event | City)[]
      isPreview: false,
    };
  };

  const { listItems, mapItems, isPreview } = getDisplayData();

  // Debug logging
  console.log('🎬 PilgrimagePlannerMain render:', {
    showSearchResults: showSearchResults,
    selectedRoute: selectedRoute?.id,
    filteredPlaces: filteredPlaces.length,
    filteredEvents: filteredEvents.length,
    plannedItems: plannedItems.length,
    listItemsCount: listItems.length,
    mapItemsCount: mapItems.length,
    isPreview: isPreview,
  });

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
              onSelectedPlaceSubtypesChange={setSelectedEventSubtypes}
              onSearch={handleSearch}
              onResetFilters={handleResetFilters}
              isLoadingData={isLoadingCities || isLoadingPlacesAndEvents}
            />
          </div>

          {/* Средняя колонка - Список городов и мест (30%) */}
          <div className="xl:col-span-3 order-2 border-l border-gray-200 h-full flex flex-col">
            {isPreview || plannedItems.length > 0 ? (
              <PilgrimagePlanDisplay
                itemsToShow={listItems}
                routePreview={selectedRoute}
                availableCities={availableCities}
                language={language}
                t={t}
                onUpdateDateTime={handleUpdatePlannedItemDateTime}
                onRemoveItem={handleRemovePlannedItem}
                onRemovePreviewItem={handleRemovePreviewItem}
                onAddPlacesForCity={handleAddPlacesForCity}
                onSearchAndAddPlace={handleSearchAndAddPlace}
                onAddSpecificPlace={handleAddSpecificPlace}
                onReorderItems={handlePlannedItemsReorder}
                isPreview={isPreview}
              />
            ) : (
              <div className="h-full overflow-y-auto p-4">
                <div className="space-y-4">
                  <h3 className={`text-lg font-semibold ${fonts.subheading.className} mb-4`}>{t('designed_routes', { defaultValue: 'Designed Routes' })}</h3>
                  {availableRoutes.length > 0 ? (
                    <div className="space-y-4">
                      {availableRoutes
                        .slice()
                        .sort((a, b) => {
                          const nameA = getLocalizedText(a.name, language);
                          const nameB = getLocalizedText(b.name, language);
                          return nameA.localeCompare(nameB, language);
                        })
                        .map(route => (
                          <RouteCardMob
                            key={route.id}
                            route={route}
                            onRouteClick={handleRouteClick}
                          />
                        ))
                      }
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <div className="text-2xl mb-2">🛣️</div>
                      <p className="text-sm">
                        {t('no_routes_available', { defaultValue: 'No routes available' })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Правая колонка - Карта (40%) */}
          <div className="xl:col-span-4 order-3 border-l border-gray-200 h-full flex flex-col min-h-0">
            <div className="flex-1 min-h-0">
              <PilgrimageRouteMap 
                plannedItems={sortedItemsForDisplay} // Для информации о датах/времени, если нужно
                filteredItems={mapItems}
                showFilteredItems={isPreview}
              />
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
};
