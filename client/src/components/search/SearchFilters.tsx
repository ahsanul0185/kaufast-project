import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

type PropertySearchFilters = {
  query?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  listingType?: string;
  minSquareFeet?: number;
  maxSquareFeet?: number;
  features?: string[];
};

interface SearchFiltersProps {
  initialFilters: PropertySearchFilters;
  onFilterChange: (filters: PropertySearchFilters) => void;
  className?: string;
}

export default function SearchFilters({
  initialFilters,
  onFilterChange,
  className,
}: SearchFiltersProps) {
  const [_, navigate] = useLocation();
  const [filters, setFilters] = useState<PropertySearchFilters>(initialFilters);
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  // Initialize listingType if not provided
  useEffect(() => {
    if (!filters.listingType) {
      setFilters((prev) => ({ ...prev, listingType: "buy" }));
    }
  }, []);

  const handleFilterChange = (newFilters: Partial<PropertySearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    // Apply filters immediately without requiring Apply button click
    onFilterChange(updatedFilters);
  };

  const handleTabChange = (value: string) => {
    handleFilterChange({ listingType: value });
  };

  const handleBedroomsChange = (value: string) => {
    handleFilterChange({ bedrooms: value === "any" ? undefined : parseInt(value) });
  };

  const handleBathroomsChange = (value: string) => {
    handleFilterChange({ bathrooms: value === "any" ? undefined : parseInt(value) });
  };

  const handlePropertyTypeChange = (value: string) => {
    handleFilterChange({ propertyType: value === "any" ? undefined : value });
  };

  const handlePriceRangeChange = (values: number[]) => {
    if (values.length === 2) {
      handleFilterChange({ minPrice: values[0], maxPrice: values[1] });
    }
  };

  const handleSquareFeetChange = (values: number[]) => {
    if (values.length === 2) {
      handleFilterChange({ minSquareFeet: values[0], maxSquareFeet: values[1] });
    }
  };

  const handleFeatureToggle = (feature: string, checked: boolean) => {
    const currentFeatures = filters.features || [];
    let newFeatures: string[];
    
    if (checked) {
      newFeatures = [...currentFeatures, feature];
    } else {
      newFeatures = currentFeatures.filter(f => f !== feature);
    }
    
    handleFilterChange({ features: newFeatures.length > 0 ? newFeatures : undefined });
  };

  const clearFilters = () => {
    const clearedFilters = {
      ...initialFilters,
      listingType: filters.listingType, // keep the current tab
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  // Common property features
  const propertyFeatures = [
    "Swimming Pool",
    "Near the Sea",
    "Balcony",
    "Air-conditioning",
    "Parking",
    "Gym",
    "Security System",
    "Garden",
    "Ocean Views",
    "Furnished",
    "Pet Friendly",
    "WiFi",
  ];

  return (
    <div className={cn("bg-white rounded-xl shadow-md p-6", className)}>
      <Tabs 
        value={filters.listingType || "buy"} 
        onValueChange={handleTabChange}
        className="mb-6"
      >
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="buy">Buy</TabsTrigger>
          <TabsTrigger value="rent">Rent</TabsTrigger>
          <TabsTrigger value="sell">Sell</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-6">
        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="property-type">Property Type</Label>
            <Select 
              value={filters.propertyType || "any"}
              onValueChange={handlePropertyTypeChange}
            >
              <SelectTrigger id="property-type">
                <SelectValue placeholder="Any Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Type</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="penthouse">Penthouse</SelectItem>
                <SelectItem value="townhouse">Townhouse</SelectItem>
                <SelectItem value="office">Office</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="land">Land</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="bedrooms">Bedrooms</Label>
            <Select 
              value={filters.bedrooms?.toString() || "any"}
              onValueChange={handleBedroomsChange}
            >
              <SelectTrigger id="bedrooms">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="1">1+</SelectItem>
                <SelectItem value="2">2+</SelectItem>
                <SelectItem value="3">3+</SelectItem>
                <SelectItem value="4">4+</SelectItem>
                <SelectItem value="5">5+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="bathrooms">Bathrooms</Label>
            <Select 
              value={filters.bathrooms?.toString() || "any"}
              onValueChange={handleBathroomsChange}
            >
              <SelectTrigger id="bathrooms">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="1">1+</SelectItem>
                <SelectItem value="2">2+</SelectItem>
                <SelectItem value="3">3+</SelectItem>
                <SelectItem value="4">4+</SelectItem>
                <SelectItem value="5">5+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Price Range Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <Label>Price Range</Label>
            <div className="text-sm text-neutral-500">
              ${filters.minPrice || 0} - ${filters.maxPrice || 5000000}
            </div>
          </div>
          <Slider
            defaultValue={[filters.minPrice || 0, filters.maxPrice || 5000000]}
            max={10000000}
            step={50000}
            onValueChange={handlePriceRangeChange}
            className="mt-2"
          />
        </div>

        {/* Advanced Filters Button */}
        <div className="flex justify-center mt-6 mb-2">
          <Button
            variant="outline"
            size="sm"
            className={`w-full flex items-center justify-center gap-2 transition-all duration-300 ${showMoreFilters ? 'bg-primary/5 border-primary/20 text-primary' : ''}`}
            onClick={() => setShowMoreFilters(!showMoreFilters)}
          >
            {showMoreFilters ? (
              <>
                <i className="fas fa-chevron-up text-xs"></i>
                <span>Hide Advanced Filters</span>
              </>
            ) : (
              <>
                <i className="fas fa-sliders-h mr-1"></i>
                <span>Show Advanced Filters</span>
              </>
            )}
          </Button>
        </div>
        
        {/* Advanced Filters Content */}
        <Collapsible
          open={showMoreFilters}
          onOpenChange={setShowMoreFilters}
          className={`overflow-hidden transition-all duration-300 ${showMoreFilters ? 'mt-4 border-t border-neutral-200 pt-4' : ''}`}
        >
          <CollapsibleContent className="space-y-6">
            {/* Square Feet Range */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Square Feet</Label>
                <div className="text-sm text-neutral-500">
                  {filters.minSquareFeet?.toLocaleString() || 0} - {filters.maxSquareFeet?.toLocaleString() || '10,000'} sqft
                </div>
              </div>
              <Slider
                defaultValue={[filters.minSquareFeet || 0, filters.maxSquareFeet || 10000]}
                max={20000}
                step={100}
                onValueChange={handleSquareFeetChange}
                className="mt-2"
              />
            </div>
            
            {/* Features Section with Accordion */}
            <Accordion type="single" collapsible defaultValue="features" className="w-full">
              <AccordionItem value="features" className="border-b-0">
                <AccordionTrigger className="py-2 hover:no-underline">
                  <span className="flex items-center text-base font-medium">
                    <i className="fas fa-star mr-2 text-primary"></i>
                    Property Features
                    {filters.features && filters.features.length > 0 && (
                      <span className="ml-2 text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
                        {filters.features.length} selected
                      </span>
                    )}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pt-2">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {propertyFeatures.map((feature) => (
                      <div key={feature} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`feature-${feature}`} 
                          checked={filters.features?.includes(feature)}
                          onCheckedChange={(checked) => 
                            handleFeatureToggle(feature, checked as boolean)
                          }
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <Label 
                          htmlFor={`feature-${feature}`}
                          className="text-sm cursor-pointer"
                        >
                          {feature}
                        </Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            {/* Location Section (Additional) */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="Enter city name"
                    value={filters.city || ''}
                    onChange={(e) => handleFilterChange({ city: e.target.value || undefined })}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Filter Actions */}
        <div className="flex justify-end pt-4 border-t border-neutral-200">
          <Button
            variant="outline"
            onClick={clearFilters}
            className="text-neutral-700"
          >
            Clear All Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
