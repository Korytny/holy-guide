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
             <h2 className="text-xl md:text-2xl font-bold mb-4 text-[#09332A] font-[Laudatio]">{t('about_route')}</h2>
             <div className="space-y-3 prose max-w-none text-black font-['Monaco']">
                {routeDescription ? (
                    <p>{routeDescription}</p>
                ) : (
                    <p className="text-gray-500 italic">{t('no_description_available')}</p>
                )}
                {route.info && Object.entries(route.info)
                    .filter(([key]) => key === language || !['en', 'ru', 'hi'].includes(key))
                    .map(([key, value], i) => (
                      <p key={i}>
                        {!['en', 'ru', 'hi'].includes(key) && <strong>{key}: </strong>}
                        {typeof value === 'object' ? getLocalizedText(value, language) : String(value)}
                      </p>
                    ))}
             </div>
        </div>
    );
}

export default RouteAbout;
