import { useEffect, useState, useCallback } from 'react';
import { getCities } from '../services/api';
import { City, Language } from '../types'; // PlannedItem import no longer needed here
import CityCard from '../components/CityCard';
import CityCardMob from '../components/CityCardMob';
import SearchBar from '../components/SearchBar';
import HeroSection from '../components/HeroSection';
import { ImageCloudItem } from '../components/ui/image-cloud'; 
import { useLanguage } from '../context/LanguageContext';
import { useAuth, AuthContextType } from '../context/AuthContext'; 
import { useIsSmallScreen } from '../hooks/use-small-screen';
import { Skeleton } from '@/components/ui/skeleton';
import { getLocalizedText } from '../utils/languageUtils';
import { motion } from 'framer-motion';
import { PilgrimagePlanner } from '../components/profile/PilgrimagePlanner';
// PilgrimageRouteMap import no longer needed here

const CitiesPage = () => {
  const { language, t } = useLanguage();
  const authContext = useAuth(); 
  const isSmallScreen = useIsSmallScreen();
  const [cities, setCities] = useState<City[]>([]);
  const [areCitiesLoading, setAreCitiesLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [allCities, setAllCities] = useState<City[]>([]);
  const [imageCloudItems, setImageCloudItems] = useState<ImageCloudItem[]>([]);
  const isCloudLoading = areCitiesLoading;
  // plannedItems state and handlePlannedItemsChange are no longer needed here

  const heroText = {
    title: t('hero_default_title', { defaultValue: 'Discover Sacred Sites' }),
    description: t('hero_default_description', { defaultValue: 'Explore ancient temples, sacred places and spiritual destinations around the world' })
  };

  useEffect(() => {
    // console.log(`[CitiesPage] Fetch Effect Triggered. isAuthLoading: ${authContext.auth.isLoading}, language: ${language}`);
    if (!authContext.auth.isLoading) {
      // console.log('[CitiesPage] Auth loaded, attempting to fetch cities...');
      setAreCitiesLoading(true);
      const fetchAllCities = async () => {
        // console.log('[CitiesPage] fetchAllCities executing...');
        try {
          const citiesData = await getCities();
          // console.log('[CitiesPage] Cities fetched successfully:', citiesData.length);
          setAllCities(citiesData);
          const items = citiesData
            .filter(city => city.imageUrl)
            .slice(0, 25)
            .map(city => ({
              id: city.id,
              imageUrl: city.imageUrl as string,
              alt: getLocalizedText(city.name, language) || 'City',
              link: `/cities/${city.id}`
            }));
          setImageCloudItems(items);
          // console.log('[CitiesPage] Image cloud items generated:', items.length);
        } catch (error) {
            console.error('[CitiesPage] Error fetching cities:', error);
            setCities([]); 
            setAllCities([]); 
            setImageCloudItems([]); 
        } finally {
            // console.log('[CitiesPage] Setting areCitiesLoading to false.');
            setAreCitiesLoading(false); 
        }
      };
      fetchAllCities();
    } else {
      // console.log('[CitiesPage] Waiting for auth to load...');
      setAreCitiesLoading(true);
    }
  }, [authContext.auth.isLoading, language]);

  useEffect(() => {
    // console.log(`[CitiesPage] Filtering Effect Triggered. searchTerm: "${searchTerm}", allCities count: ${allCities.length}`);
    if (!searchTerm) {
      setCities(allCities);
      // console.log('[CitiesPage] No search term, showing all cities:', allCities.length);
      return;
    }
    if (allCities.length === 0) {
        setCities([]);
        // console.log('[CitiesPage] No base cities to filter.');
        return;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    const results = allCities.filter(city => {
      return Object.values(city.name || {}).some(
          (name: string | null | undefined) => name?.toLowerCase().includes(lowerSearchTerm)
      );
    });
    setCities(results);
    // console.log('[CitiesPage] Filtering complete. Results:', results.length);
  }, [searchTerm, allCities]);

  // handlePlannedItemsChange callback removed

  const showLoadingSkeleton = authContext.auth.isLoading || areCitiesLoading;
  // console.log(`[CitiesPage] Render. isAuthLoading: ${authContext.auth.isLoading}, areCitiesLoading: ${areCitiesLoading}, showLoadingSkeleton: ${showLoadingSkeleton}, cities count: ${cities.length}`);

  const CardComponent = isSmallScreen ? CityCardMob : CityCard;

  return (
    <>
      <HeroSection
        imageCloudItems={imageCloudItems}
        isCloudLoading={isCloudLoading}
      />
      <div className="bg-gradient-to-b from-orange-50 to-orange-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="w-full max-w-2xl">
              <SearchBar placeholder={t('search_placeholder')} onSearch={term => setSearchTerm(term)} />
            </div>
          </div>
          {showLoadingSkeleton ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg h-72 animate-pulse shadow-md"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cities.length > 0 ? (
                  cities.map((city, index) => (
                    <motion.div 
                      key={city.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }} 
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <CardComponent city={city} />
                    </motion.div>
                  ))
              ) : (
                  <div className="col-span-3 text-center py-10">
                    <h3 className="text-lg font-medium text-gray-900">{t('no_cities_found')}</h3>
                    <p className="mt-2 text-gray-500">{searchTerm ? t('try_adjusting_search') : t('no_cities_available')}</p>
                  </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <section aria-labelledby="pilgrimage-planner-heading" className="mb-8">
          <h2 id="pilgrimage-planner-heading" className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
            {t('pilgrimage_plan', { defaultValue: 'Pilgrimage Plan' })}
          </h2>
          <PilgrimagePlanner 
            auth={authContext} 
            language={language} 
            t={t} 
            // onItemsChange is no longer needed
          /> 
          {/* PilgrimageRouteMap is no longer rendered here directly */}
        </section>
      </div>
    </>
  );
};

export default CitiesPage;
