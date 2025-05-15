import React from 'react';
import { Link } from 'react-router-dom';
import { City } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Route as RouteIcon, CalendarDays } from 'lucide-react';
import { getLocalizedText } from '../utils/languageUtils';
import { cn } from "@/lib/utils";

interface CityCardProps {
  city: City;
  className?: string;
}

const CityCard: React.FC<CityCardProps> = ({ city, className }) => {
  const { language, t } = useLanguage(); // Assuming t function provides translations
  const { auth, isFavorite, toggleFavorite } = useAuth();

  const cityName = getLocalizedText(city.name, language);
  const cityIsFavorite = auth.isAuthenticated && auth.user ? isFavorite('city', city.id) : false;

  const handleFavoriteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (city.id) {
        toggleFavorite('city', city.id);
    }
  };

  // Make sure to get the localized info description
  const infoDescription = getLocalizedText(city.info, language) || t('no_description_available');

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

        {/* Favorite Button */}
        {city.id && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white z-10 group-hover:opacity-100 opacity-75 transition-opacity"
              onClick={handleFavoriteClick}
              aria-label={cityIsFavorite ? t('remove_from_favorites') : t('add_to_favorites')}
            >
              <Heart size={16} className={cn("transition-colors", cityIsFavorite ? "fill-red-500 text-red-500" : "text-white/80")} />
            </Button>
        )}
      </div>

      {/* Content Section - Now wrapped by Link */}
      <Link to={`/cities/${city.id}`} className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <h3
             className={cn(
                 "font-[LaudatioC] text-lg font-semibold mb-1 truncate text-[#09332A]"
             )}
             title={cityName}
          >
             {cityName}
          </h3>
          {/* Added description back */}
          <p className="text-sm text-black line-clamp-3 mb-3 font-[Monaco]">
             {infoDescription}
          </p>

          {/* Vertical Stats Section */}
          <div className="space-y-3 mb-4 px-10 py-3 bg-gray-100/50 rounded-lg font-[LaudatioC]">
              {city.spotsCount !== undefined && city.spotsCount > 0 && (
                   <div className="flex items-center text-base font-medium text-gray-700 px-20">
                       <MapPin size={16} className="mr-2 text-gray-500"/>
                       <span>{t('spots_label')}:</span>
                       <span className="font-medium ml-auto">{city.spotsCount}</span>
                   </div>
              )}
              {city.routesCount !== undefined && city.routesCount > 0 && (
                   <div className="flex items-center text-sm font-medium text-gray-700 px-20">
                       <RouteIcon size={16} className="mr-2 text-gray-500"/>
                       <span>{t('routes_label')}:</span>
                       <span className="font-medium ml-auto">{city.routesCount}</span>
                   </div>
              )}
              {city.eventsCount !== undefined && city.eventsCount > 0 && (
                   <div className="flex items-center text-sm font-medium text-gray-700 px-20">
                       <CalendarDays size={16} className="mr-2 text-gray-500"/>
                       <span>{t('events_label')}:</span>
                       <span className="font-medium ml-auto">{city.eventsCount}</span>
                   </div>
              )}
          </div>
        </div>

        {/* Details Button */}
         <div className="mt-auto pt-3">
            <Button
                variant="default"
                className="w-full"
            >
                {t('details_button')}
            </Button>
        </div>
      </Link>
    </div>
  );
};

export default CityCard;
