import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Check, AlertCircle } from "lucide-react";

// Simple Stripe test using the exact approach as requested
export default function DirectStripeTest() {
  const [amount, setAmount] = useState(15000); // €150.00 by default
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [stripeInstance, setStripeInstance] = useState<any>(null);
  const [elements, setElements] = useState<any>(null);
  
  // Initialize Stripe directly 
  useEffect(() => {
    const initStripe = async () => {
      try {
        console.log("Checking if Stripe is available on window...");
        
        if (typeof window === 'undefined' || !window.Stripe) {
          console.warn("Stripe not found on window - waiting for script to load");
          
          // Try waiting for Stripe to load (it might still be loading)
          let attempts = 0;
          const checkStripeInterval = setInterval(() => {
            attempts++;
            console.log(`Checking for Stripe (attempt ${attempts})...`);
            
            if (window.Stripe) {
              clearInterval(checkStripeInterval);
              console.log("Stripe found after waiting!");
              
              const publicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
              console.log("Public key available:", !!publicKey);
              
              if (!publicKey) {
                setError("Missing Stripe public key in environment");
                setLoading(false);
                return;
              }
              
              // Initialize Stripe with the key
              const stripe = window.Stripe(publicKey);
              setStripeInstance(stripe);
              console.log("Stripe initialized successfully!");
            } else if (attempts >= 10) {
              clearInterval(checkStripeInterval);
              setError("Stripe.js failed to load after multiple attempts");
              setLoading(false);
            }
          }, 500);
          
          return;
        }
        
        // Stripe is available, initialize it
        const publicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
        console.log("Public key available:", !!publicKey);
        
        if (!publicKey) {
          setError("Missing Stripe public key in environment");
          setLoading(false);
          return;
        }
        
        const stripe = window.Stripe(publicKey);
        setStripeInstance(stripe);
        console.log("Stripe initialized successfully with key!");
      } catch (err) {
        console.error("Error initializing Stripe:", err);
        setError("Failed to initialize Stripe: " + (err instanceof Error ? err.message : "Unknown error"));
        setLoading(false);
      }
    };
    
    initStripe();
  }, []);
  
  const handleCreatePaymentIntent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Creating payment intent for amount:", amount);
      
      // Using the exact fetch approach you specified
      const response = await fetch('/api/payments/test-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
        credentials: 'include',
        mode: 'cors'
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Payment service error (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Payment intent created:", data);
      
      if (!data.clientSecret) {
        throw new Error("No client secret returned from the server");
      }
      
      setClientSecret(data.clientSecret);
      
      // Create Elements instance after getting client secret
      if (stripeInstance) {
        const elementsInstance = stripeInstance.elements({
          clientSecret: data.clientSecret,
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#0a84ff',
            },
          },
        });
        
        setElements(elementsInstance);
        
        // Create and mount the Payment Element
        const paymentElement = elementsInstance.create('payment');
        
        // Clean up any existing elements first
        const container = document.getElementById('payment-element');
        if (container) {
          container.innerHTML = '';
          paymentElement.mount('#payment-element');
          console.log("Payment element mounted");
        } else {
          console.error("Payment element container not found");
          throw new Error("Payment element container not found");
        }
      }
    } catch (err: any) {
      console.error("Error creating payment intent:", err);
      setError(err.message || "Failed to set up payment");
    } finally {
      setLoading(false);
    }
  };
  
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripeInstance || !elements || !clientSecret) {
      setError("Payment system is not fully initialized");
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Confirming payment with Stripe...");
      
      const { error, paymentIntent } = await stripeInstance.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required',
      });
      
      if (error) {
        console.error("Payment confirmation error:", error);
        throw new Error(error.message || "Payment failed");
      }
      
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log("Payment succeeded:", paymentIntent);
        setPaymentSuccess(true);
      } else {
        console.warn("Payment intent status:", paymentIntent?.status);
        throw new Error(`Payment status: ${paymentIntent?.status || 'unknown'}`);
      }
    } catch (err: any) {
      console.error("Payment submission error:", err);
      setError(err.message || "Payment processing failed");
    } finally {
      setLoading(false);
    }
  };
  
  if (paymentSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
        <Card className="max-w-md w-full">
          <CardHeader className="bg-green-50 border-b border-green-100">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-center text-green-700">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-center text-gray-700 mb-6">
              Your payment has been processed successfully.
            </p>
            <div className="flex justify-center">
              <Button onClick={() => window.location.href = "/"}>
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Direct Stripe Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Payment Error</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (in cents)</Label>
              <div className="flex space-x-2">
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value, 10))}
                  disabled={loading}
                />
                <Button 
                  onClick={handleCreatePaymentIntent}
                  disabled={loading || !stripeInstance}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    "Set Up Payment"
                  )}
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                Current amount: €{(amount / 100).toFixed(2)}
              </p>
            </div>
            
            {clientSecret && (
              <form onSubmit={handlePaymentSubmit} className="mt-6 space-y-4">
                <div id="payment-element" className="mt-2">
                  {/* Stripe Elements will be mounted here */}
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || !elements}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay €${(amount / 100).toFixed(2)}`
                  )}
                </Button>
              </form>
            )}
            
            <div className="pt-4 text-xs text-gray-500">
              <p>Debug Info:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Stripe Loaded: {stripeInstance ? "Yes" : "No"}</li>
                <li>Elements Created: {elements ? "Yes" : "No"}</li>
                <li>Client Secret: {clientSecret ? "Available" : "Not Available"}</li>
                <li>Cookies: {document.cookie || "None"}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Add type definition for window.Stripe
declare global {
  interface Window {
    Stripe: any;
  }
}