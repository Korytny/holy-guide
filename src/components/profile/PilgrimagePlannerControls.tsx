import React, { useMemo, useState } from 'react';
import { Language, City, PlannedItem } from '../../types';
import { type DateRange } from 'react-day-picker';
import { SimpleDateSelector } from './SimpleDateSelector';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"; // Added Carousel imports
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
import { Label } from "@/components/ui/label";
import useMobile from '../../hooks/use-mobile';
import { useFont } from '@/context/FontContext';
// Removed FontSwitcher import
export type PlaceSubtype = 'temple' | 'samadhi' | 'kunda' | 'sacred_site'; 
export type EventSubtype = 'festival' | 'practice' | 'retreat' | 'vipassana' | 'puja' | 'lecture' | 'guru_festival';

export const PLACE_SUBTYPES_OPTIONS: { value: PlaceSubtype; labelKey: string; Icon: React.ElementType }[] = [
  { value: 'temple', labelKey: 'place_type_temple', Icon: Church },
  { value: 'samadhi', labelKey: 'place_type_samadhi', Icon: Archive },
  { value: 'kunda', labelKey: 'place_type_kunda', Icon: Waves },
  { value: 'sacred_site', labelKey: 'place_type_sacred_site', Icon: Sparkles },
];

const EVENT_SUBTYPES_OPTIONS: { value: EventSubtype; labelKey: string; Icon: React.ElementType }[] = [
  { value: "festival", labelKey: "event_type_festival", Icon: PartyPopper },
  { value: "practice", labelKey: "event_type_practice", Icon: Zap },
  { value: "retreat", labelKey: "event_type_retreat", Icon: MountainSnow },
  { value: "vipassana", labelKey: "event_type_vipassana", Icon: Eye },
  { value: "lecture", labelKey: "event_type_lecture", Icon: BookOpenText },
  { value: "puja", labelKey: "event_type_puja", Icon: Flame },
  { value: "guru_festival", labelKey: "event_type_guru_festival", Icon: Flame },
];


interface PilgrimagePlannerControlsProps {
  availableCities: City[];
  filterSelectedCityIds: string[]; 
  onFilterSelectedCityIdsChange: (ids: string[]) => void; 
  plannedItems: PlannedItem[];
  selectedDateRange?: DateRange;
  language: Language;
  t: (key: string, params?: object) => string;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onAddFavoritesToPlan: () => void;
  onDistributeDates: () => void;
  goalNameValue: string;
  onGoalNameChange: (name: string) => void;
  currentLoadedGoalId: string | null;
  onSaveOrUpdateGoal: (name: string) => void;
  onLoadGoal: (goalId: string) => void;
  onDeleteGoal: (goalId: string) => void; 
  savedGoals: Array<{ id: string; title: string; created_at: string; }>;
  selectedPlaceSubtypes: PlaceSubtype[];
  selectedEventSubtypes: EventSubtype[];
  onSelectedPlaceSubtypesChange: (subtypes: PlaceSubtype[]) => void;
  onSelectedEventSubtypesChange: (subtypes: EventSubtype[]) => void;
  onAddFilteredItemsToPlan: () => void;
  onClearPlan: () => void;
  isLoadingData?: boolean; 
}

const ORANGE_BUTTON_CLASS = "bg-saffron hover:bg-saffron/90 text-white"; 
const BEIGE_BACKGROUND_CLASS = "bg-orange-50";
const CARD_BACKGROUND_CLASS = 'bg-card'; 

