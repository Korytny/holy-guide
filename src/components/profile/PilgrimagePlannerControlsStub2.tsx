import React from 'react';

export const PilgrimagePlannerControlsStub2: React.FC = () => {
  return (
    <div className="w-screen bg-blue-50 m-0 p-0">
      <div className="flex flex-col md:flex-row h-screen">
        {/* Left column - 50% */}
        <div className="w-full md:w-1/2 p-4 bg-blue-100">
          <h2 className="text-xl font-bold mb-4">Pilgrimage Planner Controls - STUB 2</h2>
          <p className="text-gray-600 mb-4">Left column - Filters and Selection</p>
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg shadow">
              <h3 className="font-semibold mb-2">Date Selection</h3>
              <div className="h-20 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-gray-500">Date picker placeholder</span>
              </div>
            </div>
            <div className="p-4 bg-white rounded-lg shadow">
              <h3 className="font-semibold mb-2">Filters</h3>
              <div className="h-20 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-gray-500">Filters placeholder</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right column - 50% */}
        <div className="w-full md:w-1/2 p-4 bg-green-100">
          <h2 className="text-xl font-bold mb-4">Right Column</h2>
          <p className="text-gray-600 mb-4">Map and Results</p>
          <div className="h-96 bg-white rounded-lg shadow flex items-center justify-center">
            <span className="text-gray-500">Map placeholder</span>
          </div>
        </div>
      </div>
    </div>
  );
};