import React from 'react';
import { Link } from 'wouter';
import { Property } from '@shared/schema';
import { PropertyService } from '@/lib/property-service';
import { useFavorites } from '@/hooks/use-favorites';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Heart, Share2, ArrowRight, Building2, Map, BedDouble, Bath, AreaChart, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import PremiumPropertyBadge from './PremiumPropertyBadge';

interface PropertyCardProps {
  property: Property;
  variant?: 'default' | 'horizontal' | 'simple';
  showActions?: boolean;
  className?: string;
}

export default function PropertyCard({ 
  property, 
  variant = 'default', 
  showActions = true, 
  className 
}: PropertyCardProps) {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = user ? isFavorite(property.id) : false;
  
  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      // If not logged in, redirect to login page
      window.location.href = '/auth';
      return;
    }
    
    await toggleFavorite(property.id);
  };
  
  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Create a share URL
    const shareUrl = `${window.location.origin}/property/${property.id}`;
    
    // Use native sharing if available, otherwise copy to clipboard
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Check out this property: ${property.title}`,
        url: shareUrl,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Link copied to clipboard!');
      }).catch((err) => {
        console.error('Could not copy text: ', err);
      });
    }
  };
  
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };
  
  // Render different card layouts based on variant
  if (variant === 'horizontal') {
    return (
      <Card className={cn("overflow-hidden group", className)}>
        <div className="flex flex-col md:flex-row h-full">
          <div className="relative md:w-1/3">
            <AspectRatio ratio={16/9} className="bg-muted">
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <img 
                  src={property.images[0]} 
                  alt={property.title} 
                  className="object-cover w-full h-full"
                />
              </div>
              
              {/* Tags */}
              <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
                {property.isPremium && (
                  <PremiumPropertyBadge showLabel={true} />
                )}
                <Badge variant="secondary" className="bg-white text-black">
                  {property.listingType === 'rent' ? 'For Rent' : 'For Sale'}
                </Badge>
              </div>
              
              {/* Action buttons */}
              {showActions && (
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="rounded-full w-8 h-8 bg-white hover:bg-white/90"
                    onClick={handleFavoriteClick}
                  >
                    <Heart 
                      className={cn("h-4 w-4", isFav ? "fill-red-500 text-red-500" : "text-neutral-600")} 
                    />
                  </Button>
                  
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="rounded-full w-8 h-8 bg-white hover:bg-white/90"
                    onClick={handleShareClick}
                  >
                    <Share2 className="h-4 w-4 text-neutral-600" />
                  </Button>
                </div>
              )}
            </AspectRatio>
          </div>
          
          <div className="flex flex-col justify-between p-4 md:p-5 flex-1">
            <div>
              <div className="flex items-center gap-2 text-sm mb-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span className="capitalize">{PropertyService.getPropertyTypeName(property.propertyType)}</span>
                
                {property.city && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-neutral-300"></span>
                    <Map className="h-4 w-4 text-primary" />
                    <span>{property.city}, {property.state}</span>
                  </>
                )}
              </div>
              
              <h3 className="font-medium text-lg line-clamp-1 group-hover:text-primary transition-colors duration-200">
                {property.title}
              </h3>
              
              <p className="text-sm text-neutral-500 line-clamp-2 mt-1 mb-3">{property.description}</p>
              
              <div className="flex flex-wrap gap-3 mt-2 mb-3">
                {property.bedrooms && (
                  <div className="flex items-center gap-1">
                    <BedDouble className="h-4 w-4 text-neutral-500" />
                    <span className="text-sm">{property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
                  </div>
                )}
                
                {property.bathrooms && (
                  <div className="flex items-center gap-1">
                    <Bath className="h-4 w-4 text-neutral-500" />
                    <span className="text-sm">{property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
                  </div>
                )}
                
                {property.squareFeet && (
                  <div className="flex items-center gap-1">
                    <AreaChart className="h-4 w-4 text-neutral-500" />
                    <span className="text-sm">{property.squareFeet.toLocaleString()} sq ft</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
              <div>
                <p className="text-xl font-semibold text-[#131313]">
                  {PropertyService.formatPrice(property.price, property.listingType === 'rent')}
                </p>
                {property.listingType === 'rent' && (
                  <p className="text-sm text-neutral-500">per month</p>
                )}
              </div>
              
              <Link href={`/property/${property.id}`}>
                <Button className="rounded-full bg-[#131313] text-white hover:bg-white hover:text-[#131313] transition-all">
                  View Details
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    );
  }
  
  if (variant === 'simple') {
    return (
      <Card className={cn("overflow-hidden group", className)}>
        <div className="relative">
          <AspectRatio ratio={4/3} className="bg-muted">
            <img 
              src={property.images[0]} 
              alt={property.title} 
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          </AspectRatio>
          
          <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
            {property.isPremium && (
              <PremiumPropertyBadge size="sm" />
            )}
            <Badge variant="secondary" className="bg-white text-black">
              {property.listingType === 'rent' ? 'For Rent' : 'For Sale'}
            </Badge>
          </div>
        </div>
        
        <CardContent className="p-3">
          <h3 className="font-medium text-base mb-1 line-clamp-1 group-hover:text-primary transition-colors duration-200">
            {property.title}
          </h3>
          
          <div className="flex justify-between items-center">
            <p className="text-lg font-semibold text-[#131313]">
              {PropertyService.formatPrice(property.price, property.listingType === 'rent')}
            </p>
            
            <div className="flex items-center text-xs text-neutral-500">
              <Clock className="mr-1 h-3 w-3" />
              {formatDate(property.createdAt?.toString() || new Date().toISOString())}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Default card variant
  return (
    <Card className={cn("overflow-hidden group", className)}>
      <div className="relative">
        <AspectRatio ratio={4/3} className="bg-muted">
          <img 
            src={property.images[0]} 
            alt={property.title} 
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Tags */}
          <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
            {property.isPremium && (
              <PremiumPropertyBadge showLabel={true} />
            )}
            <Badge variant="secondary" className="bg-white text-black">
              {property.listingType === 'rent' ? 'For Rent' : 'For Sale'}
            </Badge>
          </div>
          
          {/* Action buttons */}
          {showActions && (
            <div className="absolute top-2 right-2 flex gap-1">
              <Button 
                size="icon" 
                variant="secondary" 
                className="rounded-full w-8 h-8 bg-white hover:bg-white/90"
                onClick={handleFavoriteClick}
              >
                <Heart 
                  className={cn("h-4 w-4", isFav ? "fill-red-500 text-red-500" : "text-neutral-600")} 
                />
              </Button>
              
              <Button 
                size="icon" 
                variant="secondary" 
                className="rounded-full w-8 h-8 bg-white hover:bg-white/90"
                onClick={handleShareClick}
              >
                <Share2 className="h-4 w-4 text-neutral-600" />
              </Button>
            </div>
          )}
          
          {/* Price tag */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <p className="text-xl font-semibold text-white">
              {PropertyService.formatPrice(property.price, property.listingType === 'rent')}
              {property.listingType === 'rent' && <span className="text-sm font-normal">/mo</span>}
            </p>
          </div>
        </AspectRatio>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-sm mb-2">
          <Building2 className="h-4 w-4 text-primary" />
          <span className="capitalize">{PropertyService.getPropertyTypeName(property.propertyType)}</span>
          
          {property.city && (
            <>
              <span className="w-1 h-1 rounded-full bg-neutral-300"></span>
              <Map className="h-4 w-4 text-primary" />
              <span>{property.city}, {property.state}</span>
            </>
          )}
        </div>
        
        <Link href={`/property/${property.id}`}>
          <h3 className="font-medium text-lg mb-3 line-clamp-1 group-hover:text-primary transition-colors duration-200">
            {property.title}
          </h3>
        </Link>
        
        <div className="flex flex-wrap gap-4">
          {property.bedrooms && (
            <div className="flex items-center gap-1">
              <BedDouble className="h-4 w-4 text-neutral-500" />
              <span className="text-sm">{property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
            </div>
          )}
          
          {property.bathrooms && (
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4 text-neutral-500" />
              <span className="text-sm">{property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
            </div>
          )}
          
          {property.squareFeet && (
            <div className="flex items-center gap-1">
              <AreaChart className="h-4 w-4 text-neutral-500" />
              <span className="text-sm">{property.squareFeet.toLocaleString()} sq ft</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="px-4 pb-4 pt-0">
        <Link href={`/property/${property.id}`} className="w-full">
          <Button className="w-full rounded-full bg-[#131313] text-white hover:bg-white hover:text-[#131313] transition-all">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}