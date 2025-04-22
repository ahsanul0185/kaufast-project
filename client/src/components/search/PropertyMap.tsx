import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Property } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { PropertyService } from "@/lib/property-service";
import { useLocation } from "wouter";

interface PropertyMapProps {
  properties: Property[];
  loading?: boolean;
  height?: string;
  className?: string;
}

export default function PropertyMap({
  properties,
  loading = false,
  height = "600px",
  className = "",
}: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const [_, navigate] = useLocation();
  
  // Setup and initialize the map
  useEffect(() => {
    if (mapRef.current && !leafletMap.current) {
      // Initialize map
      leafletMap.current = L.map(mapRef.current, {
        center: [25.276987, 55.296249], // Dubai coordinates as default
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
    }
    
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);
  
  // Update markers when properties change
  useEffect(() => {
    if (!loading && leafletMap.current && properties.length > 0) {
      // Clear existing markers
      leafletMap.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          layer.remove();
        }
      });
      
      // Collect valid coordinates for bounds
      const validCoordinates: L.LatLngExpression[] = [];
      
      // Add markers for properties
      properties.forEach((property) => {
        if (property.latitude && property.longitude) {
          // Add to valid coordinates for bounds
          validCoordinates.push([property.latitude, property.longitude]);
          
          // Format price for display
          const isRental = property.listingType === 'rent';
          const priceFormatted = PropertyService.formatPrice(property.price, isRental);
          
          // Create custom icon for marker
          const markerHtml = `
            <div class="bg-primary text-white px-2 py-1 rounded-lg text-sm font-medium">
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
      
      // Set bounds to fit all markers if we have valid coordinates
      if (validCoordinates.length > 0) {
        leafletMap.current.fitBounds(validCoordinates, { padding: [50, 50] });
      }
    }
  }, [properties, loading]);
  
  if (loading) {
    return (
      <div style={{ height }} className={`bg-neutral-200 animate-pulse rounded-xl ${className}`}>
        <div className="h-full w-full flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-neutral-400 mb-3"></i>
            <p className="text-neutral-600">Loading map...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (properties.length === 0) {
    return (
      <div style={{ height }} className={`bg-neutral-100 rounded-xl flex items-center justify-center ${className}`}>
        <div className="text-center p-6">
          <i className="fas fa-map-marker-alt text-4xl text-neutral-300 mb-3"></i>
          <p className="text-neutral-600">No properties to display on map</p>
          <p className="text-sm text-neutral-500 mt-2">Try adjusting your search filters</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height }} className={`relative rounded-xl overflow-hidden shadow-md ${className}`}>
      <div ref={mapRef} className="h-full w-full"></div>
      
      {/* Reset View Button */}
      <Button
        className="absolute bottom-4 right-4 bg-white text-primary hover:bg-neutral-100 z-[1000]"
        onClick={() => {
          if (leafletMap.current && properties.length > 0) {
            const validCoordinates = properties
              .filter(p => p.latitude && p.longitude)
              .map(p => [p.latitude!, p.longitude!] as L.LatLngExpression);
            
            if (validCoordinates.length > 0) {
              leafletMap.current.fitBounds(validCoordinates, { padding: [50, 50] });
            }
          }
        }}
      >
        <i className="fas fa-home mr-2"></i> Reset View
      </Button>
    </div>
  );
}
