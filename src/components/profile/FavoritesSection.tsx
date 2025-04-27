import React, { useState, useEffect } from 'react';
import { City, Place, Route, Event } from '../../types'; // Updated path
import {
  getCitiesByIds,
  getRoutesByIds,
  getEventsByIds,
  fetchPlaceData // For places
} from '../../services/api'; // Updated path
import FavoritesCarousel from './FavoritesCarousel';
import CityCard from '../CityCard'; // Updated path
import PlaceCard from '../PlaceCard'; // Updated path
import RouteCard from '../RouteCard'; // Updated path
import EventCard from '../EventCard'; // Updated path
import { Separator } from "@/components/ui/separator";
import { useAuth } from '../../context/AuthContext'; // Updated path
import { useLanguage } from '../../context/LanguageContext'; // Updated path

const FavoritesSection = () => {
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

    // Fetch favorites when user data is available
    useEffect(() => {
      if (auth.user) {
        const fetchFavs = async () => {
          // Fetch Cities
          if (auth.user?.cities_like && auth.user.cities_like.length > 0) {
            setLoadingCities(true);
            try {
              const cities = await getCitiesByIds(auth.user.cities_like);
              setFavoriteCities(cities);
            } catch (e) { console.error("Failed to load favorite cities", e); }
             finally { setLoadingCities(false); }
          }
          
          // Fetch Places
          if (auth.user?.places_like && auth.user.places_like.length > 0) {
            setLoadingPlaces(true);
             try {
              const places = await fetchPlaceData(auth.user.places_like);
              setFavoritePlaces(places);
            } catch (e) { console.error("Failed to load favorite places", e); }
             finally { setLoadingPlaces(false); }
          }

          // Fetch Routes
          if (auth.user?.routes_like && auth.user.routes_like.length > 0) {
             setLoadingRoutes(true);
             try {
              const routes = await getRoutesByIds(auth.user.routes_like);
              setFavoriteRoutes(routes);
            } catch (e) { console.error("Failed to load favorite routes", e); }
             finally { setLoadingRoutes(false); }
          }

          // Fetch Events
          if (auth.user?.events_like && auth.user.events_like.length > 0) {
            setLoadingEvents(true);
            try {
              const events = await getEventsByIds(auth.user.events_like);
              setFavoriteEvents(events);
            } catch (e) { console.error("Failed to load favorite events", e); }
            finally { setLoadingEvents(false); }
          }
        };
        fetchFavs();
      }
    }, [auth.user]); // Re-run when user object changes (e.g., after login or profile refresh)

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
