import React from 'react';
import { City, Place, Event, Language, PlannedItem } from '../../types';
import { CityCard } from '../CityCard';
import { PilgrimageRouteMap } from './PilgrimageRouteMap';
import { useLanguage } from '../../context/LanguageContext';
import { getLocalizedText } from '../../utils/languageUtils';

interface FilteredResultsProps {
  filteredPlaces: Place[];
  filteredEvents: Event[];
  availableCities: City[];
  filterSelectedCityIds: string[];
  selectedPlaceSubtypes: string[];
  selectedEventSubtypes: string[];
  language: Language;
  t: (key: string, params?: object) => string;
  plannedItems: PlannedItem[];
}

export function FilteredResults({
  filteredPlaces,
  filteredEvents,
  availableCities,
  filterSelectedCityIds,
  selectedPlaceSubtypes,
  selectedEventSubtypes,
  language,
  t,
  plannedItems
}: FilteredResultsProps) {
  const { t: langT } = useLanguage();

  // Получаем города, которые есть в фильтре
  const filteredCities = availableCities.filter(city => 
    filterSelectedCityIds.includes(city.id)
  );

  // Группируем места и события по городам
  const itemsByCity = React.useMemo(() => {
    const grouped: Record<string, { places: Place[]; events: Event[]; city: City }> = {};
    
    // Инициализируем для отфильтрованных городов
    filteredCities.forEach(city => {
      grouped[city.id] = { places: [], events: [], city };
    });

    // Добавляем места
    filteredPlaces.forEach(place => {
      if (grouped[place.cityId]) {
        grouped[place.cityId].places.push(place);
      }
    });

    // Добавляем события
    filteredEvents.forEach(event => {
      if (grouped[event.cityId]) {
        grouped[event.cityId].events.push(event);
      }
    });

    return grouped;
  }, [filteredPlaces, filteredEvents, filteredCities]);

  // Создаем PlannedItem элементы для отображения на карте
  const mapItems = React.useMemo(() => {
    const items: PlannedItem[] = [];
    
    Object.values(itemsByCity).forEach(({ city, places, events }) => {
      // Добавляем город
      items.push({
        type: 'city',
        data: city,
        city_id_for_grouping: city.id,
        time: '09:00',
        orderIndex: items.length
      });

      // Добавляем места
      places.forEach((place, index) => {
        items.push({
          type: 'place',
          data: place,
          city_id_for_grouping: city.id,
          time: `${10 + index}:00`,
          orderIndex: items.length
        });
      });

      // Добавляем события
      events.forEach((event, index) => {
        items.push({
          type: 'event',
          data: event,
          city_id_for_grouping: city.id,
          time: event.time || `${14 + index}:00`,
          date: event.date ? event.date.split('T')[0] : undefined,
          orderIndex: items.length
        });
      });
    });

    return items;
  }, [itemsByCity]);

  const hasFilters = filterSelectedCityIds.length > 0 || 
                   selectedPlaceSubtypes.length > 0 || 
                   selectedEventSubtypes.length > 0;

  if (!hasFilters) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <p>{t('select_filters_to_see_results', { defaultValue: 'Выберите фильтры, чтобы увидеть результаты' })}</p>
      </div>
    );
  }

  if (Object.keys(itemsByCity).length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <p>{t('no_results_for_filters', { defaultValue: 'Нет результатов по выбранным фильтрам' })}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Список городов с местами и событиями */}
      <div className="flex-1 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {t('found_results', { defaultValue: 'Найденные результаты' })}
        </h3>
        <div className="space-y-4">
          {Object.values(itemsByCity).map(({ city, places, events }) => (
            <div key={city.id} className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">
                {getLocalizedText(city.name, language)}
              </h4>
              
              {places.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-1">
                    {t('places', { defaultValue: 'Места' })}: {places.length}
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {places.slice(0, 3).map(place => (
                      <div key={place.id} className="text-sm p-2 bg-gray-50 rounded">
                        {getLocalizedText(place.name, language)}
                      </div>
                    ))}
                    {places.length > 3 && (
                      <div className="text-sm text-gray-500">
                        +{places.length - 3} {t('more_places', { defaultValue: 'ещё мест' })}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {events.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {t('events', { defaultValue: 'События' })}: {events.length}
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {events.slice(0, 2).map(event => (
                      <div key={event.id} className="text-sm p-2 bg-gray-50 rounded">
                        {getLocalizedText(event.name, language)}
                      </div>
                    ))}
                    {events.length > 2 && (
                      <div className="text-sm text-gray-500">
                        +{events.length - 2} {t('more_events', { defaultValue: 'ещё событий' })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Карта */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold mb-4">
          {t('map', { defaultValue: 'Карта' })}
        </h3>
        <div className="h-full border rounded-lg overflow-hidden">
          {mapItems.length > 0 ? (
            <PilgrimageRouteMap plannedItems={mapItems} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              {t('no_items_for_map', { defaultValue: 'Нет элементов для отображения на карте' })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}