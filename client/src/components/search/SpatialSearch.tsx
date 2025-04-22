import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Marker, useMap } from 'react-leaflet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import 'leaflet/dist/leaflet.css';
import { useQuery } from '@tanstack/react-query';
import PropertyCard from '../property/PropertyCard';
import L from 'leaflet';
import { apiRequest } from '@/lib/queryClient';
import { Property } from '@shared/schema';
import { Loader2, Search } from 'lucide-react';

interface MapLocationSetterProps {
  position: [number, number];
  setPosition: (position: [number, number]) => void;
}

// This component allows the map to update on position change
const MapLocationSetter: React.FC<MapLocationSetterProps> = ({ position, setPosition }) => {
  const map = useMap();
  
  // useEffect for setting map center
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);
  
  // Handle map clicks to set position
  useEffect(() => {
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      setPosition([e.latlng.lat, e.latlng.lng]);
    };
    
    map.on('click', handleMapClick);
    
    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, setPosition]);
  
  return null;
};

const SpatialSearch: React.FC = () => {
  // Default position (New York City)
  const [position, setPosition] = useState<[number, number]>([40.7128, -74.0060]);
  const [radius, setRadius] = useState<number>(1); // km
  const [isSearching, setIsSearching] = useState(false);
  const [searchAddress, setSearchAddress] = useState('');
  const [isFindingLocation, setIsFindingLocation] = useState(false);
  
  // Reference for the MapContainer
  const mapRef = useRef<L.Map | null>(null);
  
  // Query for properties near the position
  const {
    data: properties,
    isLoading,
    refetch
  } = useQuery<{ properties: Property[], total: number }>({
    queryKey: ['/api/properties/search', { lat: position[0], lng: position[1], radius }],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/properties/search', {
        lat: position[0],
        lng: position[1],
        radius: radius
      });
      return response.json();
    },
    enabled: false // Don't run automatically
  });
  
  // Function to perform search
  const handleSearch = async () => {
    setIsSearching(true);
    try {
      await refetch();
    } finally {
      setIsSearching(false);
    }
  };
  
  // Function to geocode address to coordinates
  const handleAddressSearch = async () => {
    if (!searchAddress) return;
    
    setIsFindingLocation(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setPosition([parseFloat(lat), parseFloat(lon)]);
        mapRef.current?.setView([parseFloat(lat), parseFloat(lon)], 13);
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
    } finally {
      setIsFindingLocation(false);
    }
  };
  
  // Function to get current location
  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsFindingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition([latitude, longitude]);
          mapRef.current?.setView([latitude, longitude], 13);
          setIsFindingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsFindingLocation(false);
        }
      );
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Find Properties Near You</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="p-4 bg-white shadow-md rounded-lg">
            <div className="mb-4">
              <Label htmlFor="address">Search by Address</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="address"
                  placeholder="Enter an address or location"
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddressSearch()}
                />
                <Button 
                  size="icon" 
                  onClick={handleAddressSearch}
                  disabled={isFindingLocation || !searchAddress}
                >
                  {isFindingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <Button 
              onClick={handleCurrentLocation} 
              variant="outline" 
              className="w-full mb-4"
              disabled={isFindingLocation}
            >
              {isFindingLocation ? 
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Finding your location...</> : 
                'Use My Current Location'
              }
            </Button>
            
            <div className="mb-4">
              <Label htmlFor="radius" className="block mb-2">
                Search Radius: {radius} km
              </Label>
              <Slider 
                id="radius"
                min={0.5} 
                max={10} 
                step={0.5} 
                value={[radius]} 
                onValueChange={(value) => setRadius(value[0])}
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <p className="text-sm text-gray-600 mb-1">Current Coordinates:</p>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline">Lat: {position[0].toFixed(6)}</Badge>
                <Badge variant="outline">Lng: {position[1].toFixed(6)}</Badge>
              </div>
            </div>
            
            <Button 
              onClick={handleSearch} 
              className="w-full mt-4 bg-black text-white hover:bg-white hover:text-black"
              disabled={isSearching}
            >
              {isSearching ? 
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Searching...</> : 
                'Search Properties'
              }
            </Button>
          </div>
          
          <div className="p-4 bg-white shadow-md rounded-lg">
            <h3 className="font-semibold mb-2">How to use:</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Click on the map to set a search location</li>
              <li>• Adjust the radius slider to expand or narrow your search</li>
              <li>• Use the search button to find properties in that area</li>
              <li>• Enter an address or use your current location</li>
            </ul>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <div className="h-[400px] rounded-lg overflow-hidden shadow-md">
            <MapContainer
              ref={mapRef}
              center={position}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={position} />
              <CircleMarker
                center={position}
                radius={radius * 20} // Scaled for visual representation
                pathOptions={{ color: 'rgba(0, 0, 0, 0.7)', fillColor: 'rgba(0, 0, 0, 0.2)', fillOpacity: 0.3 }}
              />
              <MapLocationSetter position={position} setPosition={setPosition} />
            </MapContainer>
          </div>
          
          {isLoading ? (
            <div className="mt-8 flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : properties ? (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">
                {properties.total} Properties Found
              </h2>
              
              {properties.total > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {properties.properties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              ) : (
                <div className="p-8 bg-gray-50 rounded-lg text-center">
                  <p className="text-gray-600">No properties found in this area. Try expanding your search radius or selecting a different location.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-8 p-8 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-600">Select a location and search radius, then click "Search Properties" to find real estate in that area.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpatialSearch;