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


    const validPlaces = places.filter(place => place.location?.latitude && place.location?.longitude);
    const sortedPlaces = validPlaces
        .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
    
    const mapLocations = sortedPlaces
        .map(place => ({
            id: place.id,
            latitude: place.location.latitude,
            longitude: place.location.longitude,
            name: place.name,
            description: place.description,
            imageUrl: place.imageUrl,
            type: place.type,
            order: place.order
        }));

    const polylinePoints = sortedPlaces
        .map(place => [place.location.latitude, place.location.longitude] as [number, number]);
    
    

    if (validPlaces.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center bg-gray-100 rounded-xl text-gray-500">
                <div className="text-center">
                    <MapPin size={32} className="mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">{t('no_places_with_coordinates') || 'No places with valid coordinates available for map display'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col mb-10 bg-white rounded-xl shadow-sm p-0 w-full max-w-none min-h-[400px]">
            <div className="flex-grow rounded-none overflow-hidden w-full h-full min-h-[400px]">
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
