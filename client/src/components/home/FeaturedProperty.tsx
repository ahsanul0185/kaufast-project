import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Property } from "@shared/schema";
import { useFavorites } from "@/hooks/use-favorites";
import { useMediaQuery } from "@/hooks/use-mobile";

interface FeaturedPropertyProps {
  property: Property;
}

export default function FeaturedProperty({ property }: FeaturedPropertyProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { isFavorite, toggleFavorite } = useFavorites();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  // Extract main image and thumbnails
  const mainImage = property.images[activeImageIndex];
  const thumbnails = property.images.slice(0, 4);
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Check out this property: ${property.title}`,
        url: window.location.origin + `/property/${property.id}`,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.origin + `/property/${property.id}`)
        .then(() => alert('Link copied to clipboard'))
        .catch((error) => console.error('Could not copy text: ', error));
    }
  };

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:space-x-8 bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Property Image */}
        <div className="md:w-1/2">
          <div className="relative h-[400px]">
            <img 
              src={mainImage} 
              alt={property.title}
              className="w-full h-full object-cover"
            />
            <Link href={`/search?lat=${property.latitude}&lng=${property.longitude}&radius=1`}>
              <Button variant="secondary" className="absolute bottom-4 left-4 bg-white bg-opacity-90 text-neutral-800 flex items-center px-3 py-2 rounded-lg text-sm font-medium">
                <i className="fas fa-map-marker-alt mr-2 text-primary"></i> View on Map
              </Button>
            </Link>
            <div className="absolute top-4 right-4 flex space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="bg-white bg-opacity-90 text-primary hover:text-primary-dark"
                onClick={handleShare}
              >
                <i className="fas fa-share-alt"></i>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`bg-white bg-opacity-90 ${isFavorite(property.id) ? 'text-primary' : 'text-neutral-400 hover:text-primary'}`}
                onClick={() => toggleFavorite(property.id)}
              >
                <i className="fas fa-heart"></i>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Property Details */}
        <div className="md:w-1/2 p-6">
          <div className="mb-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-neutral-500 mb-1">Minimal price</p>
                <h2 className="font-heading text-3xl font-bold">{formatPrice(property.price)}</h2>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 mb-4 flex-wrap">
            <div className="flex items-center">
              <i className="fas fa-home text-primary mr-2"></i>
              <span>{property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-ruler-combined text-primary mr-2"></i>
              <span>{property.squareFeet}m²</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-check-circle text-primary mr-2"></i>
              <span>Ready</span>
            </div>
          </div>
          
          {property.installmentPlan && (
            <div className="border-t border-neutral-200 pt-4 mb-4">
              <p className="text-sm text-neutral-500">
                Installment plan from {property.installmentPlan.years} years
              </p>
            </div>
          )}
          
          <div className="mb-6">
            <h3 className="text-sm font-medium uppercase text-neutral-500 mb-3">FEATURES</h3>
            <div className="grid grid-cols-2 gap-3">
              {property.features && property.features.slice(0, 4).map((feature, index) => {
                let icon = 'fa-check';
                
                // Map common features to icons
                if (feature.toLowerCase().includes('pool')) icon = 'fa-swimming-pool';
                if (feature.toLowerCase().includes('sea') || feature.toLowerCase().includes('ocean')) icon = 'fa-water';
                if (feature.toLowerCase().includes('balcony')) icon = 'fa-sun';
                if (feature.toLowerCase().includes('air')) icon = 'fa-snowflake';
                if (feature.toLowerCase().includes('garage') || feature.toLowerCase().includes('parking')) icon = 'fa-car';
                if (feature.toLowerCase().includes('gym')) icon = 'fa-dumbbell';
                if (feature.toLowerCase().includes('security')) icon = 'fa-shield-alt';
                if (feature.toLowerCase().includes('garden')) icon = 'fa-leaf';
                
                return (
                  <div key={index} className="flex items-center">
                    <div className="bg-neutral-100 p-2 rounded-full mr-3">
                      <i className={`fas ${icon} text-primary`}></i>
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-sm font-medium uppercase text-neutral-500 mb-3">LIFESTYLE</h3>
            <div className="inline-flex items-center bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-full text-sm">
              <i className="fas fa-leaf mr-2"></i>
              <span>Green area</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {thumbnails.map((image, index) => (
              <img 
                key={index}
                src={image} 
                alt={`Property thumbnail ${index + 1}`}
                className={`w-16 h-16 object-cover rounded-lg cursor-pointer ${
                  index === activeImageIndex ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setActiveImageIndex(index)}
              />
            ))}
            {property.images.length > 4 && (
              <Button 
                variant="secondary" 
                className="w-16 h-16 flex items-center justify-center bg-neutral-100 rounded-lg"
                onClick={() => setActiveImageIndex((activeImageIndex + 1) % property.images.length)}
              >
                <i className="fas fa-chevron-right text-primary"></i>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
