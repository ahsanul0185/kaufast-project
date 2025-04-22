import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Property } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import PropertyCard from "@/components/property/PropertyCard";
import { ArrowRight } from "lucide-react";

export default function PropertyCards() {
  const { data: properties, isLoading, error } = useQuery<Property[]>({
    queryKey: ['/api/properties/featured'],
  });
  
  if (isLoading) {
    return (
      <section className="bg-neutral-100 py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-heading text-2xl md:text-3xl font-bold">Featured Properties</h2>
            <div className="h-6 w-40 bg-neutral-200 animate-pulse rounded"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md p-5">
                <div className="w-full h-64 bg-neutral-200 animate-pulse rounded-md mb-4"></div>
                <div className="h-7 w-1/2 bg-neutral-200 animate-pulse rounded mb-2"></div>
                <div className="h-5 w-3/4 bg-neutral-200 animate-pulse rounded mb-4"></div>
                <div className="h-4 w-full bg-neutral-200 animate-pulse rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  if (error) {
    return (
      <section className="bg-neutral-100 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <h2 className="font-heading text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-neutral-600 mb-6">Failed to load featured properties</p>
            <Button variant="default" className="bg-primary text-white">Try Again</Button>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section className="bg-neutral-100 py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="font-heading text-2xl md:text-3xl font-bold">Featured Properties</h2>
          <Link href="/search" className="text-primary font-medium flex items-center">
            <span>View all properties</span>
            <i className="fas fa-arrow-right ml-2"></i>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties?.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
}
