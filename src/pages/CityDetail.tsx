
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  getCityById, 
  getPlacesByCityId, 
  getRoutesRelatedToCityPlaces, 
  getEventsRelatedToCityPlaces,
  addCityToFavorites,
  removeCityFromFavorites,
  isCityFavorite 
} from '../services/api';
import { City, Place, Route, Event } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import PlaceCard from '../components/PlaceCard';
import RouteCard from '../components/RouteCard';
import EventCard from '../components/EventCard';
import CityMapView from '../components/CityMapView';
import { ArrowLeft, Heart, MapPin, Map, Route as RouteIcon, CalendarDays } from 'lucide-react';
import { getLocalizedText } from '../utils/languageUtils';

const CityDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [city, setCity] = useState<City | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const { language, t } = useLanguage();
  const { auth } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    const loadCityData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const cityData = await getCityById(id);
        setCity(cityData);
        
        // Load places in the city
        const placesData = await getPlacesByCityId(id);
        setPlaces(placesData);
        
        // Load routes related to places in the city
        const routesData = await getRoutesRelatedToCityPlaces(id);
        setRoutes(routesData);
        
        // Load events related to places in the city
        const eventsData = await getEventsRelatedToCityPlaces(id);
        setEvents(eventsData);

        // Check if city is in favorites
        if (auth.isAuthenticated) {
          const favorite = await isCityFavorite(id);
          setIsFavorite(favorite);
        }
      } catch (error) {
        console.error('Failed to load city data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCityData();
  }, [id, auth.isAuthenticated]);

  const handleToggleFavorite = async () => {
    if (!city || !auth.isAuthenticated) {
      toast({
        title: t('login_required'),
        description: t('login_to_save_favorites'),
        variant: "destructive"
      });
      return;
    }

    try {
      if (isFavorite) {
        await removeCityFromFavorites(city.id);
        setIsFavorite(false);
        toast({
          title: t('removed_from_favorites'),
          description: getLocalizedText(city.name, language) + ' ' + t('removed_from_favorites_description')
        });
      } else {
        await addCityToFavorites(city.id);
        setIsFavorite(true);
        toast({
          title: t('added_to_favorites'),
          description: getLocalizedText(city.name, language) + ' ' + t('added_to_favorites_description')
        });
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
      toast({
        title: t('error'),
        description: t('error_updating_favorites'),
        variant: "destructive"
      });
    }
  };
  
  if (loading) {
    return (
      <div className="app-container py-10">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-300 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
          <div className="h-6 w-40 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-3/4 bg-gray-200 rounded mb-6"></div>
          
          <div className="h-10 w-full bg-gray-200 rounded-lg mb-4"></div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (!city) {
    return (
      <div className="app-container py-10 text-center">
        <h2 className="text-xl font-semibold mb-4">{t('city_not_found')}</h2>
        <Link to="/cities" className="btn-primary">
          {t('back_to_cities')}
        </Link>
      </div>
    );
  }
  
  const mapLocations = places.map(place => ({
    latitude: place.location.latitude,
    longitude: place.location.longitude,
    name: place.name,
    description: place.info?.description ? 
      getLocalizedText(place.info.description, language, '').substring(0, 100) + '...' : '',
  }));
  
  const cityName = city ? getLocalizedText(city.name, language) : '';
  const cityDescription = city?.info?.description 
    ? getLocalizedText(city.info.description, language, t('no_description_available')) 
    : t('no_description_available');
  
  return (
    <div className="app-container py-6">
      <Link to="/cities" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft size={18} className="mr-2" />
        {t('back_to_cities')}
      </Link>
      
      <div className="relative mb-8">
        <img 
          src={city?.imageUrl} 
          alt={cityName}
          className="w-full h-64 object-cover rounded-xl"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl"></div>
        
        {/* City stats */}
        <div className="absolute top-4 right-4 flex gap-3">
          <Badge variant="secondary" className="bg-black/60 text-white flex items-center gap-1 px-3 py-1">
            <MapPin size={14} />
            <span>{city?.spots_count || 0}</span>
          </Badge>
          <Badge variant="secondary" className="bg-black/60 text-white flex items-center gap-1 px-3 py-1">
            <RouteIcon size={14} />
            <span>{city?.routes_count || 0}</span>
          </Badge>
          <Badge variant="secondary" className="bg-black/60 text-white flex items-center gap-1 px-3 py-1">
            <CalendarDays size={14} />
            <span>{city?.events_count || 0}</span>
          </Badge>
        </div>
        
        {/* Favorite button */}
        <Button 
          variant="ghost" 
          size="icon"
          className="absolute top-4 left-4 rounded-full bg-black/40 hover:bg-black/60 text-white"
          onClick={handleToggleFavorite}
        >
          <Heart size={20} className={isFavorite ? "fill-red-500 text-red-500" : ""} />
        </Button>
        
        <div className="absolute bottom-0 left-0 p-6">
          <h1 className="text-3xl font-bold text-white mb-2">{cityName}</h1>
          <div className="flex items-center text-white/90">
            <MapPin size={16} className="mr-1" />
            <span>{city?.country}</span>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">{t('about_city')}</h2>
        <p className="text-gray-700 leading-relaxed">
          {cityDescription}
        </p>
      </div>
      
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Map size={20} className="mr-2" />
          <h2 className="text-xl font-semibold">{t('explore_on_map')}</h2>
        </div>
        <CityMapView 
          locations={mapLocations} 
          mapboxToken="pk.eyJ1Ijoia29yeXRueSIsImEiOiJjazM2OWk0aWgwaXNlM29wbmFxYmcybDA1In0.3bQx9mdXq9p3PTkxb8soeQ" 
        />
      </div>
      
      <Tabs defaultValue="places" className="w-full">
        <TabsList className="w-full flex mb-6">
          <TabsTrigger value="places" className="flex-1 flex items-center justify-center gap-2">
            <MapPin size={16} />
            {t('sacred_places')} ({places.length})
          </TabsTrigger>
          <TabsTrigger value="routes" className="flex-1 flex items-center justify-center gap-2">
            <RouteIcon size={16} />
            {t('spiritual_routes')} ({routes.length})
          </TabsTrigger>
          <TabsTrigger value="events" className="flex-1 flex items-center justify-center gap-2">
            <CalendarDays size={16} />
            {t('holy_events')} ({events.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="places">
          {places.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600">{t('no_places_found')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {places.map(place => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="routes">
          {routes.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600">{t('no_routes_found')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {routes.map(route => (
                <RouteCard key={route.id} route={route} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="events">
          {events.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600">{t('no_events_found')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {events.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CityDetail;
