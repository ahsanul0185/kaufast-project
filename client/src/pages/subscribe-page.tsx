import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { ArrowLeft, Shield } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/use-auth';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ isYearly = false, planId = 'premium' }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/subscription-success`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
        setIsProcessing(false);
      } else {
        toast({
          title: "Payment Successful",
          description: "You are now subscribed!",
        });
        // Payment successful, redirect happens automatically
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      <div className="flex items-center text-sm text-neutral-600 my-4">
        <Shield className="h-4 w-4 mr-2 text-green-600" />
        Your payment information is secure and encrypted
      </div>
      
      <Button 
        type="submit"
        className="w-full bg-[#131313] text-white hover:bg-white hover:text-[#131313] transition-all"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? "Processing..." : `Pay Now for ${isYearly ? 'Yearly' : 'Monthly'} Subscription`}
      </Button>
      
      <div className="text-center text-sm text-neutral-500">
        By subscribing, you agree to our Terms of Service and Privacy Policy
      </div>
    </form>
  );
};

export default function SubscribePage() {
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [clientSecret, setClientSecret] = useState("");
  const [planName, setPlanName] = useState("Premium");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const planId = searchParams.get('plan') || 'premium';
  const isYearly = searchParams.get('billing') === 'yearly';

  useEffect(() => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to subscribe",
        variant: "destructive",
      });
      setLocation('/auth');
      return;
    }
    
    // Get plan details based on planId
    if (planId === 'premium') {
      setPlanName('Premium');
    } else if (planId === 'enterprise') {
      setPlanName('Enterprise');
    }
    
    // Get client secret from server
    setLoading(true);
    apiRequest("POST", "/api/get-or-create-subscription", { planId, isYearly })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
        toast({
          title: "Subscription Error",
          description: "Could not initialize subscription. Please try again.",
          variant: "destructive",
        });
        setLoading(false);
      });
  }, [planId, isYearly, user, setLocation, toast]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container py-8 max-w-2xl">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container py-8 max-w-2xl">
        <div className="mb-6 flex items-center">
          <Button 
            variant="ghost" 
            className="mr-2"
            onClick={() => setLocation('/subscription')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Plans
          </Button>
          <h1 className="text-2xl font-bold">Subscribe to {planName}</h1>
        </div>
        
        <Card className="p-6">
          <div className="space-y-4 mb-6">
            <div className="flex justify-between border-b pb-4">
              <div className="font-medium">{planName} Plan ({isYearly ? 'Yearly' : 'Monthly'})</div>
              <div className="font-semibold">
                {isYearly ? 
                  `$${(planId === 'premium' ? 19.99 * 12 * 0.6 : 49.99 * 12 * 0.6).toFixed(2)}` : 
                  `$${planId === 'premium' ? '19.99' : '49.99'}`}
                /{isYearly ? 'year' : 'month'}
              </div>
            </div>
            
            {isYearly && (
              <div className="text-emerald-600 text-sm font-medium">
                You're saving 40% with yearly billing!
              </div>
            )}
          </div>
          
          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm isYearly={isYearly} planId={planId} />
            </Elements>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}