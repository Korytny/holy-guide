import React, { useEffect, useRef, memo } from 'react';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { createRoot } from 'react-dom/client';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { getLocalizedText } from '@/utils/languageUtils';
import MapPopup from '@/components/MapPopup';

interface Location {
  id: string;
  latitude: number;
  longitude: number;
  name?: string | { [key: string]: string };
  type?: number;
  imageUrl?: string;
  description?: string | { [key: string]: string };
  order?: number;
}

interface PilgrimageMapViewProps {
  locations: Location[];
  center?: [number, number];
  zoom?: number;
  maintainZoom?: boolean;
  polylinePoints?: LatLngExpression[];
}

// Wrapper to use hook
const PilgrimageMapViewWrapper: React.FC<PilgrimageMapViewProps> = (props) => {
  const navigate = useNavigate();
  return <PilgrimageMapView {...props} navigate={navigate} />;
};

interface PilgrimageMapViewInternalProps extends PilgrimageMapViewProps {
  navigate: ReturnType<typeof useNavigate>;
}

const PilgrimageMapView: React.FC<PilgrimageMapViewInternalProps> = memo(({
  locations = [],
  center,
  zoom = 13,
  maintainZoom = false,
  polylinePoints,
  navigate
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const { language } = useLanguage();
  const [isMapReady, setIsMapReady] = React.useState(false);

  // Color mapping
  const getMarkerColor = (type?: number) => {
    const colors: Record<number, string> = { 1: '#3b82f6', 2: '#ef4444', 3: '#10b981', 4: '#f59e0b' };
    return colors[type || 1] || '#4f46e5';
  };

  // Initialize map
  useEffect(() => {
    console.log('🗺️ PilgrimageMapView: Initializing map...');
    console.log('🗺️ PilgrimageMapView: Locations to display:', locations);
    
    if (!mapContainer.current) {
      console.error('🗺️ PilgrimageMapView: Map container is null!');
      return;
    }
    
    if (mapInstance.current) {
      console.log('🗺️ PilgrimageMapView: Map already initialized, skipping');
      return;
    }
    
    const defaultCenter = center || (locations.length > 0 ?
      [locations[0].latitude, locations[0].longitude] :
      [0, 0]);

    console.log('🗺️ PilgrimageMapView: Creating map with center:', defaultCenter, 'zoom:', zoom);
    
    try {
      mapInstance.current = L.map(mapContainer.current, {
        center: defaultCenter,
        zoom,
        preferCanvas: true
      });
      
      console.log('🗺️ PilgrimageMapView: Map created successfully');
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);
      
      console.log('🗺️ PilgrimageMapView: Tile layer added');
      setIsMapReady(true);
    } catch (error) {
      console.error('🗺️ PilgrimageMapView: Error creating map:', error);
    }
    
    return () => {
      console.log('🗺️ PilgrimageMapView: Cleaning up map...');
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Add/Update markers and polyline
  useEffect(() => {
    if (!mapInstance.current || !isMapReady) return;

    const map = mapInstance.current;
    console.log('🗺️ PilgrimageMapView: Received locations:', locations);
    const validLocations = locations.filter(loc => loc.latitude && loc.longitude);
    console.log('🗺️ PilgrimageMapView: Valid locations for map:', validLocations);

    // Clear previous layers
    map.eachLayer(layer => {
      if (layer instanceof L.Marker || layer === polylineRef.current) {
        map.removeLayer(layer);
      }
    });
    polylineRef.current = null;

    // Add Markers
    if (validLocations.length > 0) {
        const bounds = L.latLngBounds(validLocations.map(loc => [loc.latitude, loc.longitude] as [number, number]));
        validLocations.forEach(location => {
          if (!location?.latitude || !location?.longitude) return;

          const marker = L.marker([location.latitude, location.longitude], {
            icon: L.divIcon({
              className: 'custom-marker',
              html: `<div style="background-color:${getMarkerColor(location.type)};width:20px;height:20px;border-radius:50%;border:2px solid white;"></div>`,
              iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [0, -12]
            })
          }).addTo(map);

          const locationId = location.id;
          const name = location.name ? (typeof location.name === 'string' ? location.name : getLocalizedText(location.name, language) || 'Place') : 'Place';
          const description = location.description ? (typeof location.description === 'string' ? location.description : getLocalizedText(location.description, language)) : '';

          if (!locationId || !name) return;

          const popupContent = document.createElement('div');
          const root = createRoot(popupContent);
          try {
            root.render(
              <MapPopup
                name={name}
                placeId={locationId}
                imageUrl={location.imageUrl}
                description={description}
                onNavigate={navigate}
              />
            );
            marker.bindPopup(popupContent, { minWidth: 200, className: 'custom-popup' });
          } catch (error) { console.error('Popup render error:', error); }
        });

        // Add Polyline
        if (polylinePoints && polylinePoints.length > 1) {
          polylineRef.current = L.polyline(polylinePoints, { 
              color: '#ff0000',
              weight: 3, 
              opacity: 0.7,
              dashArray: '5, 5'
          }).addTo(map);
        }

        // Fit Bounds
        if (bounds.isValid() && !maintainZoom) {
          try {
              map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
          } catch (e) {
              console.error("Error fitting map bounds:", e);
          }
        }
    } else {
      if (center) map.setView(center, zoom);
    }

  }, [locations, polylinePoints, language, isMapReady, maintainZoom, navigate, center, zoom]);

  return (
    <div className="h-full w-full rounded-lg overflow-hidden relative">
      <div ref={mapContainer} className="h-full w-full min-h-[400px]" />
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100"><p>Loading map...</p></div>
      )}
    </div>
  );
});

export default PilgrimageMapViewWrapper;
