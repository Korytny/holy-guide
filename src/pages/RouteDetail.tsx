import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getRouteById, getPlacesByRouteId, getEventsByRouteId } from '../services/api';
import { Route, Place, Event } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlaceCard from '../components/PlaceCard';
import EventCard from '../components/EventCard';
import PlaceCardMob from '../components/PlaceCardMob';
import EventCardMob from '../components/EventCardMob';
import { useIsSmallScreen } from '../hooks/use-small-screen';
import CityMapView from '../components/CityMapView';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge"; // Import Badge
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
// Import necessary icons
import { ArrowLeft, Heart, MapPin, CalendarDays, Route as RouteIconUi } from 'lucide-react'; // Renamed Route from react-router
import { getLocalizedText } from '../utils/languageUtils';
import Layout from '../components/Layout';

const RouteDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [route, setRoute] = useState<Route | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('places');
  const { language, t } = useLanguage();
  const { auth, isFavorite, toggleFavorite } = useAuth();
  const navigate = useNavigate();
  const isSmallScreen = useIsSmallScreen();

  const loadRouteData = async () => {
      // ... loading logic ...
        if (!id) return;

    setLoading(true);
    try {
      const routeData = await getRouteById(id);
      setRoute(routeData);

      if (routeData) {
        const [placesData, eventsData] = await Promise.all([
           getPlacesByRouteId(id),
           getEventsByRouteId(id)
        ]);
        setPlaces(placesData);
        setEvents(eventsData);
      }
    } catch (error) {
      console.error('Failed to load route data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRouteData();
  }, [id]);

  const scrollToTab = useCallback((tabValue: string, tabId: string) => {
     // ... scroll logic ...
      setActiveTab(tabValue);
    setTimeout(() => {
       document.getElementById(tabId)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  }, []);

  const RelatedPlaceCardComponent = isSmallScreen ? PlaceCardMob : PlaceCard;
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!route) {
    // ... Not found ...
     return (
      <Layout>
        <div className="app-container py-10 text-center">
          <h2 className="text-xl font-semibold mb-4">{t('route_not_found')}</h2>
          <Link to="/" className="btn-primary">
            {t('back_to_home')}
          </Link>
        </div>
      </Layout>
    );
  }

  const isRouteFavorite = route ? isFavorite('route', route.id) : false;
  const mapLocations = places.map(place => ({ /* ... map location data ... */ id: place.id, latitude: place.location.latitude, longitude: place.location.longitude, name: place.name, description: place.description, imageUrl: place.imageUrl, type: place.type, order: place.order }));
  const polylinePoints = places /* ... polyline logic ... */ .filter(place => place.location?.latitude && place.location?.longitude).sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity)).map(place => [place.location.latitude, place.location.longitude] as [number, number]);
  const routeName = getLocalizedText(route.name, language);
  const routeDescription = route.description ? getLocalizedText(route.description, language) : '';
  const allImages = [ /* ... image array logic ... */ route.imageUrl, ...(Array.isArray(route.images) ? route.images.filter(img => typeof img === 'string') : []) ].filter(Boolean) as string[];

  return (
    <Layout>
      <div className="app-container py-6">
         {/* ... Back button, Image Carousel, About Section, Map Section ... */}
          <div className="flex justify-between items-center mb-6">
            <button 
            onClick={() => navigate(route.cityId ? `/cities/${route.cityId}` : '/')} 
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

                   <div className="absolute top-4 left-4 flex flex-col sm:flex-row gap-2 md:gap-3 z-10">
                    {places.length > 0 && (
                      <button 
                        onClick={() => scrollToTab('places', 'places-content')} 
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
                        onClick={() => scrollToTab('events', 'events-content')} 
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

                 <div className="absolute bottom-0 left-0 p-6 pointer-events-none">
                    <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-md">{routeName}</h1>
                    <div className="flex items-center text-white/90">
                      <RouteIconUi size={16} className="mr-1" />
                      <span className="text-sm">{t('spiritual_route')}</span>
                    </div>
                 </div>
           </div>
           {/* About Section */} 
           <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
               <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('about_route')}</h2>
             {route.info ? (
                <div className="prose max-w-none text-gray-700">
                  {Object.entries(route.info)
                    .filter(([key]) => key === language || !['en', 'ru', 'hi'].includes(key))
                    .map(([key, value], i) => (
                      <p key={i} className="mb-2 last:mb-0">
                        {!['en', 'ru', 'hi'].includes(key) && <strong className="mr-1">{key}:</strong>}
                        {typeof value === 'object' ? getLocalizedText(value, language) : String(value)}
                      </p>
                    ))}
                     {routeDescription && <p className="mt-4 text-gray-600 italic">{routeDescription}</p>}
                </div>
              ) : routeDescription ? (
                 <p className="text-gray-700 leading-relaxed">{routeDescription}</p>
              ) : (
                 <p className="text-gray-500 italic">{t('no_description_available')}</p>
              )}
           </div>
        </div>
         {places.length > 0 && (
          <div className="mb-10">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">{t('route_on_map_title')}</h2>
            <div className="rounded-xl overflow-hidden shadow-lg h-96">
              <CityMapView 
                locations={mapLocations} 
                polylinePoints={polylinePoints} // Pass the points for the line
                maintainZoom={false} // Allow map to fit bounds for route
              />
            </div>
          </div>
        )}

        {/* Tabs Section - Updated */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full flex mb-6 flex-wrap h-auto justify-center gap-2 md:gap-4">
                {/* Use simplified keys and add count badge */}
                <TabsTrigger value="places" className="flex-1 flex items-center justify-center gap-2 min-w-[120px] py-2 px-3 data-[state=active]:shadow-sm">
                    <MapPin size={16} className="flex-shrink-0" />
                    <span>{t('places_tab_title')}</span> {/* Assuming 'places_tab_title' key */}
                    {places.length > 0 && <Badge variant="secondary" className="ml-1.5 px-1.5 py-0.5 text-xs font-medium">{places.length}</Badge>}
                </TabsTrigger>
                <TabsTrigger value="events" className="flex-1 flex items-center justify-center gap-2 min-w-[120px] py-2 px-3 data-[state=active]:shadow-sm">
                    <CalendarDays size={16} className="flex-shrink-0" />
                    <span>{t('events_tab_title')}</span> {/* Assuming 'events_tab_title' key */}
                    {events.length > 0 && <Badge variant="secondary" className="ml-1.5 px-1.5 py-0.5 text-xs font-medium">{events.length}</Badge>}
                </TabsTrigger>
            </TabsList>

          {/* TabsContent remains the same */}
          <TabsContent value="places" id="places-content">
             {/* ... content ... */}
               {places.length === 0 ? (
              <div className="text-center py-10 text-gray-500">{t('no_places_found')}</div>
            ) : (
               // Conditional grid rendering
              <div className={`grid gap-6 ${isSmallScreen ? 'grid-cols-1' : 'sm:grid-cols-2 md:grid-cols-3'}`}>
                {places.map(place =>
                    // Use the determined component
                    <RelatedPlaceCardComponent key={place.id} place={place} />
                )}
              </div>
            )}
          </TabsContent>
          <TabsContent value="events" id="events-content">
             {/* ... content ... */}
                {events.length === 0 ? (
              <div className="text-center py-10 text-gray-500">{t('no_events_found')}</div>
            ) : (
              // Conditional grid rendering
               <div className={`grid gap-6 ${isSmallScreen ? 'grid-cols-1' : 'sm:grid-cols-2'}`}>
                {events.map(event =>
                    // Use the determined component
                    <RelatedEventCardComponent key={event.id} event={event} />
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default RouteDetail;