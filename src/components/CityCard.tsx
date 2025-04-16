
import React from 'react';
import { Link } from 'react-router-dom';
import { City } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Route as RouteIcon, CalendarDays } from 'lucide-react';
import { getLocalizedText } from '../utils/languageUtils';
import { cn } from "@/lib/utils";

interface CityCardProps {
  city: City;
  className?: string;
}

const CityCard: React.FC<CityCardProps> = ({ city, className }) => {
  const { language, t } = useLanguage();
  const { auth, isFavorite, toggleFavorite } = useAuth();

  const cityName = getLocalizedText(city.name, language);
  // Check favorite status only if authenticated and user data is available
  const cityIsFavorite = auth.isAuthenticated && auth.user ? isFavorite('city', city.id) : false;

  const handleFavoriteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    // toggleFavorite will handle the auth check and toast message
    if (city.id) {
        toggleFavorite('city', city.id);
    }
  };
  
  const infoDescription = city.info?.[language] || city.info?.en || '' ;

  return (
    <div 
        className={cn(
            "block group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 h-full flex flex-col", 
            className
        )}
    >
      {/* Image Section */}
      <div className="relative">
        <Link to={`/cities/${city.id}`} className="absolute inset-0 z-0"></Link> 
        <img 
          src={city.imageUrl || '/placeholder.svg'} 
          alt={cityName} 
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Stats Badges */} 
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {city.spotsCount !== undefined && city.spotsCount > 0 && (
                <Badge variant="secondary" className="bg-black/60 text-white text-xs px-2 py-0.5 flex items-center gap-1">
                    <MapPin size={12} />
                    <span>{city.spotsCount}</span>
                </Badge>
            )}
            {city.routesCount !== undefined && city.routesCount > 0 && (
                 <Badge variant="secondary" className="bg-black/60 text-white text-xs px-2 py-0.5 flex items-center gap-1">
                     <RouteIcon size={12} />
                     <span>{city.routesCount}</span>
                 </Badge>
            )}
            {city.eventsCount !== undefined && city.eventsCount > 0 && (
                 <Badge variant="secondary" className="bg-black/60 text-white text-xs px-2 py-0.5 flex items-center gap-1">
                     <CalendarDays size={12} />
                     <span>{city.eventsCount}</span>
                 </Badge>
            )}
        </div>
        
        {/* Favorite Button - Always visible, action handled by toggleFavorite */} 
        {city.id && ( // Render button only if city has an ID
            <Button 
              variant="ghost" 
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white z-10 group-hover:opacity-100 opacity-75 transition-opacity"
              onClick={handleFavoriteClick}
              aria-label={cityIsFavorite ? t('remove_from_favorites') : t('add_to_favorites')}
            >
              {/* Style depends on favorite status (only relevant if logged in) */}
              <Heart size={16} className={cn("transition-colors", cityIsFavorite ? "fill-red-500 text-red-500" : "text-white/80")} />
            </Button>
        )}

      </div>
      {/* Content Section */} 
      <Link to={`/cities/${city.id}`} className="p-3 flex-grow flex flex-col justify-between"> 
        <div> 
          <h3 className="text-base font-medium mb-1 truncate" title={cityName}>{cityName}</h3>
          <p className="text-sm text-gray-600 line-clamp-3 h-16 overflow-hidden">
            {infoDescription || t('no_description_available')}
          </p>
        </div>
         <div className="flex items-center text-xs text-gray-500 mt-1">
             {/* Footer info */} 
         </div>
      </Link>
    </div>
  );
};

export default CityCard;
