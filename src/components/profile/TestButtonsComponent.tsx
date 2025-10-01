import React, { useState } from 'react';

export const TestButtonsComponent: React.FC = () => {
  const [count, setCount] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);

  const handleSimpleClick = () => {
    console.log('Simple click works!');
    setCount(prev => prev + 1);
  };

  const handleFilterClick = (filter: string) => {
    console.log('Filter clicked:', filter);
    setSelected(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  return (
    <div className="p-8 bg-white">
      <h1 className="text-2xl font-bold mb-4">Test Buttons Component</h1>
      
      <div className="space-y-4">
        {/* Simple button test */}
        <div>
          <p className="mb-2">Simple button test (count: {count})</p>
          <button 
            onClick={handleSimpleClick}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Click me!
          </button>
        </div>

        {/* Filter buttons test */}
        <div>
          <p className="mb-2">Filter buttons test</p>
          <div className="flex gap-2">
            {['temple', 'samadhi', 'kunda'].map((filter) => (
              <button
                key={filter}
                onClick={() => handleFilterClick(filter)}
                className={`px-3 py-1 rounded border ${
                  selected.includes(filter)
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white border-gray-300'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Selected: {selected.join(', ')}
          </p>
        </div>

        {/* Period buttons test */}
        <div>
          <p className="mb-2">Period buttons test</p>
          <div className="grid grid-cols-2 gap-2 w-48">
            {['1_week', '2_weeks', '1_month', '3_months'].map((period) => (
              <button
                key={period}
                onClick={() => console.log('Period clicked:', period)}
                className="px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600"
              >
                {period.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};