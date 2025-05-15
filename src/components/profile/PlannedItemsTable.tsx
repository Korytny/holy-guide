import React from 'react';
import { Language, PlannedItem } from '../../types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getLocalizedText } from '../../utils/languageUtils';
import { cn } from '@/lib/utils'; // For conditional classes

interface PlannedItemsTableProps {
  itemsToRender: PlannedItem[];
  cityDurationSums?: Record<string, number>; // Optional, used if items include cities
  language: Language;
  t: (key: string) => string;
  onUpdateDateTime: (itemToUpdate: PlannedItem, date?: string, time?: string) => void;
  onRemoveItem: (itemToRemove: PlannedItem) => void;
  // title prop removed as table is now flat
}

export const PlannedItemsTable: React.FC<PlannedItemsTableProps> = ({
  itemsToRender,
  cityDurationSums,
  language,
  t,
  onUpdateDateTime,
  onRemoveItem,
}) => {

  if (itemsToRender.length === 0) {
    // This case might not be hit if PilgrimagePlanDisplay handles the placeholder
    return (
        <div className="p-4 text-gray-500 text-sm">{t('no_items_in_plan')}</div>
    );
  }

  return (
    <Table className="bg-white">
        <TableHeader>
            <TableRow>
                <TableHead>{t('city_or_object_column_header')}</TableHead>
                <TableHead>{t('date')}</TableHead>
                <TableHead>{t('time')}</TableHead>
                <TableHead>{t('duration')}</TableHead>
                <TableHead>{t('distance')}</TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {itemsToRender.map((item, index) => {
                const isCityRow = item.type === 'city';
                const duration = isCityRow 
                                    ? (cityDurationSums && cityDurationSums[item.data.id] ? `${cityDurationSums[item.data.id]} ${t('minutes_short')}` : '0 ' + t('minutes_short')) 
                                    : "30 " + t('minutes_short');

                return (
                    <TableRow key={`${item.type}-${item.data.id}-${index}`}>
                        <TableCell className={cn("font-medium", isCityRow ? "font-semibold text-blue-600" : "pl-6")}>
                            {getLocalizedText(item.data.name as any, language)}
                        </TableCell>
                        <TableCell>
                            <Input 
                                type="date" 
                                value={item.date || ''} 
                                onChange={(e) => onUpdateDateTime(item, e.target.value, undefined)} 
                                className="w-auto p-1 text-sm"
                                placeholder={t('date_placeholder')} 
                            />
                        </TableCell>
                        <TableCell>
                            <Input 
                                type="time" 
                                value={item.time || ''} 
                                onChange={(e) => onUpdateDateTime(item, undefined, e.target.value)} 
                                className="w-auto p-1 text-sm" 
                                placeholder={t('time_placeholder')} 
                            />
                        </TableCell>
                        <TableCell>{duration}</TableCell>
                        <TableCell>{"N/A"}</TableCell> {/* Distance placeholder */}
                        <TableCell className="text-right">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => onRemoveItem(item)} 
                                className="text-red-500 hover:text-red-700 h-8 w-8"
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