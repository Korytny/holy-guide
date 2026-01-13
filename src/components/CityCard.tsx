import React from 'react';
import { Link } from 'react-router-dom';
import { City } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useFont } from '../context/FontContext';
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
  const { fonts } = useFont();

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
    <Link
        to={`/cities/${city.id}`}
        className={cn(
            "block group rounded-xl shadow-lg overflow-hidden transition-shadow duration-200 h-full flex flex-col",
            "bg-[#FFF8E7]", // Cream background from design
            className
        )}
        style={{ maxWidth: '400px', width: '100%' }}
    >
      {/* Image Section with Orange Gradient */}
      <div className="relative h-56 overflow-hidden">
        {/* Orange gradient overlay - fades out on hover */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FF5722] to-[#FF9800] opacity-20 z-10 pointer-events-none transition-opacity duration-300 group-hover:opacity-0" />
        <img
          src={city.imageUrl || '/placeholder.svg'}
          alt={cityName}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />

        {/* Favorite Button - Red circle with white heart */}
        {city.id && (
            <button
              className={cn(
                "absolute top-3 right-3 h-10 w-10 rounded-full z-10 flex items-center justify-center transition-all",
                cityIsFavorite
                  ? "bg-[#FF3B30] text-white"
                  : "bg-white/80 hover:bg-white text-[#FF3B30]"
              )}
              onClick={handleFavoriteClick}
              aria-label={cityIsFavorite ? t('remove_from_favorites') : t('add_to_favorites')}
            >
              <Heart
                size={18}
                className={cn(
                  "transition-colors",
                  cityIsFavorite ? "fill-white text-white" : ""
                )}
              />
            </button>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 flex-grow flex flex-col">
        {/* Title */}
        <h3
           className={cn(
               "text-2xl font-bold mb-2 text-[#333333]",
               fonts.heading.className
           )}
           title={cityName}
        >
           {cityName}
        </h3>

        {/* Description */}
        <p className={cn(
            "text-sm text-[#666666] line-clamp-3 mb-4 leading-relaxed",
            fonts.body.className
        )}>
           {infoDescription}
        </p>

        {/* Horizontal Stats Section */}
        <div className="flex justify-between items-stretch gap-3 mb-5">
            {city.spotsCount !== undefined && city.spotsCount > 0 && (
                 <div className="flex-1 flex flex-col items-center justify-center py-2">
                     <MapPin size={20} className="text-[#FF9800] mb-1"/>
                     <span className="text-xs text-[#FF9800] font-medium">{t('spots_label')}</span>
                     <span className={cn(
                         "text-base font-bold text-black",
                         fonts.subheading.className
                     )}>{city.spotsCount}</span>
                 </div>
            )}
            {city.routesCount !== undefined && city.routesCount > 0 && (
                 <div className="flex-1 flex flex-col items-center justify-center py-2">
                     <RouteIcon size={20} className="text-[#FF9800] mb-1"/>
                     <span className="text-xs text-[#FF9800] font-medium">{t('routes_label')}</span>
                     <span className={cn(
                         "text-base font-bold text-black",
                         fonts.subheading.className
                     )}>{city.routesCount}</span>
                 </div>
            )}
            {city.eventsCount !== undefined && city.eventsCount > 0 && (
                 <div className="flex-1 flex flex-col items-center justify-center py-2">
                     <CalendarDays size={20} className="text-[#FF9800] mb-1"/>
                     <span className="text-xs text-[#FF9800] font-medium">{t('events_label')}</span>
                     <span className={cn(
                         "text-base font-bold text-black",
                         fonts.subheading.className
                     )}>{city.eventsCount}</span>
                 </div>
            )}
        </div>

        {/* Details Button */}
         <div className="mt-auto">
            <Button
                className="w-full h-12 rounded-lg bg-[#FF9800] hover:bg-[#F57C00] text-white font-semibold text-base transition-colors"
            >
                {t('details_button')}
            </Button>
        </div>
      </div>
    </Link>
  );
};

export default CityCard;
