import React from 'react';
import { Language, PlannedItem } from '../../types';
import { PlannedItemsTable } from './PlannedItemsTable';

interface PilgrimagePlanDisplayProps {
  plannedItems: PlannedItem[];
  language: Language;
  t: (key: string, options?: any) => string;
  onUpdateDateTime: (itemToUpdate: PlannedItem, date?: string, time?: string) => void;
  onRemoveItem: (itemToRemove: PlannedItem) => void;
  onAddPlacesForCity?: (cityId: string) => void; // New prop
}

export const PilgrimagePlanDisplay: React.FC<PilgrimagePlanDisplayProps> = ({
  plannedItems,
  language,
  t,
  onUpdateDateTime,
  onRemoveItem,
  onAddPlacesForCity, // Destructure new prop
}) => {

  return (
    <div className="border rounded-md p-0 bg-white overflow-hidden h-full"> {/* Added h-full */}
      <h3 className="text-lg font-semibold mb-0 p-4 sticky top-0 bg-white z-10">{t('pilgrimage_plan')}</h3> {/* Made header sticky */}
      {plannedItems.length === 0 ? (
        <div className="p-4 text-gray-500">{t('plan_results_placeholder')}</div>
      ) : (
        <div className="overflow-y-auto h-[calc(100%-theme(space.16))]"> {/* Made table scrollable, adjust 4rem (space.16) if header padding changes */}
            <PlannedItemsTable
                itemsToRender={plannedItems}
                language={language}
                t={t}
                onUpdateDateTime={onUpdateDateTime}
                onRemoveItem={onRemoveItem}
                onAddPlacesForCity={onAddPlacesForCity} // Pass new prop
            />
        </div>
      )}
    </div>
  );
};