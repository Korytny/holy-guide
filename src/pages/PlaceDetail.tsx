
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPlaceById, getRoutesByPlaceId, getEventsByPlaceId } from '../services/api';
import { Place, Route, Event } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RouteCard from '../components/RouteCard';
import EventCard from '../components/EventCard';
import MapView from '../components/MapView';
import { ArrowLeft, MapPin } from 'lucide-react';
import { getLocalizedText } from '../utils/languageUtils';

const PlaceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [place, setPlace] = useState<Place | null>(null);
  const [relatedRoutes, setRelatedRoutes] = useState<Route[]>([]);
  const [relatedEvents, setRelatedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { language, t } = useLanguage();
  
  useEffect(() => {
    const loadPlaceData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Load the place details
        const placeData = await getPlaceById(id);
        setPlace(placeData);
        
        // Load related routes
        const routesData = await getRoutesByPlaceId(id);
        setRelatedRoutes(routesData);
        
        // Load related events
        const eventsData = await getEventsByPlaceId(id);
        setRelatedEvents(eventsData);
      } catch (error) {
        console.error('Failed to load place data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadPlaceData();
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
          
          <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
          
          <div className="h-10 w-full bg-gray-200 rounded-lg mb-4"></div>
        </div>
      </div>
    );
  }
  
  if (!place) {
    return (
      <div className="app-container py-10 text-center">
        <h2 className="text-xl font-semibold mb-4">{t('place_not_found')}</h2>
        <Link to="/cities" className="btn-primary">
          {t('back_to_cities')}
        </Link>
      </div>
    );
  }
  
  const placeName = place ? getLocalizedText(place.name, language) : '';
  const placeDescription = place ? getLocalizedText(place.description, language) : '';
  
  return (
    <div className="app-container py-6">
      <Link to={`/cities/${place?.cityId}`} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft size={18} className="mr-2" />
        {t('back_to_city')}
      </Link>
      
      <div className="relative mb-8">
        <img 
          src={place?.imageUrl} 
          alt={placeName}
          className="w-full h-64 object-cover rounded-xl"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl"></div>
        <div className="absolute bottom-0 left-0 p-6">
          <h1 className="text-3xl font-bold text-white mb-2">{placeName}</h1>
          <div className="flex items-center text-white/90">
            <MapPin size={16} className="mr-1" />
            <span>{t('sacred_place')}</span>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">{t('about_place')}</h2>
        <p className="text-gray-700 leading-relaxed">{placeDescription}</p>
      </div>
      
      {place && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6">{t('location_on_map')}</h2>
          <MapView 
            locations={[{
              latitude: place.location.latitude,
              longitude: place.location.longitude,
              name: place.name,
              description: placeDescription.substring(0, 100)
            }]}
            center={[place.location.longitude, place.location.latitude]}
            zoom={14}
          />
        </div>
      )}
      
      <Tabs defaultValue="routes" className="w-full">
        <TabsList className="w-full flex mb-6">
          <TabsTrigger value="routes" className="flex-1">{t('related_routes')} ({relatedRoutes.length})</TabsTrigger>
          <TabsTrigger value="events" className="flex-1">{t('related_events')} ({relatedEvents.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="routes">
          {relatedRoutes.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600">{t('no_routes_found')}</p>
            </div>
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
            <div className="text-center py-10">
              <p className="text-gray-600">{t('no_events_found')}</p>
            </div>
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
  );
};

export default PlaceDetail;
