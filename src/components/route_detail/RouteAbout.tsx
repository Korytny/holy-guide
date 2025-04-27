import React from 'react';
import { Route } from '../../types'; // Adjust path as needed
import { useLanguage } from '../../context/LanguageContext'; // Adjust path as needed
import { getLocalizedText } from '../../utils/languageUtils'; // Adjust path as needed

interface RouteAboutProps {
  route: Route;
}

const RouteAbout: React.FC<RouteAboutProps> = ({ route }) => {
    const { language, t } = useLanguage();
    const routeDescription = route.description ? getLocalizedText(route.description, language) : '';

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
             <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('about_route')}</h2>
             {route.info ? (
                <div className="prose max-w-none text-gray-700">
                  {Object.entries(route.info)
                    .filter(([key]) => key === language || !['en', 'ru', 'hi'].includes(key))
                    .map(([key, value], i) => (
                      <p key={i} className="mb-2 last:mb-0">
                        {!['en', 'ru', 'hi'].includes(key) && <strong className="mr-1">{key}:</strong>}
                        {typeof value === 'object' ? getLocalizedText(value, language) : String(value)}
                      </p>
                    ))}
                     {routeDescription && <p className="mt-4 text-gray-600 italic">{routeDescription}</p>}
                </div>
              ) : routeDescription ? (
                 <p className="text-gray-700 leading-relaxed">{routeDescription}</p>
              ) : (
                 <p className="text-gray-500 italic">{t('no_description_available')}</p>
              )}
        </div>
    );
}

export default RouteAbout;
