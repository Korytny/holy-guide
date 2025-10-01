import React, { useState } from 'react';

export const SimplePilgrimagePlanner: React.FC = () => {
  const [selectedCities, setSelectedCities] = useState(['vrindavan', 'mathura']);
  const [selectedPlaces, setSelectedPlaces] = useState(['temple', 'samadhi']);
  const [selectedEvents, setSelectedEvents] = useState(['festival', 'puja']);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);

  const cities = [
    { id: 'vrindavan', name: 'Вриндаван', items: 25 },
    { id: 'mathura', name: 'Матура', items: 18 },
    { id: 'varanasi', name: 'Варанаси', items: 32 },
  ];

  const placeTypes = [
    { id: 'temple', name: 'Храмы', count: 156 },
    { id: 'samadhi', name: 'Самадхи', count: 89 },
    { id: 'kunda', name: 'Кунды', count: 34 },
    { id: 'sacred_site', name: 'Святые места', count: 117 },
  ];

  const eventTypes = [
    { id: 'festival', name: 'Фестивали', count: 23 },
    { id: 'practice', name: 'Практики', count: 45 },
    { id: 'retreat', name: 'Ретриты', count: 12 },
    { id: 'puja', name: 'Пуджи', count: 67 },
  ];

  const toggleCity = (cityId: string) => {
    console.log('Toggle city:', cityId);
    setSelectedCities(prev => 
      prev.includes(cityId) 
        ? prev.filter(id => id !== cityId)
        : [...prev, cityId]
    );
  };

  const toggleFilter = (current: string[], item: string, setter: (newSelection: string[]) => void) => {
    console.log('Toggle filter:', item);
    const newSelection = current.includes(item) 
      ? current.filter(i => i !== item)
      : [...current, item];
    setter(newSelection);
  };

  const selectPeriod = (period: string) => {
    console.log('Select period:', period);
    setSelectedPeriod(period);
  };

  const resetAll = () => {
    console.log('Reset all filters');
    setSelectedCities(cities.map(c => c.id));
    setSelectedPlaces(placeTypes.map(p => p.id));
    setSelectedEvents(eventTypes.map(e => e.id));
    setSelectedPeriod(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white">
      <h1 className="text-2xl font-bold mb-6">Планировщик паломничества</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1 - Filters */}
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-3">Города</h2>
            <div className="space-y-2">
              {cities.map(city => (
                <label key={city.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCities.includes(city.id)}
                    onChange={() => toggleCity(city.id)}
                    className="rounded"
                  />
                  <span>{city.name} ({city.items})</span>
                </label>
              ))}
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-3">Типы мест</h2>
            <div className="flex flex-wrap gap-2">
              {placeTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => toggleFilter(selectedPlaces, type.id, setSelectedPlaces)}
                  className={`px-3 py-1 rounded-full text-sm border ${
                    selectedPlaces.includes(type.id)
                      ? 'bg-orange-100 border-orange-300 text-orange-800'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {type.name} ({type.count})
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-3">Типы событий</h2>
            <div className="flex flex-wrap gap-2">
              {eventTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => toggleFilter(selectedEvents, type.id, setSelectedEvents)}
                  className={`px-3 py-1 rounded-full text-sm border ${
                    selectedEvents.includes(type.id)
                      ? 'bg-purple-100 border-purple-300 text-purple-800'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {type.name} ({type.count})
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-3">Период</h2>
            <div className="grid grid-cols-2 gap-2">
              {['1_week', '2_weeks', '1_month', '3_months'].map(period => (
                <button
                  key={period}
                  onClick={() => selectPeriod(period)}
                  className={`px-3 py-2 text-sm rounded border ${
                    selectedPeriod === period
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {period.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Найти
            </button>
            <button 
              onClick={resetAll}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Сбросить все
            </button>
          </div>
        </div>

        {/* Column 2 - Selected items */}
        <div className="p-4 border rounded-lg">
          <h2 className="font-semibold mb-3">Выбранные города ({selectedCities.length})</h2>
          <div className="space-y-2">
            {selectedCities.map(cityId => {
              const city = cities.find(c => c.id === cityId);
              return city ? (
                <div key={cityId} className="p-2 bg-gray-50 rounded flex justify-between items-center">
                  <span>{city.name}</span>
                  <button 
                    onClick={() => toggleCity(cityId)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                </div>
              ) : null;
            })}
          </div>
        </div>

        {/* Column 3 - Info */}
        <div className="p-4 border rounded-lg">
          <h2 className="font-semibold mb-3">Информация</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Выбрано городов:</strong> {selectedCities.length}</p>
            <p><strong>Типов мест:</strong> {selectedPlaces.length}</p>
            <p><strong>Типов событий:</strong> {selectedEvents.length}</p>
            <p><strong>Период:</strong> {selectedPeriod || 'не выбран'}</p>
            <p><strong>Всего мест:</strong> {
              selectedCities.reduce((sum, cityId) => {
                const city = cities.find(c => c.id === cityId);
                return sum + (city?.items || 0);
              }, 0)
            }</p>
          </div>
        </div>
      </div>
    </div>
  );
};