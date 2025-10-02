import React from 'react';
import { Route, Place, Language } from '../../types';
import { getLocalizedText } from '../../utils/languageUtils';
import { useLanguage } from '../../context/LanguageContext';
import { useFont } from '../../context/FontContext';
import { cn } from "@/lib/utils";

interface RouteContentProps {
  route: Route;
  places: Place[];
  language: Language;
  t: (key: string, params?: object) => string;
  onBack: () => void;
  onAddToPlan?: (route: Route) => void;
}

const RouteContent: React.FC<RouteContentProps> = ({ route, places, language, t, onBack, onAddToPlan }) => {
  const { fonts } = useFont();

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="space-y-4">
        {/* Кнопка возврата к списку маршрутов */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          ← {t('back_to_routes', { defaultValue: 'Back to routes' })}
        </button>
        
        {/* Заголовок маршрута */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden">
            <img
              src={route.imageUrl || '/placeholder.svg'}
              alt={getLocalizedText(route.name, language)}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-grow">
            <h3 className={`text-xl font-semibold ${fonts.heading.className} mb-2`}>
              {getLocalizedText(route.name, language)}
            </h3>
            <p className={`text-sm text-gray-600 ${fonts.body.className} line-clamp-3`}>
              {getLocalizedText(route.description, language) || t('no_description_available')}
            </p>
          </div>
        </div>

        {/* Список мест маршрута */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className={`font-semibold ${fonts.subheading.className}`}>
              {t('places_in_route', { defaultValue: 'Places in Route' })} ({places.length})
            </h4>
            {onAddToPlan && (
              <button
                onClick={() => onAddToPlan(route)}
                className="bg-[#09332A] text-white py-1 px-3 rounded-lg hover:bg-[#0a4035] transition-colors text-sm"
              >
                {t('add_route_to_plan', { defaultValue: 'Add Route to Plan' })}
              </button>
            )}
          </div>
          
          {places.length > 0 ? (
            <div className="space-y-3">
              {places.map((place, index) => (
                <div 
                  key={place.id} 
                  className={`bg-white p-3 rounded-lg border border-gray-200 ${fonts.body.className}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
                      <img
                        src={place.imageUrl || '/placeholder.svg'}
                        alt={getLocalizedText(place.name, language)}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-medium ${fonts.subheading.className}`}>
                          {index + 1}.
                        </span>
                        <h5 className={`font-medium ${fonts.subheading.className}`}>
                          {getLocalizedText(place.name, language)}
                        </h5>
                      </div>
                      <p className={`text-xs text-gray-600 line-clamp-2`}>
                        {getLocalizedText(place.description, language) || t('no_description_available')}
                      </p>
                      {place.type && (
                        <span className={`text-xs text-gray-500 mt-1 block`}>
                          {t(['', 'temple', 'samadhi', 'kunda', 'sacred_site'][place.type] || '', { defaultValue: 'Place' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-2xl mb-2">📍</div>
              <p className="text-sm">
                {t('no_places_in_route', { defaultValue: 'No places found in this route' })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RouteContent;