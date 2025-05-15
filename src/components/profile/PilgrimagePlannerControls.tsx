import React from 'react';
import { Language, City } from '../../types';
import { DateRange } from 'react-day-picker';
import { PilgrimageCalendar } from './PilgrimageCalendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Import Badge
import { X } from 'lucide-react'; // Import X icon for remove button
import { getLocalizedText } from '../../utils/languageUtils';

interface PilgrimagePlannerControlsProps {
  availableCities: City[];
  stagedCities: City[]; // New: cities selected but not yet added to main plan
  selectedDateRange?: DateRange;
  displayedDateRange: string;
  language: Language;
  t: (key: string) => string;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onCitySelect: (cityId: string) => void; // This will now be onStageCity
  onRemoveStagedCity: (cityId: string) => void; // New: to remove a city from staged list
  onAddStagedCities: () => void; // New: to add all staged cities to the main plan (was suggest_route)
  onAddFavoritesToPlan: () => void;
  onDistributeDates: () => void; 
}

export const PilgrimagePlannerControls: React.FC<PilgrimagePlannerControlsProps> = ({
  availableCities,
  stagedCities,
  displayedDateRange,
  language,
  t,
  onDateRangeChange,
  onCitySelect, // This is for onStageCity
  onRemoveStagedCity,
  onAddStagedCities,
  onAddFavoritesToPlan,
  onDistributeDates,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h3 className="text-lg font-semibold mb-2">{t('select_dates')}</h3>
        <PilgrimageCalendar onDateRangeChange={onDateRangeChange} />
      </div>
      <div className="border rounded-md p-4 bg-white">
        <h3 className="text-lg font-semibold mb-4">{t('plan_your_pilgrimage')}</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('selected_dates')}:</label>
          <div className="w-full p-2 border rounded-md bg-gray-100 text-gray-700">
            {displayedDateRange}
          </div>
        </div>

        {displayedDateRange !== t('select_dates_placeholder') && (
            <div className="mb-4">
                <Button variant="outline" className="w-full" onClick={onDistributeDates}>
                    {t('distribute_dates_to_cities_button')}
                </Button>
            </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('select_cities_to_stage')}</label> {/* Changed key for clarity */}
          <Select onValueChange={onCitySelect}> {/* This now calls onStageCity (passed as onCitySelect) */}
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('select_a_city_to_stage')} /> {/* Changed key */}
            </SelectTrigger>
            <SelectContent>
              {availableCities.map((city) => (
                <SelectItem key={city.id} value={city.id || ''} disabled={stagedCities.some(sc => sc.id === city.id)}>
                  {getLocalizedText(city.name, language)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Display Staged Cities */}
          {stagedCities.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-xs text-gray-600">{t('cities_staged_for_plan')}:</p>
              <div className="flex flex-wrap gap-1">
                {stagedCities.map(city => (
                  <Badge key={city.id} variant="secondary" className="flex items-center">
                    {getLocalizedText(city.name, language)}
                    <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 rounded-full" onClick={() => onRemoveStagedCity(city.id)}>
                      <X size={12} />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Button to add staged cities to the main plan */} 
        {stagedCities.length > 0 && (
            <div className="mb-4">
                <Button className="w-full" onClick={onAddStagedCities}>
                    {t('add_selected_cities_to_plan_button')} {/* New translation key */}
                </Button>
            </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('add_from_favorites')}</label>
          <Button variant="outline" className="w-full" onClick={onAddFavoritesToPlan}>
            {t('add_favorites_to_plan')}
          </Button>
        </div>
        
        {/* Suggest Route button can be kept for future or removed if add_staged_cities replaces its immediate role */}
        {/* <div className="mt-2">
          <Button className="w-full">{t('suggest_route')}</Button> 
        </div>*/}
      </div>
    </div>
  );
};