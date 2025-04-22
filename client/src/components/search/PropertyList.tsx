import { useState } from "react";
import { Property } from "@shared/schema";
import PropertyCard from "@/components/property/PropertyCard";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";

interface PropertyListProps {
  properties: Property[];
  total: number;
  loading?: boolean;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  viewType?: 'grid' | 'list';
  onViewChange?: (view: 'grid' | 'list') => void;
}

export default function PropertyList({
  properties,
  total,
  loading = false,
  page,
  limit,
  onPageChange,
  viewType = 'grid',
  onViewChange,
}: PropertyListProps) {
  const totalPages = Math.ceil(total / limit);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* View Type Toggle */}
        <div className="flex justify-between items-center">
          <div className="text-neutral-600">
            <div className="h-5 w-32 bg-neutral-200 animate-pulse rounded"></div>
          </div>
          <div className="flex space-x-2">
            <div className="h-9 w-9 bg-neutral-200 animate-pulse rounded"></div>
            <div className="h-9 w-9 bg-neutral-200 animate-pulse rounded"></div>
          </div>
        </div>

        {/* Skeleton Cards */}
        <div className={`grid ${viewType === 'grid' ? 'grid-cols-1 md:grid-cols-3 gap-6' : 'grid-cols-1 gap-6'}`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div 
              key={i} 
              className={`bg-white rounded-xl overflow-hidden shadow-md ${
                viewType === 'list' ? 'flex flex-col md:flex-row' : ''
              }`}
            >
              <div 
                className={`${
                  viewType === 'list' ? 'md:w-1/3' : 'w-full'
                } h-64 bg-neutral-200 animate-pulse`}
              ></div>
              <div className={`p-5 ${viewType === 'list' ? 'md:w-2/3' : 'w-full'}`}>
                <div className="h-6 w-1/2 bg-neutral-200 animate-pulse rounded mb-3"></div>
                <div className="h-5 w-3/4 bg-neutral-200 animate-pulse rounded mb-2"></div>
                <div className="h-4 w-1/3 bg-neutral-200 animate-pulse rounded mb-4"></div>
                {viewType === 'list' && (
                  <div className="h-16 w-full bg-neutral-200 animate-pulse rounded mb-4"></div>
                )}
                <div className="h-4 w-full bg-neutral-200 animate-pulse rounded"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Skeleton Pagination */}
        <div className="flex justify-center">
          <div className="h-9 w-40 bg-neutral-200 animate-pulse rounded"></div>
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center">
        <i className="fas fa-search text-4xl text-neutral-300 mb-4"></i>
        <h3 className="font-heading text-xl font-bold mb-2">No properties found</h3>
        <p className="text-neutral-600 mb-4">
          Try adjusting your search filters to find more properties.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Type Toggle & Results Count */}
      <div className="flex justify-between items-center">
        <div className="text-neutral-600">
          Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total} properties
        </div>
        {onViewChange && (
          <div className="flex space-x-2">
            <Button
              variant={viewType === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => onViewChange('grid')}
              className={viewType === 'grid' ? 'bg-primary text-white' : ''}
            >
              <i className="fas fa-th-large"></i>
            </Button>
            <Button
              variant={viewType === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => onViewChange('list')}
              className={viewType === 'list' ? 'bg-primary text-white' : ''}
            >
              <i className="fas fa-list"></i>
            </Button>
          </div>
        )}
      </div>

      {/* Property Cards */}
      <div className={`grid ${viewType === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'grid-cols-1 gap-6'}`}>
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            variant={viewType}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination>
            <Pagination.Content>
              <Pagination.Previous 
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page === 1}
              />

              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNumber = i + 1;
                // Show first, last, current, and pages around current
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= page - 1 && pageNumber <= page + 1)
                ) {
                  return (
                    <Pagination.Item
                      key={pageNumber}
                      active={pageNumber === page}
                      onClick={() => onPageChange(pageNumber)}
                    >
                      {pageNumber}
                    </Pagination.Item>
                  );
                }
                // Show ellipsis for skipped pages
                if (pageNumber === page - 2 || pageNumber === page + 2) {
                  return <Pagination.Ellipsis key={`ellipsis-${pageNumber}`} />;
                }
                return null;
              })}

              <Pagination.Next 
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              />
            </Pagination.Content>
          </Pagination>
        </div>
      )}
    </div>
  );
}
