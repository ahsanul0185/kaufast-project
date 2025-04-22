import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Property } from "@shared/schema";
import { useFavorites } from "@/hooks/use-favorites";
import PropertyTourScheduling from "@/components/property/PropertyTourScheduling";
import PropertyToursList from "@/components/property/PropertyToursList";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function PropertyDetailsPage() {
  const [_, params] = useRoute<{ id: string }>("/property/:id");
  const id = params?.id ? parseInt(params.id) : 0;
  const { isFavorite, toggleFavorite } = useFavorites();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  const { data: property, isLoading, error } = useQuery<Property>({
    queryKey: [`/api/properties/${id}`],
    enabled: id > 0,
  });
  
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);
  
  useEffect(() => {
    // We'll initialize the map only when the map tab is active
    // The map container may not exist initially in our new layout
    const mapContainer = document.getElementById('property-map');
    if (property?.latitude && property.longitude && mapContainer) {
      try {
        // Initialize map
        const map = L.map('property-map', {
          center: [property.latitude, property.longitude],
          zoom: 15,
        });
        
        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);
        
        // Add marker
        const marker = L.marker([property.latitude, property.longitude]).addTo(map);
        marker.bindPopup(`<b>${property.title}</b><br>${property.address}`).openPopup();
        
        return () => {
          map.remove();
        };
      } catch (error) {
        console.log("Map initialization error:", error);
      }
    }
  }, [property]);
  
  const formatPrice = (price?: number) => {
    if (!price) return "";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property?.title || "Property",
        text: `Check out this property: ${property?.title}`,
        url: window.location.href,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copied to clipboard'))
        .catch((error) => console.error('Could not copy text: ', error));
    }
  };
  
  const handleNextImage = () => {
    if (!property) return;
    setActiveImageIndex((prevIndex) => (prevIndex + 1) % property.images.length);
  };
  
  const handlePrevImage = () => {
    if (!property) return;
    setActiveImageIndex((prevIndex) => (prevIndex - 1 + property.images.length) % property.images.length);
  };
  
  // This method is replaced by PropertyTourScheduling component
  const handleRequestTour = () => {
    // We'll keep this for now as a fallback for backward compatibility
    // with existing button handlers until we fully replace them
    console.log('Tour scheduling functionality moved to PropertyTourScheduling component');
  };
  
  const handleContactAgent = () => {
    // In a real app, this would open a form or modal
    alert('Contact agent form would open here');
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading property details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (error || !property) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex-grow">
          <div className="bg-white rounded-xl p-8 text-center shadow-md">
            <h1 className="font-heading text-2xl font-bold mb-4">Property Not Found</h1>
            <p className="text-neutral-600 mb-6">The property you're looking for doesn't exist or there was an error loading it.</p>
            <Link href="/search">
              <Button className="bg-primary text-white">Browse Properties</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        {/* Main layout with left content + right image */}
        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          {/* Left side - Property details */}
          <div className="w-full lg:w-1/2">
            {/* Property Title */}
            <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
            <p className="text-neutral-600 mb-6">
              {property.address}, {property.city}, {property.country}
            </p>
            
            {/* Price section */}
            <div className="mb-8">
              <h2 className="text-4xl font-bold">
                ${property.price.toLocaleString()}
                {property.listingType === 'rent' && <span className="text-lg font-normal text-neutral-600"> /night</span>}
              </h2>
            </div>
            
            {/* Property Tour Scheduling */}
            <div className="mb-8">
              <PropertyTourScheduling 
                propertyId={property.id}
              />
            </div>
            
            {/* Property features - icons*/}
            <div className="flex justify-between mb-12 border-b border-gray-200 pb-8">
              <div className="text-center">
                <div className="text-4xl mb-2">
                  <i className="fas fa-user-friends text-neutral-700"></i>
                </div>
                <p className="text-neutral-700">{property.bedrooms} Guests</p>
              </div>
              
              <div className="text-center">
                <div className="text-4xl mb-2">
                  <i className="fas fa-bed text-neutral-700"></i>
                </div>
                <p className="text-neutral-700">{property.bedrooms} Bedrooms</p>
              </div>
              
              <div className="text-center">
                <div className="text-4xl mb-2">
                  <i className="fas fa-bath text-neutral-700"></i>
                </div>
                <p className="text-neutral-700">{property.bathrooms} Bathroom</p>
              </div>
            </div>
            
            {/* Property description */}
            <div className="mb-8">
              <p className="text-neutral-700 whitespace-pre-line">
                {property.description}
              </p>
              <Button 
                variant="link" 
                className="text-neutral-700 p-0 mt-2 underline font-medium"
                onClick={() => alert('More description would show here')}
              >
                Show more
              </Button>
            </div>
            
            {/* Property amenities */}
            <div className="mb-8">
              <h3 className="font-heading text-xl font-bold mb-4">Amenities</h3>
              <div className="grid grid-cols-2 gap-y-4">
                {property.features && property.features.slice(0, 8).map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <i className="fas fa-arrow-right text-neutral-700 mt-1 mr-2"></i>
                    <span className="text-neutral-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Ratings section */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="text-2xl font-bold flex items-center">
                  <i className="fas fa-star mr-2"></i>
                  4.82 <span className="text-neutral-600 text-lg font-normal ml-2">· 55 reviews</span>
                </div>
              </div>
              
              {/* Review preview */}
              <div className="flex gap-4 mb-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-neutral-200 rounded-full overflow-hidden flex items-center justify-center">
                    <span className="text-neutral-600 font-medium">K</span>
                  </div>
                </div>
                <div>
                  <p className="font-bold">Kaveh</p>
                  <p className="text-neutral-600 text-sm">April 2023</p>
                  <p className="mt-2">Everything was great. The host was very kind and responsive. Check-in was smooth.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side - Images */}
          <div className="w-full lg:w-1/2">
            <div className="relative rounded-3xl overflow-hidden mb-4">
              <img 
                src={property.images[activeImageIndex]} 
                alt={property.title} 
                className="w-full h-[500px] object-cover"
              />
              
              <Button 
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full h-10 w-10"
                onClick={handlePrevImage}
              >
                <i className="fas fa-chevron-left"></i>
              </Button>
              
              <Button 
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full h-10 w-10"
                onClick={handleNextImage}
              >
                <i className="fas fa-chevron-right"></i>
              </Button>
            </div>
            
            {/* Thumbnail gallery */}
            <div className="grid grid-cols-2 gap-4">
              {property.images.slice(0, 2).map((image, index) => (
                <img 
                  key={index}
                  src={image} 
                  alt={`Property thumbnail ${index + 1}`}
                  className="w-full h-48 object-cover rounded-2xl cursor-pointer"
                  onClick={() => setActiveImageIndex(index === 0 ? 0 : 1)}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Map section */}
        <div className="bg-white rounded-xl p-6 shadow-md mb-6">
          <h3 className="font-heading text-xl font-bold mb-4">Location</h3>
          <p className="text-neutral-700 mb-4">
            <i className="fas fa-map-marker-alt text-primary mr-2"></i>
            {property.address}, {property.city}, {property.country}
          </p>
          <div id="property-map" className="h-[300px] rounded-xl"></div>
        </div>

        {/* Property Details section */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <h3 className="font-heading text-xl font-bold mb-4">Property Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex flex-col">
              <span className="text-neutral-500 text-sm">Property ID</span>
              <span className="font-medium">{property.id}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-neutral-500 text-sm">Property Type</span>
              <span className="font-medium capitalize">{property.propertyType}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-neutral-500 text-sm">Bedrooms</span>
              <span className="font-medium">{property.bedrooms}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-neutral-500 text-sm">Bathrooms</span>
              <span className="font-medium">{property.bathrooms}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-neutral-500 text-sm">Size</span>
              <span className="font-medium">{property.squareFeet} sqft</span>
            </div>
            {property.lotSize && (
              <div className="flex flex-col">
                <span className="text-neutral-500 text-sm">Lot Size</span>
                <span className="font-medium">{property.lotSize} sqft</span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-neutral-500 text-sm">Status</span>
              <span className="font-medium capitalize">
                For {property.listingType}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-neutral-500 text-sm">Verification</span>
              <span className={`font-medium ${property.isVerified ? 'text-green-500' : 'text-amber-500'}`}>
                {property.isVerified ? 'Verified' : 'Pending'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Amenities section */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <h3 className="font-heading text-xl font-bold mb-4">All Amenities</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {property.features && property.features.map((feature, index) => (
              <div key={index} className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center mr-3">
                  <i className="fas fa-check text-[#131313]"></i>
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Gallery section */}
        <div className="bg-white rounded-xl p-6 mb-6">
          <h3 className="font-heading text-xl font-bold mb-4">Full Gallery</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {property.images.map((image, index) => (
              <div key={index} className="rounded-xl overflow-hidden">
                <img 
                  src={image} 
                  alt={`Property image ${index + 1}`}
                  className="w-full h-64 object-cover transition-transform hover:scale-105 cursor-pointer"
                  onClick={() => setActiveImageIndex(index)}
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Property Tours List */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <PropertyToursList type="property" propertyId={property.id} />
        </div>
        
        {/* Agent Information */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="font-heading text-xl font-bold mb-4">Contact Agent</h3>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-neutral-200 rounded-full flex items-center justify-center text-neutral-500 text-xl font-semibold">
                AS
              </div>
            </div>
            <div className="flex-grow">
              <h4 className="font-heading text-lg font-bold">Areeya al Shams</h4>
              <p className="text-neutral-600 mb-3">Senior Property Consultant</p>
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center">
                  <i className="fas fa-phone-alt text-primary mr-2"></i>
                  <span>+971 345 248 018</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-envelope text-primary mr-2"></i>
                  <span>areeya@inmobi.com</span>
                </div>
              </div>
              <Button className="bg-primary text-white rounded-full" onClick={handleContactAgent}>
                <i className="fas fa-comment-alt mr-2"></i> Send Message
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
