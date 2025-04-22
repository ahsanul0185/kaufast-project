import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function CallToAction() {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="bg-primary bg-opacity-10 rounded-xl p-8 md:p-12 text-center">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-dark mb-4">
          Find Your Dream Property
        </h2>
        <p className="text-neutral-700 md:text-lg max-w-2xl mx-auto mb-6">
          Browse through our exclusive collection of properties in Dubai and find the perfect home that matches your lifestyle and preferences.
        </p>
        <Link href="/search">
          <Button className="bg-primary text-white px-8 py-3 rounded-full font-medium text-lg hover:bg-primary-dark transition-colors h-auto">
            Browse Properties
          </Button>
        </Link>
      </div>
    </section>
  );
}
