import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard, Check, X } from 'lucide-react';
import { PageTitle } from '@/components/ui/page-title';
import { useLanguage } from '@/hooks/use-language';

export default function StripePublicTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    // Initialize Stripe only after component mounts
    const loadStripe = async () => {
      try {
        setIsLoading(true);
        
        // Create a payment intent on the server
        const response = await fetch('/api/create-payment-intent-public', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: 100, // $1.00 for testing
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create payment intent');
        }
        
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error('Error initializing payment:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize payment');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStripe();
  }, []);

  useEffect(() => {
    // Only mount Stripe elements if we have a client secret
    if (!clientSecret) return;
    
    // Make sure Stripe.js is loaded
    if (!window.Stripe) {
      console.error('Stripe.js not loaded');
      setError('Stripe.js failed to load. Please refresh the page.');
      return;
    }
    
    try {
      // Initialize Stripe
      const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
      if (!stripeKey) {
        throw new Error('Stripe public key is missing');
      }
      
      const stripe = window.Stripe(stripeKey);
      
      // Mount the payment element
      const elements = stripe.elements({
        clientSecret,
        appearance: {
          theme: 'stripe',
        },
      });
      
      const paymentElement = elements.create('payment');
      
      // Clear any previous elements before mounting
      const paymentContainer = document.getElementById('payment-element');
      if (paymentContainer) {
        paymentContainer.innerHTML = '';
        paymentElement.mount('#payment-element');
      }
      
      // Handle form submission
      const form = document.getElementById('payment-form');
      if (form) {
        form.addEventListener('submit', async (event) => {
          event.preventDefault();
          setIsLoading(true);
          
          const { error: submitError } = await stripe.confirmPayment({
            elements,
            confirmParams: {
              return_url: `${window.location.origin}/payment-success`,
            },
            redirect: 'if_required',
          });
          
          if (submitError) {
            setError(submitError.message || 'Payment failed');
            setIsLoading(false);
          } else {
            setPaymentSuccess(true);
            setIsLoading(false);
          }
        });
      }
    } catch (err) {
      console.error('Error setting up Stripe:', err);
      setError(err instanceof Error ? err.message : 'Failed to set up payment');
      setIsLoading(false);
    }
  }, [clientSecret]);

  return (
    <div className="container max-w-4xl py-10">
      <PageTitle title="Public Stripe Payment Test" subtitle="Test payment without authentication" />
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Test Payment</CardTitle>
          <CardDescription>
            Enter test card details to complete the payment
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isLoading && !clientSecret ? (
            <div className="flex flex-col items-center justify-center p-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="mt-4 text-center text-muted-foreground">
                Initializing payment...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-10 text-destructive">
              <X className="h-10 w-10" />
              <p className="mt-4 text-center font-medium">Error: {error}</p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          ) : paymentSuccess ? (
            <div className="flex flex-col items-center justify-center p-10 text-green-600">
              <Check className="h-10 w-10" />
              <p className="mt-4 text-center font-medium">Payment Successful!</p>
              <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
                Make Another Payment
              </Button>
            </div>
          ) : (
            <form id="payment-form" className="space-y-6">
              <div id="payment-element" className="min-h-[200px]">
                {/* Stripe Elements will be mounted here */}
              </div>
              
              <Button 
                type="submit" 
                disabled={isLoading || !clientSecret} 
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay Now
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
        
        <CardFooter className="flex-col space-y-2 text-sm text-muted-foreground">
          <p>Use these test card details:</p>
          <p>Card number: 4242 4242 4242 4242</p>
          <p>Expiry: Any future date (e.g., 12/25)</p>
          <p>CVC: Any 3 digits</p>
          <p>Zip code: Any 5 digits</p>
        </CardFooter>
      </Card>
    </div>
  );
}

// Define type for Stripe
declare global {
  interface Window {
    Stripe: any;
  }
}