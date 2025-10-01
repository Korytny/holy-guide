import React, { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addDays, addWeeks, addMonths } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SimpleDateSelectorProps {
  selectedDateRange?: DateRange;
  onDateRangeChange: (range: DateRange | undefined) => void;
  className?: string;
}

const DURATION_OPTIONS = [
  { label: '1 день', value: 'day', fn: (date: Date) => addDays(date, 1) },
  { label: '1 неделя', value: 'week', fn: (date: Date) => addWeeks(date, 1) },
  { label: '1 месяц', value: 'month', fn: (date: Date) => addMonths(date, 1) },
];

export function SimpleDateSelector({
  selectedDateRange,
  onDateRangeChange,
  className
}: SimpleDateSelectorProps) {
  const [startCalendarOpen, setStartCalendarOpen] = useState(false);
  const [endCalendarOpen, setEndCalendarOpen] = useState(false);

  const handleStartDateSelect = (date: Date | undefined) => {
    if (date) {
      // Если есть дата окончания, проверяем что начало не позже окончания
      const endDate = selectedDateRange?.to && date > selectedDateRange.to ? date : selectedDateRange?.to;
      onDateRangeChange({ from: date, to: endDate });
    }
    setStartCalendarOpen(false);
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (date) {
      // Проверяем что окончание не раньше начала
      const startDate = selectedDateRange?.from && date < selectedDateRange.from ? selectedDateRange.from : selectedDateRange?.from;
      onDateRangeChange({ from: startDate, to: date });
    }
    setEndCalendarOpen(false);
  };

  const handleDurationClick = (duration: string) => {
    if (selectedDateRange?.from) {
      const durationOption = DURATION_OPTIONS.find(opt => opt.value === duration);
      if (durationOption) {
        const endDate = durationOption.fn(selectedDateRange.from);
        onDateRangeChange({ ...selectedDateRange, to: endDate });
      }
    }
  };

  const clearDates = () => {
    onDateRangeChange(undefined);
  };

  const startDisplay = selectedDateRange?.from ? format(selectedDateRange.from, 'dd.MM.yyyy') : 'Выберите дату';
  const endDisplay = selectedDateRange?.to ? format(selectedDateRange.to, 'dd.MM.yyyy') : 'Выберите дату';

  return (
    <div className={cn("space-y-2", className)}>
      {/* Поля для выбора дат */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* Дата начала */}
        <Popover open={startCalendarOpen} onOpenChange={setStartCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDateRange?.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDisplay}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDateRange?.from}
              onSelect={handleStartDateSelect}
              disabled={(date) => date < new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Дата окончания */}
        <Popover open={endCalendarOpen} onOpenChange={setEndCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDateRange?.to && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDisplay}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDateRange?.to}
              onSelect={handleEndDateSelect}
              disabled={(date) => selectedDateRange?.from ? date < selectedDateRange.from : false}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Кнопки длительности */}
      <div className="space-y-1">
        <p className="text-sm font-medium">Быстрый выбор длительности:</p>
        <div className="flex gap-1">
          {DURATION_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant="outline"
              size="sm"
              onClick={() => handleDurationClick(option.value)}
              disabled={!selectedDateRange?.from}
              className="flex-1"
            >
              <Clock className="mr-1 h-3 w-3" />
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      </div>
  );
}