import React from 'react';
import { Link } from 'react-router-dom';
import { City } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useFont } from '../context/FontContext';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Route as RouteIcon, CalendarDays } from 'lucide-react';
import { getLocalizedText } from '../utils/languageUtils';
import { cn } from "@/lib/utils";

interface CityCardMobProps {
  city: City;
  className?: string;
}

const CityCardMob: React.FC<CityCardMobProps> = ({ city, className }) => {
  const { language, t } = useLanguage(); // Keep t for aria-labels etc.
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

  const infoDescription = city.info?.[language] || city.info?.en || '' ;
  const displayRating = 4.9; // Use a local variable for the example rating

  // Helper to create minimal stat badges
  const StatBadge = ({ icon: Icon, count }: { icon: React.ElementType, count: number | undefined }) => {
      if (count === undefined || count === null || count <= 0) return null; // Also check for null
      return (
          <Badge variant="outline" className={cn(
              "text-xs px-2 py-0.5 flex items-center gap-2 border-[#09332A] text-[#09332A]",
              fonts.subheading.className
          )}>
              <Icon size={12} className="flex-shrink-0" />
              <span className="text-xs">{count}</span>
          </Badge>
      );
  };


  return (
    <Link
        to={`/cities/${city.id}`}
        className={cn(
            "block group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200",
            className
        )}
    >
      <div className="flex p-3 gap-3 items-start">
        {/* Image Section */}
        <div className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden">
          <img
            src={city.imageUrl || '/placeholder.svg'}
            alt={cityName}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {city.id && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 h-7 w-7 rounded-full bg-white/80 hover:bg-white text-gray-700 z-10 group-hover:opacity-100 opacity-90 transition-opacity shadow-sm"
                onClick={handleFavoriteClick}
                aria-label={cityIsFavorite ? t('remove_from_favorites') : t('add_to_favorites')}
              >
                <Heart size={14} className={cn("transition-colors", cityIsFavorite ? "fill-red-500 text-red-500" : "text-gray-600")} />
              </Button>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-grow flex flex-col min-w-0"> {/* min-w-0 is important for flex children truncation */}
          {/* Top Row: Title and Stats */}
          <div className="flex justify-between items-start gap-2 mb-1">
             {/* Title */}
             <h3
                className={cn(
                   "text-base font-semibold line-clamp-2 flex-grow text-[#09332A]",
                   fonts.heading.className
                )}
                title={cityName}
             >
                {cityName}
             </h3>
             {/* Stats and Rating Container */}
             <div className="flex items-center flex-shrink-0 gap-1.5"> {/* Removed px-[108px] */}
                 {/* Stats Badges - Now first */}
                 <StatBadge icon={MapPin} count={city.spotsCount} />
                 <StatBadge icon={RouteIcon} count={city.routesCount} />
                 <StatBadge icon={CalendarDays} count={city.eventsCount} />
                 {/* Rating Badge - Use displayRating */}
                {displayRating && (
                    <Badge variant="default" className="bg-orange-500 text-white text-xs px-1.5 py-0.5 flex-shrink-0">
                        {displayRating.toFixed(1)}
                    </Badge>
                )}
             </div>
          </div>

          {/* Description */}
          <p className={cn(
              "text-sm text-gray-600 line-clamp-3 overflow-hidden mt-1",
              fonts.body.className
          )}>
            {infoDescription || t('no_description_available')}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default CityCardMob;
