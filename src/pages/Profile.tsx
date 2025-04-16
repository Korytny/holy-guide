
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { signOut } from "../services/api";
import { useToast } from "@/hooks/use-toast";
import Layout from "../components/Layout";
import { useLanguage } from "../context/LanguageContext";
import { City, Place, Route, Event } from '../types';
import {
  getCitiesByIds,
  getRoutesByIds,
  getEventsByIds,
  fetchPlaceData // For places
} from '../services/api';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import CityCard from '../components/CityCard';
import PlaceCard from '../components/PlaceCard';
import RouteCard from '../components/RouteCard';
import EventCard from '../components/EventCard';
import { Separator } from "@/components/ui/separator";

// Helper component for rendering carousels
interface FavoritesCarouselProps<T> {
  title: string;
  items: T[];
  renderCard: (item: T) => React.ReactNode;
  isLoading: boolean;
  itemType: string;
}

const FavoritesCarousel = <T extends { id: string }>({ 
    title, items, renderCard, isLoading, itemType
}: FavoritesCarouselProps<T>) => {
  const { t } = useLanguage();
  
  if (isLoading) {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>
        <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>)}
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
       <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>
        <p className="text-gray-500 italic">{t('no_favorites_yet', { type: itemType })}</p>
      </div>
    );
  }

  return (
    <div className="mb-10">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>
      <Carousel
        opts={{
          align: "start",
          loop: items.length > 3, // Loop only if enough items
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {items.map((item) => (
            <CarouselItem key={item.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
              <div className="p-1 h-full">
                {renderCard(item)}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {items.length > 1 && <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 z-10" />} 
        {items.length > 1 && <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 z-10" />}
      </Carousel>
    </div>
  );
};


const Profile = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [favoriteCities, setFavoriteCities] = useState<City[]>([]);
  const [favoritePlaces, setFavoritePlaces] = useState<Place[]>([]);
  const [favoriteRoutes, setFavoriteRoutes] = useState<Route[]>([]);
  const [favoriteEvents, setFavoriteEvents] = useState<Event[]>([]);
  
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      navigate('/auth');
    }
  }, [auth.isAuthenticated, auth.isLoading, navigate]);

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

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({ title: t("signed_out_title"), description: t("signed_out_success_desc") });
      navigate('/auth');
    } catch (error) {
      console.error("Error signing out:", error);
      toast({ title: t("error_title"), description: t("signout_failed_desc"), variant: "destructive" });
    }
  };

  if (auth.isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-center">
            <h1 className="text-2xl font-semibold mb-4">{t('loading')}</h1>
            <p className="text-gray-500">{t('please_wait')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!auth.user) {
    return null; // Should be redirected by the effect above
  }

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map((part) => part[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-purple-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */} 
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-10">
            <div className="p-8 text-center border-b border-gray-100">
              <h1 className="text-3xl font-bold text-gray-900">{t('your_profile')}</h1>
            </div>
            <div className="p-8 flex flex-col items-center">
              <Avatar className="h-32 w-32 mb-4">
                <AvatarImage src={auth.user.avatarUrl || undefined} alt={auth.user.fullName || "User"} />
                <AvatarFallback className="text-3xl">{getInitials(auth.user.fullName)}</AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-semibold mb-1">
                {auth.user.fullName || t('welcome')}
              </h2>
              <div className="mt-8 w-full flex justify-center">
                <Button onClick={handleSignOut} variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700">
                  {t('sign_out')}
                </Button>
              </div>
            </div>
          </div>

          {/* Favorites Section */} 
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
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
          
          <div className="mt-8 text-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              {t('back_to_cities')} 
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
