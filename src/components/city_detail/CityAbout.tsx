import React from 'react';
import { City } from '../../types'; // Adjust path
import { useLanguage } from '../../context/LanguageContext'; // Adjust path
import { getLocalizedText } from '../../utils/languageUtils'; // Adjust path

interface CityAboutProps {
  city: City;
}

const CityAbout: React.FC<CityAboutProps> = ({ city }) => {
    const { language, t } = useLanguage();

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
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
             <h2 className="text-xl md:text-2xl font-bold mb-4 text-[#09332A] font-[Laudatio]">{t('about_city')}</h2>
             <div className="space-y-3 prose max-w-none text-black font-['Monaco']">
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
