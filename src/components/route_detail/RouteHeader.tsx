import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Route, Place, Event } from '../../types'; // Path from src/components/route_detail
import { useLanguage } from '../../context/LanguageContext'; // Path from src/components/route_detail
import { useAuth } from '../../context/AuthContext'; // Path from src/components/route_detail
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Heart, MapPin, CalendarDays, Route as RouteIconUi } from 'lucide-react';
import { getLocalizedText } from '../../utils/languageUtils'; // Path from src/components/route_detail

interface RouteHeaderProps {
  route: Route;
  places: Place[];
  events: Event[];
  id: string;
  onTabSelect: (tabValue: string, tabId: string) => void;
}

const RouteHeader: React.FC<RouteHeaderProps> = ({ route, places, events, id, onTabSelect }) => {
    const { language, t } = useLanguage();
    const { isFavorite, toggleFavorite } = useAuth();
    // const navigate = useNavigate(); // Not used here

    const isRouteFavorite = route ? isFavorite('route', route.id) : false;
    const routeName = getLocalizedText(route.name, language);
    const allImages = [ route.imageUrl, ...(Array.isArray(route.images) ? route.images.filter(img => typeof img === 'string') : []) ].filter(Boolean) as string[];

    return (
        <div className="relative w-full h-64 md:h-96"> 
              {allImages.length > 0 ? (
                <Carousel className="w-full h-full rounded-xl overflow-hidden shadow-lg">
                    <CarouselContent className="h-full">
                        {allImages.map((imgUrl, index) => (
                            <CarouselItem key={index} className="h-full">
                                <Card className="h-full border-none shadow-none rounded-none">
                                    <CardContent className="flex items-center justify-center h-full p-0">
                                        <img src={imgUrl} alt={`${routeName} - Image ${index + 1}`} className="w-full h-full object-cover" />
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

             {/* Badges for related items */}
             <div className="absolute top-4 left-4 flex flex-col sm:flex-row gap-2 md:gap-3 z-10">
                {places.length > 0 && (
                  <button 
                    onClick={() => onTabSelect('places', 'places-content')} 
                    className="p-0 bg-transparent border-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full"
                    aria-label={`${t('places_on_route')}: ${places.length}`}
                  >
                    <Badge variant="secondary" className="bg-black/60 text-white flex items-center gap-1 px-2 py-1 text-xs md:px-3 md:text-sm hover:bg-black/80 transition-colors">
                      <MapPin size={14} />
                      <span>{places.length}</span>
                    </Badge>
                  </button>
                )}
                {events.length > 0 && (
                  <button 
                    onClick={() => onTabSelect('events', 'events-content')} 
                    className="p-0 bg-transparent border-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full"
                    aria-label={`${t('related_events')}: ${events.length}`}
                  >
                    <Badge variant="secondary" className="bg-black/60 text-white flex items-center gap-1 px-2 py-1 text-xs md:px-3 md:text-sm hover:bg-black/80 transition-colors">
                      <CalendarDays size={14} />
                      <span>{events.length}</span>
                    </Badge>
                  </button>
                )}
             </div>

             {/* Favorite Button */}
             {route && id && (
                 <Button
                     variant="ghost"
                     size="icon"
                     className="absolute top-4 right-4 rounded-full bg-black/40 hover:bg-black/60 text-white z-20"
                     onClick={() => toggleFavorite('route', id)}
                     aria-label={isRouteFavorite ? t('remove_from_favorites') : t('add_to_favorites')}
                 >
                     <Heart size={20} className={isRouteFavorite ? "fill-red-500 text-red-500" : ""} />
                 </Button>
             )}

             {/* Title and Type */}
             <div className="absolute bottom-0 left-0 p-6 pointer-events-none">
                 <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-md font-['Laudatio']">{routeName}</h1>
                 <div className="flex items-center text-white/90">
                     <RouteIconUi size={16} className="mr-1" />
                     <span>{t('spiritual_route')}</span>
                 </div>
             </div>
        </div>
    );
}

export default RouteHeader;
