import React from 'react';
import { Link } from 'react-router-dom';
import { Language, PlannedItem, City } from '../../types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, PlusCircle, GripVertical } from 'lucide-react';
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
import { Droppable, Draggable } from 'react-beautiful-dnd';

interface PlannedItemsTableProps {
  itemsToRender: PlannedItem[];
  language: Language;
  t: (key: string, options?: any) => string;
  onUpdateDateTime: (itemToUpdate: PlannedItem, date?: string, time?: string) => void;
  onRemoveItem: (itemToRemove: PlannedItem) => void;
  onAddPlacesForCity?: (cityId: string) => void;
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
        <div className="p-4 text-gray-500 text-sm">{t('no_items_in_plan', {defaultValue: 'No items in plan yet.'})}</div>
    );
  }

  return (
    <Table className="bg-white">
        <TableHeader>
            <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>{t('object_name_column_header', {defaultValue: 'Object'})}</TableHead>
                <TableHead>{t('date')}</TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
            </TableRow>
        </TableHeader>
        <Droppable droppableId="planned-items-droppable">
            {(provided) => (
                <TableBody ref={provided.innerRef} {...provided.droppableProps}>
                    {itemsToRender.map((item, index) => {
                        const isCityRow = item.type === 'city';
                        const draggableId = `${item.type}-${item.data.id}-${item.orderIndex}`;

                        // Определяем реальный тип объекта для правильной ссылки
                        const data = item.data as any;
                        const isEventByData = data.eventTypeField || data.cultureField || data.hasOnlineStream !== undefined;
                        const actualType = isEventByData ? 'event' : item.type;

                        return (
                            <Draggable key={draggableId} draggableId={draggableId} index={index}>
                                {(providedDraggable) => (
                                    <TableRow
                                        ref={providedDraggable.innerRef}
                                        {...providedDraggable.draggableProps}
                                    >
                                        <TableCell {...providedDraggable.dragHandleProps} className="w-10 cursor-grab">
                                            <GripVertical size={18} className="text-gray-400" />
                                        </TableCell>
                                        <TableCell className={cn("font-medium", isCityRow ? "font-semibold text-blue-600" : "pl-6")}>
                                            <Link
                                              to={`/${actualType === 'city' ? 'cities' : actualType === 'place' ? 'places' : actualType === 'route' ? 'routes' : 'events'}/${item.data.id}`}
                                              target="_blank"
                                              className={cn(
                                                "hover:underline",
                                                actualType === 'city' ? "text-blue-600 hover:text-blue-800" :
                                                actualType === 'event' ? "text-gray-600 hover:text-gray-800" :
                                                "text-blue-600 hover:text-blue-800"
                                              )}
                                            >
                                              {getLocalizedText(item.data.name as any, language)}
                                            </Link>
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
                                )}
                            </Draggable>
                        );
                    })}
                    {provided.placeholder}
                </TableBody>
            )}
        </Droppable>
    </Table>
  );
};