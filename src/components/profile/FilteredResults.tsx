import React from 'react';
import { City, Place, Event, Language, PlannedItem } from '../../types';
import CityCard from '../CityCard';
import PilgrimageRouteMap from './PilgrimageRouteMap';
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

  const hasFilters = selectedPlaceSubtypes.length > 0 ||
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
    <div className="bg-white rounded-lg shadow-sm border p-4 h-full">
      <h3 className="text-lg font-semibold mb-4">
        {t('found_results', { defaultValue: 'Найденные результаты' })}
      </h3>
      
      {hasFilters && Object.keys(itemsByCity).length > 0 ? (
        <div className="space-y-4 max-h-[450px] overflow-y-auto">
          {Object.values(itemsByCity).map(({ city, places, events }) => (
            <div key={city.id} className="border border-gray-200 rounded-lg p-3">
              <h4 className="font-medium text-sm mb-2 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                {getLocalizedText(city.name, language)}
              </h4>
              
              {places.length > 0 && (
                <div className="mb-2">
                  <div className="text-xs text-gray-600 mb-1 flex items-center">
                    🏛️ {t('places', { defaultValue: 'Места' })}: {places.length}
                  </div>
                  <div className="space-y-1">
                    {places.slice(0, 2).map(place => (
                      <div key={place.id} className="text-xs p-2 bg-blue-50 rounded border-l-2 border-blue-200">
                        {getLocalizedText(place.name, language)}
                      </div>
                    ))}
                    {places.length > 2 && (
                      <div className="text-xs text-blue-600">
                        +{places.length - 2} {t('more_places', { defaultValue: 'ещё' })}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {events.length > 0 && (
                <div>
                  <div className="text-xs text-gray-600 mb-1 flex items-center">
                    🎉 {t('events', { defaultValue: 'События' })}: {events.length}
                  </div>
                  <div className="space-y-1">
                    {events.slice(0, 2).map(event => (
                      <div key={event.id} className="text-xs p-2 bg-purple-50 rounded border-l-2 border-purple-200">
                        {getLocalizedText(event.name, language)}
                      </div>
                    ))}
                    {events.length > 2 && (
                      <div className="text-xs text-purple-600">
                        +{events.length - 2} {t('more_events', { defaultValue: 'ещё' })}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {places.length === 0 && events.length === 0 && (
                <div className="text-xs text-gray-500 italic">
                  {t('no_items_in_city', { defaultValue: 'Нет мест или событий в этом городе' })}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="h-full flex items-center justify-center text-gray-500">
          <div className="text-center">
            <div className="text-2xl mb-2">🔍</div>
            <p className="text-sm">
              {hasFilters 
                ? t('no_results_for_filters', { defaultValue: 'Нет результатов по выбранным фильтрам' })
                : t('select_filters_to_see_results', { defaultValue: 'Выберите фильтры, чтобы увидеть результаты' })
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
