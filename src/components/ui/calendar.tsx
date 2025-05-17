"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  showTimePicker?: boolean;
  timePickerProps?: {
    startTime?: string;
    endTime?: string;
    onTimeChange?: (time: { start: string; end: string }) => void;
  };
  components?: {
    IconLeft?: React.ComponentType<any>;
    IconRight?: React.ComponentType<any>;
    [key: string]: React.ComponentType<any> | undefined;
  };
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  components: userComponents = {},
  showTimePicker = false,
  timePickerProps,
  ...props
}: CalendarProps) {
  const [time, setTime] = React.useState({
    start: timePickerProps?.startTime || "09:00",
    end: timePickerProps?.endTime || "17:00"
  });

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'start' | 'end') => {
    const newTime = { ...time, [type]: e.target.value };
    setTime(newTime);
    timePickerProps?.onTimeChange?.(newTime);
  };

  const defaultClassNames = {
    months: "relative flex flex-col sm:flex-row gap-4",
    month: "w-full",
    month_caption: "relative flex flex-col items-center gap-1 mb-2",
    caption_label: "text-base font-semibold",
    nav: "flex w-full justify-between mb-2 px-4",
    button_previous: cn(
      buttonVariants({ variant: "ghost" }),
      "size-9 text-foreground hover:bg-accent p-0",
    ),
    button_next: cn(
      buttonVariants({ variant: "ghost" }),
      "size-9 text-foreground hover:bg-accent p-0",
    ),
    weekday: "size-9 p-0 text-xs font-medium text-muted-foreground/80",
    day_button:
      "relative flex size-9 items-center justify-center whitespace-nowrap rounded-lg p-0 text-foreground outline-offset-2 group-[[data-selected]:not(.range-middle)]:[transition-property:color,background-color,border-radius,box-shadow] group-[[data-selected]:not(.range-middle)]:duration-150 focus:outline-none group-data-[disabled]:pointer-events-none focus-visible:z-10 hover:bg-accent group-data-[selected]:bg-primary hover:text-foreground group-data-[selected]:text-primary-foreground group-data-[disabled]:text-foreground/30 group-data-[disabled]:line-through group-data-[outside]:text-foreground/30 group-data-[outside]:group-data-[selected]:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 group-[.range-start:not(.range-end)]:rounded-e-none group-[.range-end:not(.range-start)]:rounded-s-none group-[.range-middle]:rounded-none group-data-[selected]:group-[.range-middle]:bg-accent group-data-[selected]:group-[.range-middle]:text-foreground",
    day: "group size-9 px-0 text-sm",
    range_start: "range-start",
    range_end: "range-end",
    range_middle: "range-middle",
    today:
      "*:after:pointer-events-none *:after:absolute *:after:bottom-1 *:after:start-1/2 *:after:z-10 *:after:size-[3px] *:after:-translate-x-1/2 *:after:rounded-full *:after:bg-primary [&[data-selected]:not(.range-middle)>*]:after:bg-background [&[data-disabled]>*]:after:bg-foreground/30 *:after:transition-colors",
    outside: "text-muted-foreground data-selected:bg-accent/50 data-selected:text-muted-foreground",
    hidden: "invisible",
    week_number: "size-9 p-0 text-xs font-medium text-muted-foreground/80",
    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
    day_today: "bg-accent text-accent-foreground",
    day_disabled: "text-muted-foreground opacity-50",
    day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
    day_hidden: "invisible"
  };

  const mergedClassNames = {
    ...defaultClassNames,
    ...classNames
  };

  const defaultComponents = {
    IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" {...props} />,
    IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" {...props} />,
    ...userComponents
  };

  return (
    <div className={cn("space-y-4", className)}>
      <DayPicker
        showOutsideDays={showOutsideDays}
        classNames={mergedClassNames}
        components={defaultComponents}
        {...props}
      />
      
      {showTimePicker && (
        <div className="flex gap-4 px-3 pb-3">
          <div className="grid gap-1">
            <label className="text-xs text-muted-foreground font-medium">Start Time</label>
            <input
              type="time"
              value={time.start}
              onChange={(e) => handleTimeChange(e, 'start')}
              className={cn(
                "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
                "file:border-0 file:bg-transparent file:text-sm file:font-medium",
                "placeholder:text-muted-foreground",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            />
          </div>
          <div className="grid gap-1">
            <label className="text-xs text-muted-foreground font-medium">End Time</label>
            <input
              type="time"
              value={time.end}
              onChange={(e) => handleTimeChange(e, 'end')}
              className={cn(
                "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
                "file:border-0 file:bg-transparent file:text-sm file:font-medium",
                "placeholder:text-muted-foreground",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}
Calendar.displayName = "Calendar";


export { Calendar };
