import React, { useState, useEffect } from 'react';
import { City, Place, Route, Event } from '../../types';
import {
  getCitiesByIds,
  getRoutesByIds,
  getEventsByIds,
  fetchPlaceData
} from '../../services/api';
import FavoritesCarousel from './FavoritesCarousel';
import CityCard from '../CityCard';
import PlaceCard from '../PlaceCard';
import RouteCard from '../RouteCard';
import EventCard from '../EventCard';
import { Separator } from "@/components/ui/separator";
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface FavoritesSectionProps {
  onFavoriteCountsLoaded?: (counts: { citiesCount: number; placesCount: number; routesCount: number; eventsCount: number }) => void;
}

const FavoritesSection: React.FC<FavoritesSectionProps> = ({ onFavoriteCountsLoaded }) => {
    const { auth } = useAuth();
    const { t } = useLanguage();

    const [favoriteCities, setFavoriteCities] = useState<City[]>([]);
    const [favoritePlaces, setFavoritePlaces] = useState<Place[]>([]);
    const [favoriteRoutes, setFavoriteRoutes] = useState<Route[]>([]);
    const [favoriteEvents, setFavoriteEvents] = useState<Event[]>([]);
    
    const [loadingCities, setLoadingCities] = useState(false);
    const [loadingPlaces, setLoadingPlaces] = useState(false);
    const [loadingRoutes, setLoadingRoutes] = useState(false);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [isLoadingAny, setIsLoadingAny] = useState(true); // To track if any loading is in progress

    // Fetch favorites when user data is available
    useEffect(() => {
      if (auth.user) {
        const fetchFavs = async () => {
          let cities: City[] = [];
          let places: Place[] = [];
          let routes: Route[] = [];
          let events: Event[] = [];

          // Fetch Cities
          if (auth.user?.cities_like && auth.user.cities_like.length > 0) {
            setLoadingCities(true);
            try {
              cities = await getCitiesByIds(auth.user.cities_like);
              setFavoriteCities(cities);
            } catch (e) { console.error("Failed to load favorite cities", e); }
             finally { setLoadingCities(false); }
          }
          
          // Fetch Places
          if (auth.user?.places_like && auth.user.places_like.length > 0) {
            setLoadingPlaces(true);
             try {
              places = await fetchPlaceData(auth.user.places_like);
              setFavoritePlaces(places);
            } catch (e) { console.error("Failed to load favorite places", e); }
             finally { setLoadingPlaces(false); }
          }

          // Fetch Routes
          if (auth.user?.routes_like && auth.user.routes_like.length > 0) {
             setLoadingRoutes(true);
             try {
              routes = await getRoutesByIds(auth.user.routes_like);
              setFavoriteRoutes(routes);
            } catch (e) { console.error("Failed to load favorite routes", e); }
             finally { setLoadingRoutes(false); }
          }

          // Fetch Events
          if (auth.user?.events_like && auth.user.events_like.length > 0) {
            setLoadingEvents(true);
            try {
              events = await getEventsByIds(auth.user.events_like);
              setFavoriteEvents(events);
            } catch (e) { console.error("Failed to load favorite events", e); }
            finally { setLoadingEvents(false); }
          }

          // Call the callback with counts after all fetches are attempted
          if (onFavoriteCountsLoaded) {
              onFavoriteCountsLoaded({
                  citiesCount: cities.length,
                  placesCount: places.length,
                  routesCount: routes.length,
                  eventsCount: events.length,
              });
          }
           setIsLoadingAny(false); // All fetches attempted
        };
        fetchFavs();
      } else {
         // If user is not available (e.g., signed out), reset counts to 0
         if (onFavoriteCountsLoaded) {
            onFavoriteCountsLoaded({
                citiesCount: 0,
                placesCount: 0,
                routesCount: 0,
                eventsCount: 0,
            });
         }
          setIsLoadingAny(false);
      }
    }, [auth.user, onFavoriteCountsLoaded]); // Add onFavoriteCountsLoaded to dependencies

     // Optional: effect to update counts if state changes later (e.g., user unfavorites something)
     useEffect(() => {
         if (!isLoadingAny && onFavoriteCountsLoaded) { // Only update if initial loading is done
             onFavoriteCountsLoaded({
                 citiesCount: favoriteCities.length,
                 placesCount: favoritePlaces.length,
                 routesCount: favoriteRoutes.length,
                 eventsCount: favoriteEvents.length,
             });
         }
     }, [favoriteCities, favoritePlaces, favoriteRoutes, favoriteEvents, isLoadingAny, onFavoriteCountsLoaded]);

    return (
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-10">
            <h2 className="text-2xl font-semibold mb-6 pb-4 border-b text-center text-gray-900">{t('my_favorites')}</h2>
            
            {/* Favorite Cities Carousel */}
            <FavoritesCarousel
              title={t('favorite_cities')}
              items={favoriteCities}
              isLoading={loadingCities}
              itemType={t('cities')}
              renderCard={(city) => <CityCard city={city} className="h-full" />} 
            />
            
            <Separator className="my-8" />

            {/* Favorite Places Carousel */}
            <FavoritesCarousel
              title={t('favorite_places')}
              items={favoritePlaces}
              isLoading={loadingPlaces}
               itemType={t('places')}
              renderCard={(place) => <PlaceCard place={place} className="h-full" />}
            />
            
            <Separator className="my-8" />
            
            {/* Favorite Routes Carousel */}
            <FavoritesCarousel
              title={t('favorite_routes')}
              items={favoriteRoutes}
              isLoading={loadingRoutes}
              itemType={t('routes')}
              renderCard={(route) => <RouteCard route={route} className="h-full" />} 
            />
            
            <Separator className="my-8" />
            
            {/* Favorite Events Carousel */}
            <FavoritesCarousel
              title={t('favorite_events')}
              items={favoriteEvents}
              isLoading={loadingEvents}
              itemType={t('events')}
              renderCard={(event) => <EventCard event={event} className="h-full" />} 
            />
            
        </div>
    );
}

export default FavoritesSection;
