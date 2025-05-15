import React from 'react';
import { Language, PlannedItem, City } from '../../types'; // Added City type
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, PlusCircle } from 'lucide-react'; // Added PlusCircle icon
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getLocalizedText } from '../../utils/languageUtils';
import { cn } from '@/lib/utils';

interface PlannedItemsTableProps {
  itemsToRender: PlannedItem[];
  language: Language;
  t: (key: string, options?: any) => string; // Adjusted t for defaultValue
  onUpdateDateTime: (itemToUpdate: PlannedItem, date?: string, time?: string) => void;
  onRemoveItem: (itemToRemove: PlannedItem) => void;
  onAddPlacesForCity?: (cityId: string) => void; // New prop for adding places
}

export const PlannedItemsTable: React.FC<PlannedItemsTableProps> = ({
  itemsToRender,
  language,
  t,
  onUpdateDateTime,
  onRemoveItem,
  onAddPlacesForCity,
}) => {

  if (itemsToRender.length === 0) {
    return (
        <div className="p-4 text-gray-500 text-sm">{t('no_items_in_plan')}</div>
    );
  }

  return (
    <Table className="bg-white">
        <TableHeader>
            <TableRow>
                <TableHead>{t('object_name_column_header', {defaultValue: 'Object'})}</TableHead>
                <TableHead>{t('date')}</TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {itemsToRender.map((item, index) => {
                const isCityRow = item.type === 'city';
                return (
                    <TableRow key={`${item.type}-${item.data.id}-${index}`}>
                        <TableCell className={cn("font-medium", isCityRow ? "font-semibold text-blue-600" : "pl-6")}>
                            {getLocalizedText(item.data.name as any, language)}
                        </TableCell>
                        <TableCell>
                            <Input 
                                type="date" 
                                value={item.date || ''} 
                                onChange={(e) => onUpdateDateTime(item, e.target.value, item.time)} 
                                className="w-auto p-1 text-sm"
                                placeholder={t('date_placeholder')} 
                            />
                        </TableCell>
                        <TableCell className="text-right flex items-center justify-end space-x-1">
                            {isCityRow && onAddPlacesForCity && (
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => onAddPlacesForCity((item.data as City).id)} 
                                    className="text-green-600 hover:text-green-800 h-8 w-8"
                                    title={t('add_places_for_city_tooltip', {defaultValue: 'Add places for this city'})}
                                >
                                    <PlusCircle size={16} />
                                </Button>
                            )}
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => onRemoveItem(item)} 
                                className="text-red-500 hover:text-red-700 h-8 w-8"
                                title={t('remove_item_tooltip', {defaultValue: 'Remove item'})}
                            >
                                <Trash2 size={16} />
                            </Button>
                        </TableCell>
                    </TableRow>
                );
            })}
        </TableBody>
    </Table>
  );
};