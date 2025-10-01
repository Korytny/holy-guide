import React, { useMemo, useState, useEffect } from 'react';
import { Language, City, PlannedItem } from '../../types';
import { type DateRange } from 'react-day-picker';
import { PilgrimageCalendar } from './PilgrimageCalendar';
import { ToggleGroup, ToggleGroupItem } from "../../components/ui/toggle-group";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../components/ui/carousel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { 
    X, RotateCcw, 
    Church, Archive, Waves, Sparkles,
    PartyPopper, Zap, Eye, Leaf, BookOpenText, Flame, MountainSnow,
    MapPin, Calendar, Building, Star, Clock
} from 'lucide-react'; 
import { getLocalizedText } from '../../utils/languageUtils';
import { Input } from "../../components/ui/input";
import { format, addDays, addWeeks, addMonths } from 'date-fns';
import { enUS, ru, hi, type Locale as DateFnsLocale } from "date-fns/locale";
// import { DateFieldComponent } from '../../components/ui/date-field'; // Not used
import {
  parseDate,
  getLocalTimeZone,
} from '@internationalized/date';
import type { DateValue } from '@internationalized/date';
import { Label } from "../../components/ui/label";
import useMobile from '../../hooks/use-mobile';
import { useFont } from '../../context/FontContext';
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";

export type PlaceSubtype = 'temple' | 'samadhi' | 'kunda' | 'sacred_site'; 
export type EventSubtype = 'festival' | 'practice' | 'retreat' | 'vipassana' | 'puja' | 'lecture' | 'guru_festival';

export const PLACE_SUBTYPES_OPTIONS: { value: PlaceSubtype; labelKey: string; Icon: React.ElementType }[] = [
  { value: 'temple', labelKey: 'place_type_temple', Icon: Church },
  { value: 'samadhi', labelKey: 'place_type_samadhi', Icon: Archive },
  { value: 'kunda', labelKey: 'place_type_kunda', Icon: Waves },
  { value: 'sacred_site', labelKey: 'place_type_sacred_site', Icon: Sparkles },
];

export const EVENT_SUBTYPES_OPTIONS: { value: EventSubtype; labelKey: string; Icon: React.ElementType }[] = [
  { value: "festival", labelKey: "event_type_festival", Icon: PartyPopper },
  { value: "practice", labelKey: "event_type_practice", Icon: Zap },
  { value: "retreat", labelKey: "event_type_retreat", Icon: MountainSnow },
  { value: "vipassana", labelKey: "event_type_vipassana", Icon: Eye },
  { value: "puja", labelKey: "event_type_puja", Icon: Leaf },
  { value: "lecture", labelKey: "event_type_lecture", Icon: BookOpenText },
  { value: "guru_festival", labelKey: "event_type_guru_festival", Icon: Flame },
];

// Mock cities for demo
const mockCities = [
  { id: 'vrindavan', name: { en: 'Vrindavan', hi: 'वृन्दावन', ru: 'Вриндаван' }, items: 25, image: '🕍' },
  { id: 'mathura', name: { en: 'Mathura', hi: 'मथुरा', ru: 'Матура' }, items: 18, image: '🛕' },
  { id: 'varanasi', name: { en: 'Varanasi', hi: 'वाराणसी', ru: 'Варанаси' }, items: 32, image: '🏯' },
  { id: 'rishikesh', name: { en: 'Rishikesh', hi: 'ऋषिकेश', ru: 'Ришикеш' }, items: 15, image: '🧘' },
  { id: 'haridwar', name: { en: 'Haridwar', hi: 'हरिद्वार', ru: 'Хардвар' }, items: 12, image: '🌊' },
];

interface PilgrimagePlannerControlsProps {
  language: Language;
  t: (key: string, options?: { defaultValue?: string }) => string;
  selectedDateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  availableCities: City[];
  filterSelectedCityIds: string[];
  onFilterSelectedCityIdsChange: (ids: string[]) => void;
  selectedPlaceSubtypes: PlaceSubtype[];
  onSelectedPlaceSubtypesChange: (types: PlaceSubtype[]) => void;
  selectedEventSubtypes: EventSubtype[];
  onSelectedEventSubtypesChange: (types: EventSubtype[]) => void;
  onAddFavoritesToPlan: () => void;
  onClearPlan: () => void;
  onSaveOrUpdateGoal: (name: string) => void;
  plannedItems: PlannedItem[];
  currentLoadedGoalId?: string;
  showPlanNameInput: boolean;
  setShowPlanNameInput: (show: boolean) => void;
  goalNameValue: string;
  onGoalNameChange: (name: string) => void;
  savedGoals?: any[];
  onLoadGoal?: (id: string) => void;
  onDeleteGoal?: (id: string) => void;
}

