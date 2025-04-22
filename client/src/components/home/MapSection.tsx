import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Property } from "@shared/schema";
import { useLocation } from "wouter";

export default function MapSection() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const [_, navigate] = useLocation();
  
  const { data: properties } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });
  
  useEffect(() => {
    if (mapRef.current && !leafletMap.current) {
      // Initialize map
      leafletMap.current = L.map(mapRef.current, {
        center: [25.276987, 55.296249], // Dubai coordinates
        zoom: 12,
        zoomControl: false,
      });
      
      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(leafletMap.current);
      
      // Add zoom controls in a custom position
      L.control.zoom({
        position: 'topright'
      }).addTo(leafletMap.current);
      
      setMapLoaded(true);
    }
    
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);
  
  useEffect(() => {
    if (mapLoaded && leafletMap.current && properties?.length) {
      // Clear existing markers
      leafletMap.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          layer.remove();
        }
      });
      
      // Add markers for properties
      properties.forEach((property) => {
        if (property.latitude && property.longitude) {
          // Create custom icon for marker
          const priceFormatted = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            notation: 'compact',
            maximumFractionDigits: 1
          }).format(property.price);
          
          const markerHtml = `
            <div class="bg-primary text-white px-2 py-1 rounded-lg text-sm">
              ${priceFormatted}
            </div>
          `;
          
          const icon = L.divIcon({
            html: markerHtml,
            className: '',
            iconSize: [80, 40],
            iconAnchor: [40, 40]
          });
          
          // Create marker and add to map
          const marker = L.marker([property.latitude, property.longitude], { icon })
            .addTo(leafletMap.current!);
          
          // Add popup with property info
          marker.bindPopup(`
            <div class="p-2">
              <h3 class="font-bold">${property.title}</h3>
              <p>${property.bedrooms} bed, ${property.bathrooms} bath</p>
              <p class="font-bold">${priceFormatted}</p>
              <a href="/property/${property.id}" class="text-primary font-semibold">View Details</a>
            </div>
          `);
        }
      });
    }
  }, [mapLoaded, properties]);
  
  const handleMapSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?query=${encodeURIComponent(mapSearchQuery)}`);
  };
  
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-xl overflow-hidden shadow-md">
        <div className="relative h-[400px]">
          <div ref={mapRef} className="absolute inset-0 bg-neutral-200"></div>
          
          {/* Search on Map */}
          <div className="absolute top-4 left-4 right-16 lg:w-1/3 z-[1000]">
            <form onSubmit={handleMapSearch} className="bg-white rounded-lg shadow-md p-2 flex items-center">
              <i className="fas fa-search text-neutral-400 mx-2"></i>
              <Input 
                type="text" 
                placeholder="Search on map..." 
                className="bg-transparent border-none shadow-none focus-visible:ring-0 text-sm"
                value={mapSearchQuery}
                onChange={(e) => setMapSearchQuery(e.target.value)}
              />
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
