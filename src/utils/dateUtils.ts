import { format, addDays, isBefore, isAfter, parseISO, isSameDay } from 'date-fns';

export function getDaysBetweenDates(startDate: Date, endDate: Date): Date[] {
  if (!startDate || !endDate) return [];
  if (isAfter(startDate, endDate)) return [];

  const days = [];
  let currentDate = new Date(startDate);
  
  while (isBefore(currentDate, endDate) || isSameDay(currentDate, endDate)) {
    days.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }

  return days;
}

export function validateDateRange(range: { from?: Date; to?: Date }): boolean {
  if (!range.from || !range.to) return false;
  return isBefore(range.from, range.to) || isSameDay(range.from, range.to);
}

export function formatDateSafe(date: Date | string | undefined, formatStr: string): string {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch (e) {
    console.error('Error formatting date:', e);
    return '';
  }
}
