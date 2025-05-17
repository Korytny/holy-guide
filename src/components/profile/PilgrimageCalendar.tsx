import * as React from "react";
import { DateRange, SelectRangeEventHandler, DayPicker } from "react-day-picker";
import { Locale } from "date-fns";
import { isSameDay } from "date-fns";
import { Star } from "lucide-react"; // Import Star icon

import { Calendar } from "@/components/ui/calendar";

export interface PilgrimageCalendarProps {
  selectedRange?: DateRange;
  className?: string;
  headerClassName?: string;
  onDateRangeChange: SelectRangeEventHandler;
  locale?: Locale;
  highlightedDates?: Date[];
  showTimePicker?: boolean;
  timePickerProps?: {
    startTime?: string;
    endTime?: string;
    onTimeChange?: (time: { start: string; end: string }) => void;
  };
}

export function PilgrimageCalendar({
  selectedRange,
  onDateRangeChange,
  locale,
  highlightedDates,
  className,
  headerClassName,
  showTimePicker = false,
  timePickerProps
}: PilgrimageCalendarProps) {
  console.log("--- PilgrimageCalendar RENDERED ---"); 

  // Log received highlightedDates
  React.useEffect(() => {
    if (highlightedDates) {
      console.log("PilgrimageCalendar received highlightedDates:", highlightedDates.map(d => d.toISOString()));
    }
  }, [highlightedDates]);

  const modifiers = {
    highlighted: highlightedDates || [], 
  };

  const modifiersStyles = {
    highlighted: { 
      // Styles for .rdp-day_highlighted if not using components
    },
  };

  const components = {
    DayContent: (props: { date: Date; displayMonth: Date }) => {
      let originalContent = <>{props.date.getDate()}</>;
      let starIcon = null;

      const isHighlighted = highlightedDates && highlightedDates.some(d => {
        const same = isSameDay(d, props.date);
        // if (props.date.getDate() === 14 && props.date.getMonth() === 4) { // For May 14th
        //   console.log(`Comparing calendar date: ${props.date.toISOString()} with highlighted: ${d.toISOString()}, isSameDay: ${same}`);
        // }
        return same;
      });

      if (isHighlighted) {
        // if (props.date.getDate() === 14 && props.date.getMonth() === 4) {
        //   console.log(`Rendering STAR for date: ${props.date.toISOString()}`);
        // }
        starIcon = (
          <Star 
            className="h-5 w-5 text-green-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-70" 
            fill="currentColor"
          />
        );
      }
      
      return (
        <div className="relative w-full h-full flex items-center justify-center">
          {originalContent}
          {starIcon}
        </div>
      );
    },
  };

  return (
    <div className={className}>
      <Calendar
        mode="range"
        selected={selectedRange}
        onSelect={onDateRangeChange}
        numberOfMonths={2}
        className="rounded-md border"
        locale={locale}
        modifiers={modifiers}
        modifiersStyles={modifiersStyles}
        components={components}
        showOutsideDays={false}
        showTimePicker={showTimePicker}
        timePickerProps={timePickerProps}
        classNames={{
          caption_label: headerClassName,
          nav_button: headerClassName,
          head_cell: headerClassName
        }}
      />
    </div>
  );
}
