import React, { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Place } from '../../types';
import { getLocalizedText } from '../../utils/languageUtils';
import { Language } from '../../types';

interface PlaceSearchAndAddProps {
  cityId: string;
  language: Language;
  t: (key: string, options?: any) => string;
  onSearch: (searchTerm: string) => Promise<Place[]>;
  onAddPlace: (place: Place) => void;
  existingPlaceIds: Set<string>;
}

export const PlaceSearchAndAdd: React.FC<PlaceSearchAndAddProps> = ({
  cityId,
  language,
  t,
  onSearch,
  onAddPlace,
  existingPlaceIds,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await onSearch(searchTerm);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching places:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchTerm, onSearch]);

  const handleAddPlace = (place: Place) => {
    onAddPlace(place);
    setSearchTerm('');
    setSearchResults([]);
    setShowSearch(false);
  };

  const availablePlaces = searchResults.filter(place => !existingPlaceIds.has(place.id));

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowSearch(!showSearch)}
        className="text-green-600 hover:text-green-800 h-7 w-7 mr-1"
        title={t('search_and_add_places')}
      >
        <Plus size={18} />
      </Button>

      {showSearch && (
        <div className="absolute top-full right-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                type="text"
                placeholder={t('search_places_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full text-sm"
                autoFocus
              />
            </div>
          </div>

          {isSearching && (
            <div className="p-4 text-center text-gray-500">
              {t('searching')}
            </div>
          )}

          {!isSearching && searchTerm && searchResults.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              {t('no_places_found')}
            </div>
          )}

          {!isSearching && availablePlaces.length > 0 && (
            <div className="max-h-60 overflow-y-auto">
              {availablePlaces.map((place) => (
                <div
                  key={place.id}
                  className="p-3 hover:bg-gray-50 border-b last:border-b-0 flex items-center justify-between group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        place.type === 1 ? "bg-amber-500" :
                        place.type === 2 ? "bg-orange-500" :
                        place.type === 3 ? "bg-blue-500" :
                        place.type === 4 ? "bg-emerald-500" :
                        "bg-gray-400"
                      }`}></div>
                      <span className={`text-sm font-medium truncate ${
                        place.type === 1 ? "text-amber-600" :
                        place.type === 2 ? "text-orange-600" :
                        place.type === 3 ? "text-blue-600" :
                        place.type === 4 ? "text-emerald-600" :
                        "text-gray-600"
                      }`}>
                        {getLocalizedText(place.name, language)}
                      </span>
                    </div>
                    {place.rating && (
                      <div className="text-xs text-gray-500 mt-1">
                        {t('rating')}: {place.rating}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleAddPlace(place)}
                    className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 text-green-600 hover:text-green-800"
                    title={t('add_place')}
                  >
                    <Plus size={14} />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {!isSearching && searchTerm && availablePlaces.length === 0 && searchResults.length > 0 && (
            <div className="p-4 text-center text-gray-500 text-sm">
              {t('all_places_already_added')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};