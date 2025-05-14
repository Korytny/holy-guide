import React from 'react';
import CityMapView from '../CityMapView'; // Adjust path as needed
import { Place } from '../../types'; // Adjust path as needed
import { useLanguage } from '../../context/LanguageContext'; // Adjust path as needed

interface PlaceMapProps {
  place: Place;
}

const PlaceMap: React.FC<PlaceMapProps> = ({ place }) => {
    const { t } = useLanguage();

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
            <h2 className="text-2xl font-semibold mb-6 text-gray-900 font-['Laudatio']">{t('location')}</h2>
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
