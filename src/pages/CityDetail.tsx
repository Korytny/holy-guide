import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getCityById } from '../services/citiesApi';
import { getRoutesByCityId } from '../services/routesApi';
import { getEventsByCityId } from '../services/eventsApi';
import { getPlacesByCityId } from '../services/placesApi';
import { City, Place, Route, Event } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PlaceCard from '../components/PlaceCard';
import RouteCard from '../components/RouteCard';
import EventCard from '../components/EventCard';
import PlaceCardMob from '../components/PlaceCardMob';
import RouteCardMob from '../components/RouteCardMob';
import EventCardMob from '../components/EventCardMob';
import { useIsSmallScreen } from '../hooks/use-small-screen';
import CityMapView from '../components/CityMapView';
import { ArrowLeft, Heart, MapPin, Map, Route as RouteIcon, CalendarDays } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import { getLocalizedText } from '../utils/languageUtils';

interface MapLocation {
  id: string;
  latitude: number;
  longitude: number;
  name: any;
  description: any;
  imageUrl: string | undefined;
  type: number | undefined;
}

const CityDetail: React.FC = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const [city, setCity] = useState<City | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [originalPlaces, setOriginalPlaces] = useState<Place[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('places');
  const { language, t } = useLanguage();
  const { auth, isFavorite, toggleFavorite } = useAuth();
  const navigate = useNavigate();
  const isSmallScreen = useIsSmallScreen();

  useEffect(() => {
    const loadCityData = async () => {
      // ... loading logic ...
        if (!id) return;

      setLoading(true);
      try {
        const [cityData, placesData, routesData, eventsData] = await Promise.all([
          getCityById(id),
          getPlacesByCityId(id),
          getRoutesByCityId(id),
          getEventsByCityId(id),
        ]);

        setCity(cityData);
        setPlaces(placesData);
        setOriginalPlaces(placesData);
        setRoutes(routesData);
        setEvents(eventsData);

      } catch (error) {
        console.error('Failed to load city data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCityData();
  }, [id, language]);


  const handleSearchPlaces = (term: string) => {
    // ... search logic ...
      if (!term) {
      setPlaces(originalPlaces);
      return;
    }

    const lowerTerm = term.toLowerCase();
    const results = originalPlaces.filter(place => {
      const nameMatch = getLocalizedText(place.name, language).toLowerCase().includes(lowerTerm);
      const descMatch = getLocalizedText(place.description, language).toLowerCase().includes(lowerTerm);
      return nameMatch || descMatch;
    });
    setPlaces(results);
  };

  const scrollToTab = useCallback((tabValue: string, tabId: string) => {
    // ... scroll logic ...
      setActiveTab(tabValue);
    setTimeout(() => {
       document.getElementById(tabId)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  }, []);

  const PlaceCardComponent = isSmallScreen ? PlaceCardMob : PlaceCard;
  const RouteCardComponent = isSmallScreen ? RouteCardMob : RouteCard;
  const EventCardComponent = isSmallScreen ? EventCardMob : EventCard;

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

  if (!city) {
    // ... Not found ...
     return (
      <Layout>
        <div className="app-container py-10 text-center">
          <h2 className="text-xl font-semibold mb-4">{t('city_not_found')}</h2>
          <Link to="/" className="btn-primary">
            {t('back_to_home')}
          </Link>
        </div>
      </Layout>
    );
  }

  const cityIsFavorite = id ? isFavorite('city', id) : false;
  const mapLocations: MapLocation[] = places.map(place => ({ /* ... map location data ... */ id: place.id, latitude: place.location.latitude, longitude: place.location.longitude, name: place.name, description: place.description, imageUrl: place.imageUrl, type: place.type}));
  const cityName = getLocalizedText(city.name, language) || city.name.en;
  const infoFields = city.info ? Object.entries(city.info) /* ... info fields logic ... */ .filter(([key]) => key === language || !['en', 'ru', 'hi'].includes(key)).map(([key, value]) => { const displayKey = ['en', 'ru', 'hi'].includes(key) ? '' : key; const textValue = typeof value === 'object' ? getLocalizedText(value, language) : String(value); return { key: displayKey, value: textValue }; }) : [];

  return (
    <Layout>
      <div className="app-container py-6">
        {/* ... Header, Image, About sections ... */}
        <div className="flex justify-between items-center mb-6">
            <button 
              onClick={() => navigate('/')} 
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={18} className="mr-2" />
              {t('back_to_cities')} 
            </button>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-10">
           <div className="relative w-full h-64 md:h-96"> 
             <img 
                src={city.imageUrl} 
                alt={cityName}
                className="absolute inset-0 w-full h-full object-cover rounded-xl shadow-lg"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl"></div>
             
             {/* Badges - Pass tab value to scrollToTab */}
             <div className="absolute top-4 left-4 flex flex-col sm:flex-row gap-2 md:gap-3 z-10"> 
                {places.length > 0 && (
                  <button 
                    onClick={() => scrollToTab('places', 'places-content')} 
                    className="p-0 bg-transparent border-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full"
                    aria-label={`${t('sacred_places')}: ${places.length}`}
                   >
                    <Badge variant="secondary" className="bg-black/60 text-white flex items-center gap-1 px-2 py-1 text-xs md:px-3 md:text-sm hover:bg-black/80 transition-colors">
                      <MapPin size={14} />
                      <span>{places.length}</span>
                    </Badge>
                  </button>
                )}
                {routes.length > 0 && (
                  <button 
                    onClick={() => scrollToTab('routes', 'routes-content')} 
                    className="p-0 bg-transparent border-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full"
                    aria-label={`${t('spiritual_routes')}: ${routes.length}`}
                   >
                    <Badge variant="secondary" className="bg-black/60 text-white flex items-center gap-1 px-2 py-1 text-xs md:px-3 md:text-sm hover:bg-black/80 transition-colors">
                      <RouteIcon size={14} />
                      <span>{routes.length}</span>
                    </Badge>
                  </button>
                )}
                {events.length > 0 && (
                   <button 
                    onClick={() => scrollToTab('events', 'events-content')} 
                    className="p-0 bg-transparent border-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full"
                    aria-label={`${t('holy_events')}: ${events.length}`}
                   >
                    <Badge variant="secondary" className="bg-black/60 text-white flex items-center gap-1 px-2 py-1 text-xs md:px-3 md:text-sm hover:bg-black/80 transition-colors">
                      <CalendarDays size={14} />
                      <span>{events.length}</span>
                    </Badge>
                  </button>
                )}
             </div>
             
             {/* Favorite Button */} 
             {city && id && (
               <Button 
                 variant="ghost" 
                 size="icon"
                 className="absolute top-4 right-4 rounded-full bg-black/40 hover:bg-black/60 text-white z-10"
                 onClick={() => toggleFavorite('city', id)} 
                 aria-label={cityIsFavorite ? t('remove_from_favorites') : t('add_to_favorites')}
               >
                 <Heart size={20} className={cityIsFavorite ? "fill-red-500 text-red-500" : ""} />
               </Button>
             )}
             
             {/* City Name & Country */} 
             <div className="absolute bottom-0 left-0 p-4 md:p-6 pointer-events-none">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2 drop-shadow-md">{getLocalizedText(city.name, language)}</h1>
                <div className="flex items-center text-white/90">
                  <MapPin size={14} className="mr-1" /> 
                  <span className="text-sm md:text-base">{city.country}</span>
                </div>
             </div>
           </div>

           {/* About Section */}
           <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
             <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-900">{t('about_city')}</h2>
             <div className="space-y-3 prose max-w-none text-gray-700">
                {infoFields.length > 0 ? (
                  infoFields.map((field, i) => (
                    <p key={i}>
                      {field.key && <strong className="mr-1">{field.key}:</strong>}
                      {field.value}
                    </p>
                  ))
                ) : (
                  <p className="text-gray-500 italic">{t('no_description_available')}</p>
                )}
             </div>
           </div>
        </div>

        {/* Map Section */}
        {places.length > 0 && (
           <div className="mb-10">
            <div className="flex items-center mb-4">
              <Map size={20} className="mr-2" />
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">{t('explore_on_map')}</h2>
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg h-96">
              <CityMapView
                locations={mapLocations} 
                maintainZoom={false}
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
              <span>{t('places_tab_title')}</span>
              {places.length > 0 && <Badge variant="secondary" className="ml-1.5 px-1.5 py-0.5 text-xs font-medium">{places.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="routes" className="flex-1 flex items-center justify-center gap-2 min-w-[120px] py-2 px-3 data-[state=active]:shadow-sm">
              <RouteIcon size={16} className="flex-shrink-0" />
              <span>{t('routes_tab_title')}</span>
              {routes.length > 0 && <Badge variant="secondary" className="ml-1.5 px-1.5 py-0.5 text-xs font-medium">{routes.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="events" className="flex-1 flex items-center justify-center gap-2 min-w-[120px] py-2 px-3 data-[state=active]:shadow-sm">
              <CalendarDays size={16} className="flex-shrink-0" />
              <span>{t('events_tab_title')}</span>
              {events.length > 0 && <Badge variant="secondary" className="ml-1.5 px-1.5 py-0.5 text-xs font-medium">{events.length}</Badge>}
            </TabsTrigger>
          </TabsList>

          {/* TabsContent remains the same as before */}
          <TabsContent value="places" id="places-content">
             {/* ... content ... */}
              <div className="mb-6">
              <SearchBar
                placeholder={t('search_places_placeholder')}
                onSearch={handleSearchPlaces}
              />
            </div>
            {places.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                 {t('no_places_found')}
              </div>
            ) : (
              // Conditional grid rendering
              <div className={`grid gap-6 ${isSmallScreen ? 'grid-cols-1' : 'sm:grid-cols-2 md:grid-cols-3'}`}>
                {places.map(place => (
                  // Use the determined component
                  <PlaceCardComponent key={place.id} place={place} />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="routes" id="routes-content">
             {/* ... content ... */}
               {routes.length === 0 ? (
               <div className="text-center py-10 text-gray-500">{t('no_routes_found')}</div>
            ) : (
              // Conditional grid rendering
              <div className={`grid gap-6 ${isSmallScreen ? 'grid-cols-1' : 'sm:grid-cols-2 md:grid-cols-3'}`}>
                {routes.map(route => (
                  // Use the determined component
                  <RouteCardComponent key={route.id} route={route} />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="events" id="events-content">
             {/* ... content ... */}
              {events.length === 0 ? (
               <div className="text-center py-10 text-gray-500">{t('no_events_found')}</div>
            ) : (
               // Conditional grid rendering
              <div className={`grid gap-6 ${isSmallScreen ? 'grid-cols-1' : 'sm:grid-cols-2 md:grid-cols-3'}`}>
                {events.map(event => (
                  // Use the determined component
                  <EventCardComponent key={event.id} event={event} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CityDetail;