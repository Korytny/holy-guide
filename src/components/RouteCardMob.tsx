import React from 'react';
import { Link } from 'react-router-dom';
import { Route } from '../types'; // Assume Route might have rating or other stats
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Route as RouteIcon, Clock } from 'lucide-react'; // Example: Add Clock for duration if available
import { getLocalizedText } from '../utils/languageUtils';
import { cn } from "@/lib/utils";

interface RouteCardMobProps {
  route: Route;
  className?: string;
}

const RouteCardMob: React.FC<RouteCardMobProps> = ({ route, className }) => {
  const { language, t } = useLanguage();
  const { auth, isFavorite, toggleFavorite } = useAuth();

  const routeName = getLocalizedText(route.name, language);
  const routeDescription = getLocalizedText(route.description, language);
  const isRouteFavorite = auth.isAuthenticated && auth.user ? isFavorite('route', route.id) : false;

  const handleFavoriteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (route.id) {
        toggleFavorite('route', route.id);
    }
  };

  return (
    <div
        className={cn(
            "block group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200",
            className
        )}
    >
      <Link to={`/routes/${route.id}`} className="flex p-3 gap-3 items-start">
        {/* Image Section */}
        <div className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden">
          <img
            src={route.imageUrl || '/placeholder.svg'}
            alt={routeName}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {route.id && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 h-7 w-7 rounded-full bg-white/80 hover:bg-white text-gray-700 z-10 group-hover:opacity-100 opacity-90 transition-opacity shadow-sm"
                onClick={handleFavoriteClick}
                aria-label={isRouteFavorite ? t('remove_from_favorites') : t('add_to_favorites')}
              >
                <Heart size={14} className={cn("transition-colors", isRouteFavorite ? "fill-red-500 text-red-500" : "text-gray-600")} />
              </Button>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-grow flex flex-col min-w-0">
          {/* Top Row: Title and Stats/Rating */}
          <div className="flex justify-between items-start gap-2 mb-1">
             {/* Title */}
             <h3 className="text-base font-bold line-clamp-2 flex-grow mr-1 font-[Laudatio] text-[#09332A]" title={routeName}>
                {routeName}
             </h3>
             {/* Stats and Rating Container */}
             <div className="flex items-center flex-shrink-0 gap-1.5">
                 {/* Route Icon Badge */}
                 <Badge variant="outline" className="text-xs px-1.5 py-0.5 flex items-center gap-1 border-[#09332A] text-[#09332A] font-['Monaco']" title={t('spiritual_route')}>
                     <RouteIcon size={12} className="flex-shrink-0" />
                 </Badge>
             </div>
          </div>

          {/* Description */}
          <p className="text-sm text-black line-clamp-3 overflow-hidden mt-1 font-['Monaco']">
            {routeDescription || t('no_description_available')}
          </p>
        </div>
      </Link>
    </div>
  );
};

export default RouteCardMob;
