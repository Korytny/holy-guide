import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type AuthContextType } from "../../context/AuthContext";
import { type LanguageContextType } from "../../context/LanguageContext";
import { City, Place, Route, Event, Language, PlannedItem } from "../../types";
import { getCities } from "../../services/citiesApi";
import { getPlacesByCityId } from "../../services/placesApi";
import { format } from "date-fns";
import { supabase } from '../../integrations/supabase/client';
import { getLocalizedText } from '../../utils/languageUtils';

import { PiligrimageControls } from "./PiligrimageControls";
import { PiligrimageDisplay } from "./PiligrimageDisplay";
import PilgrimageRouteMap from "./PilgrimageRouteMap";

interface PiligrimagePlanerProps {
  auth: AuthContextType;
  language: Language;
  t: LanguageContextType['t'];
}

const getRandomTime = () => {
  const hour = Math.floor(Math.random() * 12) + 8;
  const minute = Math.floor(Math.random() * 4) * 15;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

export const PiligrimagePlaner: React.FC<PiligrimagePlanerProps> = ({ auth, language, t }) => {
  const [availableCities, setAvailableCities] = useState<City[]>([]);
  const [plannedItems, setPlannedItems] = useState<PlannedItem[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<import("react-day-picker").DateRange | undefined>();
  const [pilgrimageType, setPilgrimageType] = useState<string>("");

  useEffect(() => {
    const fetchCities = async () => {
      const response = await getCities();
      if (response) setAvailableCities(response);
    };
    fetchCities();
  }, []);

  const handleAddPlace = async (cityId: string) => {
    const places = await getPlacesByCityId(cityId);
    if (!places) return;

    const newItem: PlannedItem = {
      type: 'place',
      data: places[0],
      city_id_for_grouping: cityId,
      time: getRandomTime(),
      orderIndex: plannedItems.length
    };
    setPlannedItems([...plannedItems, newItem]);
  };

  const handleRemoveItem = (itemId: string) => {
    setPlannedItems(plannedItems.filter(item => item.data.id !== itemId));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <Select onValueChange={setPilgrimageType} value={pilgrimageType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('pilgrimage_filter_title')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="temple" className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                {t('place_type_temple')}
              </SelectItem>
              {/* Other select items */}
            </SelectContent>
          </Select>
        </div>
      </div>

      <PiligrimageControls
        availableCities={availableCities}
        selectedDateRange={selectedDateRange}
        onDateRangeChange={setSelectedDateRange}
        language={language}
        t={t}
        onAddCity={handleAddPlace}
      />

      {plannedItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PiligrimageDisplay
            items={plannedItems}
            onRemove={handleRemoveItem}
            onAddPlace={handleAddPlace}
            language={language}
            t={t}
          />
          <PilgrimageRouteMap plannedItems={plannedItems} />
        </div>
      )}
    </div>
  );
};
