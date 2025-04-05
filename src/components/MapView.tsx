
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedText } from '../utils/languageUtils';

export interface Location {
  latitude: number;
  longitude: number;
  name?: string | { [key: string]: string };
  description?: string;
}

interface MapViewProps {
  locations: Location[];
  center?: [number, number];
  zoom?: number;
}

const MapView: React.FC<MapViewProps> = ({ 
  locations, 
  center = [78.9629, 20.5937], // Default center of India
  zoom = 4 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('pk.eyJ1Ijoia29yeXRueSIsImEiOiJjazM2OWk0aWgwaXNlM29wbmFxYmcybDA1In0.3bQx9mdXq9p3PTkxb8soeQ');
  const { language, t } = useLanguage();
  
  const [showTokenInput, setShowTokenInput] = useState(false); // Changed to false since we have a default token
  
  const handleSubmitToken = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowTokenInput(false);
  };
  
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || showTokenInput) return;
    
    mapboxgl.accessToken = mapboxToken;
    
    if (map.current) return; // initialize map only once
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: center,
      zoom: zoom,
    });
    
    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Add markers for each location
    locations.forEach(location => {
      const { latitude, longitude, name, description } = location;
      const localizedName = name ? getLocalizedText(name, language) : undefined;
      
      // Create marker element
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundImage = 'url(https://cdn-icons-png.flaticon.com/512/4874/4874738.png)';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.backgroundSize = 'cover';
      
      // Add popup if name exists
      if (localizedName) {
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <h3 class="font-medium text-base">${localizedName}</h3>
            ${description ? `<p class="text-sm">${description}</p>` : ''}
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
  }, [mapboxToken, showTokenInput, locations, center, zoom, language]);
  
  return (
    <div className="rounded-lg overflow-hidden shadow-md bg-white h-[400px] w-full">
      {showTokenInput ? (
        <div className="h-full flex items-center justify-center flex-col p-6">
          <h3 className="text-lg font-medium mb-4">{t('mapbox_token_required')}</h3>
          <p className="text-sm text-gray-600 mb-4 text-center">
            {t('mapbox_token_description')}
          </p>
          <form onSubmit={handleSubmitToken} className="w-full max-w-md">
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
              placeholder={t('enter_mapbox_token')}
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full btn-primary"
            >
              {t('submit')}
            </button>
          </form>
        </div>
      ) : (
        <div ref={mapContainer} className="h-full w-full" />
      )}
    </div>
  );
};

export default MapView;
