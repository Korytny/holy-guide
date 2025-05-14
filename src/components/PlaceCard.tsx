
import React from 'react';
import { Link } from 'react-router-dom';
import { Place } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { MapPin, Heart } from 'lucide-react';
import { getLocalizedText } from '../utils/languageUtils';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';

interface PlaceCardProps {
  place: Place;
  className?: string;
}

const getPlaceTypeKey = (type: number | undefined): string => {
    switch (type) {
        case 1: return 'place_type_temple';
        case 2: return 'place_type_samadhi';
        case 3: return 'place_type_kunda';
        case 4: return 'place_type_sacred_site';
        default: return 'sacred_place';
    }
};

const PlaceCard: React.FC<PlaceCardProps> = ({ place, className }) => {
  const { language, t } = useLanguage();
  const { auth, isFavorite, toggleFavorite } = useAuth();
  
  const placeName = getLocalizedText(place.name, language);
  const placeDescription = getLocalizedText(place.description, language);
  const isPlaceFavorite = auth.isAuthenticated && auth.user ? isFavorite('place', place.id) : false;
  const placeTypeKey = getPlaceTypeKey(place.type);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // toggleFavorite handles the auth check
    if (place.id) {
      toggleFavorite('place', place.id);
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
        <Link to={`/places/${place.id}`} className="absolute inset-0 z-0"></Link> 
        <img
          src={place.imageUrl || '/placeholder.svg'} 
          alt={placeName}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Favorite Button - Always visible */} 
        {place.id && (
            <Button 
                variant="ghost" 
                size="icon"
                className="absolute top-2 right-2 rounded-full bg-black/40 hover:bg-black/60 text-white z-10 h-8 w-8"
                onClick={handleFavoriteClick}
                aria-label={isPlaceFavorite ? t('remove_from_favorites') : t('add_to_favorites')}
            >
                <Heart 
                    size={16} 
                    className={cn("transition-colors", isPlaceFavorite ? "fill-red-500 text-red-500" : "text-white")}
                />
            </Button>
        )}
      </div>
      
      <Link to={`/places/${place.id}`} className="p-3 flex-grow flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold mb-1 truncate font-[Laudatio] text-[#09332A]" title={placeName}>{placeName}</h3>
            <p className="text-sm text-black line-clamp-3 mb-3 font-['Monaco']">
                {placeDescription || t('no_description_available')}
            </p>
          </div>
          <div className="flex items-center text-xs text-[#09332A] mt-1 font-['Monaco']">
              <MapPin size={14} className="mr-1" />
              <span>{t(placeTypeKey)}</span>
          </div>
      </Link>
    </div>
  );
};

export default PlaceCard;