const PilgrimageRouteMap = ({ plannedItems }: { plannedItems: PlannedItem[] }) => {
  return (
    <div className="h-96 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-2">🗺️</div>
        <p className="text-sm text-gray-600">Карта маршрута</p>
        <p className="text-xs text-gray-500">{plannedItems.length} мест в маршруте</p>
      </div>
    </div>
  );
};

const GoalCard = ({ goal, onLoad, onDelete }: { goal: any; onLoad: () => void; onDelete: () => void }) => {
  return (
    <div className="p-3 bg-white rounded-lg shadow-sm border">
      <h4 className="font-medium text-sm mb-1">{goal.name}</h4>
      <p className="text-xs text-gray-500 mb-2">{goal.itemCount} мест</p>
      <div className="flex gap-1">
        <button onClick={onLoad} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200">
          Загрузить
        </button>
        <button onClick={onDelete} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">
          Удалить
        </button>
      </div>
    </div>
  );
};

export const PilgrimagePlannerControls: React.FC<PilgrimagePlannerControlsProps> = ({
  language,
  t,
  selectedDateRange,
  onDateRangeChange,
  availableCities,
  filterSelectedCityIds,
  onFilterSelectedCityIdsChange,
  selectedPlaceSubtypes,
  onSelectedPlaceSubtypesChange,
  selectedEventSubtypes,
  onSelectedEventSubtypesChange,
  onAddFavoritesToPlan,
  onClearPlan,
  onSaveOrUpdateGoal,
  plannedItems,
  currentLoadedGoalId,
  showPlanNameInput,
  setShowPlanNameInput,
  goalNameValue,
  onGoalNameChange,
  savedGoals,
  onLoadGoal,
  onDeleteGoal,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'1_week' | '2_weeks' | '1_month' | '3_months' | null>(null);
  const [showCalendar, setShowCalendar] = useState<'from' | 'to' | null>(null);
  const [activeDateField, setActiveDateField] = useState<'from' | 'to' | null>(null);
  const isMobile = useMobile();
  const { fonts } = useFont();

  const handlePeriodSelect = (period: '1_week' | '2_weeks' | '1_month' | '3_months') => {
    const baseDate = selectedDateRange?.from || new Date();
    const startDate = new Date(baseDate);
    startDate.setHours(0, 0, 0, 0);
    
    let endDate: Date;
    
    switch (period) {
      case '1_week':
        endDate = addWeeks(startDate, 1);
        break;
      case '2_weeks':
        endDate = addWeeks(startDate, 2);
        break;
      case '1_month':
        endDate = addMonths(startDate, 1);
        break;
      case '3_months':
        endDate = addMonths(startDate, 3);
        break;
      default:
        endDate = addWeeks(startDate, 1);
    }
    
    setSelectedPeriod(period);
    onDateRangeChange({ from: startDate, to: endDate });
  };

  const handleDateFieldClick = (field: 'from' | 'to') => {
    setActiveDateField(field);
    setShowCalendar(field);
  };

  const handleCalendarClose = () => {
    setShowCalendar(null);
    setActiveDateField(null);
  };

  const toggleFilter = function (currentSelection: string[], item: string, setter: (newSelection: string[]) => void) {
    const newSelection = currentSelection.includes(item) 
      ? currentSelection.filter(i => i !== item)
      : [...currentSelection, item];
    setter(newSelection);
  };

  const saveButtonTextKey = currentLoadedGoalId ? 'update_button' : 'save_button';

  useEffect(() => {
    if (!selectedDateRange?.from || !selectedDateRange?.to) {
      setSelectedPeriod(null);
    }
  }, [selectedDateRange]);

  const DateFieldsSection = () => (
    <div className={`p-3 bg-white rounded-lg shadow-sm space-y-4 ${fonts.body?.className || ''}`}>
      <h3 className={`font-semibold mb-2 text-sm ${fonts.subheading?.className || ''}`}>Даты</h3>
      
      <div className="h-16 bg-gray-50 rounded flex items-center justify-center text-xs">
        <span className="text-gray-500">
          {selectedDateRange?.from 
            ? `${format(selectedDateRange.from, 'dd/MM')} - ${selectedDateRange.to ? format(selectedDateRange.to, 'dd/MM') : '...'}`
            : 'Выберите даты'
          }
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant={selectedPeriod === '1_week' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePeriodSelect('1_week')}
          className={`flex items-center gap-1 ${fonts.body?.className || ''} text-xs`}
        >
          <Clock className="w-3 h-3" />
          1 неделя
        </Button>
        <Button
          variant={selectedPeriod === '2_weeks' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePeriodSelect('2_weeks')}
          className={`flex items-center gap-1 ${fonts.body?.className || ''} text-xs`}
        >
          <Clock className="w-3 h-3" />
          2 недели
        </Button>
        <Button
          variant={selectedPeriod === '1_month' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePeriodSelect('1_month')}
          className={`flex items-center gap-1 ${fonts.body?.className || ''} text-xs`}
        >
          <Clock className="w-3 h-3" />
          1 месяц
        </Button>
        <Button
          variant={selectedPeriod === '3_months' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handlePeriodSelect('3_months')}
          className={`flex items-center gap-1 ${fonts.body?.className || ''} text-xs`}
        >
          <Clock className="w-3 h-3" />
          3 месяца
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <Popover open={showCalendar === 'from'} onOpenChange={(open) => !open && handleCalendarClose()}>
          <PopoverTrigger asChild>
            <div className="relative">
              <Label className={`text-sm font-medium ${fonts.subheading?.className || ''}`}>Начальная дата</Label>
              <Button
                variant="outline"
                className={`w-full justify-start text-left font-normal ${fonts.body?.className || ''}`}
                onClick={() => handleDateFieldClick('from')}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {selectedDateRange?.from ? format(selectedDateRange.from, 'dd.MM.yyyy') : 'Выберите дату'}
              </Button>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <PilgrimageCalendar
              selectedRange={selectedDateRange}
              onDateRangeChange={onDateRangeChange}
              locale={language === 'ru' ? ru : language === 'hi' ? hi : enUS}
            />
          </PopoverContent>
        </Popover>
        
        <Popover open={showCalendar === 'to'} onOpenChange={(open) => !open && handleCalendarClose()}>
          <PopoverTrigger asChild>
            <div className="relative">
              <Label className={`text-sm font-medium ${fonts.subheading?.className || ''}`}>Конечная дата</Label>
              <Button
                variant="outline"
                className={`w-full justify-start text-left font-normal ${fonts.body?.className || ''}`}
                onClick={() => handleDateFieldClick('to')}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {selectedDateRange?.to ? format(selectedDateRange.to, 'dd.MM.yyyy') : 'Выберите дату'}
              </Button>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <PilgrimageCalendar
              selectedRange={selectedDateRange}
              onDateRangeChange={onDateRangeChange}
              locale={language === 'ru' ? ru : language === 'hi' ? hi : enUS}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );

  return (
    <div className="w-screen bg-orange-50 m-0 p-0">
      <div className="flex flex-col md:flex-row h-screen">
        {/* Column 1 - Filters (25%) */}
        <div className="w-full md:w-1/4 p-4 bg-orange-100 border-r border-orange-200">
          <h2 className="text-lg font-bold mb-4 text-orange-800">Фильтры</h2>
          <p className="text-gray-600 mb-4 text-sm">Выбор дат и параметров</p>
          
          <div className="space-y-4">
            {/* Date selection section */}
            <DateFieldsSection />
            
            {/* City Selection */}
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2 text-sm">Выбор городов</h3>
              <div className="space-y-2">
                {mockCities.map((city) => (
                  <div key={city.id} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 cursor-move">
                    <div className="flex items-center gap-2">
                      <div className="text-lg">⋮⋮</div>
                      <div className="text-xl">{city.image}</div>
                      <div>
                        <div className="font-medium text-sm">{getLocalizedText(city.name, language)}</div>
                        <div className="text-xs text-gray-500">{city.items} мест</div>
                      </div>
                    </div>
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      defaultChecked={filterSelectedCityIds.includes(city.id)}
                      onChange={() => toggleFilter(filterSelectedCityIds, city.id, onFilterSelectedCityIdsChange)}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-gray-500">
                📌 Перетащите города для изменения порядка маршрута
              </div>
            </div>
            
            {/* Place Type Filters */}
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2 text-sm">Типы мест</h3>
              <div className="flex flex-wrap gap-1">
                {PLACE_SUBTYPES_OPTIONS.map((type) => (
                  <button
                    key={type.value}
                    className={`px-3 py-1.5 text-xs rounded-full border flex items-center gap-1.5 transition-colors ${
                      selectedPlaceSubtypes.includes(type.value)
                        ? 'bg-orange-100 border-orange-300 text-orange-800'
                        : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => toggleFilter(selectedPlaceSubtypes, type.value, onSelectedPlaceSubtypesChange)}
                  >
                    <type.Icon className="w-3 h-3" />
                    <span>{t(type.labelKey, { defaultValue: type.value })}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Event Type Filters */}
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2 text-sm">Типы событий</h3>
              <div className="flex flex-wrap gap-1">
                {EVENT_SUBTYPES_OPTIONS.map((type) => (
                  <button
                    key={type.value}
                    className={`px-3 py-1.5 text-xs rounded-full border flex items-center gap-1.5 transition-colors ${
                      selectedEventSubtypes.includes(type.value)
                        ? 'bg-purple-100 border-purple-300 text-purple-800'
                        : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => toggleFilter(selectedEventSubtypes, type.value, onSelectedEventSubtypesChange)}
                  >
                    <type.Icon className="w-3 h-3" />
                    <span>{t(type.labelKey, { defaultValue: type.value })}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-2">
              <button className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                Найти
              </button>
              <button className="w-full px-3 py-2 bg-gray-400 text-white text-sm rounded hover:bg-gray-500" onClick={onClearPlan}>
                Очистить
              </button>
            </div>
          </div>
        </div>
        
        {/* Column 2 - List (40%) */}
        <div className="w-full md:w-2/5 p-4 bg-blue-50 border-r border-blue-200">
          <h2 className="text-lg font-bold mb-4 text-blue-800">Список</h2>
          <p className="text-gray-600 mb-4 text-sm">Города и объекты</p>
          
          <div className="space-y-3 overflow-y-auto" style={{maxHeight: 'calc(100vh - 120px)'}}>
            {/* Selected cities with drag handles */}
            {mockCities.filter(city => filterSelectedCityIds.includes(city.id)).map((city, index) => (
              <div key={city.id} className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-move">
                <div className="flex items-center gap-3">
                  <div className="text-lg text-gray-400 cursor-grab">⋮⋮</div>
                  <div className="text-2xl">{city.image}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm">{getLocalizedText(city.name, language)}</h4>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{city.items} мест</p>
                  </div>
                  <button className="text-xs text-red-600 hover:text-red-800" onClick={() => toggleFilter(filterSelectedCityIds, city.id, onFilterSelectedCityIdsChange)}>
                    ✕
                  </button>
                </div>
              </div>
            ))}
            
            {/* Add city button */}
            <button className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 text-sm">
              + Добавить город
            </button>
          </div>
        </div>
        
        {/* Column 3 - Map (35%) */}
        <div className="w-full md:w-7/20 p-4 bg-green-50">
          <h2 className="text-lg font-bold mb-4 text-green-800">Карта</h2>
          <p className="text-gray-600 mb-4 text-sm">Маршрут и местоположения</p>
          
          <div className="h-full bg-white rounded-lg shadow-sm flex flex-col">
            {/* Map placeholder */}
            <div className="flex-1 bg-gradient-to-br from-green-100 to-blue-100 rounded-t-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">🗺️</div>
                <p className="text-sm text-gray-600">
                  {selectedDateRange 
                    ? `Карта маршрута\n${format(selectedDateRange.from, 'dd/MM')} - ${selectedDateRange.to ? format(selectedDateRange.to, 'dd/MM') : '...'}`
                    : 'Выберите даты для построения маршрута'
                  }
                </p>
              </div>
            </div>
            
            {/* Map controls */}
            <div className="p-3 border-t bg-gray-50 rounded-b-lg">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-blue-50 p-2 rounded">
                  <div className="font-medium text-blue-800">Маршрут</div>
                  <div className="text-blue-600">
                    {selectedDateRange ? '3 города • 12 дней' : 'Выберите города'}
                  </div>
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <div className="font-medium text-green-800">Прогресс</div>
                  <div className="text-green-600">
                    {selectedDateRange ? '156 мест найдено' : '0 мест'}
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className="text-gray-500 text-xs">
                  {selectedDateRange ? 'Вриндаван → Матура → Варанаси' : 'Постройте маршрут'}
                </span>
                <div className="space-x-2">
                  <button className="px-2 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600">
                    Оптимизировать
                  </button>
                  <button className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700" onClick={() => onSaveOrUpdateGoal('My Plan')}>
                    Сохранить план
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};