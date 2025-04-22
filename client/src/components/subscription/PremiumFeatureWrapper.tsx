import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Lock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export interface PremiumFeatureWrapperProps {
  children: React.ReactNode;
  feature: string;
  description: string;
  showUpgradePrompt?: boolean;
}

export default function PremiumFeatureWrapper({
  children,
  feature,
  description,
  showUpgradePrompt = false,
}: PremiumFeatureWrapperProps) {
  const { user } = useAuth();
  
  // If user has a premium subscription or we explicitly want to show content anyway
  const isPremium = user?.subscriptionTier === 'premium' || user?.subscriptionTier === 'enterprise';
  const showContent = isPremium || showUpgradePrompt === false;

  // If we should show the content, return the children
  if (showContent) {
    return <>{children}</>;
  }

  // Otherwise, show premium feature blocked UI
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <div className="text-center space-y-6 py-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
          <Lock className="h-8 w-8 text-neutral-500" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">{feature}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
        
        <div className="max-w-xs mx-auto space-y-4">
          <Button 
            asChild 
            className="w-full bg-[#131313] text-white hover:bg-white hover:text-[#131313] transition-all"
          >
            <Link href="/subscription">
              <Crown className="mr-2 h-4 w-4" />
              Upgrade to Premium
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            Unlock premium features to get the most out of Inmobi.
          </p>
        </div>
      </div>
    </div>
  );
}