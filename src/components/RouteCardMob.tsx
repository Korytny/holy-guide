import React from 'react';
import { Route } from '../types'; // Assume Route might have rating or other stats
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useFont } from '../context/FontContext';
import { Badge } from "@/components/ui/badge";
import { Route as RouteIcon } from 'lucide-react'; // Example: Add Clock for duration if available
import { getLocalizedText } from '../utils/languageUtils';
import { cn } from "@/lib/utils";

interface RouteCardMobProps {
  route: Route;
  className?: string;
  onRouteClick?: (route: Route) => void;
}

const RouteCardMob: React.FC<RouteCardMobProps> = ({ route, className, onRouteClick }) => {
  const { language, t } = useLanguage();
  const { auth, isFavorite, toggleFavorite } = useAuth();
  const { fonts } = useFont();

  const routeName = getLocalizedText(route.name, language);
  const routeDescription = getLocalizedText(route.description, language);
  const isRouteFavorite = auth.isAuthenticated && auth.user ? isFavorite('route', route.id) : false;

  const handleCardClick = () => {
    if (onRouteClick && route.id) {
        onRouteClick(route);
    }
  };

  return (
    <div
        className={cn(
            "block group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200",
            className
        )}
    >
      <div className="flex p-3 gap-3 items-start cursor-pointer" onClick={handleCardClick}>
        {/* Image Section */}
        <div className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden">
          <img
            src={route.imageUrl || '/placeholder.svg'}
            alt={routeName}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Content Section */}
        <div className="flex-grow flex flex-col min-w-0">
          {/* Top Row: Title and Stats/Rating */}
          <div className="flex justify-between items-start gap-2 mb-1">
             {/* Title */}
             <h3 className={cn(
                 "text-base font-bold line-clamp-2 flex-grow mr-1 text-[#09332A]",
                 fonts.heading.className
             )} title={routeName}>
                {routeName}
             </h3>
             {/* Stats and Rating Container */}
             <div className="flex items-center flex-shrink-0 gap-1.5">
                 {/* Route Icon Badge */}
                 <Badge variant="outline" className="text-xs px-1.5 py-0.5 flex items-center gap-1 border-[#09332A] text-[#09332A]" title={t('spiritual_route')}>
                     <RouteIcon size={12} className="flex-shrink-0" />
                 </Badge>
             </div>
          </div>

          {/* Description */}
          <p className={cn(
              "text-sm text-black line-clamp-2 overflow-hidden mt-1",
              fonts.body.className
          )}>
            {routeDescription || t('no_description_available')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RouteCardMob;
