import React from 'react';
import { Language, City, EventType, EventCulture } from '../../types';
import { type DateRange } from 'react-day-picker';
import { PilgrimageCalendar } from './PilgrimageCalendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from 'date-fns';
import { enUS, ru, hi, type Locale as DateFnsLocale } from "date-fns/locale";
import { DateFieldComponent } from '@/components/ui/date-field';
import {
  parseDate,
  getLocalTimeZone,
} from '@internationalized/date';
import type { DateValue } from '@internationalized/date';
import { Checkbox } from "@/components/ui/checkbox";
import { getLocalizedText } from '../../utils/languageUtils';
import { X, PartyPopper, Zap, Leaf, Eye, Sparkles, BookOpenText, Users, Church, Star, MoonStar, Handshake } from 'lucide-react';

const dateFnsLocales: Record<string, DateFnsLocale> = {
  en: enUS, ru: ru, hi: hi,
};

const eventTypeOptions: { value: EventType; labelKey: string; Icon?: React.ElementType }[] = [
  { value: "festival", labelKey: "event_type_festival", Icon: PartyPopper },
  { value: "practice", labelKey: "event_type_practice", Icon: Zap },
  { value: "retreat", labelKey: "event_type_retreat", Icon: Leaf },
  { value: "vipassana", labelKey: "event_type_vipassana", Icon: Eye },
  { value: "puja", labelKey: "event_type_puja", Icon: Sparkles },
  { value: "lecture", labelKey: "event_type_lecture", Icon: BookOpenText },
];

const eventCultureOptions: { value: EventCulture; labelKey: string; Icon?: React.ElementType }[] = [
  { value: "atheism", labelKey: "event_culture_atheism", Icon: Users }, 
  { value: "hinduism", labelKey: "event_culture_hinduism" /* Icon: Om (Placeholder) */ },
  { value: "christianity", labelKey: "event_culture_christianity", Icon: Church },
  { value: "judaism", labelKey: "event_culture_judaism", Icon: Star },
  { value: "islam", labelKey: "event_culture_islam", Icon: MoonStar },
  { value: "advaita", labelKey: "event_culture_advaita", Icon: Handshake },
  { value: "syncretism", labelKey: "event_culture_syncretism", Icon: Users },
];

interface GuruControlsProps {
  language: Language;
  t: (key: string, params?: object) => string;
  availableCities: City[];
  selectedCityId?: string;
  onCityChange: (cityId: string | undefined) => void;
  selectedEventTypes: EventType[];
  onSelectedEventTypesChange: (types: EventType[]) => void;
  hasTranslation?: boolean;
  onHasTranslationChange: (value: boolean | undefined) => void;
  selectedCultures: EventCulture[];
  onSelectedCulturesChange: (cultures: EventCulture[]) => void;
  onAddFilteredEventsToPlan: () => void;
  onAddFavoritesToPlan: () => void;
  selectedDateRange?: DateRange;
  onDateRangeChange: (range: DateRange | undefined) => void;
  guruPlanNameValue: string; 
  onGuruPlanNameChange: (name: string) => void; 
  currentLoadedGuruPlanId: string | null; 
  onSaveOrUpdateGuruPlan: (name: string) => void; 
  onLoadGuruPlan: (planId: string) => void; 
  onDeleteGuruPlan: (planId: string) => void; 
  savedGuruPlans: Array<{ id: string; title: string; created_at: string; }>;
  eventDatesForCalendar: Date[];
}

