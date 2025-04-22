import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SearchFilters from "@/components/search/SearchFilters";
import PropertyList from "@/components/search/PropertyList";
import PropertyMap from "@/components/search/PropertyMap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PropertyService } from "@/lib/property-service";
import { Property, PropertySearchParams } from "@shared/schema";

// Type alias to match the search filters component
type PropertySearchFilters = Partial<PropertySearchParams>;

interface PropertyListCompactCardProps {
  property: Property;
}

// Add CompactCard to PropertyList to avoid type errors
const PropertyListCompactCard = ({ property }: PropertyListCompactCardProps) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex">
        <div className="w-20 h-20 bg-neutral-200 relative shrink-0">
          {property.images && property.images.length > 0 && (
            <img 
              src={property.images[0]} 
              alt={property.title} 
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </div>
        <div className="p-3">
          <h3 className="font-medium text-sm line-clamp-1">{property.title}</h3>
          <p className="text-xs text-neutral-500 mb-1">{property.bedrooms} bed · {property.bathrooms} bath</p>
          <p className="font-semibold text-sm">
            {PropertyService.formatPrice(property.price, property.listingType === 'rent')}
          </p>
        </div>
      </div>
    </div>
  );
};

// Extend PropertyList to add CompactCard
if (typeof PropertyList === 'function') {
  (PropertyList as any).CompactCard = PropertyListCompactCard;
}

