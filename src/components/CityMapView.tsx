
import React, { useEffect, useRef, memo } from 'react';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { createRoot } from 'react-dom/client';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedText } from '../utils/languageUtils';
import MapPopup from './MapPopup';
import MapLegend from './MapLegend';

interface Location {
  id: string;
  latitude: number;
  longitude: number;
  name?: string | { [key: string]: string };
  type?: number;
  imageUrl?: string;
  description?: string | { [key: string]: string };
  order?: number; // Include order if available
}

interface CityMapViewProps {
  locations: Location[];
  center?: [number, number];
  zoom?: number;
  maintainZoom?: boolean;
  polylinePoints?: LatLngExpression[]; // Add prop for polyline points
  gpsTrackCoordinates?: LatLngExpression[]; // Add prop for GPS track coordinates
}

// Wrapper to use hook
const CityMapViewWrapper: React.FC<CityMapViewProps> = (props) => {
  const navigate = useNavigate();
  return <CityMapView {...props} navigate={navigate} />;
};

interface CityMapViewInternalProps extends CityMapViewProps {
  navigate: ReturnType<typeof useNavigate>;
}

const CityMapView: React.FC<CityMapViewInternalProps> = memo(({
  locations = [],
  center,
  zoom = 13,
  maintainZoom = false,
  polylinePoints, // Receive polyline points
  gpsTrackCoordinates, // Receive GPS track coordinates
  navigate
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null); // Ref to manage existing polyline
  const gpsTrackRef = useRef<L.Polyline | null>(null); // Ref to manage GPS track polyline
  const { language } = useLanguage();
  const [isMapReady, setIsMapReady] = React.useState(false);

  // Color mapping
  const getMarkerColor = (type?: number) => {
    const colors: Record<number, string> = { 1: '#3b82f6', 2: '#ef4444', 3: '#10b981', 4: '#f59e0b' };
    return colors[type || 1] || '#4f46e5';
  };

  // Initialize map
  useEffect(() => {
    console.log('🗺️ Initializing map...');
    console.log('🗺️ Map container ref:', mapContainer.current);
    console.log('🗺️ Map instance exists:', !!mapInstance.current);
    
    if (!mapContainer.current) {
      console.error('🗺️ Map container is null!');
      return;
    }
    
    if (mapInstance.current) {
      console.log('🗺️ Map already initialized, skipping');
      return; // Initialize only once
    }
    
    const defaultCenter = center || (locations.length > 0 ?
      [locations[0].latitude, locations[0].longitude] :
      [0, 0]); // Fallback to 0,0 if no locations
    
    console.log('🗺️ Creating map with center:', defaultCenter, 'zoom:', zoom);
    
    try {
      mapInstance.current = L.map(mapContainer.current, {
        center: defaultCenter,
        zoom,
        preferCanvas: true // Better performance for many markers
      });
      
      console.log('🗺️ Map created successfully:', !!mapInstance.current);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);
      
      console.log('🗺️ Tile layer added');
      setIsMapReady(true);
    } catch (error) {
      console.error('🗺️ Error creating map:', error);
    }
    
    return () => {
      console.log('🗺️ Cleaning up map...');
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
    console.log('🗺️ CityMapView received locations:', locations);
    const validLocations = locations.filter(loc => loc.latitude && loc.longitude);
    console.log('🗺️ Valid locations for map:', validLocations);
    console.log('🗺️ Map instance exists:', !!mapInstance.current);
    console.log('🗺️ Map container exists:', !!mapContainer.current);

    // --- Clear previous layers ---
    map.eachLayer(layer => {
      // Keep the tile layer, remove markers and existing polylines
      if (layer instanceof L.Marker || layer === polylineRef.current || layer === gpsTrackRef.current) {
        map.removeLayer(layer);
      }
    });
    polylineRef.current = null; // Reset polyline ref
    gpsTrackRef.current = null; // Reset GPS track ref

    // --- Add Markers --- 
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

        // --- Add Route Polyline (red dashed) ---
        if (polylinePoints && polylinePoints.length > 1) {
          polylineRef.current = L.polyline(polylinePoints, {
              color: '#ff0000', // Red color
              weight: 3,
              opacity: 0.7,
              dashArray: '5, 5' // Dashed line
          }).addTo(map);
          // Optionally fit bounds to the polyline as well
          // bounds.extend(polylineRef.current.getBounds());
        }

        // --- Add GPS Track Polyline (blue solid) ---
        if (gpsTrackCoordinates && gpsTrackCoordinates.length > 1) {
          console.log('🛣️ Adding GPS track to map:', gpsTrackCoordinates.length, 'points');
          gpsTrackRef.current = L.polyline(gpsTrackCoordinates, {
              color: '#3b82f6', // Blue color
              weight: 5,
              opacity: 0.8
              // Solid line (no dashArray)
          }).addTo(map);
          console.log('🛣️ GPS track added successfully');
        }

        // --- Fit Bounds --- 
        if (bounds.isValid() && !maintainZoom) {
          try {
              map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
          } catch (e) {
              console.error("Error fitting map bounds:", e);
          }
        }
    } else {
      // If no locations, maybe reset view?
      if (center) map.setView(center, zoom);
    }

  }, [locations, polylinePoints, gpsTrackCoordinates, language, isMapReady, maintainZoom, navigate, center, zoom]);

  return (
    <div className="h-full w-full rounded-lg overflow-hidden relative"> {/* Changed h-[400px] to h-full */}
      <div ref={mapContainer} className="h-full w-full min-h-[400px]" />

      {/* Map Legend */}
      <MapLegend
        showGpsTrack={gpsTrackCoordinates && gpsTrackCoordinates.length > 1}
        showRoute={polylinePoints && polylinePoints.length > 1}
      />

      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100"><p>Loading map...</p></div>
      )}
    </div>
  );
});

export default CityMapViewWrapper;