export const PilgrimagePlannerControls: React.FC<PilgrimagePlannerControlsProps> = ({
  availableCities,
  filterSelectedCityIds = [], 
  onFilterSelectedCityIdsChange, 
  plannedItems,
  selectedDateRange,
  language,
  t,
  onDateRangeChange,
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
  isLoadingData,
}) => {
  const isMobile = useMobile();
  const { fonts } = useFont();
  const [showPlanNameInput, setShowPlanNameInput] = React.useState(false);

  const plannedCityIdsInMainPlan = useMemo(() => new Set(plannedItems.filter(item => item.type === 'city').map(item => item.data.id)), [plannedItems]);
  const saveButtonTextKey = currentLoadedGoalId ? 'update_button' : 'save_button';

  const toggleFilter = <T extends string>(currentSelection: T[], item: T, setter: (newSelection: T[]) => void) => {
    const newSelection = currentSelection.includes(item) 
      ? currentSelection.filter(i => i !== item)
      : [...currentSelection, item];
    setter(newSelection);
  };

  const SimpleDateSection = () => (
    <div className={`p-4 rounded-lg ${CARD_BACKGROUND_CLASS} shadow-lg space-y-4 ${fonts.body.className}`}>
      <h3 className={`text-lg font-semibold ${fonts.subheading.className}`}>{t('select_dates')}</h3>
      <SimpleDateSelector
        selectedDateRange={selectedDateRange}
        onDateRangeChange={onDateRangeChange}
      />
      {selectedDateRange && selectedDateRange.from && (
        <Button 
          variant="outline" 
          className={`w-full ${fonts.subheading.className}`}
          onClick={() => {
            try {
              if (!selectedDateRange?.from || !selectedDateRange?.to) {
                console.error('Invalid date range');
                return;
              }
              if (!plannedItems.length) {
                console.error('No items to distribute dates');
                return;
              }
              onDistributeDates();
            } catch (error) {
              console.error('Error distributing dates:', error);
            }
          }}
        >
          {t('distribute_dates_to_cities_button')}
        </Button>
      )}
    </div>
  );

  return (
    <div className={`flex flex-col ${BEIGE_BACKGROUND_CLASS} text-card-foreground rounded-lg shadow-xl ${fonts.body.className}`}> {/* Changed to flex-col for vertical layout */}
      {/* Date Selection Section - Always on top */}
      <SimpleDateSection />

      {/* Filters and Actions Section - Below calendar */}
      <div className={`space-y-6`}>
        
        <div className={`p-4 rounded-lg ${CARD_BACKGROUND_CLASS} shadow-lg space-y-4`}>
          <div>
            <h3 className={`text-lg font-semibold ${fonts.subheading.className}`}>{t('select_cities_to_plan')}</h3>
            <div className="mb-2 mt-2"> 
            {isMobile ? (
              <Carousel opts={{ align: "start", loop: false, dragFree: true }} className="w-full">
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
                      <ToggleGroup type="multiple" value={filterSelectedCityIds} onValueChange={() => {}} className="m-0 p-0">
                        <ToggleGroupItem
                          value={city.id}
                          onClick={() => toggleFilter(filterSelectedCityIds, city.id, onFilterSelectedCityIdsChange)}
                          variant="outline"
                          className={`px-3 py-1.5 text-sm ${fonts.body.className} ${
                            filterSelectedCityIds.includes(city.id)
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground' 
                            : 'border-input bg-transparent hover:bg-accent hover:text-accent-foreground'
                          }`}
                        >
                          {getLocalizedText(city.name, language)}
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background border-slate-300 disabled:opacity-30 h-8 w-8" />
                <CarouselNext className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background border-slate-300 disabled:opacity-30 h-8 w-8" />
              </Carousel>
            ) : (
              <ToggleGroup
                type="multiple"
                className="flex-wrap justify-start gap-1" 
                value={filterSelectedCityIds} 
                onValueChange={onFilterSelectedCityIdsChange} 
              >
                {availableCities
                  .slice()
                  .sort((a, b) => {
                    const nameA = getLocalizedText(a.name, language);
                    const nameB = getLocalizedText(b.name, language);
                    return nameA.localeCompare(nameB, language);
                  })
                  .map(city => {
                    const isSelected = filterSelectedCityIds.includes(city.id);
                    return (
                      <ToggleGroupItem
                        key={city.id}
                        value={city.id}
                        variant="outline"
                        className={`px-2 py-1 text-sm ${fonts.body.className} ${
                          isSelected 
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground' 
                          : 'border-input bg-transparent hover:bg-accent hover:text-accent-foreground'
                        }`}
                      >
                        {getLocalizedText(city.name, language)}
                      </ToggleGroupItem>
                    );
                })}
              </ToggleGroup>
            )}
            </div>
          </div>

          <div className="space-y-3 pt-2"> 
            <div>
              <Label className={`mb-2 block font-medium ${fonts.subheading.className}`}>{t('filter_place_subtypes_label')}</Label>
              {isMobile ? (
                <Carousel opts={{ align: "start", loop: false, dragFree: true }} className="w-full">
                  <CarouselContent className="-ml-1 py-1">
                    {PLACE_SUBTYPES_OPTIONS.map(opt => (
                      <CarouselItem key={opt.value} className="pl-1 basis-auto">
                        <Button 
                          variant={selectedPlaceSubtypes.includes(opt.value) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => toggleFilter(selectedPlaceSubtypes, opt.value, onSelectedPlaceSubtypesChange)}
                          className={`text-xs px-3 py-1.5 ${fonts.body.className}`}
                        >
                          <opt.Icon className="mr-1.5 h-4 w-4" />
                          {t(opt.labelKey)}
                        </Button>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background border-slate-300 disabled:opacity-30 h-8 w-8" />
                  <CarouselNext className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background border-slate-300 disabled:opacity-30 h-8 w-8" />
                </Carousel>
              ) : (
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
              )}
            </div>
            <div>
              <Label className={`mb-2 block font-medium ${fonts.subheading.className}`}>{t('filter_event_subtypes_label')}</Label>
              {isMobile ? (
                <Carousel opts={{ align: "start", loop: false, dragFree: true }} className="w-full">
                  <CarouselContent className="-ml-1 py-1">
                    {EVENT_SUBTYPES_OPTIONS.map(opt => (
                      <CarouselItem key={opt.value} className="pl-1 basis-auto">
                        <Button 
                          variant={selectedEventSubtypes.includes(opt.value) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => toggleFilter(selectedEventSubtypes, opt.value, onSelectedEventSubtypesChange)}
                          className={`text-xs px-3 py-1.5 ${fonts.body.className}`}
                        >
                          <opt.Icon className="mr-1.5 h-4 w-4" />
                          {t(opt.labelKey)}
                        </Button>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background border-slate-300 disabled:opacity-30 h-8 w-8" />
                  <CarouselNext className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background border-slate-300 disabled:opacity-30 h-8 w-8" />
                </Carousel>
              ) : (
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
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:gap-2 pt-4 mt-auto border-t">
            <Button 
              size="lg" 
              onClick={onAddFilteredItemsToPlan} 
              className={`w-full sm:w-1/4 ${ORANGE_BUTTON_CLASS} ${fonts.subheading.className} mt-2 sm:mt-0`}
              disabled={isLoadingData}
            >
              {isLoadingData ? t('loading_short_button_text', { defaultValue: 'Loading...' }) : t('add_filtered_to_plan_button')}
            </Button>

            { (currentLoadedGoalId || showPlanNameInput) ? (
              <div className="w-full sm:w-1/4 flex flex-col gap-2 mt-2 sm:mt-0">
                <Label htmlFor="goalNameInputPilgrimage" className="sr-only">{t('goal_name_placeholder')}</Label>
                <Input
                  id="goalNameInputPilgrimage"
                  placeholder={t('goal_name_placeholder')}
                  value={goalNameValue}
                  onChange={(e) => onGoalNameChange(e.target.value)}
                  className={`${fonts.body.className} text-sm`}
                />
                <Button 
                  size="lg"
                  variant="outline"
                  className={`w-full ${fonts.subheading.className}`}
                  onClick={() => {
                      onSaveOrUpdateGoal(goalNameValue);
                      if (showPlanNameInput && !currentLoadedGoalId) { 
                          setShowPlanNameInput(false); 
                      }
                  }}
                  disabled={!goalNameValue.trim()}
                >
                  {t(saveButtonTextKey)}
                </Button>
              </div>
            ) : (
              <Button 
                size="lg" 
                variant="outline"
                className={`w-full sm:w-1/4 mt-2 sm:mt-0 ${fonts.subheading.className}`}
                onClick={() => setShowPlanNameInput(true)} 
              >
                {t(saveButtonTextKey)}
              </Button>
            )}
            
            <Button 
              size="lg" 
              variant="outline" 
              className={`w-full sm:w-1/4 ${fonts.subheading.className} mt-2 sm:mt-0`} 
              onClick={onAddFavoritesToPlan}
            >
              {t('find_from_favorites')}
            </Button>

            <Button 
              size="lg"
              variant="outline" 
              onClick={onClearPlan} 
              className={`w-full sm:w-1/4 border-destructive text-destructive hover:bg-destructive/10 ${fonts.subheading.className} mt-2 sm:mt-0`}
            >
                {t('clear_short_button_text', {defaultValue: 'Clear'})}
            </Button>
          </div>

          {savedGoals && savedGoals.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="mb-4">
                  <h4 className={`text-md font-medium mb-2 ${fonts.subheading.className}`}>{t('saved_goals')}</h4>
                  <div className="flex flex-wrap justify-start gap-2">
                  {savedGoals.map(goal => (
                      <div key={goal.id} className="flex items-center">
                        <Button variant="outline" size="sm" onClick={() => onLoadGoal(goal.id)} className={`rounded-r-none px-2 py-1 h-auto ${fonts.body.className}`}>{goal.title}</Button>
                        <Button variant="destructive" size="sm" onClick={() => onDeleteGoal(goal.id)} className={`px-1 py-1 h-auto rounded-l-none`} aria-label={t('delete_goal_label', { goalName: goal.title })}><X size={14} /></Button>
                      </div>
                  ))}
                  </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
