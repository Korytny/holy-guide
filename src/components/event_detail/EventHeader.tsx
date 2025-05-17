import React, { useCallback } from 'react';
import { Event, Place, Route } from '../../types'; // Adjust path
import { useLanguage } from '../../context/LanguageContext'; // Adjust path
import { useAuth } from '../../context/AuthContext'; // Adjust path
import { useFont } from '../../context/FontContext';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MapPin, CalendarDays, Route as RouteIcon } from 'lucide-react';
import { getLocalizedText } from '../../utils/languageUtils'; // Adjust path

interface EventHeaderProps {
  event: Event;
  places: Place[];
  routes: Route[];
  id: string;
  onTabSelect: (tabValue: string, tabId: string) => void;
}

const EventHeader: React.FC<EventHeaderProps> = ({ event, places, routes, id, onTabSelect }) => {
    const { language, t } = useLanguage();
    const { fonts } = useFont();
    const { isFavorite, toggleFavorite } = useAuth();

    const isEventFavorite = event ? isFavorite('event', event.id) : false;
    const eventName = getLocalizedText(event.name, language);
    const allImages = Array.from(new Set([
      event.imageUrl, 
      ...(Array.isArray(event.images) ? event.images.filter(img => typeof img === 'string') : [])
    ].filter(Boolean))) as string[];

    return (
        <div className="relative w-full h-64 md:h-96"> 
                {allImages.length > 0 ? (
                    <Carousel className="w-full h-full rounded-xl overflow-hidden shadow-lg">
                        <CarouselContent className="h-full">
                            {allImages.map((imgUrl, index) => (
                                <CarouselItem key={index} className="h-full">
                                    <Card className="h-full border-none shadow-none rounded-none">
                                        <CardContent className="flex items-center justify-center h-full p-0">
                                            <img src={imgUrl} alt={`${eventName} - Image ${index + 1}`} className="w-full h-full object-cover" />
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

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-xl pointer-events-none"></div>

                   {/* Badges for related items */}
                   <div className="absolute top-4 left-4 flex flex-col sm:flex-row gap-2 md:gap-3 z-10">
                    {places.length > 0 && (
                      <button 
                        onClick={() => onTabSelect('places', 'places-content')} 
                        className="p-0 bg-transparent border-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full"
                        aria-label={`${t('places')}: ${places.length}`}
                      >
                        <Badge variant="secondary" className="bg-black/60 text-white flex items-center gap-1 px-2 py-1 text-xs md:px-3 md:text-sm hover:bg-black/80 transition-colors">
                          <MapPin size={14} />
                          <span>{places.length}</span>
                        </Badge>
                      </button>
                    )}
                     {routes.length > 0 && (
                      <button 
                        onClick={() => onTabSelect('routes', 'routes-content')} 
                        className="p-0 bg-transparent border-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full"
                        aria-label={`${t('routes')}: ${routes.length}`}
                      >
                        <Badge variant="secondary" className="bg-black/60 text-white flex items-center gap-1 px-2 py-1 text-xs md:px-3 md:text-sm hover:bg-black/80 transition-colors">
                          <RouteIcon size={14} />
                          <span>{routes.length}</span>
                        </Badge>
                      </button>
                    )}
                  </div>
                  {/* Favorite Button */}
                  {event && id && (
                     <Button
                         variant="ghost"
                         size="icon"
                         className="absolute top-4 right-4 rounded-full bg-black/40 hover:bg-black/60 text-white z-20"
                         onClick={() => toggleFavorite('event', id)}
                         aria-label={isEventFavorite ? t('remove_from_favorites') : t('add_to_favorites')}
                     >
                         <Heart size={20} className={isEventFavorite ? "fill-red-500 text-red-500" : ""} />
                     </Button>
                 )}

                 {/* Title and Date */}
                 <div className="absolute bottom-0 left-0 p-6 pointer-events-none">
                    <div className="bg-black/40 px-4 py-2 rounded-lg mb-2">
                      <h1 className={cn(
                        "text-3xl font-bold text-white",
                        fonts.heading.className
                      )}>{eventName}</h1>
                    </div>
                     {event.date && (
                         <div className="flex items-center text-white/90 bg-black/40 px-3 py-1 rounded-full">
                           <CalendarDays size={16} className="mr-1" />
                           <span className="text-sm">{new Date(event.date).toLocaleDateString()}</span>
                         </div>
                     )}
                 </div>
           </div>
    );
}

export default EventHeader;
