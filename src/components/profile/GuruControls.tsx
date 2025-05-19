import React from 'react';
import { Language, City, EventType, EventCulture } from '../../types';
import { type DateRange } from 'react-day-picker';
import { PilgrimageCalendar } from './PilgrimageCalendar';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFont } from '@/context/FontContext';
import { FontSwitcher } from '@/components/ui/FontSwitcher';
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
import { X, PartyPopper, Zap, Leaf, Eye, Sparkles, BookOpenText, Users, Church, Star, MoonStar, Handshake, Cross, Cog } from 'lucide-react';

const OmIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    stroke="currentColor" 
    strokeWidth="0.5" 
    className="h-4 w-4 mr-1.5"
  >
    {/* Center dot */}
    <circle cx="12" cy="12" r="2" fill="currentColor"/>
    {/* Empty middle circle */}
    <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor"/>
    {/* Thin outer circle */}
    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor"/>
  </svg>
);

const StarOfDavidIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className="h-4 w-4 mr-1.5"
  >
    {/* Star of David - two overlapping triangles */}
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
  </svg>
);

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

export const eventCultureOptions: { value: EventCulture; labelKey: string; Icon?: React.ElementType }[] = [
  { value: "atheism", labelKey: "event_culture_atheism", Icon: Users }, 
  { value: "hinduism", labelKey: "event_culture_hinduism", Icon: OmIcon },
  { value: "christianity", labelKey: "event_culture_christianity", Icon: Cross },
  { value: "judaism", labelKey: "event_culture_judaism", Icon: StarOfDavidIcon },
  { value: "islam", labelKey: "event_culture_islam", Icon: MoonStar },
  { value: "advaita", labelKey: "event_culture_advaita", Icon: Handshake },
  { value: "syncretism", labelKey: "event_culture_syncretism", Icon: () => (
    <div className="relative h-4 w-4 mr-1.5">
      <Cog className="absolute top-0 left-0 h-3 w-3" />
      <Cog className="absolute bottom-0 right-0 h-3 w-3" />
    </div>
  ) },
];

interface GuruControlsProps {
  language: Language;
  t: (key: string, params?: object) => string;
  availableCities: City[];
  selectedCityIds: string[];
  onSelectedCityIdsChange: (cityIds: string[]) => void;
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
  selectedCityIds,
  onSelectedCityIdsChange,
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

  const { fonts } = useFont();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="absolute top-4 right-4">
        <FontSwitcher />
      </div>
      {/* Left Panel: Calendar and Date Inputs */}
      <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
        <h3 className={`text-lg font-semibold mb-4 ${fonts.subheading.className}`}>{t('select_event_dates', {defaultValue: 'Select Event Dates'})}</h3>
        <PilgrimageCalendar 
            selectedRange={selectedDateRange} 
            onDateRangeChange={onDateRangeChange}
            locale={currentLocale}
            highlightedDates={eventDatesForCalendar}
            className={fonts.body.className}
            headerClassName={fonts.subheading.className}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DateFieldComponent
            label={t('start_date_label')}
            value={convertToDateValue(selectedDateRange?.from)}
            onChange={(dateValue) => handleDateFieldChange(dateValue, 'from')}
            className={fonts.body.className}
            labelClassName={fonts.subheading.className}
          />
          <DateFieldComponent
            label={t('end_date_label')}
            value={convertToDateValue(selectedDateRange?.to)}
            onChange={(dateValue) => handleDateFieldChange(dateValue, 'to')}
            className={fonts.body.className}
            labelClassName={fonts.subheading.className}
          />
        </div>
      </div>

      {/* Right Panel: Plan Name, Saved Plans, Filters, and Actions */}
      <div className="border rounded-md p-4 bg-white flex flex-col space-y-4"> 
        
