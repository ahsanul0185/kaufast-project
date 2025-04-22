import { Button } from "@/components/ui/button";
import { Property } from "@shared/schema";

interface PropertyDescriptionProps {
  property: Property;
}

export default function PropertyDescription({ property }: PropertyDescriptionProps) {
  const shortDescription = property.description.length > 250 
    ? property.description.substring(0, 250) + '...' 
    : property.description;

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Description */}
        <div className="md:col-span-2">
          <h3 className="text-sm font-medium uppercase text-neutral-500 mb-2">DESCRIPTION</h3>
          <h2 className="font-heading text-3xl font-bold mb-6">
            Builded by<br />Kleindienst Group
          </h2>
          
          <div className="mb-6">
            <p className="text-neutral-700 leading-relaxed">
              {shortDescription}
            </p>
          </div>
          
          <Button variant="link" className="flex items-center text-primary font-medium p-0">
            <span>Read More</span>
            <i className="fas fa-arrow-right ml-2"></i>
          </Button>
        </div>
        
        {/* Brand Info */}
        <div>
          <div className="bg-neutral-100 rounded-lg overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1572025442646-866d16c84a54?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
              alt="Kleindienst Group" 
              className="w-full h-48 object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
