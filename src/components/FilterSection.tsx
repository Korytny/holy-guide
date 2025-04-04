
import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FilterOption {
  id: string;
  name: string;
}

interface FilterSectionProps {
  options: FilterOption[];
  onFilter: (selected: string[]) => void;
  title?: string;
}

const FilterSection: React.FC<FilterSectionProps> = ({ 
  options, 
  onFilter, 
  title 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const { t } = useLanguage();
  
  const handleToggleFilter = (id: string) => {
    setSelectedFilters(prev => {
      const newFilters = prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id];
      
      onFilter(newFilters);
      return newFilters;
    });
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium"
      >
        <Filter size={16} />
        <span>{title || t('filter')}</span>
        {selectedFilters.length > 0 && (
          <span className="bg-saffron text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {selectedFilters.length}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute z-10 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <h4 className="font-medium">{t('filter_by')}</h4>
          </div>
          <div className="p-3">
            {options.map(option => (
              <div key={option.id} className="flex items-center mb-2 last:mb-0">
                <input
                  type="checkbox"
                  id={option.id}
                  checked={selectedFilters.includes(option.id)}
                  onChange={() => handleToggleFilter(option.id)}
                  className="mr-2 h-4 w-4 rounded border-gray-300 text-saffron focus:ring-saffron"
                />
                <label htmlFor={option.id} className="text-sm text-gray-700">
                  {option.name}
                </label>
              </div>
            ))}
          </div>
          <div className="p-3 bg-gray-50 flex justify-between">
            <button
              onClick={() => {
                setSelectedFilters([]);
                onFilter([]);
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {t('clear_all')}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-sm font-medium text-saffron hover:text-saffron/90"
            >
              {t('apply')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterSection;
