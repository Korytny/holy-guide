
import { useEffect, useState } from 'react';
import { getCities } from '../services/api';
import { City } from '../types';
import CityCard from '../components/CityCard';
import SearchBar from '../components/SearchBar';
import FilterSection from '../components/FilterSection';
import Layout from '../components/Layout';

const CitiesPage = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<any>({});

  useEffect(() => {
    const fetchCities = async () => {
      setIsLoading(true);
      const citiesData = await getCities(searchTerm, filter);
      setCities(citiesData);
      setIsLoading(false);
    };

    fetchCities();
  }, [searchTerm, filter]);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Sacred Cities of India</h1>
            <p className="mt-4 text-lg text-gray-600">
              Discover the spiritual heart of India through its most sacred cities
            </p>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-6 mb-8">
            <div className="lg:w-2/3 w-full">
              <SearchBar 
                placeholder="Search cities..." 
                onSearch={(term) => setSearchTerm(term)}
              />
            </div>
            <div className="lg:w-1/3 w-full">
              <FilterSection 
                filters={[
                  { name: 'country', label: 'Country', options: ['India', 'Nepal', 'Sri Lanka'] },
                  { name: 'type', label: 'Type', options: ['Sacred', 'Historical', 'Cultural'] }
                ]} 
                onFilterChange={setFilter}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div 
                  key={i} 
                  className="bg-white rounded-lg h-72 animate-pulse shadow-md"
                ></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cities.map((city) => (
                <CityCard key={city.id} city={city} />
              ))}
              
              {cities.length === 0 && !isLoading && (
                <div className="col-span-3 text-center py-10">
                  <h3 className="text-lg font-medium text-gray-900">No cities found</h3>
                  <p className="mt-2 text-gray-500">Try adjusting your search or filter criteria</p>
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
