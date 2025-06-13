import React from 'react';
import { Phone, Mail } from 'lucide-react';
import { Location } from '../types';

interface LocationSelectorProps {
  locations: Location[];
  onSelectLocation: (location: Location) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ locations, onSelectLocation }) => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((location) => (
          <div 
            key={location.id}
            className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer hover:bg-gray-700"
            onClick={() => onSelectLocation(location)}
          >
            <div 
              className="h-48 bg-cover bg-center" 
              style={{ backgroundImage: `url(${location.image})` }}
            >
              <div className="w-full h-full bg-black bg-opacity-40 flex items-end p-4">
                <h3 className="text-2xl font-bold text-white">{location.name}</h3>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-300 mb-4">{location.address}, {location.city}</p>
              <div className="flex items-center text-gray-400 mb-2">
                <Phone className="h-4 w-4 mr-2" />
                <span>{location.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Mail className="h-4 w-4 mr-2" />
                <span>{location.email || 'N/A'}</span>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-900 bg-opacity-50">
              <button 
                className="w-full py-2 bg-[#ebdaa8] hover:bg-[#ebdaa8] rounded-md font-medium transition-colors duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectLocation(location);
                }}
              >
                Seleziona
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LocationSelector;