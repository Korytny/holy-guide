import { useEffect, useState } from 'react';
import { getCities } from '../services/citiesApi';
import { City, Language } from '../types';
import CityCard from '../components/CityCard';
import SearchBar from '../components/SearchBar';
import Layout from '../components/Layout';
import { useLanguage } from '../context/LanguageContext';

const CitiesPage = () => {
  const { t } = useLanguage();
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [allCities, setAllCities] = useState<City[]>([]);

  useEffect(() => {
    const fetchAllCities = async () => {
      setIsLoading(true);
      const citiesData = await getCities();
      setAllCities(citiesData);
      setCities(citiesData);
      setIsLoading(false);
    };
    fetchAllCities();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setCities(allCities);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const results = allCities.filter(city => {
      // Check name in all languages
      return Object.values(city.name).some(
        name => name?.toLowerCase().includes(lowerSearchTerm)
      );
    });
    
    setCities(results);
  }, [searchTerm, allCities]);

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

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg h-72 animate-pulse shadow-md"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cities.map(city => (
                <CityCard key={city.id} city={city} />
              ))}
              
              {cities.length === 0 && !isLoading && (
                <div className="col-span-3 text-center py-10">
                  <h3 className="text-lg font-medium text-gray-900">{t('no_cities_found')}</h3>
                  <p className="mt-2 text-gray-500">{t('try_adjusting_search')}</p>
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