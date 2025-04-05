
import React from 'react';
import { Link } from 'react-router-dom';
import { City } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedText } from '../utils/languageUtils';

interface CityCardProps {
  city: City;
}

const CityCard: React.FC<CityCardProps> = ({ city }) => {
  const { language, t } = useLanguage();
  
  const cityName = getLocalizedText(city.name, language);
  
  console.log('City info structure:', city.info);
  
  // Get info fields for current language, limit to 3 items
  const infoFields = city.info
    ? Object.entries(city.info)
        .filter(([key]) => key === language || !['en', 'ru', 'hi'].includes(key))
        .slice(0, 3)
        .map(([key, value]) => {
          const displayKey = ['en', 'ru', 'hi'].includes(key) ? '' : key;
          const textValue = typeof value === 'object'
            ? getLocalizedText(value, language)
            : String(value);
          return { key: displayKey, value: textValue };
        })
    : [];
  
  return (
    <Link to={`/cities/${city.id}`} className="block">
      <div className="india-card animate-slide-up">
        <div className="relative">
          <img 
            src={city.imageUrl} 
            alt={cityName} 
            className="india-card-image"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        <div className="india-card-content">
          <h3 className="text-lg font-medium mb-1">{cityName}</h3>
          <div className="text-sm text-gray-600 h-[4.5rem] overflow-hidden space-y-1">
            {infoFields.length > 0 ? (
              infoFields.map((field, i) => (
                <div key={i} className="line-clamp-3">
                  {field.key && <span className="font-medium">{field.key} </span>}
                  {field.value}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No additional information</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CityCard;
