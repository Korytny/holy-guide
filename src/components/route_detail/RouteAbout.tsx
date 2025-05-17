import React from 'react';
import { Route } from '../../types'; // Adjust path as needed
import { useLanguage } from '../../context/LanguageContext'; // Adjust path as needed
import { useFont } from '../../context/FontContext';
import { getLocalizedText } from '../../utils/languageUtils'; // Adjust path as needed
import { cn } from "@/lib/utils";

interface RouteAboutProps {
  route: Route;
}

const RouteAbout: React.FC<RouteAboutProps> = ({ route }) => {
    const { language, t } = useLanguage();
    const { fonts } = useFont();
    const routeDescription = route.description ? getLocalizedText(route.description, language) : '';

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
             <h2 className={cn(
               "text-xl md:text-2xl font-bold mb-4 text-[#09332A]",
               fonts.heading.className
             )}>{t('about_route')}</h2>
             <div className={cn(
               "space-y-3 prose max-w-none text-black",
               fonts.body.className
             )}>
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
