
export interface FilterOption {
  value: string;
  label: string;
}

export interface Filter {
  name: string;
  label: string;
  options: string[] | FilterOption[];
}

export interface FilterSectionProps {
  filters: Filter[];
  onFilterChange: (filters: any) => void;
}
