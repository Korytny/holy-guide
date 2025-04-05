
import React from 'react';
import { Link } from 'react-router-dom';
import { Place } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Heart } from 'lucide-react';
import { getLocalizedText } from '../utils/languageUtils';

interface PlaceCardProps {
  place: Place;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ place }) => {
  const { language, t } = useLanguage();
  
  const placeName = getLocalizedText(place.name, language);
  const placeDescription = getLocalizedText(place.description, language);
  
  return (
    <Link to={`/places/${place.id}`} className="block">
      <div className="india-card animate-slide-up">
        <div className="relative">
          <img
            src={place.imageUrl}
            alt={placeName}
            className="india-card-image"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-2 left-2 right-2 flex justify-between">
            <div className="bg-white/80 p-1.5 rounded-full">
              <MapPin size={18} className="text-blue-600" />
            </div>
            <div className="bg-white/80 p-1.5 rounded-full">
              <Heart size={18} className="text-gray-600" />
            </div>
          </div>
        </div>
        <div className="india-card-content">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-medium mb-1">{placeName}</h3>
            {/* Icons removed from title area - now shown above image */}
          </div>
          <div className="text-sm text-gray-600 h-[4.5rem] overflow-hidden space-y-1">
            {place.info ? (
              Object.entries(place.info)
                .filter(([key]) => key === language || !['en', 'ru', 'hi'].includes(key))
                .slice(0, 3)
                .map(([key, value], i) => (
                  <div key={i} className="line-clamp-3">
                    {['en', 'ru', 'hi'].includes(key) ? '' : `${key} `}
                    {typeof value === 'object' ? getLocalizedText(value, language) : String(value)}
                  </div>
                ))
            ) : (
              <p className="line-clamp-3">{placeDescription}</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PlaceCard;
