import React, { useEffect, useState } from 'react';
import CityMapView from '../CityMapView'; // Adjust path as needed
import { Place } from '../../types'; // Adjust path as needed
import { useLanguage } from '../../context/LanguageContext'; // Adjust path as needed
import { useFont } from '../../context/FontContext';
import { cn } from "@/lib/utils";
import { MapPin } from 'lucide-react';
import { routeTrackApi } from '../../services/routeTrackApi';
import RouteStats from '../RouteStats';

interface RouteMapProps {
  places: Place[];
  maintainZoom?: boolean; // Added maintainZoom prop
  routeId?: string; // Add routeId prop for GPS track loading
}

const RouteMap: React.FC<RouteMapProps> = ({ places, maintainZoom = false, routeId }) => {
    const { t } = useLanguage();
    const { fonts } = useFont();
    const [gpsTrackCoordinates, setGpsTrackCoordinates] = useState<[number, number][]>([]);

    // Load GPS track data when routeId changes
    useEffect(() => {
        const loadGpsTrack = async () => {
            if (!routeId) {
                setGpsTrackCoordinates([]);
                return;
            }

            try {
                console.log('🛣️ Loading GPS track for route:', routeId);
                const coordinates = await routeTrackApi.getGpsCoordinatesForMap(routeId);
                console.log('🛣️ GPS track loaded:', coordinates.length, 'points');
                setGpsTrackCoordinates(coordinates);
            } catch (error) {
                console.error('Error loading GPS track:', error);
                setGpsTrackCoordinates([]);
            }
        };

        loadGpsTrack();
    }, [routeId]);


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
        <div className="h-full flex flex-col mb-10 rounded-xl shadow-sm p-0 w-full max-w-none min-h-[400px]">
            <div className="flex-grow rounded-none overflow-hidden w-full h-full min-h-[400px]">
                <CityMapView
                    locations={mapLocations}
                    polylinePoints={polylinePoints}
                    maintainZoom={maintainZoom}
                    gpsTrackCoordinates={gpsTrackCoordinates}
                />
            </div>

            {/* Route Statistics */}
            <div className="p-4 border-t border-gray-200">
                <RouteStats
                    places={places}
                    gpsCoordinates={gpsTrackCoordinates}
                />
            </div>
        </div>
    );
}

export default RouteMap;
