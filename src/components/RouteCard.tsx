
import React from 'react';
import { Link } from 'react-router-dom';
import { Route } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { RouteIcon, Heart } from 'lucide-react';
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
          <div className="absolute top-2 left-2 right-2 flex justify-between">
            <div className="bg-white/80 p-1.5 rounded-full">
              <RouteIcon size={16} className="text-spiritualPurple" />
            </div>
            <div className="bg-white/80 p-1.5 rounded-full">
              <Heart size={16} className="text-gray-600" />
            </div>
          </div>
        </div>
        <div className="india-card-content">
          <h3 className="text-lg font-medium mb-1">{routeName}</h3>
          <div className="text-sm text-gray-600 h-[4.5rem] overflow-hidden space-y-1">
            {route.info ? (
              Object.entries(route.info)
                .filter(([key]) => key === language || !['en', 'ru', 'hi'].includes(key))
                .slice(0, 3)
                .map(([key, value], i) => (
                  <div key={i} className="line-clamp-3">
                    {['en', 'ru', 'hi'].includes(key) ? '' : `${key} `}
                    {typeof value === 'object' ? getLocalizedText(value, language) : String(value)}
                  </div>
                ))
            ) : (
              <p className="line-clamp-3">{routeDescription}</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RouteCard;
