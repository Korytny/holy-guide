import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Route } from '../types';
import { useFont } from '../context/FontContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Route as RouteIcon, Heart } from 'lucide-react';
import { getLocalizedText } from '../utils/languageUtils';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface RouteCardProps {
  route: Route;
  className?: string;
  onAddToPlan?: (route: Route) => void;
  onRouteClick?: (route: Route) => void;
}

const RouteCard: React.FC<RouteCardProps> = ({ route, className, onAddToPlan, onRouteClick }) => {
  const { language, t } = useLanguage();
  const { auth, isFavorite, toggleFavorite } = useAuth();
  const { fonts } = useFont();
  const navigate = useNavigate();

  const routeName = getLocalizedText(route.name, language);
  const routeDescription = getLocalizedText(route.description, language);
  const isRouteFavorite = auth.isAuthenticated && auth.user ? isFavorite('route', route.id) : false;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // toggleFavorite handles the auth check
    if (route.id) {
        toggleFavorite('route', route.id);
    }
  };

  const handleAddToPlan = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToPlan && route.id) {
        onAddToPlan(route);
    }
  };

  const handleCardClick = () => {
    // Если передан onRouteClick, используем его
    if (onRouteClick && route.id) {
        onRouteClick(route);
    } else {
      // Иначе переходим по прямому маршруту
      if (route.id) {
        navigate(`/routes/${route.id}`);
      }
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "block group rounded-xl shadow-lg overflow-hidden transition-shadow duration-200 h-full flex flex-col cursor-pointer",
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
          src={route.imageUrl || '/placeholder.svg'}
          alt={routeName}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />

        {/* Favorite Button - Red circle with white heart */}
        {route.id && (
          <button
            className={cn(
              "absolute top-3 right-3 h-10 w-10 rounded-full z-10 flex items-center justify-center transition-all",
              isRouteFavorite
                ? "bg-[#FF3B30] text-white"
                : "bg-white/80 hover:bg-white text-[#FF3B30]"
            )}
            onClick={handleFavoriteClick}
            aria-label={isRouteFavorite ? t('remove_from_favorites') : t('add_to_favorites')}
          >
            <Heart
              size={18}
              className={cn(
                "transition-colors",
                isRouteFavorite ? "fill-white text-white" : ""
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
           title={routeName}
        >
           {routeName}
        </h3>

        {/* Description */}
        <p className={cn(
            "text-sm text-[#666666] line-clamp-3 mb-4 leading-relaxed",
            fonts.body.className
        )}>
           {routeDescription || t('no_description_available')}
        </p>

        {/* Route Type Badge */}
        <div className="mt-auto pt-2">
            <div className="flex items-center justify-center py-3 bg-[#FFE0B2] rounded-lg">
                <RouteIcon size={20} className="text-[#FF9800] mr-2"/>
                <span className={cn(
                    "text-sm font-medium text-[#333333]",
                    fonts.subheading.className
                )}>{t('spiritual_route')}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RouteCard;