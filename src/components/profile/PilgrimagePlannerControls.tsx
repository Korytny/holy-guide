import React, { useEffect } from 'react'; // Removed useState as inputFromDate/ToDate are removed
import { Language, City } from '../../types';
import { type DateRange } from 'react-day-picker';
import { PilgrimageCalendar } from './PilgrimageCalendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from 'lucide-react';
import { getLocalizedText } from '../../utils/languageUtils';
// Removed Input import
import { format } from 'date-fns'; // format is still used for PilgrimageCalendar selectedRange prop
import { enUS, ru, hi, type Locale as DateFnsLocale } from "date-fns/locale";

// Imports for new DateFieldComponent
import { DateFieldComponent } from '@/components/ui/date-field';
import {
  parseDate,
  CalendarDate,
  getLocalTimeZone,
  today
} from '@internationalized/date';
import type { DateValue } from '@internationalized/date';

const dateFnsLocales: Record<string, DateFnsLocale> = {
  en: enUS, ru: ru, hi: hi,
};

interface PilgrimagePlannerControlsProps {
  availableCities: City[];
  stagedCities: City[];
  selectedDateRange?: DateRange;
  language: Language;
  t: (key: string, params?: object) => string;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onCitySelect: (cityId: string) => void;
  onRemoveStagedCity: (cityId: string) => void;
  onAddStagedCities: () => void;
  onAddFavoritesToPlan: () => void;
  onDistributeDates: () => void;
  onSaveAsGoal: () => void;
}

export const PilgrimagePlannerControls: React.FC<PilgrimagePlannerControlsProps> = ({
  availableCities,
  stagedCities,
  selectedDateRange,
  language,
  t,
  onDateRangeChange,
  onCitySelect,
  onRemoveStagedCity,
  onAddStagedCities,
  onAddFavoritesToPlan,
  onDistributeDates,
  onSaveAsGoal,
}) => {
  const currentLocale = dateFnsLocales[language] || enUS;

  // Helper to convert JS Date to DateValue
  const convertToDateValue = (date: Date | undefined | null): DateValue | null => {
    if (!date) return null;
    try {
      return parseDate(format(date, 'yyyy-MM-dd'));
    } catch (e) {
      console.error("Error parsing date for DateValue:", e);
      return null;
    }
  };

  // Helper to convert DateValue to JS Date
  const convertToJSDate = (dateValue: DateValue | null): Date | undefined => {
    if (!dateValue) return undefined;
    try {
      return dateValue.toDate(getLocalTimeZone());
    } catch (e) {
      console.error("Error converting DateValue to JS Date:", e);
      return undefined;
    }
  };

  const handleDateFieldChange = (dateValue: DateValue | null, field: 'from' | 'to') => {
    const jsDate = convertToJSDate(dateValue);
    let newRange: DateRange;

    if (field === 'from') {
      newRange = { from: jsDate, to: selectedDateRange?.to };
      // Ensure 'from' is not after 'to' if 'to' exists
      if (newRange.to && jsDate && jsDate > newRange.to) {
        newRange.to = jsDate; // Or set to undefined, or keep old, depending on desired UX
      }
    } else { // field === 'to'
      newRange = { from: selectedDateRange?.from, to: jsDate };
      // Ensure 'to' is not before 'from' if 'from' exists
      if (newRange.from && jsDate && jsDate < newRange.from) {
        newRange.from = jsDate; // Or set to undefined, or keep old
      }
    }
     // If both become undefined, pass undefined to clear the range
    if (!newRange.from && !newRange.to) {
        onDateRangeChange(undefined);
    } else {
        onDateRangeChange(newRange);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">{t('select_dates')}</h3>
        <PilgrimageCalendar 
            selectedRange={selectedDateRange} 
            onDateRangeChange={onDateRangeChange}
            locale={currentLocale}
        />
      </div>
      <div className="border rounded-md p-4 bg-white">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">{t('plan_your_pilgrimage')}</h3>
        
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DateFieldComponent
            label={t('start_date_label')}
            value={convertToDateValue(selectedDateRange?.from)}
            onChange={(dateValue) => handleDateFieldChange(dateValue, 'from')}
          />
          <DateFieldComponent
            label={t('end_date_label')}
            value={convertToDateValue(selectedDateRange?.to)}
            onChange={(dateValue) => handleDateFieldChange(dateValue, 'to')}
          />
        </div>

        {selectedDateRange && selectedDateRange.from && (
            <div className="mb-4">
                <Button variant="outline" className="w-full" onClick={onDistributeDates}>
                    {t('distribute_dates_to_cities_button')}
                </Button>
            </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('select_cities_to_stage')}</label>
          <Select onValueChange={onCitySelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('select_a_city_to_stage')} />
            </SelectTrigger>
            <SelectContent>
              {availableCities.map((city) => (
                <SelectItem key={city.id} value={city.id || ''} disabled={stagedCities.some(sc => sc.id === city.id)}>
                  {getLocalizedText(city.name, language)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {stagedCities.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-xs text-gray-600">{t('cities_staged_for_plan')}:</p>
              <div className="flex flex-wrap gap-1">
                {stagedCities.map(city => (
                  <Badge key={city.id} className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1.5 rounded-md">
                    {getLocalizedText(city.name, language)}
                    <Button variant="ghost" size="icon" className="h-5 w-5 ml-1.5 rounded-full" onClick={() => onRemoveStagedCity(city.id)}>
                      <X size={14} />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {stagedCities.length > 0 && (
            <div className="mb-4">
                <Button className="w-full" onClick={onAddStagedCities}>
                    {t('add_selected_cities_to_plan_button')}
                </Button>
            </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('add_from_favorites')}</label>
          <Button variant="outline" className="w-full" onClick={onAddFavoritesToPlan}>
            {t('add_favorites_to_plan')}
          </Button>
          
          <div className="mt-4">
            <Button 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              onClick={onSaveAsGoal}
            >
              {t('save_as_goal')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
