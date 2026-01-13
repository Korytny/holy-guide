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
        <div className="relative w-full h-80 md:h-96">
            <img
                src={city.imageUrl}
                alt={cityName}
                className="absolute inset-0 w-full h-full object-cover rounded-xl shadow-lg"
            />
            {/* Warm orange-pink gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-orange-400/30 via-pink-300/20 to-black/50 rounded-xl"></div>

            {/* Favorite Button - Red */}
            {city && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "absolute top-4 right-4 rounded-full z-10",
                  isCityFavorite
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-white/80 hover:bg-white text-red-500"
                )}
                onClick={() => toggleFavorite('city', city.id)}
                aria-label={isCityFavorite ? t('remove_from_favorites') : t('add_to_favorites')}
              >
                <Heart size={20} className={isCityFavorite ? "fill-white" : ""} />
              </Button>
            )}

            {/* City Name - Centered */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <h1 className={cn(
                  "text-5xl md:text-6xl lg:text-7xl font-bold text-white text-center px-4",
                  fonts.heading.className
                )}
                style={{
                  textShadow: '2px 2px 8px rgba(0, 0, 0, 0.6)',
                  letterSpacing: '0.02em'
                }}>
                  {cityName}
                </h1>
            </div>
        </div>
    );
}

export default CityHeader;
