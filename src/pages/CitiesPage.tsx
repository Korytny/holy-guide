import { useEffect, useState } from 'react';
import { getCities } from '../services/citiesApi';
import { City, Language } from '../types';
import CityCard from '../components/CityCard';
import SearchBar from '../components/SearchBar';
import Layout from '../components/Layout';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const CitiesPage = () => {
  const { t } = useLanguage();
  // Keep isAuthLoading to wait for auth check, but don't need isAuthenticated for fetch trigger
  const { auth: { isLoading: isAuthLoading } } = useAuth(); 
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Local loading state for cities fetch
  const [searchTerm, setSearchTerm] = useState('');
  const [allCities, setAllCities] = useState<City[]>([]);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false); 

  useEffect(() => {
    // Fetch cities once the initial auth check is complete, regardless of auth status
    if (!isAuthLoading && !hasAttemptedFetch) {
      // console.log('[CitiesPage] Auth check complete. Fetching cities...');
      setHasAttemptedFetch(true); 
      setIsLoading(true); 

      const fetchAllCities = async () => {
        try {
          const citiesData = await getCities();
          // console.log('[CitiesPage] Cities data fetched:', citiesData.length);
          setAllCities(citiesData);
          setCities(citiesData);
        } catch (error) {
            console.error('[CitiesPage] Error fetching cities:', error);
            setCities([]); 
            setAllCities([]);
        } finally {
            setIsLoading(false); 
        }
      };
      fetchAllCities();
    } 
     // If auth is still loading, keep local loading true
     else if (isAuthLoading) {
         setIsLoading(true); 
     }
  }, [isAuthLoading, hasAttemptedFetch]); 

  useEffect(() => {
    // Filter logic
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

  // Show skeleton if auth is loading OR if cities are loading
  const showLoadingSkeleton = isAuthLoading || isLoading;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{t('cities_title')}</h1>
            <p className="mt-4 text-lg text-gray-600">
              {t('cities_subtitle')}
            </p>
          </div>
          
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
            // Always render the grid after loading is complete
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cities.length > 0 ? (
                  cities.map(city => (
                      <CityCard key={city.id} city={city} />
                  ))
              ) : (
                  // Show different messages depending on whether a search is active
                  <div className="col-span-3 text-center py-10">
                    <h3 className="text-lg font-medium text-gray-900">{t('no_cities_found')}</h3>
                    <p className="mt-2 text-gray-500">{searchTerm ? t('try_adjusting_search') : t('no_cities_available')}</p>
                  </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CitiesPage;