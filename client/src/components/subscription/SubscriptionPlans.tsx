import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

interface PlanFeature {
  name: string;
  included: boolean;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  yearlyPrice: number;
  description: string;
  features: PlanFeature[];
  buttonText: string;
  highlight?: boolean;
  popular?: boolean;
}

interface SubscriptionPlansProps {
  isYearly?: boolean;
  onPlanSelect?: (planId: string) => void;
}

export default function SubscriptionPlans({ 
  isYearly = false, 
  onPlanSelect 
}: SubscriptionPlansProps) {
  const { user } = useAuth();
  
  // Calculate yearly price with 40% discount
  const getYearlyPrice = (monthlyPrice: number) => {
    const yearlyPrice = monthlyPrice * 12;
    const discount = yearlyPrice * 0.4; // 40% discount
    return yearlyPrice - discount;
  };
  
  const plans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Basic',
      price: 0,
      yearlyPrice: 0,
      description: 'For individuals looking to browse properties',
      features: [
        { name: 'Basic property listing', included: true },
        { name: 'Save favorite properties', included: true },
        { name: 'Contact property owners', included: true },
        { name: 'Premium property listings', included: false },
        { name: 'Bulk property uploads', included: false },
        { name: 'Advanced analytics', included: false },
        { name: 'Priority support', included: false },
        { name: 'Featured property placement', included: false },
      ],
      buttonText: 'Current Plan',
      highlight: false,
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 19.99,
      yearlyPrice: getYearlyPrice(19.99),
      description: 'For real estate agents and property managers',
      features: [
        { name: 'Basic property listing', included: true },
        { name: 'Save favorite properties', included: true },
        { name: 'Contact property owners', included: true },
        { name: 'Premium property listings', included: true },
        { name: 'Bulk property uploads', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'Priority support', included: true },
        { name: 'Featured property placement', included: true },
      ],
      buttonText: 'Upgrade Now',
      highlight: true,
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 49.99,
      yearlyPrice: getYearlyPrice(49.99),
      description: 'For real estate agencies and large businesses',
      features: [
        { name: 'Basic property listing', included: true },
        { name: 'Save favorite properties', included: true },
        { name: 'Contact property owners', included: true },
        { name: 'Premium property listings', included: true },
        { name: 'Unlimited bulk property uploads', included: true },
        { name: 'Advanced analytics & reporting', included: true },
        { name: 'Priority 24/7 support', included: true },
        { name: 'Featured property placement', included: true },
        { name: 'Custom branding', included: true },
        { name: 'API access', included: true },
        { name: 'White-label solution', included: true },
      ],
      buttonText: 'Contact Sales',
      highlight: false,
    },
  ];

  const handlePlanClick = (planId: string) => {
    if (onPlanSelect) {
      onPlanSelect(planId);
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free';
    return `$${price.toFixed(2)}`;
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((plan) => {
        const price = isYearly ? plan.yearlyPrice : plan.price;
        const isPremiumUser = user?.subscriptionTier === 'premium';
        const isEnterpriseUser = user?.subscriptionTier === 'enterprise';
        const isCurrentPlan = 
          (plan.id === 'free' && (!user?.subscriptionTier || user.subscriptionTier === 'free')) ||
          (plan.id === 'premium' && isPremiumUser) ||
          (plan.id === 'enterprise' && isEnterpriseUser);
        
        return (
          <Card 
            key={plan.id} 
            className={`relative flex flex-col ${plan.highlight ? 'border-primary shadow-lg' : ''}`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-[#131313] text-white px-3 py-1 text-xs font-bold tracking-wider transform translate-y-[-50%] rounded-full">
                POPULAR
              </div>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="mb-4">
                <span className="text-3xl font-bold">{formatPrice(price)}</span>
                {price > 0 && (
                  <span className="text-sm text-muted-foreground ml-1">
                    /{isYearly ? 'year' : 'month'}
                  </span>
                )}
                
                {isYearly && price > 0 && (
                  <div className="mt-1 text-sm text-emerald-600 font-semibold">
                    Save 40% with yearly billing
                  </div>
                )}
              </div>
              
              <ul className="space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-neutral-300 mr-2 shrink-0" />
                    )}
                    <span className={feature.included ? '' : 'text-neutral-500'}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {isCurrentPlan ? (
                <Button 
                  className="w-full bg-neutral-100 text-[#131313] cursor-default"
                  disabled
                >
                  Current Plan
                </Button>
              ) : plan.id === 'enterprise' ? (
                <Button 
                  className="w-full bg-[#131313] text-white hover:bg-white hover:text-[#131313] transition-all"
                  onClick={() => handlePlanClick(plan.id)}
                  asChild
                >
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              ) : (
                <Button 
                  className="w-full bg-[#131313] text-white hover:bg-white hover:text-[#131313] transition-all"
                  onClick={() => handlePlanClick(plan.id)}
                  asChild
                >
                  <Link href={`/subscribe?plan=${plan.id}${isYearly ? '&billing=yearly' : ''}`}>
                    {plan.buttonText}
                  </Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}