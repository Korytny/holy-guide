
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { City } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { Badge } from "@/components/ui/badge"; // Import Badge
import { Button } from "@/components/ui/button"; // Import Button
import { Heart, MapPin, Route as RouteIcon, CalendarDays } from 'lucide-react'; // Import icons
import { getLocalizedText } from '../utils/languageUtils';

interface CityCardProps {
  city: City;
}

const CityCard: React.FC<CityCardProps> = ({ city }) => {
  const { language, t } = useLanguage();
  const { auth, isFavorite, toggleFavorite } = useAuth(); // Use auth context
  const navigate = useNavigate(); // Use navigate for handling clicks within Link

  const cityName = getLocalizedText(city.name, language);
  const cityIsFavorite = isFavorite('city', city.id);

  // Stop propagation for button clicks inside the Link
  const handleFavoriteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    toggleFavorite('city', city.id);
  };
  
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
    <Link to={`/cities/${city.id}`} className="block group relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out">
      <div className="india-card animate-slide-up bg-white"> {/* Ensure background for content */}
        <div className="relative">
          <img 
            src={city.imageUrl} 
            alt={cityName} 
            className="india-card-image w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" // Fixed height and zoom effect
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Stats Badges - Top Left */}
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
          
          {/* Favorite Button - Top Right */} 
          <Button 
            variant="ghost" 
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-white z-10 group-hover:opacity-100 opacity-75 transition-opacity" // Adjust size and opacity
            onClick={handleFavoriteClick}
            aria-label={cityIsFavorite ? t('remove_from_favorites') : t('add_to_favorites')}
          >
            <Heart size={16} className={cityIsFavorite ? "fill-red-500 text-red-500" : "text-white/80"} /> {/* Adjusted size */}
          </Button>

        </div>
        <div className="india-card-content p-3"> {/* Consistent padding */}
          <h3 className="text-base font-medium mb-1 truncate">{cityName}</h3> {/* Truncate long names */}
          <div className="text-xs text-gray-600 h-12 overflow-hidden space-y-0.5"> {/* Adjusted size and spacing */}
            {infoFields.length > 0 ? (
              infoFields.map((field, i) => (
                <p key={i} className="line-clamp-2 leading-snug"> {/* Limit lines */}
                  {field.key && <span className="font-medium">{field.key}: </span>}
                  {field.value}
                </p>
              ))
            ) : (
              <p className="text-gray-500 italic">{t('no_description_available')}</p> 
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CityCard;
