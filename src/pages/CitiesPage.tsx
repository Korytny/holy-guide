
import React, { useState, useEffect } from 'react';
import { getCities } from '../services/api';
import { City } from '../types';
import { useLanguage } from '../context/LanguageContext';
import CityCard from '../components/CityCard';
import SearchBar from '../components/SearchBar';
import FilterSection from '../components/FilterSection';
import { Languages } from 'lucide-react';

const CitiesPage = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { t, language } = useLanguage();
  
  // Example filter options (would come from API in real app)
  const filterOptions = [
    { id: 'north', name: t('north_india') },
    { id: 'south', name: t('south_india') },
    { id: 'east', name: t('east_india') },
    { id: 'west', name: t('west_india') },
    { id: 'central', name: t('central_india') },
  ];
  
  useEffect(() => {
    const loadCities = async () => {
      setLoading(true);
      try {
        const data = await getCities();
        setCities(data);
        setFilteredCities(data);
      } catch (error) {
        console.error('Failed to load cities:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCities();
  }, []);
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredCities(cities);
      return;
    }
    
    const filtered = cities.filter(city => 
      city.name.toLowerCase().includes(term.toLowerCase()) ||
      city.description.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredCities(filtered);
  };
  
  const handleFilter = (selectedFilters: string[]) => {
    if (selectedFilters.length === 0) {
      setFilteredCities(cities);
      return;
    }
    
    // This is a simplified example - in a real app, you would filter based on proper criteria
    const filtered = cities.filter(city => {
      // This is just an example - in real app you'd check actual properties
      if (selectedFilters.includes('north') && city.name.includes('North')) {
        return true;
      }
      if (selectedFilters.includes('south') && city.name.includes('South')) {
        return true;
      }
      // Add other filter logic as needed
      return false;
    });
    
    setFilteredCities(filtered);
  };
  
  return (
    <div className="app-container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('sacred_cities')}</h1>
        <button className="flex items-center space-x-2 text-sm font-medium text-spiritualPurple bg-spiritualPurple/10 px-3 py-2 rounded-md">
          <Languages size={18} />
          <span>{language.toUpperCase()}</span>
        </button>
      </div>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchBar 
            onSearch={handleSearch} 
            placeholder={t('search_cities')}
          />
        </div>
        <FilterSection 
          options={filterOptions}
          onFilter={handleFilter}
          title={t('filter_regions')}
        />
      </div>
      
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-10 w-10 bg-gray-300 rounded-full mb-2"></div>
            <div className="h-4 w-32 bg-gray-300 rounded mb-1"></div>
            <div className="h-3 w-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      ) : filteredCities.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg text-gray-600 mb-4">{t('no_cities_found')}</p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setFilteredCities(cities);
            }}
            className="btn-primary"
          >
            {t('clear_search')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCities.map(city => (
            <CityCard key={city.id} city={city} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CitiesPage;
