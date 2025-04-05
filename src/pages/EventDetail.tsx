import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEventById, getPlacesByEventId, getRoutesByEventId } from '../services/api';
import { Event, Place, Route } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlaceCard from '../components/PlaceCard';
import RouteCard from '../components/RouteCard';
import MapView from '../components/MapView';
import { ArrowLeft, Calendar } from 'lucide-react';
import { getLocalizedText } from '../utils/languageUtils';
import Layout from '../components/Layout';

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const { language, t } = useLanguage();
  
  const loadEventData = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const eventData = await getEventById(id);
      setEvent(eventData);
      
      const placesData = await getPlacesByEventId(id);
      setPlaces(placesData);
      
      const routesData = await getRoutesByEventId(id);
      setRoutes(routesData);
    } catch (error) {
      console.error('Failed to load event data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadEventData();
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
  
  if (!event) {
    return (
      <Layout>
        <div className="app-container py-10 text-center">
          <h2 className="text-xl font-semibold mb-4">{t('event_not_found')}</h2>
          <Link to="/cities" className="btn-primary">
            {t('back_to_cities')}
          </Link>
        </div>
      </Layout>
    );
  }
  
  const mapLocations = places.map(place => ({
    latitude: place.location.latitude,
    longitude: place.location.longitude,
    name: getLocalizedText(place.name, language),
  }));
  
  const eventName = getLocalizedText(event.name, language);
  const eventDescription = [
    event.description ? getLocalizedText(event.description, language) : '',
    event.info ? getLocalizedText(event.info, language) : ''
  ].filter(text => text.trim()).join('\n\n');
  
  return (
    <Layout>
      <div className="app-container py-6">
        <Link to={`/cities/${event.cityId}`} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft size={18} className="mr-2" />
          {t('back_to_city')}
        </Link>
        
        <div className="relative mb-8">
          <img 
            src={event.imageUrl} 
            alt={eventName}
            className="w-full h-64 object-cover rounded-xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl"></div>
          <div className="absolute bottom-0 left-0 p-6">
            <h1 className="text-3xl font-bold text-white mb-2">{eventName}</h1>
            {event.date && (
              <div className="flex items-center text-white/90 bg-black/30 px-3 py-1 rounded-full inline-flex">
                <Calendar size={16} className="mr-2" />
                <span>{new Date(event.date).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="mb-10 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">{t('about_event')}</h2>
          {eventDescription ? (
            <div className="prose max-w-none text-gray-700">
              {eventDescription.split('\n').map((paragraph, i) => (
                <p key={i} className="mb-4 last:mb-0">{paragraph}</p>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">{t('no_description_available')}</p>
          )}
        </div>
        
        {places.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-6">{t('event_locations')}</h2>
            <MapView locations={mapLocations} />
          </div>
        )}
        
        <Tabs defaultValue="places" className="w-full">
          <TabsList className="w-full flex mb-6">
            <TabsTrigger value="places" className="flex-1">{t('related_places')} ({places.length})</TabsTrigger>
            <TabsTrigger value="routes" className="flex-1">{t('related_routes')} ({routes.length})</TabsTrigger>
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
        </Tabs>
      </div>
    </Layout>
  );
};

export default EventDetail;
