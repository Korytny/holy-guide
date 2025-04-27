import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout'; // Corrected path
import { getCityById } from '../services/citiesApi'; // Corrected path
import { getRoutesByCityId } from '../services/routesApi'; // Corrected path
import { getEventsByCityId } from '../services/eventsApi'; // Corrected path
import { getPlacesByCityId } from '../services/placesApi'; // Corrected path
import { City, Place, Route, Event } from '../types'; // Corrected path
import { useLanguage } from '../context/LanguageContext'; // Corrected path
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { getLocalizedText } from '../utils/languageUtils'; // Corrected path
import CommentsSection from '../components/CommentsSection'; // Corrected path
import CityHeader from '../components/city_detail/CityHeader'; // Import new component
import CityAbout from '../components/city_detail/CityAbout'; // Import new component
import CityMapSection from '../components/city_detail/CityMapSection'; // Import new component
import CityTabsContent from '../components/city_detail/CityTabsContent'; // Import new component

const CityDetail: React.FC = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const [city, setCity] = useState<City | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [originalPlaces, setOriginalPlaces] = useState<Place[]>([]); // Keep for search
  const [routes, setRoutes] = useState<Route[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('places');
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const loadCityData = async () => {
        if (!id) return;

      setLoading(true);
      try {
        const [cityData, placesData, routesData, eventsData] = await Promise.all([
          getCityById(id),
          getPlacesByCityId(id),
          getRoutesByCityId(id),
          getEventsByCityId(id),
        ]);

        setCity(cityData);
        setPlaces(placesData);
        setOriginalPlaces(placesData);
        setRoutes(routesData);
        setEvents(eventsData);

      } catch (error) {
        console.error('Failed to load city data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCityData();
  }, [id, language]);


  const handleSearchPlaces = (term: string) => {
      if (!term) {
      setPlaces(originalPlaces);
      return;
    }

    const lowerTerm = term.toLowerCase();
    const results = originalPlaces.filter(place => {
      const nameMatch = getLocalizedText(place.name, language).toLowerCase().includes(lowerTerm);
      const descMatch = getLocalizedText(place.description, language).toLowerCase().includes(lowerTerm);
      return nameMatch || descMatch;
    });
    setPlaces(results);
  };

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

  if (!city) {
    // Not found remains the same
     return (
      <Layout>
        <div className="app-container py-10 text-center">
          <h2 className="text-xl font-semibold mb-4">{t('city_not_found')}</h2>
          <Link to="/" className="btn-primary">
            {t('back_to_home')}
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="app-container py-6">
        {/* Back Button */}
        <div className="flex justify-between items-center mb-6">
            <button 
              onClick={() => navigate('/')} 
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={18} className="mr-2" />
              {t('back_to_cities')} 
            </button>
        </div>

        {/* Grid for Header and About */}
        <div className="grid md:grid-cols-2 gap-8 mb-10">
            <CityHeader 
                city={city} 
                places={places} 
                routes={routes} 
                events={events} 
                id={id!} 
                onTabSelect={scrollToTab} 
            />
            <CityAbout city={city} />
        </div>

        {/* Map Section */}
        <CityMapSection places={places} />
        
        {/* Tabs Section */}
        <CityTabsContent 
            places={places} 
            routes={routes} 
            events={events} 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            onSearch={handleSearchPlaces}
        />

        {/* Comments Section */} 
        {city && id && (
          <CommentsSection entityType="city" entityId={id} />
        )}

      </div>
    </Layout>
  );
};

export default CityDetail;