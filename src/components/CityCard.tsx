
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
  const cityDescription = getLocalizedText(city.description, language);
  
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
          <p className="text-sm text-gray-600 line-clamp-2">
            {cityDescription.substring(0, 100)}
            {cityDescription.length > 100 ? '...' : ''}
          </p>
          <button className="mt-3 text-sm text-saffron font-medium hover:underline">
            {t('explore')} →
          </button>
        </div>
      </div>
    </Link>
  );
};

export default CityCard;
