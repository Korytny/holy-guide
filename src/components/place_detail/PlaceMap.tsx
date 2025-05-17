import React from 'react';
import CityMapView from '../CityMapView'; // Adjust path as needed
import { Place } from '../../types'; // Adjust path as needed
import { useLanguage } from '../../context/LanguageContext'; // Adjust path as needed
import { useFont } from '../../context/FontContext';
import { cn } from "@/lib/utils";
import { MapPin } from 'lucide-react';

interface PlaceMapProps {
  place: Place;
}

const PlaceMap: React.FC<PlaceMapProps> = ({ place }) => {
    const { t } = useLanguage();
    const { fonts } = useFont();

    const mapLocations = [{
        id: place.id,
        latitude: place.location.latitude,
        longitude: place.location.longitude,
        name: place.name,
        description: place.description,
        imageUrl: place.imageUrl,
        type: place.type
    }];

    return (
        <div className="mb-10">
            <div className="flex items-center gap-2 mb-6">
              <MapPin className="w-5 h-5 text-gray-900" />
              <h2 className={cn(
                "text-2xl font-semibold text-gray-900",
                fonts.heading.className
              )}>{t('location')}</h2>
            </div>
            <div className="rounded-xl overflow-hidden shadow-lg h-96">
                <CityMapView
                    locations={mapLocations} 
                    center={[place.location.latitude, place.location.longitude]} // Center on place
                    zoom={15} // Zoom closer for single place
                    maintainZoom={true} // Keep zoom fixed
                />
            </div>
        </div>
    );
}

export default PlaceMap;
