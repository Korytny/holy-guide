import React, { useMemo, useState } from 'react';
import { Language, City, PlannedItem } from '@/types';
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
import { getLocalizedText } from '@/utils/languageUtils';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useMobile from '@/hooks/use-mobile';
import { useFont } from '@/context/FontContext';
// Removed FontSwitcher import
export type PlaceSubtype = 'temple' | 'samadhi' | 'kunda' | 'sacred_site';
export type EventSubtype = 'festival' | 'practice' | 'retreat' | 'vipassana' | 'puja' | 'lecture' | 'guru_festival' | 'visit';

export const PLACE_SUBTYPES_OPTIONS: { value: PlaceSubtype; labelKey: string; Icon: React.ElementType }[] = [
  { value: 'temple', labelKey: 'place_type_temple', Icon: Church },
  { value: 'samadhi', labelKey: 'place_type_samadhi', Icon: Archive },
  { value: 'kunda', labelKey: 'place_type_kunda', Icon: Waves },
  { value: 'sacred_site', labelKey: 'place_type_sacred_site', Icon: Sparkles },
];

const EVENT_SUBTYPES_OPTIONS: { value: EventSubtype; labelKey: string; Icon: React.ElementType }[] = [
  { value: "festival", labelKey: "event_type_festival", Icon: PartyPopper },
  { value: "practice", labelKey: "event_type_practice", Icon: Zap },
  { value: "visit", labelKey: "event_type_visit", Icon: Eye },
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
  savedGoals: Array<{
  id: string;
  title: string;
  created_at: string;
  cities?: string;
  places?: string;
  events?: string;
  planned_items?: string;
}>;
  selectedPlaceSubtypes: PlaceSubtype[];
  selectedEventSubtypes: EventSubtype[];
  onSelectedPlaceSubtypesChange: (subtypes: PlaceSubtype[]) => void;
  onSelectedEventSubtypesChange: (value: any[]) => void;
  onSearch: () => void;
  onResetFilters: () => void;
    onFullReset: () => void;
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
    onSearch,
    onResetFilters,
    onFullReset, // new prop
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
  
    // Функция для подсчета городов и объектов в цели
    const getGoalStats = (goal: typeof savedGoals[0]) => {
      let citiesCount = 0;
      let placesCount = 0;
      let routesCount = 0;
      let eventsCount = 0;

      // Основной источник данных - planned_items
      if (goal.planned_items) {
        try {
          let items;
          if (typeof goal.planned_items === 'string') {
            items = JSON.parse(goal.planned_items);
          } else {
            items = goal.planned_items;
          }

          if (Array.isArray(items)) {
            citiesCount = items.filter(item => item.type === 'city').length;
            placesCount = items.filter(item => item.type === 'place').length;
            routesCount = items.filter(item => item.type === 'route').length;
            eventsCount = items.filter(item => item.type === 'event').length;
          }
        } catch (e) {
          console.error('Error parsing planned_items JSON:', e);
        }
      } else {
        // Fallback для старого формата (если вдруг есть)
        if (goal.cities) {
          try {
            if (typeof goal.cities === 'string') {
              const cities = JSON.parse(goal.cities);
              citiesCount = cities.length;
            } else if (Array.isArray(goal.cities)) {
              citiesCount = goal.cities.length;
            }
          } catch (e) {
            console.error('Error parsing cities JSON:', e);
          }
        }

        if (goal.places) {
          try {
            if (typeof goal.places === 'string') {
              const places = JSON.parse(goal.places);
              placesCount = places.length;
            } else if (Array.isArray(goal.places)) {
              placesCount = goal.places.length;
            }
          } catch (e) {
            console.error('Error parsing places JSON:', e);
          }
        }

        if (goal.routes) {
          try {
            const routes = JSON.parse(goal.routes);
            routesCount = routes.length;
          } catch (e) {
            console.error('Error parsing routes JSON:', e);
          }
        }
      }

          return { cities: citiesCount, places: placesCount, routes: routesCount, events: eventsCount };
        };
      
        const SimpleDateSection = () => (
          <div className={`space-y-2 ${fonts.body.className}`}>
            <h3 className={`text-lg font-semibold ${fonts.subheading.className}`}>{t('search_by_criteria')}</h3>
            <SimpleDateSelector
              selectedDateRange={selectedDateRange}
              onDateRangeChange={onDateRangeChange}
              t={t}
            />
          </div>
        );
      
        return (
          <div className={`flex flex-col h-full p-3 ${BEIGE_BACKGROUND_CLASS} text-card-foreground rounded-lg shadow-xl ${fonts.body.className}`}>
            {/* All sections in flex layout that fills entire height with scrolling */}
            <div className="flex flex-col h-full">
              {/* Scrollable content area */}
              <div className="flex-1 overflow-y-auto space-y-3">
                {/* Date Selection Section */}
                <div className="flex-shrink-0">
                  <SimpleDateSection />
                </div>
      
                {/* Cities Selection Section */}
                <div className="flex-shrink-0">
                  <h3 className={`text-lg font-semibold ${fonts.subheading.className} mb-2`}>{t('select_cities_to_plan')}</h3>
                  <div>
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
      
                {/* Place Types Section */}
                <div className="flex-shrink-0">
                  <Label className={`mb-1 block font-medium ${fonts.subheading.className}`}>{t('filter_place_subtypes_label')}</Label>
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
                    <div className="flex flex-wrap gap-1">
                      {PLACE_SUBTYPES_OPTIONS.map(opt => (
                        <Button 
                          key={opt.value} 
                          variant={selectedPlaceSubtypes.includes(opt.value) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => toggleFilter(selectedPlaceSubtypes, opt.value, onSelectedPlaceSubtypesChange)}
                          className={`text-xs px-2 py-1 ${fonts.body.className}`}
                        >
                          <opt.Icon className="mr-1 h-3 w-3" />
                          {t(opt.labelKey)}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
      
                {/* Event Types Section */}
                <div className="flex-shrink-0">
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
      
                {/* Saved Goals Display Section */}
                {savedGoals.length > 0 && (
                  <div className="flex-shrink-0">
                    <h3 className={`text-lg font-semibold ${fonts.subheading.className} mb-2`}>
                      {t('saved_goals_title', { defaultValue: 'Сохраненные цели' })}
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {savedGoals.slice(0, 5).map((goal) => (
                        <div
                          key={goal.id}
                          className={`relative group flex items-center gap-1 px-2 py-1 rounded-md border cursor-pointer ${
                            currentLoadedGoalId === goal.id
                              ? 'bg-primary text-primary-foreground hover:bg-primary/90 border-primary'
                              : 'border-input bg-transparent hover:bg-accent hover:text-accent-foreground'
                          } ${fonts.body.className}`}
                          onClick={() => onLoadGoal(goal.id)}
                          tabIndex={0}
                          role="button"
                          aria-label={`Загрузить цель: ${goal.title}`}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              onLoadGoal(goal.id);
                            }
                          }}
                        >
                          <div className="flex flex-col min-w-0 text-center">
                            <span className="text-xs font-bold truncate">
                              {goal.title}
                            </span>
                            <div className="flex gap-2 text-xs text-muted-foreground">
                              <span>{getGoalStats(goal).cities}🏙️</span>
                              <span>{getGoalStats(goal).places}📍</span>
                              {getGoalStats(goal).routes > 0 && <span>{getGoalStats(goal).routes}🗺️</span>}
                              {getGoalStats(goal).events > 0 && <span>{getGoalStats(goal).events}🎉</span>}
                            </div>
                          </div>
                          <button
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-muted-foreground hover:text-destructive focus:opacity-100 focus:outline-none flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteGoal(goal.id);
                            }}
                            aria-label={`Удалить цель: ${goal.title}`}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}          </div>
  
          <div className="flex-shrink-0 pt-2 border-t border-black/10">
            <div className="space-y-2">
              <Button onClick={onSearch} className="w-full" disabled={isLoadingData}>
                {isLoadingData ? t('loading_short_button_text', { defaultValue: 'Loading...' }) : t('search_button', { defaultValue: 'Search' })}
              </Button>
              
              <div className="flex flex-col sm:flex-row sm:gap-1">
                { (currentLoadedGoalId || showPlanNameInput) ? (
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <Label htmlFor="goalNameInputPilgrimage" className="sr-only">{t('goal_name_placeholder')}</Label>
                    <Input
                      id="goalNameInputPilgrimage"
                      placeholder={t('goal_name_placeholder')}
                      value={goalNameValue}
                      onChange={(e) => onGoalNameChange(e.target.value)}
                      className={`${fonts.body.className} text-sm h-8`}
                    />
                    <Button 
                      size="sm"
                      variant="outline"
                      className={`flex-1 min-w-0 ${fonts.subheading.className} text-sm px-2`}
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
                    size="sm" 
                    variant="outline"
                    className={`flex-1 min-w-0 ${fonts.subheading.className} text-sm px-2`}
                    onClick={() => setShowPlanNameInput(true)} 
                  >
                    {t(saveButtonTextKey)}
                  </Button>
                )}
                
                <Button 
                  size="sm" 
                  variant="outline" 
                  className={`flex-1 min-w-0 ${fonts.subheading.className} text-sm px-2`} 
                  onClick={onAddFavoritesToPlan}
                >
                  {t('find_from_favorites')}
                </Button>
  
                <Button 
                  size="sm"
                  variant="outline" 
                  onClick={onFullReset} 
                  className={`flex-1 min-w-0 border-destructive text-destructive hover:bg-destructive/10 ${fonts.subheading.className} text-sm px-2`}
                >
                    {t('clear_short_button_text', {defaultValue: 'Clear'})}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
