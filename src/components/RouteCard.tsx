
import React from 'react';
import { Link } from 'react-router-dom';
import { Route } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedText } from '../utils/languageUtils';

interface RouteCardProps {
  route: Route;
}

const RouteCard: React.FC<RouteCardProps> = ({ route }) => {
  const { language, t } = useLanguage();
  
  const routeName = getLocalizedText(route.name, language);
  const routeDescription = getLocalizedText(route.description, language);
  
  return (
    <Link to={`/routes/${route.id}`} className="block">
      <div className="india-card animate-slide-up">
        <div className="relative">
          <img 
            src={route.imageUrl} 
            alt={routeName} 
            className="india-card-image"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        <div className="india-card-content">
          <h3 className="text-lg font-medium mb-1">{routeName}</h3>
          <div className="flex items-center text-xs text-gray-500 mb-2">
            <span>{route.placeIds.length} {t('places')}</span>
            <span className="mx-2">•</span>
            <span>{route.eventIds.length} {t('events')}</span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {routeDescription.substring(0, 100)}
            {routeDescription.length > 100 ? '...' : ''}
          </p>
          <button className="mt-3 text-sm text-spiritualPurple font-medium hover:underline">
            {t('view_route')} →
          </button>
        </div>
      </div>
    </Link>
  );
};

export default RouteCard;
