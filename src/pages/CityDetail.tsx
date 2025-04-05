import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import {
  getCityById
} from '../services/citiesApi';
import {
  getRoutesByCityId
} from '../services/routesApi';
import {
  getEventsByCityId
} from '../services/eventsApi';
import {
  getPlacesByCityId
} from '../services/placesApi';
import {
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
import SearchBar from '../components/SearchBar';
import { getLocalizedText } from '../utils/languageUtils';

interface MapLocation {
  latitude: number;
  longitude: number;
  name: string;
  description: string;
}

const CityDetail: React.FC = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const [city, setCity] = useState<City | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [originalPlaces, setOriginalPlaces] = useState<Place[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
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
        
        const placesData = await getPlacesByCityId(id);
        setPlaces(placesData);
        setOriginalPlaces(placesData);
        
        const routesData = await getRoutesByCityId(id);
        setRoutes(routesData);
        
        const eventsData = await getEventsByCityId(id);
        setEvents(eventsData);

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
  }, [id, auth.isAuthenticated, language]);

  const handleToggleFavorite = async () => {
    if (!id) return;
    
    try {
      if (isFavorite) {
        await removeCityFromFavorites(id);
        setIsFavorite(false);
        toast({
          title: t('removed_from_favorites'),
          variant: 'default',
        });
      } else {
        await addCityToFavorites(id);
        setIsFavorite(true);
        toast({
          title: t('added_to_favorites'),
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      toast({
        title: t('error_occurred'),
        variant: 'destructive',
      });
    }
  };

  const handleSearchPlaces = (term: string) => {
    if (!term) {
      setPlaces(originalPlaces);
      return;
    }

    const lowerTerm = term.toLowerCase();
    const results = originalPlaces.filter(place => {
      const nameMatch = typeof place.name === 'string' 
        ? place.name.toLowerCase().includes(lowerTerm)
        : Object.values(place.name).some(name => 
            name?.toLowerCase().includes(lowerTerm)
          );
      const descMatch = typeof place.description === 'string'
        ? place.description.toLowerCase().includes(lowerTerm)
        : place.description && Object.values(place.description).some(desc =>
            desc?.toLowerCase().includes(lowerTerm)
          );
      return nameMatch || descMatch;
    });
    setPlaces(results);
  };

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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!city) {
    return (
      <Layout>
        <div className="app-container py-10 text-center">
          <h2 className="text-xl font-semibold mb-4">{t('city_not_found')}</h2>
          <Link to="/cities" className="btn-primary">
            {t('back_to_cities')}
          </Link>
        </div>
      </Layout>
    );
  }
  
  const mapLocations: MapLocation[] = places.map(place => ({
    latitude: place.location.latitude,
    longitude: place.location.longitude,
    name: getLocalizedText(place.name, language),
    description: place.info?.description ? 
      getLocalizedText(place.info.description, language, '').substring(0, 100) + '...' : '',
  }));
  
  const cityName = getLocalizedText(city.name, language) || city.name.en;
  const infoFields = city.info
    ? Object.entries(city.info)
        .filter(([key]) => key === language || !['en', 'ru', 'hi'].includes(key))
        .map(([key, value]) => {
          const displayKey = ['en', 'ru', 'hi'].includes(key) ? '' : key;
          const textValue = typeof value === 'object'
            ? getLocalizedText(value, language)
            : String(value);
          return { key: displayKey, value: textValue };
        })
    : [];
  
  return (
    <Layout>
      <div className="app-container py-6">
        <Link to="/cities" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft size={18} className="mr-2" />
          {t('back_to_cities')}
        </Link>
        
        <div className="relative mb-8">
          <img 
            src={city.imageUrl} 
            alt={cityName}
            className="w-full h-64 object-cover rounded-xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl"></div>
          
          <div className="absolute top-4 right-4 flex gap-3">
            <Badge variant="secondary" className="bg-black/60 text-white flex items-center gap-1 px-3 py-1">
              <MapPin size={14} />
              <span>{city.spotsCount || 0}</span>
            </Badge>
            <Badge variant="secondary" className="bg-black/60 text-white flex items-center gap-1 px-3 py-1">
              <RouteIcon size={14} />
              <span>{city.routesCount || 0}</span>
            </Badge>
            <Badge variant="secondary" className="bg-black/60 text-white flex items-center gap-1 px-3 py-1">
              <CalendarDays size={14} />
              <span>{city.eventsCount || 0}</span>
            </Badge>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="absolute top-4 left-4 rounded-full bg-black/40 hover:bg-black/60 text-white"
            onClick={handleToggleFavorite}
          >
            <Heart size={20} className={isFavorite ? "fill-red-500 text-red-500" : ""} />
          </Button>
          
          <div className="absolute bottom-0 left-0 p-6">
            <h1 className="text-3xl font-bold text-white mb-2">{getLocalizedText(city.name, language)}</h1>
            <div className="flex items-center text-white/90">
              <MapPin size={16} className="mr-1" />
              <span>{city.country}</span>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">{t('about_city')}</h2>
          <div className="space-y-3">
            {infoFields.length > 0 ? (
              infoFields.map((field, i) => (
                <div key={i} className="text-gray-700">
                  {field.key && <span className="font-medium">{field.key}: </span>}
                  {field.value}
                </div>
              ))
            ) : (
              <p className="text-gray-500">{t('no_description_available')}</p>
            )}
          </div>
        </div>
        
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Map size={20} className="mr-2" />
            <h2 className="text-xl font-semibold">{t('explore_on_map')}</h2>
          </div>
          <CityMapView
            locations={mapLocations}
            maintainZoom={true}
            key={mapLocations.length}
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
            <div className="mb-6">
              <SearchBar 
                placeholder={t('search_places_placeholder')} 
                onSearch={handleSearchPlaces}
              />
            </div>
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
    </Layout>
  );
};

export default CityDetail;
