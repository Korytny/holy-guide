
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface SearchBarProps {
  onSearch: (term: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, placeholder }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useLanguage();
  
  useEffect(() => {
    if (searchTerm.length === 0 || searchTerm.length > 2) {
      const timer = setTimeout(() => {
        onSearch(searchTerm);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchTerm, onSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };
  
  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron focus:border-transparent"
          placeholder={placeholder || t('search_placeholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
      </div>
    </form>
  );
};

export default SearchBar;
