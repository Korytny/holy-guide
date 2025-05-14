import { useEffect, useState } from 'react';
import { getCities } from '../services/api';
import { City, Language } from '../types';
import CityCard from '../components/CityCard';
import CityCardMob from '../components/CityCardMob';
import SearchBar from '../components/SearchBar';
// import Layout from '../components/Layout'; // Layout is applied in App.tsx
// import HeroSection from '../components/HeroSection'; // Use FullScreenHero instead
  import HeroSection from '../components/HeroSection'; // Updated import
import { ImageCloudItem } from '../components/ui/image-cloud'; 
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useIsSmallScreen } from '../hooks/use-small-screen';
import { Skeleton } from '@/components/ui/skeleton';
import { getLocalizedText } from '../utils/languageUtils';

const CitiesPage = () => {
  const { language, t } = useLanguage();
  const { auth: { isLoading: isAuthLoading } } = useAuth();
  const isSmallScreen = useIsSmallScreen();
  const [cities, setCities] = useState<City[]>([]);
  const [areCitiesLoading, setAreCitiesLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [allCities, setAllCities] = useState<City[]>([]);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  const [imageCloudItems, setImageCloudItems] = useState<ImageCloudItem[]>([]);
  const isCloudLoading = areCitiesLoading;
  
  const heroText = {
    title: t('hero_default_title', { defaultValue: 'Discover Sacred Sites' }),
    description: t('hero_default_description', { defaultValue: 'Explore ancient temples, sacred places and spiritual destinations around the world' })
  };

  // Fetch Cities & Prepare Image Cloud Items
  useEffect(() => {
    if (!isAuthLoading && !hasAttemptedFetch) {
      setHasAttemptedFetch(true);
      setAreCitiesLoading(true); 

      const fetchAllCities = async () => {
        try {
          const citiesData = await getCities();
          setAllCities(citiesData);
          setCities(citiesData);

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
      fetchAllCities();
    }
     else if (isAuthLoading) {
         setAreCitiesLoading(true);
     }
  }, [isAuthLoading, hasAttemptedFetch, language]); 

  // Filter Cities based on Search
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
      return Object.values(city.name).some(
        name => name?.toLowerCase().includes(lowerSearchTerm)
      );
    });
    setCities(results);
  }, [searchTerm, allCities]);

  // Re-generate imageCloudItems if language changes (needed for alt text)
  useEffect(() => {
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
    }
  }, [language, allCities, areCitiesLoading]); 

  const showLoadingSkeleton = isAuthLoading || areCitiesLoading;
  const CardComponent = isSmallScreen ? CityCardMob : CityCard;

  return (
    <>
      {/* Use the new FullScreenHero component */}
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
                  cities.map(city => (
                      <CardComponent key={city.id} city={city} />
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
