import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getRouteById, getPlacesByRouteId, getEventsByRouteId } from '../services/api'; // Path from src/pages
import { Route, Place, Event } from '../types'; // Path from src/pages
import { useLanguage } from '../context/LanguageContext'; // Path from src/pages
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Layout from '../components/Layout'; // Path from src/pages
import RouteHeader from '../components/route_detail/RouteHeader'; // Path from src/pages
import RouteAbout from '../components/route_detail/RouteAbout'; // Path from src/pages
import RouteMap from '../components/route_detail/RouteMap'; // Path from src/pages
import RelatedContentTabs from '../components/route_detail/RelatedContentTabs'; // Path from src/pages
import CommentsSection from '../components/CommentsSection'; // Path from src/pages

const RouteDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [route, setRoute] = useState<Route | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('places'); // Still needed for header badges
  const { t } = useLanguage();
  const navigate = useNavigate();

  const loadRouteData = async () => {
        if (!id) return;

    setLoading(true);
    try {
      const routeData = await getRouteById(id);
      setRoute(routeData);

      if (routeData) {
        const [placesData, eventsData] = await Promise.all([
           getPlacesByRouteId(id),
           getEventsByRouteId(id)
        ]);
        setPlaces(placesData);
        setEvents(eventsData);
      }
    } catch (error) {
      console.error('Failed to load route data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    loadRouteData();
  }, [id]);

  const scrollToTab = useCallback((tabValue: string, tabId: string) => {
      setActiveTab(tabValue);
    setTimeout(() => {
       document.getElementById(tabId)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  }, []);

  if (loading) {
       return (
      <Layout hideNavbar>
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

  if (!route) {
     return (
      <Layout>
        <div className="app-container py-10 text-center">
          <h2 className="text-xl font-semibold mb-4">{t('route_not_found')}</h2>
          <Link to="/" className="btn-primary">
            {t('back_to_home')}
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideNavbar={true}>
      <div className="app-container py-6">
         {/* Back Button */}
          <div className="flex justify-between items-center mb-6">
            <button 
            onClick={() => navigate(route.cityId ? `/cities/${route.cityId}` : '/')} 
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={18} className="mr-2" />
            {t('back_to_city')} 
          </button>
        </div>

        {/* Route Header & About (combined in a grid) */} 
        <div className="grid md:grid-cols-2 gap-8 mb-10">
            <RouteHeader 
                route={route} 
                places={places} 
                events={events} 
                id={id!} 
                onTabSelect={scrollToTab} 
             />
            <RouteAbout route={route} />
        </div>

                {/* Related Content Tabs - Added spacing */}
                <div className="mt-8 mb-8">
                  <RelatedContentTabs 
                    places={places} 
                    events={events} 
                    activeTab={activeTab} 
                    onTabChange={setActiveTab} 
                  />
                </div>

        {/* Route Map */} 
        <RouteMap places={places} />
        
        {/* Comments Section */} 
        {id && (
           <CommentsSection entityType="route" entityId={id} />
        )}
      </div>
    </Layout>
  );
};

export default RouteDetail;
