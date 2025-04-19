import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPlaceById, getRoutesByPlaceId, getEventsByPlaceId } from '../services/api';
import { Place, Route, Event } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RouteCard from '../components/RouteCard';
import EventCard from '../components/EventCard';
import RouteCardMob from '../components/RouteCardMob';
import EventCardMob from '../components/EventCardMob';
import { useIsSmallScreen } from '../hooks/use-small-screen';
import CityMapView from '../components/CityMapView';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge"; // Import Badge
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
// Import necessary icons including RouteIcon and CalendarDays
import { ArrowLeft, Heart, MapPin, Route as RouteIcon, CalendarDays } from 'lucide-react';
import { getLocalizedText } from '../utils/languageUtils';
import Layout from '../components/Layout';

const getPlaceTypeKey = (type: number | undefined): string => {
    // ... helper function ...
      switch (type) {
        case 1: return 'place_type_temple';
        case 2: return 'place_type_samadhi';
        case 3: return 'place_type_kunda';
        case 4: return 'place_type_sacred_site';
        default: return 'sacred_place';
    }
};

const PlaceDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [place, setPlace] = useState<Place | null>(null);
    const [relatedRoutes, setRelatedRoutes] = useState<Route[]>([]);
    const [relatedEvents, setRelatedEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const { language, t } = useLanguage();
    const { auth, isFavorite, toggleFavorite } = useAuth();
    const navigate = useNavigate();
    const isSmallScreen = useIsSmallScreen();

    useEffect(() => {
        const loadPlaceData = async () => {
            // ... loading logic ...
            if (!id) return;

            setLoading(true);
            try {
                const placeData = await getPlaceById(id);
                setPlace(placeData);

                if (placeData) {
                    const [routesData, eventsData] = await Promise.all([
                        getRoutesByPlaceId(id),
                        getEventsByPlaceId(id)
                    ]);
                    setRelatedRoutes(routesData);
                    setRelatedEvents(eventsData);
                }
            } catch (error) {
                console.error('Failed to load place data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadPlaceData();
    }, [id]);

    const RelatedRouteCardComponent = isSmallScreen ? RouteCardMob : RouteCard;
    const RelatedEventCardComponent = isSmallScreen ? EventCardMob : EventCard;

    if (loading) {
        // ... Loading skeleton ...
         return (
            <Layout>
                <div className="app-container py-10">
                    <div className="animate-pulse">
                        <div className="h-8 w-48 bg-gray-300 rounded mb-6"></div>
                        <div className="grid md:grid-cols-2 gap-8 mb-10">
                            <div className="relative w-full h-64 md:h-96 bg-gray-200 rounded-xl"></div>
                            <div className="bg-gray-100 rounded-xl p-6 md:p-8 space-y-4">
                                <div className="h-6 w-32 bg-gray-300 rounded"></div>
                                <div className="h-4 w-full bg-gray-200 rounded"></div>
                                <div className="h-4 w-full bg-gray-200 rounded"></div>
                                <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                        <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
                        <div className="h-10 w-full bg-gray-200 rounded-lg mb-4"></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[1, 2].map(i => (
                                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!place) {
        // ... Not found ...
         return (
            <Layout>
                <div className="app-container py-10 text-center">
                    <h2 className="text-xl font-semibold mb-4">{t('place_not_found')}</h2>
                    <Link to="/" className="btn-primary">
                        {t('back_to_home')}
                    </Link>
                </div>
            </Layout>
        );
    }

    const isPlaceFavorite = id ? isFavorite('place', id) : false;
    const placeName = place ? getLocalizedText(place.name, language) : '';
    const descriptionParts = place ? [ /* ... description parts ... */ getLocalizedText(place.description, language), getLocalizedText(place.info, language) ].filter(text => text && text.trim()) : [];
    const mapLocations = place ? [{ /* ... map location data ... */ id: place.id, latitude: place.location.latitude, longitude: place.location.longitude, name: place.name, description: place.description, imageUrl: place.imageUrl, type: place.type}] : [];
    const allImages = [ /* ... image array logic ... */ place.imageUrl, ...(Array.isArray(place.images) ? place.images.filter(img => typeof img === 'string') : []) ].filter(Boolean) as string[];
    const placeTypeKey = getPlaceTypeKey(place.type);

    return (
        <Layout>
            <div className="app-container py-6">
                {/* ... Back button, Image Carousel, About Section, Map Section ... */}
                 <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => navigate(place.cityId ? `/cities/${place.cityId}` : '/')}
                        className="inline-flex items-center text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft size={18} className="mr-2" />
                        {t('back_to_city')}
                    </button>
                </div>

                 <div className="grid md:grid-cols-2 gap-8 mb-10">
                    {/* Image Carousel Section */} 
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

                         <div className="absolute bottom-0 left-0 p-6 pointer-events-none">
                             <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-md">{placeName}</h1>
                             <div className="flex items-center text-white/90">
                                 <MapPin size={16} className="mr-1" />
                                 <span>{t(placeTypeKey)}</span> 
                             </div>
                         </div>
                    </div>

                    {/* About Section */}
                    <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                         <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('about_place')}</h2>
                        {descriptionParts.length > 0 ? (
                            <div className="prose max-w-none text-gray-700">
                                {descriptionParts.map((part, index) => (
                                    <p key={index} className="mb-4 last:mb-0">{part}</p>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">{t('no_description_available')}</p>
                        )}
                    </div>
                </div>
                 {place && (
                    <div className="mb-10">
                        <h2 className="text-2xl font-semibold mb-6 text-gray-900">{t('location')}</h2>
                        <div className="rounded-xl overflow-hidden shadow-lg h-96"> 
                            <CityMapView
                                locations={mapLocations} 
                                center={[place.location.latitude, place.location.longitude]} // Center on place
                                zoom={15} // Zoom closer for single place
                                maintainZoom={true} // Keep zoom fixed
                            />
                        </div>
                    </div>
                )}

                {/* Tabs Section - Updated */}
                <Tabs defaultValue="routes" className="w-full">
                     <TabsList className="w-full flex mb-6 flex-wrap h-auto justify-center gap-2 md:gap-4">
                         {/* Use simplified keys and add count badge */}
                        <TabsTrigger value="routes" className="flex-1 flex items-center justify-center gap-2 min-w-[120px] py-2 px-3 data-[state=active]:shadow-sm">
                            <RouteIcon size={16} className="flex-shrink-0" />
                            <span>{t('routes_tab_title')}</span> {/* Assuming 'routes_tab_title' key */}
                            {relatedRoutes.length > 0 && <Badge variant="secondary" className="ml-1.5 px-1.5 py-0.5 text-xs font-medium">{relatedRoutes.length}</Badge>}
                        </TabsTrigger>
                        <TabsTrigger value="events" className="flex-1 flex items-center justify-center gap-2 min-w-[120px] py-2 px-3 data-[state=active]:shadow-sm">
                             <CalendarDays size={16} className="flex-shrink-0" />
                             <span>{t('events_tab_title')}</span> {/* Assuming 'events_tab_title' key */}
                             {relatedEvents.length > 0 && <Badge variant="secondary" className="ml-1.5 px-1.5 py-0.5 text-xs font-medium">{relatedEvents.length}</Badge>}
                        </TabsTrigger>
                    </TabsList>

                    {/* TabsContent remains the same */}
                    <TabsContent value="routes">
                       {/* ... content ... */}
                           {relatedRoutes.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">{t('no_routes_found')}</div>
                        ) : (
                             // Conditional grid rendering
                            <div className={`grid gap-6 ${isSmallScreen ? 'grid-cols-1' : 'sm:grid-cols-2'}`}>
                                {relatedRoutes.map(route => (
                                    // Use the determined component
                                    <RelatedRouteCardComponent key={route.id} route={route} />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="events">
                        {/* ... content ... */}
                          {relatedEvents.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">{t('no_events_found')}</div>
                        ) : (
                            // Conditional grid rendering
                            <div className={`grid gap-6 ${isSmallScreen ? 'grid-cols-1' : 'sm:grid-cols-2'}`}>
                                {relatedEvents.map(event => (
                                    // Use the determined component
                                    <RelatedEventCardComponent key={event.id} event={event} />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </Layout>
    );
};

export default PlaceDetail;