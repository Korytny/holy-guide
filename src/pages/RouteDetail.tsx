
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRouteById, getPlacesByRouteId, getEventsByRouteId } from '../services/api';
import { Route, Place, Event } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlaceCard from '../components/PlaceCard';
import EventCard from '../components/EventCard';
import MapView from '../components/MapView';
import { ArrowLeft } from 'lucide-react';
import { getLocalizedText } from '../utils/languageUtils';
import Layout from '../components/Layout';

const RouteDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [route, setRoute] = useState<Route | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { language, t } = useLanguage();
  
  const loadRouteData = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const routeData = await getRouteById(id);
      setRoute(routeData);
      
      const placesData = await getPlacesByRouteId(id);
      setPlaces(placesData);
      
      const eventsData = await getEventsByRouteId(id);
      setEvents(eventsData);
    } catch (error) {
      console.error('Failed to load route data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadRouteData();
  }, [id]);
  
  if (loading) {
    return (
      <Layout>
        <div className="app-container py-10">
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-gray-300 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
            <div className="h-6 w-40 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded mb-6"></div>
            
            <div className="h-10 w-full bg-gray-200 rounded-lg mb-4"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!route) {
    return (
      <Layout>
        <div className="app-container py-10 text-center">
          <h2 className="text-xl font-semibold mb-4">{t('route_not_found')}</h2>
          <Link to="/cities" className="btn-primary">
            {t('back_to_cities')}
          </Link>
        </div>
      </Layout>
    );
  }
  
  const mapLocations = places.map(place => ({
    id: place.id,
    latitude: place.location.latitude,
    longitude: place.location.longitude,
    name: place.name,
    description: place.description,
    imageUrl: place.imageUrl,
    type: place.type
  }));
  
  const routeName = getLocalizedText(route.name, language);
  const routeDescription = route.description ? getLocalizedText(route.description, language) : '';
  
  return (
    <Layout>
      <div className="app-container py-6">
        <Link to={`/cities/${route.cityId}`} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft size={18} className="mr-2" />
          {t('back_to_city')}
        </Link>
        
        <div className="relative mb-8">
          <img 
            src={route.imageUrl} 
            alt={routeName}
            className="w-full h-64 object-cover rounded-xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl"></div>
          <div className="absolute bottom-0 left-0 p-6">
            <h1 className="text-3xl font-bold text-white mb-2">{routeName}</h1>
            <div className="flex items-center text-white/90">
              <span className="text-sm">{t('spiritual_route')}</span>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">{t('about_route')}</h2>
          {route.info ? (
            <div className="space-y-2">
              {Object.entries(route.info)
                .filter(([key]) => key === language || !['en', 'ru', 'hi'].includes(key))
                .map(([key, value], i) => (
                  <div key={i} className="text-gray-700 leading-relaxed">
                    {['en', 'ru', 'hi'].includes(key) ? '' : `${key}: `}
                    {typeof value === 'object' ? getLocalizedText(value, language) : String(value)}
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-700 leading-relaxed">{routeDescription}</p>
          )}
        </div>
        
        {places.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-6">{t('route_on_map_title')}</h2>
            <MapView locations={mapLocations} />
          </div>
        )}
        
        <Tabs defaultValue="places" className="w-full">
          <TabsList className="w-full flex mb-6">
            <TabsTrigger value="places" className="flex-1">{t('places_on_route')} ({places.length})</TabsTrigger>
            <TabsTrigger value="events" className="flex-1">{t('related_events')} ({events.length})</TabsTrigger>
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
    </Layout>
  );
};

export default RouteDetail;
