import React, { useMemo } from 'react';
import { Language, City, PlannedItem } from '../../types';
import { type DateRange } from 'react-day-picker';
import { PilgrimageCalendar } from './PilgrimageCalendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    X, RotateCcw, 
    Church, Archive, Waves, Sparkles, // Icons for PlaceSubtypes
    PartyPopper, Zap, Eye, Leaf, BookOpenText, Flame, MountainSnow // Added MountainSnow for retreat
} from 'lucide-react'; 
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
import { Label } from "@/components/ui/label";
import useMobile from '../../hooks/use-mobile';
import { useFont } from '@/context/FontContext';

export type PlaceSubtype = 'temple' | 'samadhi' | 'kunda' | 'sacred_site'; 
export type EventSubtype = 'festival' | 'practice' | 'retreat' | 'vipassana' | 'puja' | 'lecture'; // Changed ayurveda to retreat

export const PLACE_SUBTYPES_OPTIONS: { value: PlaceSubtype; labelKey: string; Icon: React.ElementType }[] = [
  { value: 'temple', labelKey: 'place_type_temple', Icon: Church },
  { value: 'samadhi', labelKey: 'place_type_samadhi', Icon: Archive },
  { value: 'kunda', labelKey: 'place_type_kunda', Icon: Waves },
  { value: 'sacred_site', labelKey: 'place_type_sacred_site', Icon: Sparkles },
];

export const EVENT_SUBTYPES_OPTIONS: { value: EventSubtype; labelKey: string; Icon: React.ElementType }[] = [
  { value: "festival", labelKey: "event_type_festival", Icon: PartyPopper },
  { value: "practice", labelKey: "event_type_practice", Icon: Zap },
  { value: "retreat", labelKey: "event_type_retreat", Icon: MountainSnow }, // Changed ayurveda to retreat, updated Icon
  { value: "vipassana", labelKey: "event_type_vipassana", Icon: Eye },
  { value: "lecture", labelKey: "event_type_lecture", Icon: BookOpenText },
  { value: "puja", labelKey: "event_type_puja", Icon: Flame },
];

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
  
  goalNameValue: string;
  onGoalNameChange: (name: string) => void;
  currentLoadedGoalId: string | null;
  onSaveOrUpdateGoal: (name: string) => void;
  onLoadGoal: (goalId: string) => void;
  onDeleteGoal: (goalId: string) => void; 
  savedGoals: Array<{
    id: string;
    title: string;
    created_at: string;
  }>;

  selectedPlaceSubtypes: PlaceSubtype[];
  selectedEventSubtypes: EventSubtype[];
  onSelectedPlaceSubtypesChange: (subtypes: PlaceSubtype[]) => void;
  onSelectedEventSubtypesChange: (subtypes: EventSubtype[]) => void;
  onAddFilteredItemsToPlan: () => void;
  onClearPlan: () => void; 
}

