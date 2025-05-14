import { useEffect, useState } from 'react';
import { getCities } from '../services/api';
import { City, Language } from '../types';
import CityCard from '../components/CityCard';
import CityCardMob from '../components/CityCardMob';
import SearchBar from '../components/SearchBar';
// import Layout from '../components/Layout'; // Layout is applied in App.tsx
import HeroSection from '../components/HeroSection';
import { ImageCloudItem } from '../components/ui/image-cloud'; 
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useIsSmallScreen } from '../hooks/use-small-screen';
import { Skeleton } from '@/components/ui/skeleton';
import { getLocalizedText } from '../utils/languageUtils';
import { motion } from 'framer-motion'; // Import motion

const CitiesPage = () => {
  const { language, t } = useLanguage();
  const { auth: { isLoading: isAuthLoading } } = useAuth();
  const isSmallScreen = useIsSmallScreen();
  const [cities, setCities] = useState<City[]>([]);
  const [areCitiesLoading, setAreCitiesLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [allCities, setAllCities] = useState<City[]>([]);
  // Removed hasAttemptedFetch state

  const [imageCloudItems, setImageCloudItems] = useState<ImageCloudItem[]>([]);
  // Use a separate loading state for the image cloud if needed, but can derive from areCitiesLoading for now
  const isCloudLoading = areCitiesLoading;

  const heroText = {
    title: t('hero_default_title', { defaultValue: 'Discover Sacred Sites' }),
    description: t('hero_default_description', { defaultValue: 'Explore ancient temples, sacred places and spiritual destinations around the world' })
  };

  // Fetch Cities & Prepare Image Cloud Items
  useEffect(() => {
    console.log(`[CitiesPage] Fetch Effect Triggered. isAuthLoading: ${isAuthLoading}, language: ${language}`);

    if (!isAuthLoading) {
      console.log('[CitiesPage] Auth loaded, attempting to fetch cities...');
      setAreCitiesLoading(true); // Set loading true when starting fetch

      const fetchAllCities = async () => {
        console.log('[CitiesPage] fetchAllCities executing...');
        try {
          const citiesData = await getCities();
          console.log('[CitiesPage] Cities fetched successfully:', citiesData.length);
          setAllCities(citiesData);
          // Filtering happens in the other effect, so just set allCities here.
          // The filtering effect will update `cities` based on `allCities` and `searchTerm`.

          // Generate image cloud items immediately after fetch
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
          console.log('[CitiesPage] Image cloud items generated:', items.length);

        } catch (error) {
            console.error('[CitiesPage] Error fetching cities:', error);
            setCities([]); // Reset cities on error
            setAllCities([]); // Reset allCities on error
            setImageCloudItems([]); // Reset image cloud items on error
        } finally {
            console.log('[CitiesPage] Setting areCitiesLoading to false.');
            setAreCitiesLoading(false); // Set loading false after fetch completes or fails
        }
      };
      fetchAllCities();
    } else {
      console.log('[CitiesPage] Waiting for auth to load...');
      // Keep loading true while auth is loading
      setAreCitiesLoading(true);
    }
    // Fetch depends on auth status and language (for image cloud alt text)
  }, [isAuthLoading, language]);

  // Filter Cities based on Search (Runs whenever searchTerm or allCities changes)
  useEffect(() => {
    console.log(`[CitiesPage] Filtering Effect Triggered. searchTerm: "${searchTerm}", allCities count: ${allCities.length}`);
    if (!searchTerm) {
      setCities(allCities); // If no search term, show all fetched cities
      console.log('[CitiesPage] No search term, showing all cities:', allCities.length);
      return;
    }
    if (allCities.length === 0) {
        setCities([]); // If no base cities, results are empty
        console.log('[CitiesPage] No base cities to filter.');
        return;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    const results = allCities.filter(city => {
      // Check if any translation in the 'name' object includes the search term
      return Object.values(city.name || {}).some(
          (name: string | null | undefined) => name?.toLowerCase().includes(lowerSearchTerm)
      );
    });
    setCities(results);
    console.log('[CitiesPage] Filtering complete. Results:', results.length);
  }, [searchTerm, allCities]); // Depend on searchTerm and the master list of cities

  // --- This useEffect for imageCloudItems might be redundant now ---
  // The image cloud items are generated right after fetch in the main useEffect.
  // We only need to regenerate if language changes *after* the initial fetch.
  // The main useEffect already depends on language, so it handles this.
  // Let's comment it out to simplify. If alt text updates become an issue, we can re-evaluate.
  /*
  useEffect(() => {
    console.log(`[CitiesPage] Image Cloud Alt Text Update Effect. areCitiesLoading: ${areCitiesLoading}, allCities count: ${allCities.length}, language: ${language}`);
    if (!areCitiesLoading && allCities.length > 0) {
        const items = allCities
            .filter(city => city.imageUrl)
            .slice(0, 25)
            .map(city => ({
                id: city.id,
                imageUrl: city.imageUrl as string,
                alt: getLocalizedText(city.name, language) || 'City',
                link: `/cities/${city.id}`
            }));
        setImageCloudItems(items);
        console.log('[CitiesPage] Image cloud items updated for language change.');
    }
  }, [language, allCities, areCitiesLoading]);
  */

  // Derive loading state: show skeleton if auth is loading OR cities are loading
  const showLoadingSkeleton = isAuthLoading || areCitiesLoading;
  console.log(`[CitiesPage] Render. isAuthLoading: ${isAuthLoading}, areCitiesLoading: ${areCitiesLoading}, showLoadingSkeleton: ${showLoadingSkeleton}, cities count: ${cities.length}`);

  const CardComponent = isSmallScreen ? CityCardMob : CityCard;

  return (
    <>
      {/* HeroSection with image cloud */}
      <HeroSection
        imageCloudItems={imageCloudItems}
        isCloudLoading={isCloudLoading}
      />

      {/* Cities List Section */}
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
                  cities.map((city, index) => ( // Add index here
                    <motion.div // Wrap CardComponent with motion.div
                      key={city.id}
                      initial={{ opacity: 0, y: 20 }} // Initial state: invisible and slightly down
                      whileInView={{ opacity: 1, y: 0 }} // Animate when in view
                      viewport={{ once: true }} // Trigger animation only once
                      transition={{ duration: 0.5, delay: index * 0.1 }} // Animation duration and staggered delay
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
    </>
  );
};

export default CitiesPage;
