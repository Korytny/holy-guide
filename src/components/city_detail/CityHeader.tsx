import React, { useCallback, useMemo } from 'react';
import { City, Place, Route, Event } from '../../types'; // Adjust path
import { useLanguage } from '../../context/LanguageContext'; // Adjust path
import { useAuth } from '../../context/AuthContext'; // Adjust path
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Route as RouteIcon, CalendarDays } from 'lucide-react';
import { getLocalizedText } from '../../utils/languageUtils'; // Adjust path

interface CityHeaderProps {
  city: City;
  places: Place[];
  routes: Route[];
  events: Event[];
  onTabSelect: (tabValue: string, tabId: string) => void;
}

const CityHeader: React.FC<CityHeaderProps> = ({ city, places, routes, events, onTabSelect }) => {
    const { language, t } = useLanguage();
    const { isFavorite, toggleFavorite } = useAuth();

    const isCityFavorite = useMemo(() => city ? isFavorite('city', city.id) : false, [city, isFavorite]);
    const cleanName = (name: string) => {
      // First remove any ID patterns that might have slipped through
      let cleaned = name
        .replace(/\[[^\]]+\]/g, '')  // Remove anything in brackets
        .replace(/\([^)]+\)/g, '')   // Remove anything in parentheses
        .replace(/\b(id|uid|uuid)[:\s-]*[^\s]+\b/gi, '') // Remove id:xxx patterns
        .replace(/\s{2,}/g, ' ')      // Normalize whitespace
        .trim();

      // If we have a city ID, ensure it's removed
      if (city?.id) {
        cleaned = cleaned.replace(new RegExp(city.id, 'gi'), '');
      }
      
      // Final cleanup of any remaining artifacts
      return cleaned
        .replace(/\([0-9a-f-]+\)/gi, '') // (uuid) format
        .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, '') // standalone UUID
        .replace(/\b(id|uid|uuid)[:\s]*[^\s]+/gi, '') // id:xxx or uid=xxx formats
        .replace(/\s{2,}/g, ' ')
        .trim();
      
      return cleaned;
    };
    const cityName = cleanName(getLocalizedText(city.name, language));

    return (
        <div className="relative w-full h-64 md:h-96"> 
            <img 
                src={city.imageUrl} 
                alt={cityName}
                className="absolute inset-0 w-full h-full object-cover rounded-xl shadow-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl"></div>
            
            {/* Badges - Pass tab value to onTabSelect */}
            <div className="absolute top-4 left-4 flex flex-col sm:flex-row gap-2 md:gap-3 z-10"> 
                {places.length > 0 && (
                  <button 
                    onClick={() => onTabSelect('places', 'places-content')} 
                    className="p-0 bg-transparent border-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full"
                    aria-label={`${t('sacred_places')}: ${places.length}`}
                   >
                    <Badge variant="secondary" className="bg-black/60 text-white flex items-center gap-1 px-2 py-1 text-xs md:px-3 md:text-sm hover:bg-black/80 transition-colors">
                      <MapPin size={14} />
                      <span>{places.length}</span>
                    </Badge>
                  </button>
                )}
                {routes.length > 0 && (
                  <button 
                    onClick={() => onTabSelect('routes', 'routes-content')} 
                    className="p-0 bg-transparent border-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full"
                    aria-label={`${t('spiritual_routes')}: ${routes.length}`}
                   >
                    <Badge variant="secondary" className="bg-black/60 text-white flex items-center gap-1 px-2 py-1 text-xs md:px-3 md:text-sm hover:bg-black/80 transition-colors">
                      <RouteIcon size={14} />
                      <span>{routes.length}</span>
                    </Badge>
                  </button>
                )}
                {events.length > 0 && (
                   <button 
                    onClick={() => onTabSelect('events', 'events-content')} 
                    className="p-0 bg-transparent border-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full"
                    aria-label={`${t('holy_events')}: ${events.length}`}
                   >
                    <Badge variant="secondary" className="bg-black/60 text-white flex items-center gap-1 px-2 py-1 text-xs md:px-3 md:text-sm hover:bg-black/80 transition-colors">
                      <CalendarDays size={14} />
                      <span>{events.length}</span>
                    </Badge>
                  </button>
                )}
            </div>
             
            {/* Favorite Button */}
            {city && (
              <Button 
                variant="ghost" 
                size="icon"
                className="absolute top-4 right-4 rounded-full bg-black/40 hover:bg-black/60 text-white z-10"
                onClick={() => toggleFavorite('city', city.id)} 
                aria-label={isCityFavorite ? t('remove_from_favorites') : t('add_to_favorites')}
              >
                <Heart size={20} className={isCityFavorite ? "fill-red-500 text-red-500" : ""} />
              </Button>
            )}
             
            {/* City Name & Country */}
            <div className="absolute bottom-0 left-0 p-4 md:p-6 pointer-events-none">
                <div className="bg-black/60 rounded-lg px-3 py-2 inline-block">
                    <h1 className="text-2xl md:text-3xl font-[Laudatio] font-bold text-white mb-1 md:mb-2 drop-shadow-md">
                      {cityName}
                    </h1>
                </div>
            </div>
        </div>
    );
}

export default CityHeader;