        {/* Saved Plans Section */}
        {savedGuruPlans && savedGuruPlans.length > 0 && (
          <div className="mt-1">
            <div className="flex flex-wrap gap-2">
              {savedGuruPlans.map(plan => (
                <div key={plan.id} className="flex items-center">
                  <Button variant="outline" size="sm" onClick={() => onLoadGuruPlan(plan.id)} className={`text-xs rounded-r-none px-2 py-1 h-auto ${fonts.body.className}`}>{plan.title}</Button>
                  <Button variant="destructive" size="sm" onClick={() => onDeleteGuruPlan(plan.id)} className="text-xs px-1 py-1 h-auto rounded-l-none" aria-label={t('delete_guru_plan_label', { planName: plan.title })}><X size={14} /></Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div className="space-y-6">
            <h3 className={`text-lg font-semibold mb-4 ${fonts.subheading.className}`}>{t('select_event_format', {defaultValue: 'Select Event Format'})}</h3>

            <div className="mb-2">
              <ToggleGroup 
                type="multiple" 
                className="flex-wrap gap-2"
                value={selectedCityIds}
                onValueChange={(value) => onSelectedCityIdsChange(value)}
              >
                {availableCities.map(city => (
                  <ToggleGroupItem 
                    key={city.id} 
                    value={city.id}
                    variant={selectedCityIds.includes(city.id) ? 'default' : 'outline'}
                    className={`px-3 py-1 text-sm ${fonts.body.className} ${selectedCityIds.includes(city.id) ? 'toggle-item-selected' : ''}`}
                  >
                    {getLocalizedText(city.name, language)}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            <div className="mb-2">
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${fonts.subheading.className}`}>{t('filter_by_event_type', {defaultValue: 'Event Type'})}</label>
                <div className="flex flex-wrap gap-2">
                    {eventTypeOptions.map(opt => (
                        <Button 
                            key={opt.value} 
                            variant={selectedEventTypes.includes(opt.value) ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => toggleFilter(selectedEventTypes, opt.value, onSelectedEventTypesChange)}
                            className={`text-xs ${fonts.body.className}`}
                        >
                            {opt.Icon && <opt.Icon className="mr-1.5 h-4 w-4" />}
                            {t(opt.labelKey, {defaultValue: opt.value})}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="mb-2">
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${fonts.subheading.className}`}>{t('filter_by_culture', {defaultValue: 'Culture'})}</label>
                <div className="flex flex-wrap gap-2">
                    {eventCultureOptions.map(opt => (
                        <Button 
                            key={opt.value} 
                            variant={selectedCultures.includes(opt.value) ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => toggleFilter(selectedCultures, opt.value, onSelectedCulturesChange)}
                            className={`text-xs ${fonts.body.className}`}
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
                <label htmlFor="hasTranslationFilter" className={`text-sm font-medium text-gray-700 ${fonts.body.className}`}>{t('filter_has_translation', {defaultValue: 'Has Online Translation'})}</label>
            </div>
        </div>

        {/* Plan Name Input above buttons */}
        <div className="w-full pt-4">
          <Input
            placeholder={t('guru_plan_name_placeholder', {defaultValue: 'Enter Guru plan name...'})}
            value={guruPlanNameValue}
            onChange={(e) => onGuruPlanNameChange(e.target.value)}
            className={`text-lg font-semibold w-full ${fonts.body.className}`}
          />
        </div>

        {/* Action Buttons at the bottom */}
        <div className="flex flex-col sm:flex-row sm:gap-4 pt-4 mt-auto border-t">
            <Button 
                size="lg"
                className={`w-full sm:w-1/3 mt-2 sm:mt-0 bg-orange-500 hover:bg-orange-600 text-white ${fonts.subheading.className}`}
                onClick={onAddFilteredEventsToPlan}
            >
                {t('add_filtered_events_to_plan_button')}
            </Button>
            <Button 
                size="lg" 
                variant="outline" 
                className={`w-full sm:w-1/3 mt-2 sm:mt-0 ${fonts.subheading.className}`} 
                onClick={onAddFavoritesToPlan}
            >
                {t('add_favorite_events_to_plan_button')}
            </Button>
            <Button 
                size="lg" 
                className={`w-full sm:w-1/3 bg-amber-600 hover:bg-amber-700 text-white ${fonts.subheading.className}`}
                onClick={() => window.location.href = '/auth'}
            >
                {saveButtonText}
            </Button>
        </div>
      </div>
    </div>
  );
};
