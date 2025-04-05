
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
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
  mapboxToken: string;
}

const CityMapView: React.FC<CityMapViewProps> = ({ 
  locations, 
  center,
  zoom = 12,
  mapboxToken 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { language, t } = useLanguage();
  
  // Calculate center if not provided
  const calculateCenter = (): [number, number] => {
    if (center) return center;
    if (locations.length === 0) return [78.9629, 20.5937]; // Default center of India
    
    if (locations.length === 1) {
      return [locations[0].longitude, locations[0].latitude];
    }
    
    // Calculate the center of all locations
    const sumLat = locations.reduce((sum, loc) => sum + loc.latitude, 0);
    const sumLng = locations.reduce((sum, loc) => sum + loc.longitude, 0);
    
    return [sumLng / locations.length, sumLat / locations.length];
  };
  
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;
    
    mapboxgl.accessToken = mapboxToken;
    
    if (map.current) {
      // Map already exists, update markers
      map.current.remove();
      map.current = null;
    }
    
    const mapCenter = calculateCenter();
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: mapCenter,
      zoom: zoom,
    });
    
    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Fit bounds to include all locations if there are multiple
    if (locations.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      
      locations.forEach(location => {
        bounds.extend([location.longitude, location.latitude]);
      });
      
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      });
    }
    
    // Add markers for each location
    locations.forEach(location => {
      const { latitude, longitude, name, description } = location;
      const localizedName = name ? getLocalizedText(name, language) : undefined;
      
      // Create marker element
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundImage = 'url(https://cdn-icons-png.flaticon.com/512/4874/4874738.png)';
      el.style.width = '30px';
      el.style.height = '30px';
      el.style.backgroundSize = 'cover';
      el.style.cursor = 'pointer';
      
      // Add popup if name exists
      if (localizedName) {
        const popup = new mapboxgl.Popup({ offset: 25, maxWidth: '300px' })
          .setHTML(`
            <div>
              <h3 class="font-medium text-base">${localizedName}</h3>
              ${description ? `<p class="text-sm mt-1">${description}</p>` : ''}
            </div>
          `);
        
        new mapboxgl.Marker(el)
          .setLngLat([longitude, latitude])
          .setPopup(popup)
          .addTo(map.current);
      } else {
        new mapboxgl.Marker(el)
          .setLngLat([longitude, latitude])
          .addTo(map.current);
      }
    });
    
    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken, locations, zoom, language]);
  
  return (
    <div className="rounded-lg overflow-hidden shadow-md bg-white h-[400px] w-full">
      <div ref={mapContainer} className="h-full w-full" />
    </div>
  );
};

export default CityMapView;
