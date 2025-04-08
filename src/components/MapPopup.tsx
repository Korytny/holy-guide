
import React from 'react';
import { Link } from 'react-router-dom';

interface MapPopupProps {
  name: string;
  placeId: string;
  imageUrl?: string;
  description?: string;
}

const MapPopup = ({ name, placeId, imageUrl, description }: MapPopupProps) => {
  return (
    <div className="p-2 w-56 max-w-full">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-32 object-cover rounded mb-2"
        />
      ) : (
        <div className="bg-gray-100 h-32 mb-2 flex items-center justify-center rounded">
          <span className="text-xs text-gray-500">No image</span>
        </div>
      )}
      
      <h3 className="font-medium text-sm mb-1 text-center">{name}</h3>
      
      {description && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{description}</p>
      )}
      
      <Link
        to={`/places/${placeId}`}
        className="text-xs text-blue-500 hover:underline block text-center"
      >
        View details →
      </Link>
    </div>
  );
};

export default MapPopup;
