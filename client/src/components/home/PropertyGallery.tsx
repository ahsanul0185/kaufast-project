import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Property } from "@shared/schema";

interface PropertyGalleryProps {
  property: Property;
}

export default function PropertyGallery({ property }: PropertyGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % property.images.length);
  };
  
  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + property.images.length) % property.images.length);
  };
  
  const handleRequestTour = () => {
    // In a real app, this would open a modal or navigate to a booking form
    alert("Tour request functionality would be implemented here");
  };
  
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h3 className="text-sm font-medium uppercase text-neutral-500 mb-2">GALLERY</h3>
        <div className="flex justify-between items-center">
          <h2 className="font-heading text-3xl font-bold">Exterior & interior</h2>
          <Button
            onClick={handleRequestTour}
            variant="link"
            className="text-primary font-medium hidden md:flex items-center p-0"
          >
            <span>Request Tour</span>
            <i className="fas fa-arrow-right ml-2"></i>
          </Button>
        </div>
      </div>
      
      <div className="relative">
        <div className="rounded-xl overflow-hidden">
          <img 
            src={property.images[currentIndex]} 
            alt={`Property image ${currentIndex + 1}`}
            className="w-full h-[500px] object-cover"
          />
        </div>
        
        <div className="absolute bottom-4 left-4 bg-white px-3 py-1 rounded-full text-sm">
          <span>{currentIndex + 1} / {property.images.length}</span>
        </div>
        
        <Button
          onClick={handlePrev}
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full h-10 w-10"
        >
          <i className="fas fa-chevron-left"></i>
        </Button>
        
        <Button
          onClick={handleNext}
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full h-10 w-10"
        >
          <i className="fas fa-chevron-right"></i>
        </Button>
        
        <Button
          onClick={handleRequestTour}
          className="md:hidden w-full mt-4 bg-primary text-white py-3 rounded-full font-medium"
        >
          Request Tour
        </Button>
      </div>
      
      <p className="text-sm text-neutral-500 mt-4">
        Want to see more or order 3D or video-tour? Request tour for more detailed visualization.
      </p>
    </section>
  );
}
