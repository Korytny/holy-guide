import React from 'react';
import CityMapView from '../CityMapView'; // Adjust path as needed
import { Place } from '../../types'; // Adjust path as needed
import { useLanguage } from '../../context/LanguageContext'; // Adjust path as needed

interface RouteMapProps {
  places: Place[];
  maintainZoom?: boolean; // Added maintainZoom prop
}

const RouteMap: React.FC<RouteMapProps> = ({ places, maintainZoom = false }) => { // Added prop and default value
    const { t } = useLanguage();

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
    console.log('Valid places for map:', validPlaces);
    const polylinePoints = validPlaces
        .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))
        .map(place => [place.location.latitude, place.location.longitude] as [number, number]);

    if (places.length === 0) {
        return null; // Don't render map if no places
    }

    return (
        <div className="h-full flex flex-col mb-10 bg-white rounded-xl shadow-sm p-0 w-full max-w-none">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Маршрут на карте</h2>
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
