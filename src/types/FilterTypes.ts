
import { Dispatch, SetStateAction } from 'react';

export interface FilterOption {
  value: string;
  label: string;
}

export interface Filter {
  name: string;
  label: string;
  options: FilterOption[];
}

export interface FilterSectionProps {
  filters: Filter[];
  onFilterChange: Dispatch<SetStateAction<Record<string, string>>>;
}
