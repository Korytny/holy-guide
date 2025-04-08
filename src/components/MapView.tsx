
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useLanguage } from '../context/LanguageContext';
import { getLocalizedText } from '../utils/languageUtils';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import MapPopup from './MapPopup';

export interface Location {
  id?: string;
  latitude: number;
  longitude: number;
  name?: string | { [key: string]: string };
  description?: string | { [key: string]: string };
  imageUrl?: string;
  type?: number;
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
    
    // Wait for map to load
    map.current.on('load', () => {
      // Add markers for each location
      if (locations.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        
        locations.forEach(location => {
          const { latitude, longitude, name, description, imageUrl, id } = location;
          const localizedName = name ? getLocalizedText(name, language) : undefined;
          const localizedDesc = description ? getLocalizedText(description, language) : undefined;
          
          // Skip if no valid coordinates
          if (!latitude || !longitude) return;
          
          // Extend map bounds
          bounds.extend([longitude, latitude]);
          
          // Create marker element
          const el = document.createElement('div');
          el.className = 'marker';
          el.style.backgroundImage = 'url(https://cdn-icons-png.flaticon.com/512/4874/4874738.png)';
          el.style.width = '32px';
          el.style.height = '32px';
          el.style.backgroundSize = 'cover';
          
          if (id && localizedName) {
            // Create popup container for React content
            const popupContent = document.createElement('div');
            const root = createRoot(popupContent);
            
            try {
              root.render(
                <BrowserRouter>
                  <MapPopup
                    name={localizedName}
                    placeId={id}
                    imageUrl={imageUrl}
                    description={localizedDesc}
                  />
                </BrowserRouter>
              );
              
              // Add marker with popup
              new mapboxgl.Marker(el)
                .setLngLat([longitude, latitude])
                .setPopup(new mapboxgl.Popup({ offset: 25 }).setDOMContent(popupContent))
                .addTo(map.current!);
            } catch (error) {
              console.error('Error rendering MapPopup:', error);
              
              // Fallback to simple popup if React rendering fails
              new mapboxgl.Marker(el)
                .setLngLat([longitude, latitude])
                .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<h3>${localizedName}</h3>`))
                .addTo(map.current!);
            }
          } else {
            // Simple marker without popup if no id or name
            new mapboxgl.Marker(el)
              .setLngLat([longitude, latitude])
              .addTo(map.current!);
          }
        });
        
        // Fit map to bounds if we have locations
        if (!bounds.isEmpty()) {
          map.current.fitBounds(bounds, {
            padding: 50,
            maxZoom: 14
          });
        }
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
