import React from 'react';
import { Place } from '../../types'; // Adjust path as needed
import { useLanguage } from '../../context/LanguageContext'; // Adjust path as needed
import { useAuth } from '../../context/AuthContext'; // Adjust path as needed
import { useFont } from '../../context/FontContext';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MapPin, Route as RouteIcon, CalendarDays } from 'lucide-react';
import { getLocalizedText } from '../../utils/languageUtils'; // Adjust path as needed

interface PlaceHeaderProps {
  place: Place;
  id: string; // Place ID
  onTabSelect: (tabValue: string, tabId: string) => void;
}

// Helper function from PlaceDetail (can be moved to a utils file later if needed)
const getPlaceTypeKey = (type: number | undefined): string => {
      switch (type) {
        case 1: return 'place_type_temple';
        case 2: return 'place_type_samadhi';
        case 3: return 'place_type_kunda';
        case 4: return 'place_type_sacred_site';
        default: return 'sacred_place';
    }
};

const PlaceHeader: React.FC<PlaceHeaderProps> = ({ place, id, onTabSelect }) => {
    const { language, t } = useLanguage();
    const { fonts } = useFont();
    const { isFavorite, toggleFavorite } = useAuth();

    const isPlaceFavorite = id ? isFavorite('place', id) : false;
    const placeName = getLocalizedText(place.name, language);
    const allImages = Array.from(new Set([
      place.imageUrl,
      ...(Array.isArray(place.images) ? place.images.filter(img => typeof img === 'string') : [])
    ].filter(Boolean))) as string[];
    const placeTypeKey = getPlaceTypeKey(place.type);

    return (
        <div className="relative w-full h-64 md:h-96"> 
              {allImages.length > 0 ? (
                <Carousel className="w-full h-full rounded-xl overflow-hidden shadow-lg">
                    <CarouselContent className="h-full">
                        {allImages.map((imgUrl, index) => (
                            <CarouselItem key={index} className="h-full">
                                <Card className="h-full border-none shadow-none rounded-none">
                                    <CardContent className="flex items-center justify-center h-full p-0">
                                        <img src={imgUrl} alt={`${placeName} - Image ${index + 1}`} className="w-full h-full object-cover" />
                                    </CardContent>
                                </Card>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    {allImages.length > 1 && (
                       <>
                          <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 text-white hover:bg-black/60 border-none" />
                          <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 text-white hover:bg-black/60 border-none" />
                       </>
                    )}
                 </Carousel>
             ) : (
                 <div className="w-full h-full bg-gray-200 rounded-xl flex items-center justify-center">
                     <span className="text-gray-500">{t('no_image_available')}</span>
                 </div>
             )}

             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl pointer-events-none"></div>

             {/* Favorite Button */}
             {place && id && (
                 <Button
                     variant="ghost"
                     size="icon"
                     className="absolute top-4 right-4 rounded-full bg-black/40 hover:bg-black/60 text-white z-20"
                     onClick={() => toggleFavorite('place', id)}
                     aria-label={isPlaceFavorite ? t('remove_from_favorites') : t('add_to_favorites')}
                 >
                     <Heart size={20} className={isPlaceFavorite ? "fill-red-500 text-red-500" : ""} />
                 </Button>
             )}

             {/* Badges for related items */}
             <div className="absolute top-4 left-4 flex flex-col sm:flex-row gap-2 md:gap-3 z-10">
                {place.routesCount > 0 && (
                  <button 
                    onClick={() => onTabSelect('routes', 'routes-content')} 
                    className="p-0 bg-transparent border-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full"
                    aria-label={`${t('routes_through_place')}: ${place.routesCount}`}
                  >
                    <Badge variant="secondary" className="bg-black/60 text-white flex items-center gap-1 px-2 py-1 text-xs md:px-3 md:text-sm hover:bg-black/80 transition-colors">
                      <RouteIcon size={14} />
                      <span>{place.routesCount}</span>
                    </Badge>
                  </button>
                )}
                {place.eventsCount > 0 && (
                  <button 
                    onClick={() => onTabSelect('events', 'events-content')} 
                    className="p-0 bg-transparent border-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full"
                    aria-label={`${t('events_at_place')}: ${place.eventsCount}`}
                  >
                    <Badge variant="secondary" className="bg-black/60 text-white flex items-center gap-1 px-2 py-1 text-xs md:px-3 md:text-sm hover:bg-black/80 transition-colors">
                      <CalendarDays size={14} />
                      <span>{place.eventsCount}</span>
                    </Badge>
                  </button>
                )}
             </div>

             {/* Title */}
             <div className="absolute bottom-0 left-0 p-4 md:p-6 pointer-events-none">
                 <div className="bg-black/60 rounded-lg px-3 py-2 inline-block">
                     <h1 className={cn(
                       "text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2 drop-shadow-md",
                       fonts.heading.className
                     )}>
                       {placeName}
                     </h1>
                 </div>
             </div>
        </div>
    );
}

export default PlaceHeader;
