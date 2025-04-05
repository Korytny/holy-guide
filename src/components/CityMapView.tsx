import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedText } from '../utils/languageUtils';

interface Location {
  latitude: number;
  longitude: number;
  name?: string | { [key: string]: string };
  description?: string;
}

interface CityMapViewProps {
  locations: Location[];
  center?: [number, number];
  zoom?: number;
  maintainZoom?: boolean;
}

const CityMapView: React.FC<CityMapViewProps> = memo(({ 
  locations, 
  center,
  zoom = 12,
  maintainZoom = true
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();

  const calculateCenter = useCallback((): [number, number] => {
    if (center) return center;
    if (locations.length === 0) return [55.7558, 37.6176]; // Default to Moscow [lat, lng]
    
    if (locations.length === 1) {
      return [locations[0].latitude, locations[0].longitude];
    }
    
    const sumLat = locations.reduce((sum, loc) => sum + loc.latitude, 0);
    const sumLng = locations.reduce((sum, loc) => sum + loc.longitude, 0);
    
    return [sumLat / locations.length, sumLng / locations.length];
  }, [center, locations]);

  const initMap = useCallback(async () => {
    if (!mapContainer.current) return;
    
    const L = await import('leaflet');
    await import('leaflet/dist/leaflet.css');
    
    const mapCenter = calculateCenter();
    const map = L.map(mapContainer.current).setView(mapCenter, zoom);
    
    // Auto-fit bounds if there are multiple locations
    if (locations.length > 1) {
      const bounds = L.latLngBounds(
        locations.map(loc => [loc.latitude, loc.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
    
    // Initialize map with proper language support
    const initMap = () => {
      if (language === 'en' && process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
        try {
          // Use Mapbox Streets style with English labels
          L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`, {
            attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            tileSize: 512,
            zoomOffset: -1,
            maxZoom: 18
          }).addTo(map);
          return;
        } catch (e) {
          console.warn('Mapbox failed to load, falling back to OSM');
        }
      }

      // Fallback to OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18
      }).addTo(map);
    };

    initMap();

    // Set language for any map elements
    map.getContainer().setAttribute('lang', language);

    locations.forEach(location => {
      const { latitude, longitude, name, description } = location;
      const localizedName = name ? getLocalizedText(name, language) : undefined;
      
      const marker = L.marker([latitude, longitude]);
      
      if (localizedName) {
        marker.bindPopup(`
          <div>
            <h3 class="font-medium">${localizedName}</h3>
            ${description ? `<p class="text-sm">${description}</p>` : ''}
          </div>
        `);
      }
      
      marker.addTo(map);
    });

    return () => map.remove();
  }, [calculateCenter, language, locations, zoom]);

  useEffect(() => {
    const cleanupPromise = initMap();
    return () => {
      cleanupPromise.then(cleanup => cleanup && cleanup());
    };
  }, [initMap]);

  return (
    <div className="rounded-lg overflow-hidden shadow-md bg-white h-[400px] w-full">
      <div ref={mapContainer} className="h-full w-full" />
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if locations array length changes or center/zoom changes
  return prevProps.locations.length === nextProps.locations.length &&
         prevProps.center === nextProps.center &&
         prevProps.zoom === nextProps.zoom;
});

export default CityMapView;