export const GuruControls: React.FC<GuruControlsProps> = ({
  language,
  t,
  availableCities,
  selectedCityId,
  onCityChange,
  selectedEventTypes,
  onSelectedEventTypesChange,
  hasTranslation,
  onHasTranslationChange,
  selectedCultures,
  onSelectedCulturesChange,
  onAddFilteredEventsToPlan,
  onAddFavoritesToPlan,
  selectedDateRange,
  onDateRangeChange,
  guruPlanNameValue,
  onGuruPlanNameChange,
  currentLoadedGuruPlanId,
  onSaveOrUpdateGuruPlan,
  onLoadGuruPlan,
  onDeleteGuruPlan,
  savedGuruPlans,
  eventDatesForCalendar,
}) => {
  const currentLocale = dateFnsLocales[language] || enUS;

  const convertToDateValue = (date: Date | undefined | null): DateValue | null => {
    if (!date) return null;
    try { return parseDate(format(date, 'yyyy-MM-dd')); } 
    catch (e) { console.error("Error parsing date for DateValue:", e); return null; }
  };

  const convertToJSDate = (dateValue: DateValue | null): Date | undefined => {
    if (!dateValue) return undefined;
    try { return dateValue.toDate(getLocalTimeZone()); }
    catch (e) { console.error("Error converting DateValue to JS Date:", e); return undefined; }
  };

  const handleDateFieldChange = (dateValue: DateValue | null, field: 'from' | 'to') => {
    const jsDate = convertToJSDate(dateValue);
    let newRange: DateRange;
    if (field === 'from') {
      newRange = { from: jsDate, to: selectedDateRange?.to };
      if (newRange.to && jsDate && jsDate > newRange.to) newRange.to = jsDate;
    } else {
      newRange = { from: selectedDateRange?.from, to: jsDate };
      if (newRange.from && jsDate && jsDate < newRange.from) newRange.from = jsDate;
    }
    if (!newRange.from && !newRange.to) onDateRangeChange(undefined);
    else onDateRangeChange(newRange);
  };
  
  const saveButtonText = currentLoadedGuruPlanId 
    ? t('update_guru_plan_button') 
    : t('save_guru_plan_button');

  const toggleFilter = <T extends string>(currentSelection: T[], item: T, setter: (newSelection: T[]) => void) => {
    const newSelection = currentSelection.includes(item) 
      ? currentSelection.filter(i => i !== item)
      : [...currentSelection, item];
    setter(newSelection);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Left Panel: Calendar and Date Inputs */}
      <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
        <h3 className="text-lg font-semibold mb-4">{t('select_event_dates', {defaultValue: 'Select Event Dates'})}</h3>
        <PilgrimageCalendar 
            selectedRange={selectedDateRange} 
            onDateRangeChange={onDateRangeChange}
            locale={currentLocale}
            highlightedDates={eventDatesForCalendar}
        />
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
      </div>

      {/* Right Panel: Plan Name, Saved Plans, Filters, and Actions */}
      <div className="border rounded-md p-4 bg-white flex flex-col space-y-4"> 
        
        {/* Top section: Plan Name Input, Save Button, and Saved Plans */}
        <div className="flex flex-col space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <Input
              placeholder={t('guru_plan_name_placeholder', {defaultValue: 'Enter Guru plan name...'})}
              value={guruPlanNameValue}
              onChange={(e) => onGuruPlanNameChange(e.target.value)}
              className="text-lg font-semibold w-full sm:flex-grow"
            />
            <Button 
                className="w-full sm:w-auto flex-shrink-0 bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => onSaveOrUpdateGuruPlan(guruPlanNameValue)}
                disabled={!guruPlanNameValue.trim() && !currentLoadedGuruPlanId}
            >
                {saveButtonText}
            </Button>
          </div>
          
          {savedGuruPlans && savedGuruPlans.length > 0 && (
            <div className="mt-1">
              <div className="flex flex-wrap gap-2">
                {savedGuruPlans.map(plan => (
                  <div key={plan.id} className="flex items-center">
                    <Button variant="outline" size="sm" onClick={() => onLoadGuruPlan(plan.id)} className="text-xs rounded-r-none px-2 py-1 h-auto">{plan.title}</Button>
                    <Button variant="destructive" size="sm" onClick={() => onDeleteGuruPlan(plan.id)} className="text-xs px-1 py-1 h-auto rounded-l-none" aria-label={t('delete_guru_plan_label', { planName: plan.title })}><X size={14} /></Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Filters Section */}
        <div className="space-y-3">
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('filter_by_city', {defaultValue: 'Filter by City'})}</label>
              <Select value={selectedCityId || 'all'} onValueChange={(value) => onCityChange(value === 'all' ? undefined : value)}>
                <SelectTrigger><SelectValue placeholder={t('select_city_placeholder', {defaultValue: 'Select a city'})} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('all_cities', {defaultValue: 'All Cities'})}</SelectItem>
                  {availableCities.map(city => (
                    <SelectItem key={city.id} value={city.id}>{getLocalizedText(city.name, language)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('filter_by_event_type', {defaultValue: 'Event Type'})}</label>
                <div className="flex flex-wrap gap-2">
                    {eventTypeOptions.map(opt => (
                        <Button 
                            key={opt.value} 
                            variant={selectedEventTypes.includes(opt.value) ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => toggleFilter(selectedEventTypes, opt.value, onSelectedEventTypesChange)}
                            className="text-xs"
                        >
                            {opt.Icon && <opt.Icon className="mr-1.5 h-4 w-4" />}
                            {t(opt.labelKey, {defaultValue: opt.value})}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('filter_by_culture', {defaultValue: 'Culture'})}</label>
                <div className="flex flex-wrap gap-2">
                    {eventCultureOptions.map(opt => (
                        <Button 
                            key={opt.value} 
                            variant={selectedCultures.includes(opt.value) ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => toggleFilter(selectedCultures, opt.value, onSelectedCulturesChange)}
                            className="text-xs"
                        >
                            {opt.Icon && <opt.Icon className="mr-1.5 h-4 w-4" />}
                            {t(opt.labelKey, {defaultValue: opt.value})}
                        </Button>
                    ))}
                </div>
            </div>
            
            <div className="flex items-center space-x-2">
                <Checkbox 
                    id="hasTranslationFilter"
                    checked={hasTranslation === true}
                    onCheckedChange={(checked) => {
                        if (checked === 'indeterminate') {
                            onHasTranslationChange(undefined);
                        } else {
                            onHasTranslationChange(Boolean(checked));
                        }
                    }}
                />
                <label htmlFor="hasTranslationFilter" className="text-sm font-medium text-gray-700">{t('filter_has_translation', {defaultValue: 'Has Online Translation'})}</label>
            </div>
        </div>

        {/* Action Buttons at the bottom */}
        <div className="flex flex-col sm:flex-row sm:gap-4 pt-4 mt-auto border-t">
            <Button size="lg" className="w-full sm:w-1/2" onClick={onAddFilteredEventsToPlan}>{t('add_filtered_events_to_plan_button')}</Button>
            <Button size="lg" variant="outline" className="w-full sm:w-1/2 mt-2 sm:mt-0" onClick={onAddFavoritesToPlan}>{t('add_favorite_events_to_plan_button')}</Button>
        </div>
      </div>
    </div>
  );
};
