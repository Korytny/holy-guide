
import React from 'react';
import { Link } from 'react-router-dom';
import { Place } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useFont } from '../context/FontContext';
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
  const { fonts } = useFont();

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
    <Link
        to={`/places/${place.id}`}
        className={cn(
            "block group rounded-xl shadow-lg overflow-hidden transition-shadow duration-200 h-full flex flex-col",
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
          src={place.imageUrl || '/placeholder.svg'}
          alt={placeName}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />

        {/* Favorite Button - Red circle with white heart */}
        {place.id && (
            <button
              className={cn(
                "absolute top-3 right-3 h-10 w-10 rounded-full z-10 flex items-center justify-center transition-all",
                isPlaceFavorite
                  ? "bg-[#FF3B30] text-white"
                  : "bg-white/80 hover:bg-white text-[#FF3B30]"
              )}
              onClick={handleFavoriteClick}
              aria-label={isPlaceFavorite ? t('remove_from_favorites') : t('add_to_favorites')}
            >
              <Heart
                size={18}
                className={cn(
                  "transition-colors",
                  isPlaceFavorite ? "fill-white text-white" : ""
                )}
              />
            </button>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 flex-grow flex flex-col">
          {/* Title */}
          <h3 className={cn(
            "text-2xl font-bold mb-2 text-[#333333]",
            fonts.heading.className
          )} title={placeName}>{placeName}</h3>

          {/* Description */}
          <p className={cn(
            "text-sm text-[#666666] line-clamp-3 mb-4 leading-relaxed",
            fonts.body.className
          )}>
              {placeDescription || t('no_description_available')}
          </p>

          {/* Place Type Badge */}
          <div className="mt-auto pt-2">
              <div className="flex items-center justify-center py-3 bg-[#FFE0B2] rounded-lg">
                  <MapPin size={20} className="text-[#FF9800] mr-2"/>
                  <span className={cn(
                      "text-sm font-medium text-[#333333]",
                      fonts.subheading.className
                  )}>{t(placeTypeKey)}</span>
              </div>
          </div>
      </div>
    </Link>
  );
};

export default PlaceCard;
