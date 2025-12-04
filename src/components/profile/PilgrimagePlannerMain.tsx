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
import { supabase } from '@/integrations/supabase/client';

import { PilgrimagePlannerControls } from "./PilgrimagePlannerControls";
import { PilgrimagePlanDisplay } from "./PilgrimagePlanDisplay";
import PilgrimageRouteMap from "./PilgrimageRouteMap";

import { 
  usePilgrimagePlannerState,
  usePilgrimagePlannerHandlers 
} from './PilgrimagePlannerHooks';

import { Place, Route, City, Event } from '@/types';
import RoutePlannerCard from './RoutePlannerCard';

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
    handlePlannedItemsReorder,
    handleReorderRoutePlaces,
    handleRemovePreviewItem,
    handleFullReset,

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

  // Эффект для загрузки сохраненных целей при монтировании компонента и при входе пользователя
  useEffect(() => {
    const loadSavedGoals = async () => {
      if (!authContext.auth.user) {
        setSavedGoals([]);
        return;
      }

      try {
        const { data: goalsData, error } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', authContext.auth.user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading saved goals:', error);
          return;
        }

        setSavedGoals(goalsData || []);
      } catch (error) {
        console.error('Error in loadSavedGoals:', error);
      }
    };

    loadSavedGoals();
  }, [authContext.auth.user, setSavedGoals]);

  // Определяем, что показывать в списке и на карте
  const getDisplayData = () => {

    // 1. Режим предпросмотра маршрута
    if (showSearchResults && selectedRoute) {
      // Создаем группы городов для маршрута
      const routeGroups: PlannedItem[] = [];
      const cityMap = new Map<string, Place[]>();

      // Группируем места маршрута по городам
      selectedRoutePlaces.forEach((place, index) => {

        // Ищем cityId в разных полях
        let cityId = place.cityId || (place as any).city_id;

        // Если нет cityId, пытаемся определить по имени города
        if (!cityId && (place as any).city) {
          const cityName = (place as any).city;
          const matchingCity = availableCities.find(c =>
            c.name === cityName ||
            (typeof c.name === 'object' && c.name.en === cityName) ||
            (typeof c.name === 'object' && c.name.hi === cityName) ||
            (typeof c.name === 'object' && c.name.ru === cityName)
          );
          if (matchingCity) {
            cityId = matchingCity.id;
          }
        }

        if (cityId) {
          if (!cityMap.has(cityId)) {
            cityMap.set(cityId, []);
          }
          cityMap.get(cityId)!.push(place);
        }
      });

      // Добавляем города и их места
      cityMap.forEach((places, cityId) => {
        const city = availableCities.find(c => c.id === cityId);
        if (city) {
          // Добавляем объект города
          routeGroups.push({
            type: 'city',
            data: city,
            city_id_for_grouping: city.id,
            time: null,
            orderIndex: routeGroups.length * 1000,
            dates: []
          });

          // Добавляем места этого города
          places.forEach((place, index) => {
            routeGroups.push({
              type: 'place',
              data: place,
              city_id_for_grouping: cityId, // Используем найденный cityId
              time: null,
              orderIndex: place.order || index,
              dates: []
            });
          });
        }
      });

      return {
        listItems: routeGroups,
        mapItems: selectedRoutePlaces,
        isPreview: true,
        isSearchMode: false,
      };
    }
    // 2. Режим результатов поиска (включая сохраненные места)
    if (showSearchResults) {
      // Если это сохраненные места без selectedRoute, используем plannedItems
      if (!selectedRoute && plannedItems.length > 0) {

        // Конвертируем plannedItems в format для display
        const savedPlacesAsPlannedItems = plannedItems.map((item, index) => ({
          type: item.type,
          data: item.data,
          city_id_for_grouping: item.city_id_for_grouping,
          time: item.time || null,
          orderIndex: item.orderIndex,
          date: item.date || null,
          dates: item.dates || []
        }));

        // Создаем группы городов для сохраненных мест
        const savedGroups: PlannedItem[] = [];
        const cityMap = new Map<string, PlannedItem[]>();

        // Группируем сохраненные места по городам
        savedPlacesAsPlannedItems.forEach(item => {
          if (item.city_id_for_grouping) {
            if (!cityMap.has(item.city_id_for_grouping)) {
              cityMap.set(item.city_id_for_grouping, []);
            }
            cityMap.get(item.city_id_for_grouping)!.push(item);
          }
        });

        // Добавляем города и их дочерние элементы
        cityMap.forEach((items, cityId) => {
          const city = availableCities.find(c => c.id === cityId);
          if (city) {
            // Добавляем объект города
            savedGroups.push({
              type: 'city',
              data: city,
              city_id_for_grouping: city.id,
              time: null,
              orderIndex: savedGroups.length * 1000,
              dates: []
            });

            // Добавляем места этого города
            items.forEach((item, itemIndex) => {
              savedGroups.push({
                ...item,
                orderIndex: savedGroups.length
              });
            });
          }
        });

        return {
          listItems: savedGroups,
          mapItems: plannedItems.map(item => item.data),
          isPreview: true,
          isSearchMode: true,
        };
      }

      const searchResults = [...filteredPlaces, ...filteredEvents];

      // Создаем карту ID элементов для сохранения порядка
      const orderMap = new Map<string, number>();
      searchResultsOrder.forEach((id, index) => orderMap.set(id, index));

      // Сортируем результаты согласно сохраненному порядку, если он есть
      const orderedSearchResults = searchResultsOrder.length > 0
        ? searchResults.sort((a, b) => {
            const aKey = ('type' in a && (a as Place).type !== undefined) ? `place-${a.id}` : `event-${a.id}`;
            const bKey = ('type' in b && (b as Place).type !== undefined) ? `place-${b.id}` : `event-${b.id}`;
            const aOrder = orderMap.get(aKey) ?? 999;
            const bOrder = orderMap.get(bKey) ?? 999;
            return aOrder - bOrder;
          })
        : searchResults;

      // Конвертируем search results в PlannedItem формат для поддержки drag-and-drop
      const searchResultsAsPlannedItems: PlannedItem[] = orderedSearchResults.map((item, index) => {
        if ('type' in item && (item as Place).type !== undefined) {
          // Это Place объект
          const place = item as Place;
          return {
            type: 'place',
            data: place,
            city_id_for_grouping: place.cityId,
            time: null,
            orderIndex: index,
            date: place.date || null, // Передаем дату из place.date
            dates: []
          };
        } else if ('eventTypeField' in item) {
          // Это Event объект
          const event = item as Event;
          return {
            type: 'event',
            data: event,
            city_id_for_grouping: event.cityId,
            time: event.time || null, // Передаем время из event.time
            orderIndex: index,
            date: event.date || null, // Передаем дату из event.date
            dates: []
          };
        } else {
          // Определяем тип по наличию полей
          const isEvent = 'eventTypeField' in item || 'cultureField' in item || 'hasOnlineStream' in item;
          return {
            type: isEvent ? 'event' : 'place',
            data: item,
            city_id_for_grouping: null,
            time: null,
            orderIndex: index,
            date: (item as any).date || null, // Пытаемся получить дату
            dates: []
          };
        }
      });

      
      // Создаем группы городов для результатов поиска
      const searchGroups: PlannedItem[] = [];
      const cityMap = new Map<string, PlannedItem[]>();

      // Группируем результаты по городам
      searchResultsAsPlannedItems.forEach(item => {
        if (item.city_id_for_grouping) {
          if (!cityMap.has(item.city_id_for_grouping)) {
            cityMap.set(item.city_id_for_grouping, []);
          }
          cityMap.get(item.city_id_for_grouping)!.push(item);
        }
      });

      // Добавляем города и их дочерние элементы
      cityMap.forEach((items, cityId) => {
        const city = availableCities.find(c => c.id === cityId);
        if (city) {
          // Добавляем объект города
          searchGroups.push({
            type: 'city',
            data: city,
            city_id_for_grouping: city.id,
            time: null,
            orderIndex: searchGroups.length * 1000,
            dates: []
          });

          // Добавляем места/события этого города, СРАЗУ с обновлением orderIndex
          items.forEach((item, itemIndex) => {
            searchGroups.push({
              ...item,
              orderIndex: searchGroups.length  // Используем порядок добавления в группы
            });
          });
        }
      });

      
      return {
        listItems: searchGroups,
        mapItems: searchResults,
        isPreview: true,
        isSearchMode: true,
      };
    }
    // 3. Режим отображения плана

    return {
      listItems: sortedItemsForDisplay, // PlannedItem[]
      mapItems: sortedItemsForDisplay.map(item => item.data), // (Place | Event | City)[]
      isPreview: false,
      isSearchMode: false,
    };
  };

  const { listItems, mapItems, isPreview, isSearchMode } = getDisplayData();

  
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Основной контент с трехколоночной структурой */}
      {!isLoadingCities && !isLoadingPlacesAndEvents && (
        <div className="grid grid-cols-1 xl:grid-cols-10 gap-0 flex-1 overflow-hidden">
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
            onSearch={handleSearch}
            onResetFilters={handleResetFilters}
            onFullReset={handleFullReset}
            isLoadingData={isLoadingCities || isLoadingPlacesAndEvents}
          />
          </div>

          {/* Средняя колонка - Список городов и мест (30%) */}
          <div className="xl:col-span-3 order-2 border-l border-gray-200 h-full flex flex-col min-h-0">
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
                onReorderItems={(items) => handlePlannedItemsReorder(items, isSearchMode)}
                onReorderRoutePlaces={handleReorderRoutePlaces}
                isPreview={isPreview}
                isSearchMode={isSearchMode}
              />
            ) : (
              <div className="flex flex-col flex-grow min-h-0" style={{ height: '100%', maxHeight: '100%', overflow: 'hidden' }}>
                <div className="p-4 flex flex-col flex-grow min-h-0" style={{ height: '100%', maxHeight: '100%', overflow: 'hidden' }}>
                  <h3 className={`text-lg font-semibold ${fonts.subheading.className} mb-4`} style={{ flexShrink: 0 }}>{t('designed_routes', { defaultValue: 'Designed Routes' })}</h3>
                  <div className="flex-grow overflow-y-auto" style={{ minHeight: 0, maxHeight: 'calc(100% - 3rem)' }}>
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
                            <RoutePlannerCard
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
