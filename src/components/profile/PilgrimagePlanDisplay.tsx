import React from 'react';
import { Language, PlannedItem } from '../../types';
import { PlannedItemsTable } from './PlannedItemsTable';

interface PilgrimagePlanDisplayProps {
  plannedItems: PlannedItem[];
  cityDurationSums: Record<string, number>; // CityID -> total duration of its items
  language: Language;
  t: (key: string) => string;
  onUpdateDateTime: (itemToUpdate: PlannedItem, date?: string, time?: string) => void;
  onRemoveItem: (itemToRemove: PlannedItem) => void;
}

export const PilgrimagePlanDisplay: React.FC<PilgrimagePlanDisplayProps> = ({
  plannedItems,
  cityDurationSums,
  language,
  t,
  onUpdateDateTime,
  onRemoveItem,
}) => {

  // We will sort items directly in PilgrimagePlanner and pass the sorted list
  // Or, if we want to display cities as headers and then their items, the logic would differ.
  // For a single flat table where cities are rows, plannedItems should be pre-sorted.

  return (
    <div className="mt-8 border rounded-md p-0 bg-white overflow-hidden"> {/* p-0 for table to fit nicely */}
      <h3 className="text-lg font-semibold mb-0 p-4">{t('pilgrimage_plan')}</h3> {/* mb-0 if table is directly below */}
      {plannedItems.length === 0 ? (
        <div className="p-4 text-gray-500">{t('plan_results_placeholder')}</div>
      ) : (
        <PlannedItemsTable
            itemsToRender={plannedItems} // Pass all items
            // No title for the whole table, titles were for groups previously
            cityDurationSums={cityDurationSums} // Pass sums for city rows
            language={language}
            t={t}
            onUpdateDateTime={onUpdateDateTime}
            onRemoveItem={onRemoveItem}
        />
      )}
    </div>
  );
};