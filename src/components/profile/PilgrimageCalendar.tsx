import * as React from "react"
import { DateRange } from "react-day-picker";

import { Calendar } from "@/components/ui/calendar"

interface PilgrimageCalendarProps {
  onDateRangeChange: (dateRange: DateRange | undefined) => void;
}

export function PilgrimageCalendar({ onDateRangeChange }: PilgrimageCalendarProps) {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined);

  const handleSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    onDateRangeChange(range);
  };

  return (
    <Calendar
      mode="range"
      selected={dateRange}
      onSelect={handleSelect}
      numberOfMonths={2} // Show two months for easier range selection
      className="rounded-md border"
    />
  )
}
