import * as React from "react"
import { DateRange, SelectRangeEventHandler } from "react-day-picker";
import { Locale } from "date-fns"; // Import Locale for the locale prop

import { Calendar } from "@/components/ui/calendar"

export interface PilgrimageCalendarProps {
  selectedRange?: DateRange; // Changed from dateRange to selectedRange for clarity and to accept it as a prop
  onDateRangeChange: SelectRangeEventHandler; // Use the specific handler type from react-day-picker
  locale?: Locale; // Add locale prop
}

export function PilgrimageCalendar({ selectedRange, onDateRangeChange, locale }: PilgrimageCalendarProps) {
  // Removed internal state, the component is now fully controlled by its parent
  return (
    <Calendar
      mode="range"
      selected={selectedRange} // Use the selectedRange prop directly
      onSelect={onDateRangeChange} // Pass the event handler directly
      numberOfMonths={2}
      className="rounded-md border"
      locale={locale} // Pass locale to Calendar
    />
  )
}
