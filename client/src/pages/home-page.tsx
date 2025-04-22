import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import FeaturedProperty from "@/components/home/FeaturedProperty";
import PropertyDescription from "@/components/home/PropertyDescription";
import PropertyGallery from "@/components/home/PropertyGallery";
import PropertyCards from "@/components/home/PropertyCards";
import MapSection from "@/components/home/MapSection";
import CallToAction from "@/components/home/CallToAction";
import { Property } from "@shared/schema";

export default function HomePage() {
  const { data: featuredProperty, isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties/featured', { limit: 1 }],
  });
  
  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      <Navbar />
      
      <Hero />
      
      {featuredProperty && featuredProperty.length > 0 && (
        <>
          <FeaturedProperty property={featuredProperty[0]} />
          <PropertyDescription property={featuredProperty[0]} />
          <PropertyGallery property={featuredProperty[0]} />
        </>
      )}
      
      <PropertyCards />
      <MapSection />
      <CallToAction />
      
      <Footer />
    </div>
  );
}
