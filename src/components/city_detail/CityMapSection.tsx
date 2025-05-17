import React from 'react';
import CityMapView from '../CityMapView'; // Adjust path
import { Place } from '../../types'; // Adjust path
import { useLanguage } from '../../context/LanguageContext';
import { useFont } from '../../context/FontContext';
import { Map as MapIcon } from 'lucide-react';
import { cn } from "@/lib/utils";

interface CityMapSectionProps {
  places: Place[];
}

interface MapLocation {
  id: string;
  latitude: number;
  longitude: number;
  name: any;
  description: any;
  imageUrl: string | undefined;
  type: number | undefined;
}

const CityMapSection: React.FC<CityMapSectionProps> = ({ places }) => {
    const { t } = useLanguage();
    const { fonts } = useFont();

    const mapLocations: MapLocation[] = places.map(place => ({
        id: place.id,
        latitude: place.location.latitude,
        longitude: place.location.longitude,
        name: place.name,
        description: place.description,
        imageUrl: place.imageUrl,
        type: place.type
    }));

    if (places.length === 0) {
        return null; // Don't render map if no places
    }

    return (
        <div className="mb-10">
            <div className="flex items-center mb-4">
                <MapIcon size={20} className="mr-2" />
                <h2 className={cn(
                  "text-xl md:text-2xl font-bold text-[#09332A]",
                  fonts.heading.className
                )}>{t('explore_on_map')}</h2>
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg h-96">
                <CityMapView
                    locations={mapLocations}
                    maintainZoom={false} // Allow map to adjust zoom to fit markers
                />
            </div>
        </div>
    );
}

export default CityMapSection;
