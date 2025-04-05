
import React, { useState } from 'react';
import { Filter as FilterIcon } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Filter, FilterOption, FilterSectionProps } from '../types/FilterTypes';

const FilterSection: React.FC<FilterSectionProps> = ({ 
  filters, 
  onFilterChange, 
  title 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const { t } = useLanguage();
  
  const handleToggleFilter = (filterName: string, value: string) => {
    setSelectedFilters(prev => {
      const filterValues = prev[filterName] || [];
      const newFilterValues = filterValues.includes(value)
        ? filterValues.filter(item => item !== value)
        : [...filterValues, value];
      
      const newFilters = {
        ...prev,
        [filterName]: newFilterValues
      };
      
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters({});
    onFilterChange({});
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium"
      >
        <FilterIcon size={16} />
        <span>{title || t('filter')}</span>
        {Object.values(selectedFilters).flat().length > 0 && (
          <span className="bg-saffron text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {Object.values(selectedFilters).flat().length}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute z-10 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <h4 className="font-medium">{t('filter_by')}</h4>
          </div>
          <div className="p-3">
            {filters.map((filter) => (
              <div key={filter.name} className="mb-4">
                <h5 className="font-medium text-sm mb-2">{filter.label}</h5>
                {filter.options.map((option) => {
                  const optionValue = typeof option === 'string' ? option : option.value;
                  const optionLabel = typeof option === 'string' ? option : option.label;
                  
                  return (
                    <div key={optionValue} className="flex items-center mb-2 last:mb-0">
                      <input
                        type="checkbox"
                        id={`${filter.name}-${optionValue}`}
                        checked={(selectedFilters[filter.name] || []).includes(optionValue)}
                        onChange={() => handleToggleFilter(filter.name, optionValue)}
                        className="mr-2 h-4 w-4 rounded border-gray-300 text-saffron focus:ring-saffron"
                      />
                      <label htmlFor={`${filter.name}-${optionValue}`} className="text-sm text-gray-700">
                        {optionLabel}
                      </label>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="p-3 bg-gray-50 flex justify-between">
            <button
              onClick={clearAllFilters}
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
