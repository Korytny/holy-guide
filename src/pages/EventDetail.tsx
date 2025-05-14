import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getEventById, getPlacesByEventId, getRoutesByEventId } from '../services/api'; // Path from src/pages
import { Event, Place, Route } from '../types'; // Path from src/pages
import { useLanguage } from '../context/LanguageContext'; // Path from src/pages
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Layout from '../components/Layout'; // Path from src/pages
import EventHeader from '../components/event_detail/EventHeader'; // Import new component
import EventAbout from '../components/event_detail/EventAbout'; // Import new component
import EventMapSection from '../components/event_detail/EventMapSection'; // Import new component
import EventRelatedContent from '../components/event_detail/EventRelatedContent'; // Import new component
import CommentsSection from '../components/CommentsSection'; // Import CommentsSection

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [relatedPlaces, setRelatedPlaces] = useState<Place[]>([]);
  const [relatedRoutes, setRelatedRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('places'); // Default for related content
  const { t } = useLanguage();
  const navigate = useNavigate();

  const loadEventData = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const eventData = await getEventById(id);
      setEvent(eventData);

      if (eventData) {
        const [placesData, routesData] = await Promise.all([
           getPlacesByEventId(id),
           getRoutesByEventId(id)
        ]);
        setRelatedPlaces(placesData);
        setRelatedRoutes(routesData);
      }
    } catch (error) {
      console.error('Failed to load event data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEventData();
  }, [id]);

   const scrollToTab = useCallback((tabValue: string, tabId: string) => {
      setActiveTab(tabValue);
    setTimeout(() => {
       document.getElementById(tabId)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
  }, []);


  if (loading) {
    // Loading skeleton remains the same
       return (
      <Layout>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2].map(i => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!event) {
    // Not found remains the same
     return (
      <Layout>
        <div className="app-container py-10 text-center">
          <h2 className="text-xl font-semibold mb-4">{t('event_not_found')}</h2>
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
            onClick={() => navigate(event.cityId ? `/cities/${event.cityId}` : '/')} 
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={18} className="mr-2" />
            {t('back_to_city')} 
          </button>
        </div>

         {/* Grid for Header and About */}
        <div className="grid md:grid-cols-2 gap-8 mb-10">
            <EventHeader 
                event={event} 
                places={relatedPlaces} 
                routes={relatedRoutes} 
                id={id!} 
                onTabSelect={scrollToTab} 
            />
            <EventAbout event={event} />
        </div>

        {/* Map Section */}
        <EventMapSection places={relatedPlaces} />
        
        {/* Related Content Tabs */}
        <EventRelatedContent 
            relatedPlaces={relatedPlaces} 
            relatedRoutes={relatedRoutes} 
        />

        {/* Comments Section */}
        {id && (
           <CommentsSection entityType="event" entityId={id} />
        )}
      </div>
    </Layout>
  );
};

export default EventDetail;
