import React from 'react';
import { Link } from 'react-router-dom';

interface MapPopupProps {
  name: string;
  placeId: string;
  imageUrl?: string;
}

const MapPopup = ({ name, placeId, imageUrl }: MapPopupProps) => {
  if (!placeId) {
    console.error('Missing placeId in MapPopup');
    return null;
  }
  return (
    <div className="p-2 w-48">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-24 object-cover rounded mb-2"
        />
      ) : (
        <div className="bg-gray-100 h-24 mb-2 flex items-center justify-center">
          <span className="text-xs text-gray-500">No image</span>
        </div>
      )}
      
      <h3 className="font-medium text-sm mb-2 text-center">{name}</h3>
      
      <Link
        to={`/places/${placeId}`}
        className="text-xs text-blue-500 hover:underline block text-center"
      >
        Подробнее →
      </Link>
    </div>
  );
};

export default MapPopup;