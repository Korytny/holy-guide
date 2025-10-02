import { useEffect, useState } from 'react';
import { getCities } from '../services/api';
import { City, Language } from '../types';
import CityCard from '../components/CityCard';
import CityCardMob from '../components/CityCardMob';
import SearchBar from '../components/SearchBar';
import HeroSection from '../components/HeroSection';
import { ImageCloudItem } from '../components/ui/image-cloud';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useIsSmallScreen } from '../hooks/use-small-screen';
import { Skeleton } from '@/components/ui/skeleton';
import { getLocalizedText } from '../utils/languageUtils';
import { motion } from 'framer-motion';
import { AnimatedText } from '@/components/ui/animated-underline-text-one'; // Import AnimatedText
import { WordPullUp } from '@/components/ui/word-pull-up';
import { PilgrimagePlanner } from '../components/profile/PilgrimagePlanner';

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

  
  // heroText can be removed if not used elsewhere or defined locally in HeroSection

  useEffect(() => {
    if (!authContext.auth.isLoading) {
      setAreCitiesLoading(true);
      const fetchAllCitiesData = async () => {
        try {
          const citiesData = await getCities();
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
        } catch (error) {
            console.error('[CitiesPage] Error fetching cities:', error);
            setCities([]);
            setAllCities([]);
            setImageCloudItems([]);
        } finally {
            setAreCitiesLoading(false);
        }
      };
      fetchAllCitiesData();
    } else {
      setAreCitiesLoading(true);
    }
  }, [authContext.auth.isLoading, language]); // Removed getLocalizedText from deps as it should be stable

  useEffect(() => {
    if (!searchTerm) {
      setCities(allCities);
      return;
    }
    if (allCities.length === 0) {
        setCities([]);
        return;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    const results = allCities.filter(city => {
      // Ensure city.name is not null and is an object before trying to get Object.values
      return city.name && typeof city.name === 'object' && Object.values(city.name).some(
          (name: string | null | undefined) => name?.toLowerCase().includes(lowerSearchTerm)
      );
    });
    setCities(results);
  }, [searchTerm, allCities]);

  // Scroll trigger - removed since we're not using animations anymore

  const showLoadingSkeleton = authContext.auth.isLoading || areCitiesLoading;
  const CardComponent = isSmallScreen ? CityCardMob : CityCard;

  return (
    <>
      <div> {/* Hero section container */}
        <HeroSection
          imageCloudItems={imageCloudItems}
          isCloudLoading={isCloudLoading}
        />
      </div>
      
      {/* Existing Cities List Section */}
      <div className="bg-gradient-to-b from-orange-50 to-orange-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <WordPullUp
            className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white text-center mt-20 mb-20"
            words={t('cities_section_title', { defaultValue: 'Cities' })}
          />
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
                    <h3 className="text-lg font-medium text-gray-900">{t('no_cities_found') }</h3>
                    <p className="mt-2 text-gray-500">{searchTerm ? t('try_adjusting_search') : t('no_cities_available')}</p>
                  </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* PilgrimagePlanner Section - Full Width */}
      <div className="w-full">
        <div className="text-center mb-20 pt-20">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            {t('plan_your_pilgrimage', { defaultValue: 'Запланируй свое поломничество' })}
          </h2>
        </div>
        
        <PilgrimagePlanner
          auth={authContext}
          language={language}
          t={t}
        />
      </div>

        </>
  );
};

export default CitiesPage;
