import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { type City } from "../../types";
import { type Language } from "../../types";
import { type LanguageContextType } from "../../context/LanguageContext";
import { Calendar } from "@/components/ui/calendar";
import { getLocalizedText } from "../../utils/languageUtils";

interface PiligrimageControlsProps {
  availableCities: City[];
  selectedDateRange: any;
  onDateRangeChange: (range: any) => void;
  language: Language;
  t: LanguageContextType['t'];
  onAddCity: (cityId: string) => void;
}

export const PiligrimageControls: React.FC<PiligrimageControlsProps> = ({
  availableCities,
  selectedDateRange,
  onDateRangeChange,
  language,
  t,
  onAddCity
}) => {
  const [selectedCity, setSelectedCity] = React.useState<string>();
  const [selectedEventType, setSelectedEventType] = React.useState<string>('kunda');

  return (
    <div className="flex flex-col gap-4 p-4 bg-muted/50 rounded-lg">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">{t('select_city')}</h3>
        <ToggleGroup 
          type="single" 
          className="flex-wrap gap-2"
          onValueChange={(value) => {
            setSelectedCity(value);
            onAddCity(value);
          }}
        >
          {availableCities.map(city => (
            <ToggleGroupItem 
              key={city.id} 
              value={city.id}
              className="px-3 py-1 text-sm"
            >
              {getLocalizedText(city.name, language)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Типы объектов</h3>
          <ToggleGroup type="multiple" className="flex-wrap gap-2">
            <ToggleGroupItem value="temple" className="px-3 py-1 text-sm">
              Храмы
            </ToggleGroupItem>
            <ToggleGroupItem value="monastery" className="px-3 py-1 text-sm">
              Монастыри
            </ToggleGroupItem>
            <ToggleGroupItem value="holy_place" className="px-3 py-1 text-sm">
              Святые места
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Тип событий</h3>
          <ToggleGroup 
            type="single" 
            value={selectedEventType}
            onValueChange={setSelectedEventType}
            className="flex-wrap gap-2"
          >
            <ToggleGroupItem value="kunda" className="px-3 py-1 text-sm">
              Кунда
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div className="w-full">
        <Calendar
          mode="range"
          selected={selectedDateRange}
          onSelect={onDateRangeChange}
          className="rounded-md border"
        />
      </div>
    </div>
  );
};
