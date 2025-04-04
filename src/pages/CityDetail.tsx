
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  getCityById, 
  getPlacesByCityId, 
  getRoutesByCityId, 
  getEventsByCityId 
} from '../services/api';
import { City, Place, Route, Event } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlaceCard from '../components/PlaceCard';
import RouteCard from '../components/RouteCard';
import EventCard from '../components/EventCard';
import MapView from '../components/MapView';
import { ArrowLeft, MapPin } from 'lucide-react';

const CityDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [city, setCity] = useState<City | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  
  useEffect(() => {
    const loadCityData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const cityData = await getCityById(id);
        setCity(cityData);
        
        // Load related data
        const placesData = await getPlacesByCityId(id);
        setPlaces(placesData);
        
        const routesData = await getRoutesByCityId(id);
        setRoutes(routesData);
        
        const eventsData = await getEventsByCityId(id);
        setEvents(eventsData);
      } catch (error) {
        console.error('Failed to load city data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCityData();
  }, [id]);
  
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
    description: place.description.substring(0, 100) + '...',
  }));
  
  return (
    <div className="app-container py-6">
      <Link to="/cities" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft size={18} className="mr-2" />
        {t('back_to_cities')}
      </Link>
      
      <div className="relative mb-8">
        <img 
          src={city.imageUrl} 
          alt={city.name}
          className="w-full h-64 object-cover rounded-xl"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl"></div>
        <div className="absolute bottom-0 left-0 p-6">
          <h1 className="text-3xl font-bold text-white mb-2">{city.name}</h1>
          <div className="flex items-center text-white/90">
            <MapPin size={16} className="mr-1" />
            <span>{city.country}</span>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">{t('about_city')}</h2>
        <p className="text-gray-700 leading-relaxed">{city.description}</p>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-6">{t('explore_on_map')}</h2>
        <MapView locations={mapLocations} />
      </div>
      
      <Tabs defaultValue="places" className="w-full">
        <TabsList className="w-full flex mb-6">
          <TabsTrigger value="places" className="flex-1">{t('sacred_places')} ({places.length})</TabsTrigger>
          <TabsTrigger value="routes" className="flex-1">{t('spiritual_routes')} ({routes.length})</TabsTrigger>
          <TabsTrigger value="events" className="flex-1">{t('holy_events')} ({events.length})</TabsTrigger>
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
