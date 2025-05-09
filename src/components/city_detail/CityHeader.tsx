import React, { useCallback } from 'react';
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
  id: string;
  onTabSelect: (tabValue: string, tabId: string) => void;
}

const CityHeader: React.FC<CityHeaderProps> = ({ city, places, routes, events, id, onTabSelect }) => {
    const { language, t } = useLanguage();
    const { isFavorite, toggleFavorite } = useAuth();

    const isCityFavorite = city ? isFavorite('city', city.id) : false;
    const cityName = getLocalizedText(city.name, language);

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
            {city && id && (
              <Button 
                variant="ghost" 
                size="icon"
                className="absolute top-4 right-4 rounded-full bg-black/40 hover:bg-black/60 text-white z-10"
                onClick={() => toggleFavorite('city', id)} 
                aria-label={isCityFavorite ? t('remove_from_favorites') : t('add_to_favorites')}
              >
                <Heart size={20} className={isCityFavorite ? "fill-red-500 text-red-500" : ""} />
              </Button>
            )}
             
            {/* City Name & Country */}
            <div className="absolute bottom-0 left-0 p-4 md:p-6 pointer-events-none">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2 drop-shadow-md">{getLocalizedText(city.name, language)}</h1>
                <div className="flex items-center text-white/90">
                  <MapPin size={14} className="mr-1" /> 
                  <span className="text-sm md:text-base">{city.country}</span>
                </div>
            </div>
        </div>
    );
}

export default CityHeader;
