import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import SubscriptionPlans from '@/components/subscription/SubscriptionPlans';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';

export default function SubscriptionPage() {
  const [, setLocation] = useLocation();
  const [isYearly, setIsYearly] = useState(false);
  
  const handlePlanSelect = (planId: string) => {
    // This function will be called when a plan is selected
    console.log(`Selected plan: ${planId}`);
  };
  
  return (
    <DashboardLayout>
      <div className="container py-8 max-w-6xl">
        <div className="mb-6 flex items-center">
          <Button 
            variant="ghost" 
            className="mr-2"
            onClick={() => setLocation('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">Subscription Plans</h1>
        </div>
        
        <div className="space-y-6">
          <Card className="p-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-2">Choose the Right Plan for Your Needs</h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Get access to premium features like bulk property uploads, analytics, and priority listings.
              </p>
              
              <div className="flex items-center justify-center mt-6">
                <Label htmlFor="billing-toggle" className={isYearly ? 'text-neutral-500' : 'font-medium'}>
                  Monthly
                </Label>
                <Switch
                  id="billing-toggle"
                  checked={isYearly}
                  onCheckedChange={setIsYearly}
                  className="mx-3"
                />
                <div className="flex items-center">
                  <Label htmlFor="billing-toggle" className={!isYearly ? 'text-neutral-500' : 'font-medium'}>
                    Yearly
                  </Label>
                  <span className="ml-2 text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full font-medium">
                    Save 40%
                  </span>
                </div>
              </div>
            </div>
            
            <SubscriptionPlans isYearly={isYearly} onPlanSelect={handlePlanSelect} />
            
            <div className="mt-12 border-t pt-6">
              <h3 className="text-lg font-medium mb-4">All Plans Include:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  'Access to all property listings',
                  'Secure messaging with property owners',
                  'Save favorite properties',
                  'Mobile app access',
                  'Regular updates',
                  'Technical support'
                ].map((feature, i) => (
                  <div key={i} className="flex items-center">
                    <CheckCircle2 className="text-green-500 h-5 w-5 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Frequently Asked Questions</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Can I cancel my subscription at any time?</h4>
                <p className="text-neutral-600">Yes, you can cancel your subscription at any time. Your benefits will continue until the end of your billing period.</p>
              </div>
              <div>
                <h4 className="font-medium">What payment methods do you accept?</h4>
                <p className="text-neutral-600">We accept all major credit cards, including Visa, Mastercard, and American Express.</p>
              </div>
              <div>
                <h4 className="font-medium">How do I get a refund?</h4>
                <p className="text-neutral-600">If you're not satisfied with your subscription, contact our support team within 14 days of your purchase for a full refund.</p>
              </div>
              <div>
                <h4 className="font-medium">Do you offer discounts for multiple users?</h4>
                <p className="text-neutral-600">Yes, we offer special rates for agencies and teams. Please contact our sales team for more information.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}