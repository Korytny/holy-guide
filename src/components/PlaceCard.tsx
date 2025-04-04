
import React from 'react';
import { Link } from 'react-router-dom';
import { Place } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { MapPin } from 'lucide-react';

interface PlaceCardProps {
  place: Place;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ place }) => {
  const { t } = useLanguage();
  
  return (
    <Link to={`/places/${place.id}`} className="block">
      <div className="india-card animate-slide-up">
        <div className="relative">
          <img 
            src={place.imageUrl} 
            alt={place.name} 
            className="india-card-image"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        <div className="india-card-content">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-medium mb-1">{place.name}</h3>
            <div className="flex items-center text-gray-500">
              <MapPin size={16} className="mr-1" />
            </div>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {place.description.substring(0, 100)}
            {place.description.length > 100 ? '...' : ''}
          </p>
          <button className="mt-3 text-sm text-saffron font-medium hover:underline">
            {t('view_details')} →
          </button>
        </div>
      </div>
    </Link>
  );
};

export default PlaceCard;
