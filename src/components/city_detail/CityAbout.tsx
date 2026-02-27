import React from 'react';
import { City } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { getLocalizedText } from '../../utils/languageUtils';
import { useFont } from '../../context/FontContext';
import { cn } from "@/lib/utils";

interface CityAboutProps {
  city: City;
}

const CityAbout: React.FC<CityAboutProps> = ({ city }) => {
    const { language, t } = useLanguage();
    const { fonts } = useFont();

    const infoFields = city.info 
        ? Object.entries(city.info)
            .filter(([key]) => key === language || !['en', 'ru', 'hi'].includes(key))
            .map(([key, value]) => { 
                const displayKey = ['en', 'ru', 'hi'].includes(key) ? '' : key;
                const textValue = typeof value === 'object' ? getLocalizedText(value, language) : String(value);
                return { key: displayKey, value: textValue }; 
            })
        : [];

    return (
        <div className="bg-[#FFF8E7] rounded-xl shadow-sm p-6 md:p-8">
             <h2 className={cn(
               "text-xl md:text-2xl font-bold mb-4 text-[#09332A]",
               fonts.heading.className
             )}>{t('about_city')}</h2>
             <div className={cn(
               "space-y-3 prose max-w-none text-black",
               fonts.body.className
             )}>
                {infoFields.length > 0 ? (
                  infoFields.map((field, i) => (
                    <p key={i}>
                      {field.key && <strong className="mr-1">{field.key}:</strong>}
                      {field.value}
                    </p>
                  ))
                ) : (
                  <p className="text-gray-500 italic">{t('no_description_available')}</p>
                )}
             </div>
        </div>
    );
}

export default CityAbout;
