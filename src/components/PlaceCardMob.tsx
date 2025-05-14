import React from 'react';
import { Link } from 'react-router-dom';
import { Place } from '../types'; // Assume Place has rating if needed
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin } from 'lucide-react'; // MapPin for type
import { getLocalizedText } from '../utils/languageUtils';
import { cn } from "@/lib/utils";

interface PlaceCardMobProps {
  place: Place;
  className?: string;
}

// Keep the type helper function (or import if it's extracted)
const getPlaceTypeKey = (type: number | undefined): string => {
    switch (type) {
        case 1: return 'place_type_temple';
        case 2: return 'place_type_samadhi';
        case 3: return 'place_type_kunda';
        case 4: return 'place_type_sacred_site';
        default: return 'sacred_place';
    }
};

const PlaceCardMob: React.FC<PlaceCardMobProps> = ({ place, className }) => {
  const { language, t } = useLanguage();
  const { auth, isFavorite, toggleFavorite } = useAuth();

  const placeName = getLocalizedText(place.name, language);
  const placeDescription = getLocalizedText(place.description, language);
  const isPlaceFavorite = auth.isAuthenticated && auth.user ? isFavorite('place', place.id) : false;
  const placeTypeKey = getPlaceTypeKey(place.type);
  const placeTypeText = t(placeTypeKey);

  // Assuming place might have a rating, similar to City
  const placeRating = place.rating || null; // Use null if no rating

  const handleFavoriteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (place.id) {
        toggleFavorite('place', place.id);
    }
  };

  return (
    <div
        className={cn(
            "block group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200",
            className
        )}
    >
      <Link to={`/places/${place.id}`} className="flex p-3 gap-3 items-start">
        {/* Image Section */}
        <div className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden">
          <img
            src={place.imageUrl || '/placeholder.svg'}
            alt={placeName}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {place.id && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 h-7 w-7 rounded-full bg-white/80 hover:bg-white text-gray-700 z-10 group-hover:opacity-100 opacity-90 transition-opacity shadow-sm"
                onClick={handleFavoriteClick}
                aria-label={isPlaceFavorite ? t('remove_from_favorites') : t('add_to_favorites')}
              >
                <Heart size={14} className={cn("transition-colors", isPlaceFavorite ? "fill-red-500 text-red-500" : "text-gray-600")} />
              </Button>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-grow flex flex-col min-w-0">
          {/* Top Row: Title and Type/Rating */}
          <div className="flex justify-between items-start gap-2 mb-1">
             {/* Title */}
             <h3 className="text-base font-bold line-clamp-2 flex-grow mr-1 font-[Laudatio] text-[#09332A]" title={placeName}>
                {placeName}
             </h3>
             {/* Type and Rating Container */}
             <div className="flex items-center flex-shrink-0 gap-1.5">
                 {/* Place Type Badge */}
                 <Badge variant="outline" className="text-xs px-1.5 py-0.5 flex items-center gap-1 border-[#09332A] text-[#09332A] font-['Monaco']" title={placeTypeText}>
                     <MapPin size={12} className="flex-shrink-0" />
                     {/* Optionally show text if short enough, or just icon */}
                     {/* <span className="hidden sm:inline">{placeTypeText}</span> */}
                 </Badge>
                 {/* Rating Badge */}
                {placeRating && (
                    <Badge variant="default" className="bg-orange-500 text-white text-xs px-1.5 py-0.5 flex-shrink-0">
                        {placeRating.toFixed(1)}
                    </Badge>
                )}
             </div>
          </div>

          {/* Description */}
          <p className="text-sm text-black line-clamp-3 overflow-hidden mt-1 font-['Monaco']">
            {placeDescription || t('no_description_available')}
          </p>
        </div>
      </Link>
    </div>
  );
};

export default PlaceCardMob;