const ORANGE_BUTTON_CLASS = "bg-orange-500 hover:bg-orange-600 text-white"; 
const BEIGE_BACKGROUND_CLASS = "bg-orange-50";
// Simplified CARD_BACKGROUND_CLASS logic, assuming 'bg-card' is the default if not beige
const CARD_BACKGROUND_CLASS = 'bg-card'; 

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
  selectedPlaceSubtypes,
  selectedEventSubtypes,
  onSelectedPlaceSubtypesChange,
  onSelectedEventSubtypesChange,
  onAddFilteredItemsToPlan,
  onClearPlan,
}) => {
  const currentLocale = dateFnsLocales[language] || enUS;
  const isMobile = useMobile();
  const { fonts } = useFont();

  const convertToDateValue = (date: Date | undefined | null): DateValue | null => {
    if (!date) return null;
    try { return parseDate(format(date, 'yyyy-MM-dd')); } catch (e) { console.error("Error parsing date for DateValue:", e); return null; }
  };

  const convertToJSDate = (dateValue: DateValue | null): Date | undefined => {
    if (!dateValue) return undefined;
    try { return dateValue.toDate(getLocalTimeZone()); } catch (e) { console.error("Error converting DateValue to JS Date:", e); return undefined; }
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
    onDateRangeChange((!newRange.from && !newRange.to) ? undefined : newRange);
  };

  const plannedCityIdsInMainPlan = useMemo(() => new Set(plannedItems.filter(item => item.type === 'city').map(item => item.data.id)), [plannedItems]);
  const citiesToDisplayAsBadges = useMemo(() => {
    const cityMap = new Map<string, City>();
    stagedCities.forEach(city => cityMap.set(city.id, city));
    plannedItems.forEach(item => { if (item.type === 'city' && !cityMap.has(item.data.id)) cityMap.set(item.data.id, item.data as City); });
    return Array.from(cityMap.values());
  }, [stagedCities, plannedItems]);

  const saveButtonTextKey = currentLoadedGoalId ? 'update_button' : 'save_button';

  const toggleFilter = <T extends string>(currentSelection: T[], item: T, setter: (newSelection: T[]) => void) => {
    const newSelection = currentSelection.includes(item) 
      ? currentSelection.filter(i => i !== item)
      : [...currentSelection, item];
    setter(newSelection);
  };

  const DateFieldsSection = () => (
    <div className={`p-4 border rounded-md ${CARD_BACKGROUND_CLASS} shadow-sm space-y-4 ${fonts.body.className}`}>
      <h3 className={`text-lg font-semibold ${fonts.subheading.className}`}>{isMobile ? t('select_dates') : t('selected_dates')}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DateFieldComponent labelClassName={fonts.subheading.className} className={fonts.body.className} label={t('start_date_label')} value={convertToDateValue(selectedDateRange?.from)} onChange={(dateValue) => handleDateFieldChange(dateValue, 'from')} />
        <DateFieldComponent labelClassName={fonts.subheading.className} className={fonts.body.className} label={t('end_date_label')} value={convertToDateValue(selectedDateRange?.to)} onChange={(dateValue) => handleDateFieldChange(dateValue, 'to')} />
      </div>
      {selectedDateRange && selectedDateRange.from && (
        <Button variant="outline" className={`w-full ${fonts.subheading.className}`} onClick={onDistributeDates}>{t('distribute_dates_to_cities_button')}</Button>
      )}
    </div>
  );

  return (
    <div className={`flex flex-col md:flex-row gap-6 ${BEIGE_BACKGROUND_CLASS} text-card-foreground p-4 rounded-lg shadow-xl ${fonts.body.className}`}>
      {!isMobile && (
        <div className={`md:w-1/2 space-y-6 p-1`}>
          <div className={`p-4 border rounded-md ${CARD_BACKGROUND_CLASS} shadow-sm`}>
            <h3 className={`text-lg font-semibold mb-4 text-center ${fonts.subheading.className}`}>{t('select_dates')}</h3>
            <PilgrimageCalendar selectedRange={selectedDateRange} onDateRangeChange={onDateRangeChange} locale={currentLocale} className={fonts.body.className} headerClassName={fonts.subheading.className}/>
          </div>
          <DateFieldsSection />
        </div>
      )}

      <div className={`space-y-6 ${isMobile ? 'w-full' : 'md:w-1/2'}`}>
        <h2 className={`text-xl font-semibold text-center mb-2 md:sr-only ${fonts.heading.className}`}>{t('pilgrimage_plan_settings_title')}</h2>
        
        {isMobile && <DateFieldsSection />}
        
        <div className={`p-4 border rounded-md ${CARD_BACKGROUND_CLASS} shadow-sm space-y-4`}>
          <h3 className={`text-lg font-semibold ${fonts.subheading.className}`}>{t('select_cities_to_plan')}</h3>
          <Select onValueChange={onCitySelect}>
            <SelectTrigger className={`w-full ${fonts.body.className}`}><SelectValue placeholder={t('select_a_city_to_stage')} /></SelectTrigger>
            <SelectContent className={fonts.body.className}>
              {availableCities.map((city) => {
                const isDisabled = stagedCities.some(sc => sc.id === city.id) || plannedCityIdsInMainPlan.has(city.id);
                return (
                  <SelectItem key={city.id} value={city.id || ''} disabled={isDisabled}>
                    {getLocalizedText(city.name, language)}
                    {plannedCityIdsInMainPlan.has(city.id) && !stagedCities.some(sc => sc.id === city.id) && <span className="ml-2 text-xs text-muted-foreground">({t('city_already_in_plan')})</span>}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {citiesToDisplayAsBadges.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className={`text-xs text-muted-foreground ${fonts.body.className}`}>{t('cities_staged_for_plan')}:</p> 
              <div className="flex flex-wrap gap-1">
                {citiesToDisplayAsBadges.map(city => (
                  <Badge key={city.id} variant="secondary" className={`flex items-center px-3 py-1.5 rounded-md ${fonts.body.className}`}>
                    {getLocalizedText(city.name, language)}
                    {stagedCities.some(sc => sc.id === city.id) && (
                      <Button variant="ghost" size="icon" className="h-5 w-5 ml-1.5 rounded-full hover:bg-destructive/20" onClick={() => onRemoveStagedCity(city.id)}><X size={14} className="text-destructive"/></Button>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {stagedCities.length > 0 && (<Button className={`w-full ${ORANGE_BUTTON_CLASS} ${fonts.subheading.className}`} onClick={onAddStagedCities}>{t('add_selected_cities_to_plan_button')}</Button>)}
        </div>

        {/* Item Filters Section - Using Buttons with Icons */}
        <div className={`p-4 border rounded-md ${CARD_BACKGROUND_CLASS} shadow-sm space-y-4`}>
          <h3 className={`text-lg font-semibold ${fonts.subheading.className}`}>{t('pilgrimage_filters_title')}</h3>
          <div className="space-y-3">
            <div>
              <Label className={`mb-2 block font-medium ${fonts.subheading.className}`}>{t('filter_place_subtypes_label')}</Label>
              <div className="flex flex-wrap gap-2">
                {PLACE_SUBTYPES_OPTIONS.map(opt => (
                  <Button 
                    key={opt.value} 
                    variant={selectedPlaceSubtypes.includes(opt.value) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleFilter(selectedPlaceSubtypes, opt.value, onSelectedPlaceSubtypesChange)}
                    className={`text-xs ${fonts.body.className}`}
                  >
                    <opt.Icon className="mr-1.5 h-4 w-4" />
                    {t(opt.labelKey)}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label className={`mb-2 block font-medium ${fonts.subheading.className}`}>{t('filter_event_subtypes_label')}</Label>
              <div className="flex flex-wrap gap-2">
                {EVENT_SUBTYPES_OPTIONS.map(opt => (
                  <Button 
                    key={opt.value} 
                    variant={selectedEventSubtypes.includes(opt.value) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleFilter(selectedEventSubtypes, opt.value, onSelectedEventSubtypesChange)}
                    className={`text-xs ${fonts.body.className}`}
                  >
                    <opt.Icon className="mr-1.5 h-4 w-4" />
                    {t(opt.labelKey)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <Button onClick={onAddFilteredItemsToPlan} className={`mt-4 w-full ${ORANGE_BUTTON_CLASS} ${fonts.subheading.className}`}>{t('add_filtered_to_plan_button')}</Button>
        </div>
        
        <div className={`p-4 border rounded-md ${CARD_BACKGROUND_CLASS} shadow-sm space-y-4`}>
          <h3 className={`text-lg font-semibold ${fonts.subheading.className}`}>{t('actions')}</h3>
          <div><Button variant="outline" className={`w-full ${fonts.subheading.className}`} onClick={onAddFavoritesToPlan}>{t('find_from_favorites')}</Button></div>
          
          <div className="space-y-2">
            <Label htmlFor="goalNameInput" className={`block text-sm font-medium ${fonts.subheading.className}`}>{t('goal_name_placeholder')}</Label>
            <Input id="goalNameInput" placeholder={t('goal_name_placeholder')} value={goalNameValue} onChange={(e) => onGoalNameChange(e.target.value)} className={fonts.body.className}/>
            <div className="flex gap-2 mt-2">
                <Button className={`flex-1 ${ORANGE_BUTTON_CLASS} ${fonts.subheading.className}`} onClick={() => onSaveOrUpdateGoal(goalNameValue)} disabled={!goalNameValue.trim() && !currentLoadedGoalId}>{t(saveButtonTextKey)}</Button>
                <Button variant="outline" onClick={onClearPlan} className={`flex-1 border-destructive text-destructive hover:bg-destructive/10 ${fonts.subheading.className}`}>
                    <RotateCcw size={16} className="mr-2" />
                    {t('clear_plan_button')}
                </Button>
            </div>
          </div>

          {savedGoals && savedGoals.length > 0 && (
              <div>
                  <h4 className={`text-md font-medium mb-2 ${fonts.subheading.className}`}>{t('saved_goals')}</h4>
                  <div className="flex flex-wrap gap-2">
                  {savedGoals.map(goal => (
                      <div key={goal.id} className="flex items-center">
                        <Button variant="outline" size="sm" onClick={() => onLoadGoal(goal.id)} className={`rounded-r-none ${fonts.body.className}`}>{goal.title}</Button>
                        <Button variant="destructive" size="sm" onClick={() => onDeleteGoal(goal.id)} className={`px-2 rounded-l-none ${fonts.body.className}`} aria-label={t('delete_goal_label', { goalName: goal.title })}><X size={16} /></Button>
                      </div>
                  ))}
                  </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
