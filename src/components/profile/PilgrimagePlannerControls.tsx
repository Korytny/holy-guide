import React, { useMemo } from 'react'; // Removed useState as goalName is now a prop
import { Language, City, PlannedItem } from '../../types';
import { type DateRange } from 'react-day-picker';
import { PilgrimageCalendar } from './PilgrimageCalendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from 'lucide-react';
import { getLocalizedText } from '../../utils/languageUtils';
import { Input } from "@/components/ui/input";
import { format } from 'date-fns';
import { enUS, ru, hi, type Locale as DateFnsLocale } from "date-fns/locale";
import { DateFieldComponent } from '@/components/ui/date-field';
import {
  parseDate,
  getLocalTimeZone,
} from '@internationalized/date';
import type { DateValue } from '@internationalized/date';

const dateFnsLocales: Record<string, DateFnsLocale> = {
  en: enUS, ru: ru, hi: hi,
};

interface PilgrimagePlannerControlsProps {
  availableCities: City[];
  stagedCities: City[];
  plannedItems: PlannedItem[];
  selectedDateRange?: DateRange;
  language: Language;
  t: (key: string, params?: object) => string;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onCitySelect: (cityId: string) => void;
  onRemoveStagedCity: (cityId: string) => void;
  onAddStagedCities: () => void;
  onAddFavoritesToPlan: () => void;
  onDistributeDates: () => void;
  
  // Props for goal name input and save/update logic
  goalNameValue: string;
  onGoalNameChange: (name: string) => void;
  currentLoadedGoalId: string | null;
  onSaveOrUpdateGoal: (name: string) => void; // Renamed from onSaveAsGoal

  onLoadGoal: (goalId: string) => void;
  onDeleteGoal: (goalId: string) => void; 
  savedGoals: Array<{
    id: string;
    title: string;
    created_at: string;
  }>;
}

export const PilgrimagePlannerControls: React.FC<PilgrimagePlannerControlsProps> = ({
  availableCities,
  stagedCities,
  plannedItems,
  selectedDateRange,
  language,
  t,
  onDateRangeChange,
  onCitySelect,
  onRemoveStagedCity,
  onAddStagedCities,
  onAddFavoritesToPlan,
  onDistributeDates,
  
  goalNameValue,
  onGoalNameChange,
  currentLoadedGoalId,
  onSaveOrUpdateGoal,

  onLoadGoal,
  onDeleteGoal,
  savedGoals,
}) => {
  const currentLocale = dateFnsLocales[language] || enUS;
  // const [goalName, setGoalName] = useState(''); // Removed, now a prop

  const convertToDateValue = (date: Date | undefined | null): DateValue | null => {
    if (!date) return null;
    try {
      return parseDate(format(date, 'yyyy-MM-dd'));
    } catch (e) {
      console.error("Error parsing date for DateValue:", e);
      return null;
    }
  };

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
      if (newRange.to && jsDate && jsDate > newRange.to) {
        newRange.to = jsDate;
      }
    } else {
      newRange = { from: selectedDateRange?.from, to: jsDate };
      if (newRange.from && jsDate && jsDate < newRange.from) {
        newRange.from = jsDate;
      }
    }
    if (!newRange.from && !newRange.to) {
        onDateRangeChange(undefined);
    } else {
        onDateRangeChange(newRange);
    }
  };

  const plannedCityIdsInMainPlan = useMemo(() => 
    new Set(plannedItems.filter(item => item.type === 'city').map(item => item.data.id)), 
    [plannedItems]
  );

  const citiesToDisplayAsBadges = useMemo(() => {
    const cityMap = new Map<string, City>();
    stagedCities.forEach(city => cityMap.set(city.id, city));
    plannedItems.forEach(item => {
      if (item.type === 'city' && !cityMap.has(item.data.id)) {
        cityMap.set(item.data.id, item.data as City);
      }
    });
    return Array.from(cityMap.values());
  }, [stagedCities, plannedItems]);

  const saveButtonText = currentLoadedGoalId 
    ? t('update_goal_button', { defaultValue: 'Update Goal' }) 
    : t('save_as_goal', { defaultValue: 'Save as Goal' });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
        <div>
            <h3 className="text-lg font-semibold mb-4">{t('select_dates')}</h3>
            <PilgrimageCalendar
                selectedRange={selectedDateRange}
                onDateRangeChange={onDateRangeChange}
                locale={currentLocale}
            />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div>
                <Button variant="outline" className="w-full" onClick={onDistributeDates}>
                    {t('distribute_dates_to_cities_button')}
                </Button>
            </div>
        )}
      </div>

      <div className="border rounded-md p-4 bg-white space-y-6">
        <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">{t('plan_your_pilgrimage')}</h3>
    
            {savedGoals && savedGoals.length > 0 && (
              <div className="mb-6 mt-2">
                <h4 className="text-md font-semibold mb-3 text-gray-800">{t('saved_goals')}</h4>
                <div className="flex flex-wrap gap-2">
                  {savedGoals.map(goal => (
                    <div key={goal.id} className="flex items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onLoadGoal(goal.id)}
                        className="text-xs rounded-r-none"
                      >
                        {goal.title}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDeleteGoal(goal.id)}
                        className="text-xs px-2 rounded-l-none"
                        aria-label={t('delete_goal_label', { goalName: goal.title })}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('select_cities_to_stage')}</label>
          <Select onValueChange={onCitySelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('select_a_city_to_stage')} />
            </SelectTrigger>
            <SelectContent>
              {availableCities.map((city) => {
                const isStaged = stagedCities.some(sc => sc.id === city.id);
                const isInMainPlan = plannedCityIdsInMainPlan.has(city.id);
                const isDisabled = isStaged || isInMainPlan;
                return (
                  <SelectItem 
                    key={city.id} 
                    value={city.id || ''} 
                    disabled={isDisabled}
                  >
                    {getLocalizedText(city.name, language)}
                    {isInMainPlan && !isStaged && <span className="ml-2 text-xs text-gray-500">({t('city_already_in_plan')})</span>}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          
          {citiesToDisplayAsBadges.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-xs text-gray-600">{t('cities_staged_for_plan')}:</p> 
              <div className="flex flex-wrap gap-1">
                {citiesToDisplayAsBadges.map(city => {
                  const isStaged = stagedCities.some(sc => sc.id === city.id);
                  return (
                    <Badge key={city.id} className="flex items-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1.5 rounded-md">
                      {getLocalizedText(city.name, language)}
                      {isStaged && (
                        <Button variant="ghost" size="icon" className="h-5 w-5 ml-1.5 rounded-full" onClick={() => onRemoveStagedCity(city.id)}>
                          <X size={14} />
                        </Button>
                      )}
                    </Badge>
                  );
                })}
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
            <div className="mb-2">
              <Input
                placeholder={t('goal_name_placeholder')}
                value={goalNameValue} // Use prop value
                onChange={(e) => onGoalNameChange(e.target.value)} // Use prop handler
              />
            </div>
            <Button 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => {
                onSaveOrUpdateGoal(goalNameValue);
                // Do not clear goalNameValue here, parent component handles it
              }}
              disabled={!goalNameValue.trim() && !currentLoadedGoalId} // Disable if input is empty AND no goal is loaded (to prevent saving empty new goal)
            >
              {saveButtonText} {/* Dynamically set button text */}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
