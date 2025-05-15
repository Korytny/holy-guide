
import React from 'react';
import { Link } from 'react-router-dom';
import { Route } from '../types';
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
}

const RouteCard: React.FC<RouteCardProps> = ({ route, className }) => {
  const { language, t } = useLanguage();
  const { auth, isFavorite, toggleFavorite } = useAuth(); 
  
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

  return (
    <div 
      className={cn(
        "block group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 h-full flex flex-col", 
        className
      )}
    >
      <div className="relative">
         <Link to={`/routes/${route.id}`} className="absolute inset-0 z-0"></Link> 
        <img 
          src={route.imageUrl || '/placeholder.svg'} 
          alt={routeName}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
         {/* Favorite Button - Always visible */} 
         {route.id && (
            <Button 
              variant="ghost" 
              size="icon"
              className="absolute top-2 right-2 rounded-full bg-black/40 hover:bg-black/60 text-white z-10 h-8 w-8"
              onClick={handleFavoriteClick}
              aria-label={isRouteFavorite ? t('remove_from_favorites') : t('add_to_favorites')}
            >
              <Heart 
                size={16}
                className={cn("transition-colors", isRouteFavorite ? "fill-red-500 text-red-500" : "text-white")}
               />
            </Button>
          )}
      </div>
      <Link to={`/routes/${route.id}`} className="p-3 flex-grow flex flex-col justify-between"> 
          <div>
             <h3
                className={cn( // Use cn for combining classes
                   "font-heading", // Apply heading font class
                   "text-lg font-semibold mb-1 truncate"
                )}
                title={routeName}
             >
                {routeName}
             </h3>
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {routeDescription || t('no_description_available')}
            </p>
          </div>
          <div className="flex items-center mt-1">
            <Badge variant="outline" className="text-xs px-1.5 py-0.5 flex items-center gap-1 border-[#09332A] text-[#09332A] font-['Monaco']">
              <RouteIcon size={12} className="flex-shrink-0" />
              <span>{t('spiritual_route')}</span>
            </Badge>
          </div>
      </Link>
    </div>
  );
};

export default RouteCard;