export default function SearchResultsPage() {
  const [location, setLocation] = useLocation();
  const [searchParams, setSearchParams] = useState<PropertySearchParams>({ limit: 9, offset: 0 });
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [resultsView, setResultsView] = useState<'list' | 'map'>('list');
  const [page, setPage] = useState(1);
  const limit = 9; // Items per page

  // Parse query params on initial load and when URL changes
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    const params: PropertySearchParams = {
      limit,
      offset: (page - 1) * limit,
    };

    // Extract and parse all possible query parameters
    if (urlParams.has('query')) params.query = urlParams.get('query') || undefined;
    if (urlParams.has('city')) params.city = urlParams.get('city') || undefined;
    if (urlParams.has('minPrice')) params.minPrice = Number(urlParams.get('minPrice'));
    if (urlParams.has('maxPrice')) params.maxPrice = Number(urlParams.get('maxPrice'));
    if (urlParams.has('bedrooms')) params.bedrooms = Number(urlParams.get('bedrooms'));
    if (urlParams.has('bathrooms')) params.bathrooms = Number(urlParams.get('bathrooms'));
    if (urlParams.has('propertyType')) params.propertyType = urlParams.get('propertyType') as any;
    if (urlParams.has('listingType')) params.listingType = urlParams.get('listingType') as any;
    if (urlParams.has('minSquareFeet')) params.minSquareFeet = Number(urlParams.get('minSquareFeet'));
    if (urlParams.has('maxSquareFeet')) params.maxSquareFeet = Number(urlParams.get('maxSquareFeet'));
    if (urlParams.has('features')) {
      params.features = urlParams.get('features')?.split(',') || [];
    }
    if (urlParams.has('lat') && urlParams.has('lng')) {
      params.lat = Number(urlParams.get('lat'));
      params.lng = Number(urlParams.get('lng'));
      if (urlParams.has('radius')) {
        params.radius = Number(urlParams.get('radius'));
      }
    }

    setSearchParams(params);
  }, [location, page]);

  // Fetch properties based on search parameters
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/properties/search', searchParams],
    enabled: Object.keys(searchParams).length > 0,
  });

  const properties: Property[] = data?.properties || [];
  const total: number = data?.total || 0;

  // Update URL with filters
  const updateUrlWithFilters = (filters: Partial<PropertySearchParams>) => {
    const updatedParams = { ...searchParams, ...filters, offset: 0 };
    const queryString = buildQueryString(updatedParams);
    setLocation(`/search${queryString ? `?${queryString}` : ''}`);
    setPage(1); // Reset to first page when filters change
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setSearchParams({
      ...searchParams,
      offset: (newPage - 1) * limit,
    });
  };

  // Build query string from params
  const buildQueryString = (params: Partial<PropertySearchParams>): string => {
    const urlParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'limit' && key !== 'offset') {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            urlParams.set(key, value.join(','));
          }
        } else {
          urlParams.set(key, String(value));
        }
      }
    });
    
    return urlParams.toString();
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-8">
          <h1 className="font-heading text-2xl md:text-3xl font-bold mb-2">
            {searchParams.query 
              ? `Search Results for "${searchParams.query}"` 
              : "Properties Search"}
          </h1>
          <p className="text-neutral-600">
            {isLoading 
              ? "Searching for properties..." 
              : `Found ${total} properties matching your criteria`}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar with Filters */}
          <div className="lg:col-span-1">
            <SearchFilters 
              initialFilters={searchParams}
              onFilterChange={updateUrlWithFilters}
            />
            
            {/* Active Filters Display */}
            {Object.keys(searchParams).length > 2 && ( // More than just limit and offset
              <div className="mt-4 bg-white rounded-xl p-4 shadow-md">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Active Filters</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary h-auto p-0 hover:text-primary/80 hover:bg-transparent"
                    onClick={() => updateUrlWithFilters({ 
                      query: searchParams.query,
                      listingType: searchParams.listingType
                    })}
                  >
                    Clear All
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchParams.query && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="rounded-full text-xs h-auto py-1 pr-1 pl-3 border-primary/20 bg-primary/5 hover:bg-primary/10"
                      onClick={() => updateUrlWithFilters({ ...searchParams, query: undefined })}
                    >
                      <span className="mr-1">Search: {searchParams.query}</span>
                      <span className="rounded-full bg-primary/10 w-4 h-4 flex items-center justify-center text-primary">×</span>
                    </Button>
                  )}
                  {searchParams.city && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="rounded-full text-xs h-auto py-1 pr-1 pl-3 border-primary/20 bg-primary/5 hover:bg-primary/10"
                      onClick={() => updateUrlWithFilters({ ...searchParams, city: undefined })}
                    >
                      <span className="mr-1">City: {searchParams.city}</span>
                      <span className="rounded-full bg-primary/10 w-4 h-4 flex items-center justify-center text-primary">×</span>
                    </Button>
                  )}
                  {searchParams.propertyType && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="rounded-full text-xs h-auto py-1 pr-1 pl-3 border-primary/20 bg-primary/5 hover:bg-primary/10"
                      onClick={() => updateUrlWithFilters({ ...searchParams, propertyType: undefined })}
                    >
                      <span className="mr-1">Type: {PropertyService.getPropertyTypeName(searchParams.propertyType)}</span>
                      <span className="rounded-full bg-primary/10 w-4 h-4 flex items-center justify-center text-primary">×</span>
                    </Button>
                  )}
                  {searchParams.bedrooms && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="rounded-full text-xs h-auto py-1 pr-1 pl-3 border-primary/20 bg-primary/5 hover:bg-primary/10"
                      onClick={() => updateUrlWithFilters({ ...searchParams, bedrooms: undefined })}
                    >
                      <span className="mr-1">{searchParams.bedrooms}+ Bedrooms</span>
                      <span className="rounded-full bg-primary/10 w-4 h-4 flex items-center justify-center text-primary">×</span>
                    </Button>
                  )}
                  {searchParams.bathrooms && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="rounded-full text-xs h-auto py-1 pr-1 pl-3 border-primary/20 bg-primary/5 hover:bg-primary/10"
                      onClick={() => updateUrlWithFilters({ ...searchParams, bathrooms: undefined })}
                    >
                      <span className="mr-1">{searchParams.bathrooms}+ Bathrooms</span>
                      <span className="rounded-full bg-primary/10 w-4 h-4 flex items-center justify-center text-primary">×</span>
                    </Button>
                  )}
                  {(searchParams.minPrice || searchParams.maxPrice) && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="rounded-full text-xs h-auto py-1 pr-1 pl-3 border-primary/20 bg-primary/5 hover:bg-primary/10"
                      onClick={() => updateUrlWithFilters({ 
                        ...searchParams, 
                        minPrice: undefined, 
                        maxPrice: undefined 
                      })}
                    >
                      <span className="mr-1">Price: ${searchParams.minPrice?.toLocaleString() || 0} - ${searchParams.maxPrice?.toLocaleString() || "Any"}</span>
                      <span className="rounded-full bg-primary/10 w-4 h-4 flex items-center justify-center text-primary">×</span>
                    </Button>
                  )}
                  {(searchParams.minSquareFeet || searchParams.maxSquareFeet) && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="rounded-full text-xs h-auto py-1 pr-1 pl-3 border-primary/20 bg-primary/5 hover:bg-primary/10"
                      onClick={() => updateUrlWithFilters({ 
                        ...searchParams, 
                        minSquareFeet: undefined, 
                        maxSquareFeet: undefined 
                      })}
                    >
                      <span className="mr-1">Area: {searchParams.minSquareFeet?.toLocaleString() || 0} - {searchParams.maxSquareFeet?.toLocaleString() || "Any"} sqft</span>
                      <span className="rounded-full bg-primary/10 w-4 h-4 flex items-center justify-center text-primary">×</span>
                    </Button>
                  )}
                  {searchParams.features && searchParams.features.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="rounded-full text-xs h-auto py-1 pr-1 pl-3 border-primary/20 bg-primary/5 hover:bg-primary/10"
                      onClick={() => updateUrlWithFilters({ ...searchParams, features: undefined })}
                    >
                      <span className="mr-1">Features: {searchParams.features.length}</span>
                      <span className="rounded-full bg-primary/10 w-4 h-4 flex items-center justify-center text-primary">×</span>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Results Area */}
          <div className="lg:col-span-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div className="mb-3 md:mb-0">
                <h2 className="text-lg font-semibold">
                  {isLoading ? (
                    <span className="animate-pulse">Loading results...</span>
                  ) : (
                    <span>{total} Properties Found</span>
                  )}
                </h2>
              </div>
              <div className="flex items-center space-x-3">
                <div className="hidden md:flex items-center space-x-2 mr-4">
                  <Button
                    variant={viewType === 'grid' ? "default" : "outline"}
                    size="sm"
                    className={`h-8 px-3 ${viewType === 'grid' ? 'bg-primary text-white' : 'border-neutral-300'}`}
                    onClick={() => setViewType('grid')}
                  >
                    <i className="fas fa-th-large mr-2"></i>
                    Grid
                  </Button>
                  <Button
                    variant={viewType === 'list' ? "default" : "outline"}
                    size="sm"
                    className={`h-8 px-3 ${viewType === 'list' ? 'bg-primary text-white' : 'border-neutral-300'}`}
                    onClick={() => setViewType('list')}
                  >
                    <i className="fas fa-list mr-2"></i>
                    List
                  </Button>
                </div>
                <Tabs 
                  value={resultsView} 
                  onValueChange={(value) => setResultsView(value as 'list' | 'map')}
                  className="w-full md:w-auto"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="list" className="relative">
                      <i className="fas fa-home mr-2"></i> Properties
                    </TabsTrigger>
                    <TabsTrigger value="map">
                      <i className="fas fa-map-marker-alt mr-2"></i> Map
                    </TabsTrigger>
                  </TabsList>
                
                  <TabsContent value="list" className="mt-4 p-0 border-none">
                    {isLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="bg-white rounded-xl p-4 shadow-md animate-pulse h-72">
                            <div className="rounded-lg bg-neutral-200 h-40 mb-3"></div>
                            <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-neutral-200 rounded w-1/2 mb-2"></div>
                            <div className="h-3 bg-neutral-200 rounded w-1/4"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <PropertyList 
                        properties={properties}
                        total={total}
                        loading={isLoading}
                        page={page}
                        limit={limit}
                        onPageChange={handlePageChange}
                        viewType={viewType}
                        onViewChange={setViewType}
                      />
                    )}
                  </TabsContent>
                  
                  <TabsContent value="map" className="mt-4 p-0 border-none">
                    <PropertyMap 
                      properties={properties}
                      loading={isLoading}
                    />
                    
                    {!isLoading && properties.length > 0 && (
                      <div className="mt-6 bg-white rounded-xl p-4 shadow-md">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-heading text-lg font-bold">Properties in this area</h3>
                          {properties.length > 4 && (
                            <Button 
                              variant="link" 
                              onClick={() => setResultsView('list')}
                              className="text-primary"
                            >
                              View all {properties.length}
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {properties.slice(0, 4).map((property) => (
                            <PropertyList.CompactCard key={property.id} property={property} />
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
