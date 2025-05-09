import React from 'react';
import CityMapView from '../CityMapView'; // Adjust path as needed
import { Place } from '../../types'; // Adjust path as needed
import { useLanguage } from '../../context/LanguageContext'; // Adjust path as needed

interface RouteMapProps {
  places: Place[];
}

const RouteMap: React.FC<RouteMapProps> = ({ places }) => {
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

    const polylinePoints = places
        .filter(place => place.location?.latitude && place.location?.longitude)
        .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))
        .map(place => [place.location.latitude, place.location.longitude] as [number, number]);

    if (places.length === 0) {
        return null; // Don't render map if no places
    }

    return (
        <div className="mb-10">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">{t('route_on_map_title')}</h2>
            <div className="rounded-xl overflow-hidden shadow-lg h-96">
                <CityMapView 
                    locations={mapLocations} 
                    polylinePoints={polylinePoints} // Pass the points for the line
                    maintainZoom={false} // Allow map to fit bounds for route
                />
            </div>
        </div>
    );
}

export default RouteMap;
