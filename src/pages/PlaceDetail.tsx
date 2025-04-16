
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPlaceById, getRoutesByPlaceId, getEventsByPlaceId } from '../services/api';
import { Place, Route, Event } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RouteCard from '../components/RouteCard';
import EventCard from '../components/EventCard';
// import MapView from '../components/MapView'; // Remove old import
import CityMapView from '../components/CityMapView'; // Import new map
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"; // Import Carousel components
import { Card, CardContent } from "@/components/ui/card"; // Import Card for Carousel item styling
import { ArrowLeft, Heart, MapPin } from 'lucide-react';
import { getLocalizedText } from '../utils/languageUtils';
import Layout from '../components/Layout';

// Helper function to get translation key based on place type
const getPlaceTypeKey = (type: number | undefined): string => {
    switch (type) {
        case 1: return 'place_type_temple';
        case 2: return 'place_type_samadhi';
        case 3: return 'place_type_kunda';
        case 4: return 'place_type_sacred_site'; // Using a more general term
        default: return 'sacred_place'; // Fallback to the generic term
    }
};

const PlaceDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [place, setPlace] = useState<Place | null>(null);
    const [relatedRoutes, setRelatedRoutes] = useState<Route[]>([]);
    const [relatedEvents, setRelatedEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const { language, t } = useLanguage();
    const { auth, isFavorite, toggleFavorite } = useAuth(); // Use Auth context
    const navigate = useNavigate();

    useEffect(() => {
        const loadPlaceData = async () => {
            if (!id) return;

            setLoading(true);
            try {
                const placeData = await getPlaceById(id);
                setPlace(placeData);

                // Fetch related data only if place exists
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

    if (loading) {
        // ... Loading skeleton remains the same ...
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
        // ... Not found remains the same ...
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

    // Get favorite status from context
    const isPlaceFavorite = id ? isFavorite('place', id) : false;

    const placeName = place ? getLocalizedText(place.name, language) : '';
    // Get description parts separately and filter empty ones
    const descriptionParts = place ? [
        getLocalizedText(place.description, language),
        getLocalizedText(place.info, language)
    ].filter(text => text && text.trim()) : [];

    // Prepare locations for MapView, ensure type is number and id is present
    const mapLocations = place ? [{
        id: place.id,
        latitude: place.location.latitude,
        longitude: place.location.longitude,
        name: place.name,
        description: place.description,
        imageUrl: place.imageUrl,
        type: place.type
    }] : [];

    // Prepare images for Carousel
    const allImages = [
        place.imageUrl, // Main image first
        ...(Array.isArray(place.images) ? place.images.filter(img => typeof img === 'string') : []) // Add additional images if they exist and are strings
    ].filter(Boolean) as string[]; // Filter out any null/undefined/empty values and assert as string[]

    const placeTypeKey = getPlaceTypeKey(place.type); // Get the key based on type

    return (
        <Layout>
            <div className="app-container py-6">
                {/* Back button */} 
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => navigate(place.cityId ? `/cities/${place.cityId}` : '/')}
                        className="inline-flex items-center text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft size={18} className="mr-2" />
                        {t('back_to_city')}
                    </button>
                    {/* Favorite button moved to image */} 
                </div>

                {/* --- Image Carousel and About Section Grid --- */}
                <div className="grid md:grid-cols-2 gap-8 mb-10">
                    {/* Image Carousel Section */} 
                    <div className="relative w-full h-64 md:h-96"> 
                        {/* ... Carousel remains the same ... */}
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

                         {/* Overlay elements (Gradient, Title, Like Button) */}
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl pointer-events-none"></div>

                         {/* Favorite Button - Positioned over Carousel */}
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
                                 {/* Use the determined place type key */} 
                                 <span>{t(placeTypeKey)}</span> 
                             </div>
                         </div>
                    </div>

                    {/* About Section */}
                    <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                       {/* ... About section remains the same ... */} 
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

                {/* Map Section - Use CityMapView */} 
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

                {/* Tabs Section */}
                 {/* ... Tabs remain the same ... */} 
                 <Tabs defaultValue="routes" className="w-full">
                    <TabsList className="w-full flex mb-6 flex-wrap h-auto justify-center">
                        <TabsTrigger value="routes" className="flex-1 flex items-center justify-center gap-2 min-w-[150px] py-2">{t('related_routes')} ({relatedRoutes.length})</TabsTrigger>
                        <TabsTrigger value="events" className="flex-1 flex items-center justify-center gap-2 min-w-[150px] py-2">{t('related_events')} ({relatedEvents.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="routes">
                        {relatedRoutes.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">{t('no_routes_found')}</div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {relatedRoutes.map(route => (
                                    <RouteCard key={route.id} route={route} />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="events">
                        {relatedEvents.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">{t('no_events_found')}</div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {relatedEvents.map(event => (
                                    <EventCard key={event.id} event={event} />
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
