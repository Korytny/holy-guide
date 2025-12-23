import React from 'react';
import { Language, City, EventType, EventCulture } from '../../types';
import { type DateRange } from 'react-day-picker';
import { PilgrimageCalendar } from './PilgrimageCalendar';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
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
} from '@internationalized/date';
import type { DateValue } from '@internationalized/date';
import { Checkbox } from "@/components/ui/checkbox";
import { getLocalizedText } from '../../utils/languageUtils';
import { X, PartyPopper, Zap, Leaf, Eye, Sparkles, BookOpenText, Users, Church, Star, MoonStar, Handshake, Cross, Cog } from 'lucide-react';
import useMediaQuery from '@/hooks/use-mobile';

const OmIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    stroke="currentColor" 
    strokeWidth="0.5" 
    className="h-4 w-4 mr-1.5"
  >
    <circle cx="12" cy="12" r="2" fill="currentColor"/>
    <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor"/>
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
  { value: "guru_festival", labelKey: "event_type_guru_festival", Icon: Star },
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
  onDistributeDates?: () => void; 
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
  isLoadingCities?: boolean;
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
  onDistributeDates,
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
  isLoadingCities,
}) => {
  const currentLocale = dateFnsLocales[language] || enUS;
  const isMobile = useMediaQuery('(max-width: 768px)');

  const convertToDateValue = (date: Date | undefined | null): DateValue | null => {
    if (!date) return null;
    try { return parseDate(format(date, 'yyyy-MM-dd')); }
    catch (e) { console.error("Error parsing date for DateValue:", e); return null; }
  };

  const convertToJSDate = (dateValue: DateValue | null): Date | undefined => {
    if (!dateValue) return undefined;
    try {
      // Use toDate() without timezone parameter - it will use system default
      // This avoids the "Invalid time zone specified: null" error
      return dateValue.toDate();
    }
    catch (e) {
      console.error("Error converting DateValue to JS Date:", e);
      return undefined;
    }
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
  const [showPlanNameInput, setShowPlanNameInput] = React.useState(false);

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Date Inputs - Only on mobile now */}
      {isMobile && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
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
      )}

      {/* Wrapper for Calendar and Filters/Actions to enable side-by-side on xl screens */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Calendar and Date Inputs (for non-mobile) */}
        {!isMobile && (
          <div className="bg-white p-4 rounded-lg shadow-lg space-y-4"> {/* Changed shadow-sm to shadow-lg, removed border */}
            <div> 
              <h3 className={`text-lg font-semibold mb-4 ${fonts.subheading.className}`}>
                {t('select_event_dates', {defaultValue: 'Select Event Dates'})}
              </h3>
              <PilgrimageCalendar 
                selectedRange={selectedDateRange} 
                onDateRangeChange={onDateRangeChange}
                locale={currentLocale}
                highlightedDates={eventDatesForCalendar}
                className={fonts.body.className}
                headerClassName={fonts.subheading.className}
              />
            </div>
            {/* Date Inputs for non-mobile, below calendar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
              <div> 
                <DateFieldComponent
                  label={t('start_date_label')}
                  value={convertToDateValue(selectedDateRange?.from)}
                  onChange={(dateValue) => handleDateFieldChange(dateValue, 'from')}
                  className={fonts.body.className}
                  labelClassName={fonts.subheading.className}
                />
              </div>
              <div> 
                <DateFieldComponent
                  label={t('end_date_label')}
                  value={convertToDateValue(selectedDateRange?.to)}
                  onChange={(dateValue) => handleDateFieldChange(dateValue, 'to')}
                  className={fonts.body.className}
                  labelClassName={fonts.subheading.className}
                />
              </div>
            </div>
            {/* Buttons below date fields, with a divider above them */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pt-4 border-t">
              <div>
                {onDistributeDates && (
                  <Button
                    variant="outline"
                    size="lg" 
                    onClick={onDistributeDates} 
                    className={`w-full ${fonts.body.className}`}
                  >
                    {t('distribute_dates_evenly_button', {defaultValue: 'Распределить даты равномерно'})}
                  </Button>
                )}
              </div>
              <div>
                <Button 
                  variant="outline"
                  size="lg"
                  onClick={() => onDateRangeChange(undefined)} 
                  className={`w-full ${fonts.body.className}`}
                >
                  {t('clear_date_range_button', {defaultValue: 'Не ограничивать период'})}
                </Button>
              </div>
            </div>
          </div>
        )} 

        {/* Filters and Actions */}
        <div className="rounded-lg p-4 bg-white space-y-4 flex flex-col shadow-lg"> {/* Added rounded-lg, shadow-lg, removed border and rounded-md */}
          <div className="space-y-4"> 
            <div className="flex justify-between items-center">
              <h3 className={`text-lg font-semibold ${fonts.subheading.className}`}>
                {t('place_and_format', {defaultValue: 'Place and Format'})}
              </h3>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="hasTranslationFilter"
                  checked={hasTranslation === true}
                  onCheckedChange={(checked) => {
                    onHasTranslationChange(checked === true ? true : undefined);
                  }}
                />
                <label htmlFor="hasTranslationFilter" className={`text-sm font-medium text-gray-700 ${fonts.body.className}`}>
                  {t('filter_has_translation', {defaultValue: 'Has Online Translation'})}
                </label>
              </div>
            </div>

            <div>
              {isMobile ? (
                <Carousel
                  opts={{
                    align: "start",
                    loop: false,
                    dragFree: true,
                  }}
                  className="w-full"
                >
                  <CarouselContent className="-ml-1 py-1">
                    {availableCities
                      .slice()
                      .sort((a, b) => {
                        const nameA = getLocalizedText(a.name, language);
                        const nameB = getLocalizedText(b.name, language);
                        return nameA.localeCompare(nameB, language);
                      })
                      .map(city => (
                      <CarouselItem key={city.id} className="pl-1 basis-auto">
                        <ToggleGroup 
                          type="multiple" 
                          value={selectedCityIds}
                          onValueChange={() => {}} 
                          className="m-0 p-0"
                        >
                          <ToggleGroupItem 
                            value={city.id}
                            variant="outline"
                            onClick={() => toggleFilter(selectedCityIds, city.id, onSelectedCityIdsChange)}
                            className={`px-3 py-1.5 text-sm ${fonts.body.className} ${
                              selectedCityIds.includes(city.id)
                              ? 'bg-primary text-primary-foreground hover:bg-primary/90 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground'
                              : ''
                            }`}
                          >
                            {getLocalizedText(city.name, language)}
                          </ToggleGroupItem>
                        </ToggleGroup>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="absolute -left-4 sm:-left-5 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background border-slate-300 disabled:opacity-30 h-8 w-8 sm:h-10 sm:w-10" />
                  <CarouselNext className="absolute -right-4 sm:-right-5 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background border-slate-300 disabled:opacity-30 h-8 w-8 sm:h-10 sm:w-10" />
                </Carousel>
              ) : (
                <ToggleGroup 
                  type="multiple" 
                  className="flex-wrap justify-start gap-2"
                  value={selectedCityIds}
                  onValueChange={(value) => onSelectedCityIdsChange(value)}
                >
                  {availableCities
                    .slice()
                    .sort((a, b) => {
                      const nameA = getLocalizedText(a.name, language);
                      const nameB = getLocalizedText(b.name, language);
                      return nameA.localeCompare(nameB, language);
                    })
                    .map(city => (
                    <ToggleGroupItem 
                      key={city.id} 
                      value={city.id}
                      variant="outline"
                      className={`px-3 py-1.5 text-sm ${fonts.body.className} ${ 
                        selectedCityIds.includes(city.id)
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground'
                        : ''
                      }`}
                    >
                      {getLocalizedText(city.name, language)}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-1 ${fonts.subheading.className}`}>
                {t('filter_by_event_type', {defaultValue: 'Event Type'})}
              </label>
              {isMobile ? (
                <Carousel opts={{ align: "start", loop: false, dragFree: true }} className="w-full">
                  <CarouselContent className="-ml-1 py-1">
                    {eventTypeOptions.map(opt => (
                      <CarouselItem key={opt.value} className="pl-1 basis-auto">
                        <Button 
                          variant={selectedEventTypes.includes(opt.value) ? 'default' : 'outline'}
                          size="sm" // Keep size consistent, or adjust as needed for carousel
                          onClick={() => toggleFilter(selectedEventTypes, opt.value, onSelectedEventTypesChange)}
                          className={`text-xs px-3 py-1.5 ${fonts.body.className}`} // Ensure decent touch area
                        >
                          {opt.Icon && <opt.Icon className="mr-1.5 h-4 w-4" />}
                          {t(opt.labelKey, {defaultValue: opt.value})}
                        </Button>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="absolute -left-4 sm:-left-5 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background border-slate-300 disabled:opacity-30 h-8 w-8" />
                  <CarouselNext className="absolute -right-4 sm:-right-5 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background border-slate-300 disabled:opacity-30 h-8 w-8" />
                </Carousel>
              ) : (
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
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium text-gray-700 mb-1 ${fonts.subheading.className}`}>
                {t('filter_by_culture', {defaultValue: 'Culture'})}
              </label>
              {isMobile ? (
                <Carousel opts={{ align: "start", loop: false, dragFree: true }} className="w-full">
                  <CarouselContent className="-ml-1 py-1">
                    {eventCultureOptions.map(opt => (
                      <CarouselItem key={opt.value} className="pl-1 basis-auto">
                        <Button 
                          variant={selectedCultures.includes(opt.value) ? 'default' : 'outline'}
                          size="sm" // Keep size consistent
                          onClick={() => toggleFilter(selectedCultures, opt.value, onSelectedCulturesChange)}
                          className={`text-xs px-3 py-1.5 ${fonts.body.className}`} // Ensure decent touch area
                        >
                          {opt.Icon && <opt.Icon />} 
                          {t(opt.labelKey, {defaultValue: opt.value})}
                        </Button>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="absolute -left-4 sm:-left-5 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background border-slate-300 disabled:opacity-30 h-8 w-8" />
                  <CarouselNext className="absolute -right-4 sm:-right-5 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background border-slate-300 disabled:opacity-30 h-8 w-8" />
                </Carousel>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {eventCultureOptions.map(opt => (
                    <Button 
                      key={opt.value} 
                      variant={selectedCultures.includes(opt.value) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleFilter(selectedCultures, opt.value, onSelectedCulturesChange)}
                      className={`text-xs ${fonts.body.className}`}
                    >
                      {opt.Icon && <opt.Icon />}
                      {t(opt.labelKey, {defaultValue: opt.value})}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons - Pushed to bottom */}
          <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t mt-auto">
            <Button 
              size="lg"
              className={`w-full bg-saffron hover:bg-saffron/90 text-white ${fonts.subheading.className}`}
              onClick={onAddFilteredEventsToPlan}
              disabled={isLoadingCities}
            >
              {isLoadingCities ? t('loading_short_button_text', { defaultValue: 'Loading...' }) : t('add_filtered_events_to_plan_button')}
            </Button>

            { (currentLoadedGuruPlanId || showPlanNameInput) ? (
              <div className="w-full flex flex-col gap-2">
                <Input
                  placeholder={t('guru_plan_name_placeholder', {defaultValue: 'Enter plan name...'})}
                  value={guruPlanNameValue}
                  onChange={(e) => onGuruPlanNameChange(e.target.value)}
                  className={`text-sm ${fonts.body.className}`}
                />
                <Button 
                  size="lg"
                  variant="outline"
                  className={`w-full ${fonts.subheading.className}`}
                  onClick={() => {
                    onSaveOrUpdateGuruPlan(guruPlanNameValue);
                    if (showPlanNameInput && !currentLoadedGuruPlanId) {
                      setShowPlanNameInput(false);
                    }
                  }}
                >
                  {saveButtonText}
                </Button>
              </div>
            ) : (
              <Button 
                size="lg" 
                variant="outline"
                className={`w-full ${fonts.subheading.className}`}
                onClick={() => setShowPlanNameInput(true)}
              >
                {saveButtonText}
              </Button>
            )}

            <Button 
              size="lg" 
              variant="outline" 
              className={`w-full ${fonts.subheading.className}`} 
              onClick={onAddFavoritesToPlan}
            >
              {t('add_favorite_events_to_plan_button')}
            </Button>
          </div>

          {/* Saved Plans Section */}
          {savedGuruPlans && savedGuruPlans.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex flex-wrap justify-start gap-2">
                {savedGuruPlans.map(plan => (
                  <div key={plan.id} className="flex items-center">
                    <Button variant="outline" size="sm" onClick={() => onLoadGuruPlan(plan.id)} className={`text-xs rounded-r-none px-2 py-1 h-auto ${fonts.body.className}`}>{plan.title}</Button>
                    <Button variant="destructive" size="sm" onClick={() => onDeleteGuruPlan(plan.id)} className="text-xs px-1 py-1 h-auto rounded-l-none" aria-label={t('delete_guru_plan_label', { planName: plan.title })}><X size={14} /></Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div> {/* This closes the "Filters and Actions" div */}
      </div> {/* This closes the "xl:grid-cols-2" wrapper */}
    </div> 
  );
};
