import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home, User } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/use-auth';

export default function SubscriptionSuccessPage() {
  const [, setLocation] = useLocation();
  const { user, refetchUser } = useAuth();
  
  useEffect(() => {
    // Refresh user data to get updated subscription info
    refetchUser();
  }, [refetchUser]);
  
  return (
    <DashboardLayout>
      <div className="container py-8 max-w-3xl">
        <Card className="p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
          </div>
          
          <h1 className="text-3xl font-bold mb-2">Subscription Successful!</h1>
          <p className="text-lg text-neutral-600 mb-6">
            Your account has been upgraded to {user?.subscriptionTier === 'premium' ? 'Premium' : 'Enterprise'}.
          </p>
          
          <div className="space-y-2 max-w-md mx-auto mb-8">
            <div className="text-left p-4 bg-neutral-50 rounded-lg">
              <h3 className="font-medium mb-1">Your new benefits include:</h3>
              <ul className="space-y-2 text-neutral-700">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Premium property listings with badges</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Bulk property uploads</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Advanced analytics and insights</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>Priority customer support</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button 
              variant="outline" 
              size="lg"
              className="md:w-auto"
              onClick={() => setLocation('/')}
            >
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            
            <Button 
              className="md:w-auto bg-[#131313] text-white hover:bg-white hover:text-[#131313] transition-all"
              size="lg"
              onClick={() => setLocation('/dashboard')}
            >
              <User className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}