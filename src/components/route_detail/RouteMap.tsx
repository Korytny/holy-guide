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
        <div className="h-full flex flex-col mb-10 bg-white rounded-xl shadow-sm p-6 md:p-8"> {/* Added h-full and flex flex-col */}
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-[#09332A] font-[Laudatio]">Маршрут на карте</h2>
            <div className="flex-grow rounded-xl overflow-hidden shadow-lg mt-4"> {/* Changed h-96 to flex-grow */}
                <CityMapView 
                    locations={mapLocations} 
                    polylinePoints={polylinePoints}
                    maintainZoom={false}
                />
            </div>
        </div>
    );
}

export default RouteMap;
