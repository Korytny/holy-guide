import React, { useState, useEffect } from 'react';
import { type DateRange } from 'react-day-picker';
import { format, addWeeks, addMonths } from 'date-fns';
import { enUS, ru, hi } from "date-fns/locale";
import { Button } from '../ui/button';
import { Calendar, Clock } from 'lucide-react';
import { Label } from '../ui/label';
import { PilgrimageCalendar } from './PilgrimageCalendar';

export const PilgrimagePlannerControlsStub3: React.FC = () => {
  console.log('🔥 PilgrimagePlannerControlsStub3 MOUNTED');
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>();
  const [selectedPeriod, setSelectedPeriod] = useState<'1_week' | '2_weeks' | '1_month' | '3_months' | null>(null);
  const [showCalendar, setShowCalendar] = useState<'from' | 'to' | null>(null);
  const [activeDateField, setActiveDateField] = useState<'from' | 'to' | null>(null);
  
  // City selection state
  const [availableCities, setAvailableCities] = useState([
    { id: 'vrindavan', name: 'Вриндаван', items: 25, image: '🕍', order: 1 },
    { id: 'mathura', name: 'Матура', items: 18, image: '🛕', order: 2 },
    { id: 'varanasi', name: 'Варанаси', items: 32, image: '🏯', order: 3 },
    { id: 'rishikesh', name: 'Ришикеш', items: 15, image: '🧘', order: 4 },
    { id: 'haridwar', name: 'Хардвар', items: 12, image: '🌊', order: 5 },
  ]);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  
  // Filter state - по умолчанию выбраны все типы
  const [selectedPlaceSubtypes, setSelectedPlaceSubtypes] = useState(['temple', 'samadhi', 'kunda', 'sacred_site']);
  const [selectedEventSubtypes, setSelectedEventSubtypes] = useState(['festival', 'practice', 'retreat', 'puja']);
  
  // Calculate filtered objects for selected cities
  const getFilteredObjectsForCity = (cityId: string) => {
    const city = availableCities.find(c => c.id === cityId);
    if (!city) return [];
    
    // Simplified filtering - in real app this would come from API
    const mockObjects = [
      { id: 1, name: 'Храм Кешава Девы', type: 'temple', icon: '🕍' },
      { id: 2, name: 'Самадхи Шрилы Прабхупады', type: 'samadhi', icon: '🛕' },
      { id: 3, name: 'Кунда Шьяма', type: 'kunda', icon: '🌊' },
      { id: 4, name: 'Шри Шри Радха-Говинда', type: 'temple', icon: '🕍' },
      { id: 5, name: 'ИСККОН храм', type: 'temple', icon: '🕍' },
    ];
    
    return mockObjects.filter(obj => selectedPlaceSubtypes.includes(obj.type));
  };
  
  const handlePeriodSelect = (period: '1_week' | '2_weeks' | '1_month' | '3_months') => {
    console.log('handlePeriodSelect called with:', period);
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
    
    console.log('Setting date range:', { from: startDate, to: endDate });
    setSelectedPeriod(period);
    setSelectedDateRange({ from: startDate, to: endDate });
  };

  const handleDateFieldClick = (field: 'from' | 'to') => {
    setActiveDateField(field);
    setShowCalendar(field);
  };

  const handleCalendarClose = () => {
    setShowCalendar(null);
    setActiveDateField(null);
  };

  useEffect(() => {
    if (!selectedDateRange?.from || !selectedDateRange?.to) {
      setSelectedPeriod(null);
    }
  }, [selectedDateRange]);

  
  const toggleCitySelection = (cityId: string) => {
    setSelectedCities(prev => 
      prev.includes(cityId) 
        ? prev.filter(id => id !== cityId)
        : [...prev, cityId]
    );
  };

  const toggleFilter = <T extends string>(currentSelection: T[], item: T, setter: (newSelection: T[]) => void) => {
    console.log('toggleFilter called:', { currentSelection, item });
    const newSelection = currentSelection.includes(item) 
      ? currentSelection.filter(i => i !== item)
      : [...currentSelection, item];
    console.log('New selection:', newSelection);
    setter(newSelection);
  };

  const resetAllFilters = () => {
    console.log('resetAllFilters called');
    // Выбрать все типы мест
    setSelectedPlaceSubtypes(['temple', 'samadhi', 'kunda', 'sacred_site']);
    // Выбрать все типы событий
    setSelectedEventSubtypes(['festival', 'practice', 'retreat', 'puja']);
    // Не сбрасывать выбранные города - они управляются во второй колонке
  };
  
  return (
    <div className="w-full bg-orange-50 m-0 p-0">
      <div className="flex flex-col md:flex-row h-screen">
        {/* Column 1 - Filters (30%) */}
        <div className="w-full md:w-3/10 bg-orange-100 border-r border-orange-200">
          <div className="p-3">
            <h2 className="text-lg font-bold mb-4 text-orange-800">Фильтры</h2>
            <p className="text-gray-600 mb-4 text-sm">Выбор дат и параметров</p>
            
            <div className="space-y-4">
            {/* Date Selection */}
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2 text-sm">Даты</h3>
              
              <div className="h-12 bg-gray-50 rounded flex items-center justify-center text-xs mb-3 border border-gray-200">
                <span className="text-gray-700 font-medium">
                  {selectedDateRange?.from 
                    ? `${format(selectedDateRange.from, 'dd.MM.yyyy')} - ${selectedDateRange.to ? format(selectedDateRange.to, 'dd.MM.yyyy') : '...'}`
                    : 'Выберите период поездки'
                  }
                </span>
              </div>
              
              {/* Period Buttons - simplified */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  onClick={() => handlePeriodSelect('1_week')}
                  className={`flex items-center gap-1 text-xs px-3 py-2 rounded border transition-colors ${
                    selectedPeriod === '1_week' 
                      ? 'bg-orange-500 border-orange-500 text-white' 
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-orange-50'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  1 неделя
                </button>
                <button
                  onClick={() => handlePeriodSelect('2_weeks')}
                  className={`flex items-center gap-1 text-xs px-3 py-2 rounded border transition-colors ${
                    selectedPeriod === '2_weeks' 
                      ? 'bg-orange-500 border-orange-500 text-white' 
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-orange-50'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  2 недели
                </button>
                <button
                  onClick={() => handlePeriodSelect('1_month')}
                  className={`flex items-center gap-1 text-xs px-3 py-2 rounded border transition-colors ${
                    selectedPeriod === '1_month' 
                      ? 'bg-orange-500 border-orange-500 text-white' 
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-orange-50'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  1 месяц
                </button>
                <button
                  onClick={() => handlePeriodSelect('3_months')}
                  className={`flex items-center gap-1 text-xs px-3 py-2 rounded border transition-colors ${
                    selectedPeriod === '3_months' 
                      ? 'bg-orange-500 border-orange-500 text-white' 
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-orange-50'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  3 месяца
                </button>
              </div>
              
              {/* Date Fields - упрощённые без календаря по умолчанию */}
              <div className="space-y-2">
                <div>
                  <Label className="text-sm font-medium">Начальная дата</Label>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal text-xs mt-1"
                    onClick={() => handleDateFieldClick('from')}
                  >
                    <Calendar className="mr-2 h-3 w-3" />
                    {selectedDateRange?.from ? format(selectedDateRange.from, 'dd.MM.yyyy') : 'Выберите дату'}
                  </Button>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Конечная дата</Label>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal text-xs mt-1"
                    onClick={() => handleDateFieldClick('to')}
                  >
                    <Calendar className="mr-2 h-3 w-3" />
                    {selectedDateRange?.to ? format(selectedDateRange.to, 'dd.MM.yyyy') : 'Выберите дату'}
                  </Button>
                </div>
              </div>
              
              {/* Календарь появляется только при клике на дату */}
              {showCalendar && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Выберите даты</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleCalendarClose}
                      className="h-6 w-6 p-0"
                    >
                      ✕
                    </Button>
                  </div>
                  <PilgrimageCalendar
                    selectedRange={selectedDateRange}
                    onDateRangeChange={setSelectedDateRange}
                    locale={ru}
                  />
                </div>
              )}
            </div>
            
              
            {/* Place Type Filters */}
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2 text-sm">Типы мест</h3>
              <div className="flex flex-wrap gap-1">
                {[
                  { id: 'temple', name: 'Храмы', icon: '🕍', count: 156 },
                  { id: 'samadhi', name: 'Самадхи', icon: '🛕', count: 89 },
                  { id: 'kunda', name: 'Кунды', icon: '🌊', count: 34 },
                  { id: 'sacred_site', name: 'Святые места', icon: '✨', count: 117 },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      console.log('Place filter clicked:', type.id);
                      toggleFilter(selectedPlaceSubtypes, type.id as any, setSelectedPlaceSubtypes);
                    }}
                    className={`px-3 py-1.5 text-xs rounded-full border flex items-center gap-1.5 transition-colors ${
                      selectedPlaceSubtypes.includes(type.id as any)
                        ? 'bg-orange-100 border-orange-300 text-orange-800'
                        : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{type.icon}</span>
                    <span>{type.name}</span>
                    <span className="text-xs opacity-60">({type.count})</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Event Type Filters */}
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2 text-sm">Типы событий</h3>
              <div className="flex flex-wrap gap-1">
                {[
                  { id: 'festival', name: 'Фестивали', icon: '🎉', count: 23 },
                  { id: 'practice', name: 'Практики', icon: '⚡', count: 45 },
                  { id: 'retreat', name: 'Ретриты', icon: '🧘', count: 12 },
                  { id: 'puja', name: 'Пуджи', icon: '🙏', count: 67 },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      console.log('Event filter clicked:', type.id);
                      toggleFilter(selectedEventSubtypes, type.id as any, setSelectedEventSubtypes);
                    }}
                    className={`px-3 py-1.5 text-xs rounded-full border flex items-center gap-1.5 transition-colors ${
                      selectedEventSubtypes.includes(type.id as any)
                        ? 'bg-purple-100 border-purple-300 text-purple-800'
                        : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{type.icon}</span>
                    <span>{type.name}</span>
                    <span className="text-xs opacity-60">({type.count})</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Action Buttons - simplified */}
            <div className="space-y-2">
              <button 
                onClick={() => console.log('Применить фильтры clicked')}
                className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
              >
                🔍 Применить фильтры
              </button>
              <button 
                onClick={resetAllFilters}
                className="w-full px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded transition-colors"
              >
                🔄 Сбросить фильтры
              </button>
            </div>
          </div>
          </div>
        </div>
        
        {/* Column 2 - List (40%) */}
        <div className="w-full md:w-2/5 bg-blue-50 border-r border-blue-200">
          <div className="p-3">
            <h2 className="text-lg font-bold mb-4 text-blue-800">Список</h2>
            <p className="text-gray-600 mb-4 text-sm">Выберите города и добавьте объекты</p>
            
            <div className="space-y-4 overflow-y-auto" style={{maxHeight: 'calc(100vh - 120px)'}}>
            {/* Add Cities Section */}
            <div className="p-3 bg-white rounded-lg shadow-sm">
              <h3 className="font-semibold mb-3 text-sm">Добавить города</h3>
              <div className="space-y-2">
                {availableCities.filter(city => !selectedCities.includes(city.id)).map((city) => (
                  <div key={city.id} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="text-xl">{city.image}</div>
                      <div>
                        <div className="font-medium text-sm">{city.name}</div>
                        <div className="text-xs text-gray-500">{city.items} мест</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleCitySelection(city.id)}
                      className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors"
                    >
                      + Добавить
                    </button>
                  </div>
                ))}
              </div>
              {availableCities.filter(city => !selectedCities.includes(city.id)).length === 0 && (
                <div className="text-center text-gray-500 py-2 text-xs">
                  Все города добавлены
                </div>
              )}
            </div>
            
            {/* Selected Cities with Objects */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Выбранные города ({selectedCities.length})</h3>
              {selectedCities.map((cityId, index) => {
                const city = availableCities.find(c => c.id === cityId);
                if (!city) return null;
                
                return (
                  <div key={city.id} className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{city.image}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm">{city.name}</h4>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                              {index + 1}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{city.items} мест</p>
                        </div>
                      </div>
                      <button 
                        className="text-xs text-red-600 hover:text-red-800"
                        onClick={() => toggleCitySelection(city.id)}
                      >
                        ✕
                      </button>
                    </div>
                    
                    {/* Objects in city (filtered) */}
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <div className="text-xs text-gray-600 mb-2">Объекты в городе:</div>
                      <div className="space-y-1">
                        {getFilteredObjectsForCity(city.id).slice(0, 3).map((obj) => (
                          <div key={obj.id} className="text-xs bg-orange-50 p-2 rounded border border-orange-100">
                            {obj.icon} {obj.name}
                          </div>
                        ))}
                        {getFilteredObjectsForCity(city.id).length > 3 && (
                          <div className="text-center">
                            <button className="text-xs text-blue-600 hover:text-blue-800">
                              Показать еще {getFilteredObjectsForCity(city.id).length - 3}...
                            </button>
                          </div>
                        )}
                        {getFilteredObjectsForCity(city.id).length === 0 && (
                          <div className="text-center text-gray-500 py-2 text-xs">
                            Нет объектов, соответствующих фильтрам
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {selectedCities.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  Добавьте города для планирования маршрута
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
        
        {/* Column 3 - Map (30%) */}
        <div className="w-full md:w-3/10 bg-green-50">
          <div className="p-3">
            <h2 className="text-lg font-bold mb-4 text-green-800">Карта</h2>
            <p className="text-gray-600 mb-4 text-sm">Маршрут и местоположения</p>
            
            <div className="h-full bg-white rounded-lg shadow-sm flex flex-col">
            {/* Map placeholder */}
            <div className="flex-1 bg-gradient-to-br from-green-100 to-blue-100 rounded-t-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">🗺️</div>
                <p className="text-sm text-gray-600 whitespace-pre-line">
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
                    {selectedCities.length > 0 
                      ? `${selectedCities.length} города${selectedDateRange ? ` • ${Math.ceil((selectedDateRange.to.getTime() - selectedDateRange.from.getTime()) / (1000 * 60 * 60 * 24))} дней` : ''}`
                      : 'Выберите города'
                    }
                  </div>
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <div className="font-medium text-green-800">Прогресс</div>
                  <div className="text-green-600">
                    {selectedCities.length > 0 
                      ? `${selectedCities.reduce((sum, cityId) => {
                          return sum + getFilteredObjectsForCity(cityId).length;
                        }, 0)} мест найдено`
                      : '0 мест'
                    }
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className="text-gray-600 text-xs font-medium">
                  {selectedCities.length > 0 
                    ? selectedCities.map(cityId => {
                        const city = availableCities.find(c => c.id === cityId);
                        return city?.name;
                      }).filter(Boolean).join(' → ')
                    : '🗺️ Выберите города для построения маршрута'
                  }
                </span>
                <div className="space-x-2">
                  <Button className="px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-xs transition-colors" size="sm">
                    ⚡ Оптимизировать
                  </Button>
                  <Button className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors" size="sm">
                    💾 Сохранить план
                  </Button>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};