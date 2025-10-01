import React from 'react';
import CityMapView from '../CityMapView'; // Adjust path as needed
import { Place } from '../../types'; // Adjust path as needed
import { useLanguage } from '../../context/LanguageContext'; // Adjust path as needed
import { useFont } from '../../context/FontContext';
import { cn } from "@/lib/utils";
import { MapPin } from 'lucide-react';

interface RouteMapProps {
  places: Place[];
  maintainZoom?: boolean; // Added maintainZoom prop
}

const RouteMap: React.FC<RouteMapProps> = ({ places, maintainZoom = false }) => { // Added prop and default value
    const { t } = useLanguage();
    const { fonts } = useFont();

    const mapLocations = places.map(place => ({
        id: place.id,
        latitude: place.location.latitude,
        longitude: place.location.longitude,
        name: place.name,
        description: place.description,
        imageUrl: place.imageUrl,
        type: place.type,
        order: place.order
    }));

    const validPlaces = places.filter(place => place.location?.latitude && place.location?.longitude);
    if (process.env.NODE_ENV === 'development') {
      console.debug('Valid places for map:', validPlaces);
    }
    const sortedPlaces = validPlaces
        .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
    
    const polylinePoints = sortedPlaces
        .map(place => [place.location.latitude, place.location.longitude] as [number, number]);
    
    if (process.env.NODE_ENV === 'development') {
      console.debug('🗺️ Sorted places for polyline:', sortedPlaces.map(p => ({
        name: p.name,
        order: p.order,
        coordinates: [p.location.latitude, p.location.longitude]
      })));
    }

    if (places.length === 0) {
        return null; // Don't render map if no places
    }

    return (
        <div className="h-full flex flex-col mb-10 bg-white rounded-xl shadow-sm p-0 w-full max-w-none">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-gray-900" />
              <h2 className={cn(
                "text-xl font-bold text-gray-900",
                fonts.heading.className
              )}>Маршрут на карте</h2>
            </div>
            <div className="flex-grow rounded-none overflow-hidden w-full" style={{ height: '500px' }}>
                <CityMapView 
                    locations={mapLocations} 
                    polylinePoints={polylinePoints}
                    maintainZoom={maintainZoom}
                />
            </div>
        </div>
    );
}

export default RouteMap;
