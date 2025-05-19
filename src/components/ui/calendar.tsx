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
  // Remove onPrevClick, onNextClick, captionLabel from destructured props
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
    months: "relative flex flex-col sm:flex-row gap-0",
    month: "w-full",
    month_caption: "relative flex items-center justify-center gap-4 mb-1 w-full",
    caption_label: "text-xs font-semibold",
    nav: "flex items-center justify-between w-full mb-2 px-2",
    button_previous: cn(
      buttonVariants({ variant: "ghost" }),
      "size-6 text-foreground hover:bg-accent p-0",
    ),
    button_next: cn(
      buttonVariants({ variant: "ghost" }),
      "size-6 text-foreground hover:bg-accent p-0", // Navigation buttons can remain size-6
    ),
    weekday: "size-5 p-0 text-[0.65rem] font-medium text-muted-foreground/80", // Reduced weekday cell size
    day_button:
      "relative flex size-5 items-center justify-center whitespace-nowrap rounded-sm p-0 text-xs text-foreground outline-offset-1 group-[[data-selected]:not(.range-middle)]:[transition-property:color,background-color,border-radius,box-shadow] group-[[data-selected]:not(.range-middle)]:duration-150 focus:outline-none group-data-[disabled]:pointer-events-none focus-visible:z-10 hover:bg-accent group-data-[selected]:bg-primary hover:text-foreground group-data-[selected]:text-primary-foreground group-data-[disabled]:text-foreground/30 group-data-[disabled]:line-through group-data-[outside]:text-foreground/30 group-data-[outside]:group-data-[selected]:text-primary-foreground focus-visible:outline focus-visible:outline-1 focus-visible:outline-ring/70 group-[.range-start:not(.range-end)]:rounded-e-none group-[.range-end:not(.range-start)]:rounded-s-none group-[.range-middle]:rounded-none group-data-[selected]:group-[.range-middle]:bg-accent group-data-[selected]:group-[.range-middle]:text-foreground", // Reduced day button size
    day: "group size-8 px-0 text-sm", // Reduced day cell size
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
    <div className={cn("p-3", className)}> {/* Adjusted padding for container if needed */}
      {/* Removed custom navigation div */}
      <DayPicker
        showOutsideDays={showOutsideDays}
        classNames={{
          ...mergedClassNames,
          months: "relative flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0", // Adjusted month spacing
          caption: "relative pt-1 text-sm font-medium w-full mb-1", // Ensure caption container is relative, full-width
          caption_label: cn("block text-center", mergedClassNames.caption_label), // Make label block, center text, merge existing styles
          nav_button_previous: cn(defaultClassNames.button_previous, "absolute left-1"), // Style for default prev button
          nav_button_next: cn(defaultClassNames.button_next, "absolute right-1"), // Style for default next button
        }}
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
