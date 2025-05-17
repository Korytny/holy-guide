"use client";

import { DateField, DateInput, DateSegment, Label } from "react-aria-components";
import type { DateValue } from '@internationalized/date';

interface DateFieldComponentProps {
  label: string;
  className?: string;
  labelClassName?: string;
  value: DateValue | null | undefined; // Allow null or undefined for empty state
  onChange: (date: DateValue | null) => void;
}

function DateFieldComponent({ label, value, onChange, className, labelClassName }: DateFieldComponentProps) {
  return (
    // Pass value and onChange to the underlying react-aria-components DateField
    <DateField className={`space-y-2 min-w-[150px] ${className || ''}`} value={value} onChange={onChange}>
      <Label className={`text-sm font-medium text-foreground ${labelClassName || ''}`}>{label}</Label>
      <DateInput className="relative inline-flex h-9 w-full items-center overflow-hidden whitespace-nowrap rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm shadow-black/5 transition-shadow data-[focus-within]:border-ring data-[disabled]:opacity-50 data-[focus-within]:outline-none data-[focus-within]:ring-[3px] data-[focus-within]:ring-ring/20">
        {(segment) => (
          <DateSegment
            segment={segment}
            className="inline rounded p-0.5 text-foreground caret-transparent outline outline-0 data-[disabled]:cursor-not-allowed data-[focused]:bg-accent data-[invalid]:data-[focused]:bg-destructive data-[type=literal]:px-0 data-[focused]:data-[placeholder]:text-foreground data-[focused]:text-foreground data-[invalid]:data-[focused]:data-[placeholder]:text-destructive-foreground data-[invalid]:data-[focused]:text-destructive-foreground data-[invalid]:data-[placeholder]:text-destructive data-[invalid]:text-destructive data-[placeholder]:text-muted-foreground/70 data-[type=literal]:text-muted-foreground/70 data-[disabled]:opacity-50"
          />
        )}
      </DateInput>
      {/* The help text can be removed if not needed universally, or made configurable */}
      {/* <p className="mt-2 text-xs text-muted-foreground" role="region" aria-live="polite">
        Built with{" "}
        <a
          className="underline hover:text-foreground"
          href="https://react-spectrum.adobe.com/react-aria/DateField.html"
          target="_blank"
          rel="noopener nofollow"
        >
          React Aria
        </a>
      </p> */}
    </DateField>
  );
}

export { DateFieldComponent };
