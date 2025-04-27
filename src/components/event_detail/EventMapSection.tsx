import React from 'react';
import CityMapView from '../CityMapView'; // Adjust path
import { Place } from '../../types'; // Adjust path
import { useLanguage } from '../../context/LanguageContext'; // Adjust path
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
              <MapPin size={20} className="mr-2" />
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">{t('event_locations')}</h2>
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg h-96">
              <CityMapView
                locations={mapLocations}
                maintainZoom={false} // Adjust zoom to fit markers
              />
            </div>
          </div>
    );
}

export default EventMapSection;
