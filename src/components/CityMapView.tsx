import React, { useEffect, useRef, memo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedText } from '../utils/languageUtils';
import MapPopup from './MapPopup';

interface MapLocation {
  id: string;
  latitude: number;
  longitude: number;
  name?: string | { [key: string]: string };
  type?: number;
  imageUrl?: string;
  description?: string | { [key: string]: string };
}

interface CityMapViewProps {
  locations: MapLocation[];
  center?: [number, number];
  zoom?: number;
}

const CityMapView: React.FC<CityMapViewProps> = memo(({
  locations = [],
  center,
  zoom = 13
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const { language } = useLanguage();
  const [isMapReady, setIsMapReady] = React.useState(false);

  // Color mapping for location types
  const getMarkerColor = (type?: number) => {
    const colors: Record<number, string> = {
      1: '#3b82f6', // Blue
      2: '#ef4444', // Red
      3: '#10b981', // Green
      4: '#f59e0b', // Yellow
    };
    return colors[type || 1] || '#4f46e5'; // Default indigo
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    mapInstance.current = L.map(mapContainer.current, {
      center: center || [55.751244, 37.618423],
      zoom,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapInstance.current);

    setIsMapReady(true);

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  // Add markers
  useEffect(() => {
    if (!mapInstance.current || !isMapReady) return;

    const validLocations = locations.filter(loc => loc.latitude && loc.longitude);
    const bounds = validLocations.map(loc => [loc.latitude, loc.longitude] as [number, number]);

    validLocations.forEach(location => {
      const marker = L.marker([location.latitude, location.longitude], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: `<div style="
            background-color: ${getMarkerColor(location.type)};
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 2px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 10px;
            font-weight: bold;
          "></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          popupAnchor: [0, -12]
        })
      }).addTo(mapInstance.current!);

      // Skip invalid locations but allow popups for those with coordinates
      if (!location?.latitude || !location?.longitude) {
        console.warn('Invalid location coordinates:', location);
        return;
      }
      const locationId = location.id;
      
      const name = location.name ?
        (typeof location.name === 'string' ? location.name : getLocalizedText(location.name, language) || 'Место') :
        'Место';

      if (!name) {
        console.warn('Location missing name:', location);
        return;
      }
      
      if (!location.id) {
        console.warn('Location missing ID, cannot create proper link:', location);
        return;
      }

      const popupContent = document.createElement('div');
      popupContent.className = 'popup-container';
      popupContent.style.minWidth = '150px';
      
      const root = createRoot(popupContent);
      console.log('Full location data structure:', JSON.parse(JSON.stringify(location)));
      console.log('Available location keys:', Object.keys(location));
      console.log('Data verification:', {
        hasName: !!location.name,
        hasImage: 'imageUrl' in location,
        hasDescription: 'description' in location,
        imageUrl: location.imageUrl,
        description: location.description,
        rawDescriptionType: typeof location.description,
        rawDescriptionContent: location.description
      });
      
      try {
        console.log('Popup props:', {
          name,
          locationId,
          imageUrl: location.imageUrl,
          description: location.description
        });
        
        root.render(
          <BrowserRouter>
            <MapPopup
             name={name}
             placeId={location.id}
             imageUrl={location.imageUrl}
           />
          </BrowserRouter>
        );
        
        marker.bindPopup(popupContent, {
          minWidth: 150,
          className: 'custom-popup'
        });
      } catch (error) {
        console.error('Popup render error:', error);
      }
    });

    if (bounds.length > 0) {
      mapInstance.current.fitBounds(bounds);
    }
    mapInstance.current.invalidateSize();

    return () => {
      mapInstance.current?.eachLayer(layer => {
        if (layer instanceof L.Marker) {
          mapInstance.current?.removeLayer(layer);
        }
      });
    };
  }, [locations, language, isMapReady]);

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden relative">
      <div ref={mapContainer} className="h-full w-full" />
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <p>Loading map...</p>
        </div>
      )}
    </div>
  );
});

export default CityMapView;
