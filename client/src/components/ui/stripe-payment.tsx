import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface StripePaymentProps {
  orderId: number | null;
  amount: number;
  onSuccess: () => void;
  onError: (message: string) => void;
  onCancel: () => void;
}

export default function StripePayment({
  orderId,
  amount,
  onSuccess,
  onError,
  onCancel
}: StripePaymentProps) {
  const [loading, setLoading] = useState(true);
  const [paymentInitialized, setPaymentInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stripeLoaded, setStripeLoaded] = useState(false);
  
  // First effect: ensure Stripe is loaded properly
  useEffect(() => {
    const loadStripe = async () => {
      console.log("Attempting to load Stripe...");
      
      // First check if Stripe is already available on window
      if (typeof window !== 'undefined' && window.Stripe) {
        console.log("Stripe already available on window object");
        setStripeLoaded(true);
        return;
      }
      
      // If not available, try adding the script directly
      try {
        console.log("Checking if Stripe script is in document...");
        // Check if script already exists
        let stripeScript = document.getElementById('stripe-js');
        
        if (!stripeScript) {
          console.log("Adding Stripe script to document head...");
          // Create and add the script
          const script = document.createElement('script');
          script.id = 'stripe-js';
          script.src = 'https://js.stripe.com/v3/';
          script.async = true;
          document.head.appendChild(script);
          stripeScript = script;
        } else {
          console.log("Stripe script already in document");
        }
        
        // Wait for script to load with timeout
        let attempts = 0;
        const maxAttempts = 20; // More attempts, longer timeout
        
        const waitForStripe = setInterval(() => {
          attempts++;
          console.log(`Waiting for Stripe to load (attempt ${attempts})...`);
          
          if (window.Stripe) {
            console.log("Stripe loaded successfully!");
            clearInterval(waitForStripe);
            setStripeLoaded(true);
          } else if (attempts >= maxAttempts) {
            console.error("Failed to load Stripe after multiple attempts");
            clearInterval(waitForStripe);
            setError("Could not load the payment system. Please check your internet connection and try again.");
            setLoading(false);
          }
        }, 300);
        
        return () => clearInterval(waitForStripe);
      } catch (err) {
        console.error("Error loading Stripe:", err);
        setError("Error loading payment system: " + (err instanceof Error ? err.message : "Unknown error"));
        setLoading(false);
      }
    };
    
    loadStripe();
  }, []);
  
  // Second effect: once Stripe is loaded, initialize the payment
  useEffect(() => {
    if (!stripeLoaded) return;
    
    const initializePayment = async () => {
      try {
        console.log("Creating payment intent...");
        
        // Create payment intent
        const paymentData = orderId 
          ? { orderId, amount, orderNumber: `AGH-${orderId}` }
          : { amount };
          
        const endpoint = orderId 
          ? "/api/payments/create-intent" 
          : "/api/payments/test-payment-intent";
        
        const response = await apiRequest("POST", endpoint, paymentData);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Payment initialization failed: ${errorText}`);
        }
        
        const data = await response.json();
        
        if (!data.clientSecret) {
          throw new Error("Payment service did not return a client secret");
        }
        
        console.log("Payment intent created, initializing Stripe elements");
        
        // Initialize Stripe elements
        const publicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
        if (!publicKey) {
          throw new Error("Stripe public key is not configured");
        }
        
        const stripe = window.Stripe ? window.Stripe(publicKey) : null;
        if (!stripe) {
          throw new Error("Failed to initialize Stripe with the public key");
        }
        const elements = stripe.elements({
          clientSecret: data.clientSecret,
          appearance: {
            theme: 'stripe',
          },
        });
        
        // Create and mount payment element
        const paymentElement = elements.create('payment');
        
        const container = document.getElementById('payment-element');
        if (!container) {
          throw new Error("Payment element container not found");
        }
        
        container.innerHTML = '';
        paymentElement.mount('#payment-element');
        
        console.log("Payment element mounted successfully");
        
        // Set up form submission handler
        const form = document.getElementById('payment-form') as HTMLFormElement;
        if (!form) {
          throw new Error("Payment form not found");
        }
        
        form.onsubmit = async (e) => {
          e.preventDefault();
          setLoading(true);
          
          try {
            console.log("Processing payment...");
            
            const { error: submitError, paymentIntent } = await stripe.confirmPayment({
              elements,
              confirmParams: {
                return_url: `${window.location.origin}/payment-success`,
              },
              redirect: 'if_required',
            });
            
            if (submitError) {
              console.error("Payment confirmation error:", submitError);
              setError(submitError.message || "Payment failed");
              setLoading(false);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
              console.log("Payment succeeded:", paymentIntent);
              onSuccess();
            } else {
              console.warn("Payment status:", paymentIntent?.status);
              setError(`Payment status: ${paymentIntent?.status || 'unknown'}`);
              setLoading(false);
            }
          } catch (err: any) {
            console.error("Payment submission error:", err);
            setError("Payment processing error: " + (err.message || "Unknown error"));
            setLoading(false);
          }
        };
        
        setPaymentInitialized(true);
        setLoading(false);
        
      } catch (err: any) {
        console.error("Payment setup error:", err);
        setError(err.message || "Failed to set up payment");
        onError(err.message || "Failed to set up payment");
        setLoading(false);
      }
    };
    
    initializePayment();
    
  }, [stripeLoaded, orderId, amount, onSuccess, onError]);
  
  return (
    <div className="w-full">
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-md p-4 mb-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Payment Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <form id="payment-form" className="space-y-4">
        <div id="payment-element" className="min-h-[200px] flex items-center justify-center">
          {loading && (
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
              <p className="text-sm text-gray-500">Setting up payment...</p>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 justify-end">
          <Button 
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}>
            Cancel
          </Button>
          
          <Button 
            type="submit"
            disabled={loading || !paymentInitialized}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> 
                Processing...
              </>
            ) : (
              `Pay €${(amount / 100).toFixed(2)}`
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

// Define the global Stripe type
declare global {
  interface Window {
    Stripe?: (apiKey: string) => any;
  }
}