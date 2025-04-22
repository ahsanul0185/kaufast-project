import React from 'react';
import { Crown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PremiumPropertyBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

/**
 * A badge component that indicates a property has premium status
 */
export function PremiumPropertyBadge({ 
  size = 'md', 
  showLabel = false,
  className = ''
}: PremiumPropertyBadgeProps) {
  // Sizes for the badge
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  // Base badge component
  const PremiumBadge = () => (
    <div className={`inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-1 rounded-full ${className}`}>
      <Crown className={sizes[size]} />
      {showLabel && <span className="text-xs font-medium">Premium</span>}
    </div>
  );

  // Use tooltip if not showing label
  if (!showLabel) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <PremiumBadge />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Premium Property</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Just return the badge if showing label
  return <PremiumBadge />;
}

export default PremiumPropertyBadge;