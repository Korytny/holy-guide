
import React from 'react';

interface MapPopupProps {
  name: string;
  placeId: string;
  imageUrl?: string;
  description?: string;
  onNavigate: (path: string) => void; // Function to handle navigation
}

const MapPopup = ({ name, placeId, imageUrl, description, onNavigate }: MapPopupProps) => {
  
  const handleClick = () => {
    onNavigate(`/places/${placeId}`);
  };

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
      
      <div 
        className="text-xs text-blue-500 hover:underline block text-center cursor-pointer pt-2"
        onClick={handleClick} // Call the passed navigation function
      >
        View details →
      </div>
    </div>
  );
};

export default MapPopup;
