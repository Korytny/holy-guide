// console.log('CityDetail: Module file is being processed'); // Removed log

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getCityById } from '../services/citiesApi';
import { getRoutesByCityId } from '../services/routesApi';
import { getEventsByCityId } from '../services/eventsApi';
import { getPlacesByCityId } from '../services/placesApi';
import { City, Place, Route, Event } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useFont } from '../context/FontContext';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { getLocalizedText } from '../utils/languageUtils';
import CommentsSection from '../components/CommentsSection';
import CityHeader from '../components/city_detail/CityHeader';
import CityAbout from '../components/city_detail/CityAbout';
import CityMapSection from '../components/city_detail/CityMapSection';
import CityTabsContent from '../components/city_detail/CityTabsContent';
import AudioPlayer from '../components/AudioPlayer';

const CityDetail: React.FC = (): JSX.Element => {
  // console.log('CityDetail: Component function started'); // Removed log

  const { id } = useParams<{ id: string }>();
  const [city, setCity] = useState<City | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [originalPlaces, setOriginalPlaces] = useState<Place[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('places');
  const { language, t } = useLanguage();
  const { fonts } = useFont();
  const navigate = useNavigate();

  // console.log('CityDetail: Hooks initialized', { id, loading, city: !!city, language }); // Removed log

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadCityData = async () => {
        if (!id) {
            // console.log('CityDetail: ID is missing, stopping load.'); // Removed log
             setLoading(false);
             return;
        }

      // console.log('CityDetail: Starting data load for city ID:', id); // Removed log
      setLoading(true);
      try {
        const [cityData, placesData, routesData, eventsData] = await Promise.all([
          getCityById(id).then(city => {
            // Deep clean name from any UID formats
            const localizedName = getLocalizedText(city.name, language);
            if (typeof localizedName === 'string') {
              const cleanName = localizedName
                .replace(new RegExp(id, 'gi'), '')
                .replace(/\[[^\]]+\]/g, '')
                .replace(/\([^)]+\)/g, '')
                .replace(/\s{2,}/g, ' ')
                .trim();
              city.name = { ...city.name, [language]: cleanName };
            }
            return city;
          }),
          getPlacesByCityId(id),
          getRoutesByCityId(id),
          getEventsByCityId(id),
        ]);

        // console.log('CityDetail: Data loaded successfully', { cityLoaded: !!cityData, placesCount: placesData.length, routesCount: routesData.length, eventsCount: eventsData.length }); // Removed log

        console.log('Processed city data:', {
          id: cityData.id,
          name: getLocalizedText(cityData.name, language),
          country: cityData.country
        });
        setCity(cityData);
        setPlaces(placesData);
        setOriginalPlaces(placesData);
        setRoutes(routesData);
        setEvents(eventsData);

      } catch (error) {
        // Keep console.error for actual errors
        console.error('CityDetail: Failed to load city data:', error);
        setCity(null);
      } finally {
        // console.log('CityDetail: Data load finished.'); // Removed log
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

  // console.log('CityDetail: Before render checks', { loading, city: !!city }); // Removed log

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

  if (!city) {
    // console.log('CityDetail: Rendering Not Found message.'); // Removed log
    // Layout is kept here for the same reason as loading state
     return (
      <Layout>
        <div className="app-container py-10 text-center">
          <h2 className={cn(
            "text-xl font-semibold mb-4",
            fonts.heading.className
          )}>
            {t('city_not_found')}
          </h2>
          <Link to="/" className="btn-primary">
            {t('back_to_home')}
          </Link>
        </div>
      </Layout>
    );
  }

  // console.log('CityDetail: Rendering main content.'); // Removed log

  // REMOVED Layout wrapper from the main return statement
  return (
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
                onTabSelect={scrollToTab}
            />
            <CityAbout city={city} />
        </div>

        {/* Audio Player - Added Here */}
        {/* console.log('CityDetail: Attempting to render AudioPlayer', { id }); // Removed log */}
        {id && <AudioPlayer entityType="city" entityId={id} />}

        {/* Tabs Section - Added mt-8 for spacing */}
        <div className="mt-8">
          <CityTabsContent
            places={places}
            routes={routes}
            events={events}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onSearch={handleSearchPlaces}
          />
        </div>

                {/* Map Section - Added spacing */}
                <div className="mt-8 bg-white rounded-xl shadow-sm p-6 mb-10">
                    <CityMapSection places={places} />
                </div>

                {/* Comments Section */}
        {city && id && (
          <CommentsSection entityType="city" entityId={id} />
        )}

      </div>
  );
};

export default CityDetail;
