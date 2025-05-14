import React from 'react';
import { Place } from '../../types'; // Adjust path as needed
import { useLanguage } from '../../context/LanguageContext'; // Adjust path as needed
import { useAuth } from '../../context/AuthContext'; // Adjust path as needed
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MapPin } from 'lucide-react';
import { getLocalizedText } from '../../utils/languageUtils'; // Adjust path as needed

interface PlaceHeaderProps {
  place: Place;
  id: string; // Place ID
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

const PlaceHeader: React.FC<PlaceHeaderProps> = ({ place, id }) => {
    const { language, t } = useLanguage();
    const { isFavorite, toggleFavorite } = useAuth();

    const isPlaceFavorite = id ? isFavorite('place', id) : false;
    const placeName = getLocalizedText(place.name, language);
    const allImages = [ place.imageUrl, ...(Array.isArray(place.images) ? place.images.filter(img => typeof img === 'string') : []) ].filter(Boolean) as string[];
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

             {/* Title and Type */}
             <div className="absolute bottom-0 left-0 p-6 pointer-events-none">
                 <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-md font-['Laudatio']">{placeName}</h1>
                 <div className="flex items-center text-white/90">
                     <MapPin size={16} className="mr-1" />
                     <span>{t(placeTypeKey)}</span> 
                 </div>
             </div>
        </div>
    );
}

export default PlaceHeader;
