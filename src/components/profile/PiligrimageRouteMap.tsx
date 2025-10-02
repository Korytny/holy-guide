import React from 'react';
import { type PlannedItem } from "../../types";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getLocalizedText } from "../../utils/languageUtils";

interface PiligrimageRouteMapProps {
  items: PlannedItem[];
}

const icon = L.icon({
  iconUrl: "/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export const PiligrimageRouteMap: React.FC<PiligrimageRouteMapProps> = ({ items }) => {
  const positions = items
    .map(item => {
      // Handle Place type
      if (item.type === 'place' && 'location' in item.data) {
        return {
          lat: item.data.location.latitude,
          lng: item.data.location.longitude,
          name: item.data.name
        };
      }
      // Handle Event type
      if (item.type === 'event' && 'location' in item.data) {
        return {
          lat: item.data.location.latitude,
          lng: item.data.location.longitude, 
          name: item.data.name
        };
      }
      return null;
    })
    .filter(Boolean);

  return (
    <div className="h-full w-full rounded-lg overflow-hidden">
      <MapContainer
        center={positions[0] || [55.7558, 37.6176]}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {positions.map((pos, i) => (
          <Marker key={i} position={pos} icon={icon}>
            <Popup>{getLocalizedText(pos.name, "en")}</Popup>
          </Marker>
        ))}
        {positions.length > 1 && (
          <Polyline positions={positions} color="blue" />
        )}
      </MapContainer>
    </div>
  );
};
