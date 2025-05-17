import React from 'react';
import CityMapView from '../CityMapView'; // Adjust path
import { Place } from '../../types'; // Adjust path
import { useLanguage } from '../../context/LanguageContext'; // Adjust path
import { useFont } from '../../context/FontContext';
import { cn } from "@/lib/utils";
import { MapPin } from 'lucide-react';

interface EventMapSectionProps {
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

const EventMapSection: React.FC<EventMapSectionProps> = ({ places }) => {
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
        <div className="mb-10 bg-white rounded-xl shadow-sm p-6 md:p-8">
            <h2 className={cn(
              "text-xl md:text-2xl font-bold mb-6 text-[#09332A]",
              fonts.heading.className
            )}>Места проведения</h2>
            <div className="rounded-xl overflow-hidden shadow-lg h-96 mt-4">
              <CityMapView
                locations={mapLocations}
                maintainZoom={false} // Adjust zoom to fit markers
              />
            </div>
          </div>
    );
}

export default EventMapSection;
