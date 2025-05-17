import React, { useCallback, useMemo } from 'react';
import { useFont } from '../../context/FontContext';
import { cn } from "@/lib/utils";
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
    const { fonts } = useFont();

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
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 pointer-events-none">
                <div className="bg-black/60 rounded-lg px-4 py-3 w-full">
                    <h1 className={cn(
                      "text-2xl md:text-3xl font-bold text-white mb-2 text-center",
                      fonts.heading.className
                    )}>
                      {cityName}
                    </h1>
                    <div className="flex justify-center gap-2 pointer-events-auto">
                        {places.length > 0 && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onTabSelect('places', 'places-content');
                            }}
                            className="focus:outline-none"
                          >
                            <Badge variant="secondary" className="bg-white/90 text-black hover:bg-white cursor-pointer">
                              <MapPin size={14} className="mr-1" />
                              {places.length} {t('places')}
                            </Badge>
                          </button>
                        )}
                        {routes.length > 0 && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onTabSelect('routes', 'routes-content');
                            }}
                            className="focus:outline-none"
                          >
                            <Badge variant="secondary" className="bg-white/90 text-black hover:bg-white cursor-pointer">
                              <RouteIcon size={14} className="mr-1" />
                              {routes.length} {t('routes')}
                            </Badge>
                          </button>
                        )}
                        {events.length > 0 && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onTabSelect('events', 'events-content');
                            }}
                            className="focus:outline-none"
                          >
                            <Badge variant="secondary" className="bg-white/90 text-black hover:bg-white cursor-pointer">
                              <CalendarDays size={14} className="mr-1" />
                              {events.length} {t('events')}
                            </Badge>
                          </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CityHeader;
