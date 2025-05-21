import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// This will be a direct test using the Stripe variable as specified
export default function StripeDirectTest() {
  const [loading, setLoading] = useState(true);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const { toast } = useToast();
  
  // Create a payment element
  const [stripeElement, setStripeElement] = useState<any>(null);
  const [stripe, setStripe] = useState<any>(null);
  
  // Initialize Stripe exactly as specified
  useEffect(() => {
    const setupStripe = () => {
      // Check if Stripe is already loaded
      if (window.Stripe && import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
        try {
          console.log("Creating Stripe instance with window.Stripe");
          const stripeInstance = window.Stripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
          setStripe(stripeInstance);
          
          console.log("Stripe instance created:", stripeInstance);
        } catch (error) {
          console.error("Error creating Stripe instance:", error);
          setPaymentError("Failed to initialize Stripe payment system");
        }
      } else {
        console.warn("Stripe is not loaded or public key is missing");
        setPaymentError("Stripe payment system is not available");
      }
    };
    
    // Create a payment intent first
    const createPaymentIntent = async () => {
      try {
        console.log("Creating test payment intent");
        const response = await fetch("/api/payments/test-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: 15000, // €150.00
          }),
          // Include credentials as specified
          credentials: 'include',
          mode: 'cors'
        });
        
        if (!response.ok) {
          throw new Error(`Payment service error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Payment intent created:", data);
        setClientSecret(data.clientSecret);
        
        // Initialize Stripe after successful payment intent creation
        setupStripe();
      } catch (error: any) {
        console.error("Error creating payment intent:", error);
        setPaymentError(error.message || "Failed to set up payment");
      } finally {
        setLoading(false);
      }
    };
    
    createPaymentIntent();
  }, []);
  
  // Create the payment elements when Stripe and clientSecret are available
  useEffect(() => {
    if (stripe && clientSecret) {
      console.log("Creating payment element with client secret");
      
      const elements = stripe.elements({
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#0a84ff',
          },
        },
      });
      
      const paymentElement = elements.create('payment');
      paymentElement.mount('#payment-element');
      setStripeElement(elements);
      
      console.log("Payment element created and mounted");
    }
  }, [stripe, clientSecret]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !stripeElement) {
      console.error("Stripe has not initialized yet");
      return;
    }
    
    setLoading(true);
    
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements: stripeElement,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: 'if_required',
      });
      
      if (error) {
        console.error("Payment failed:", error);
        setPaymentError(error.message || "Payment failed");
        toast({
          title: "Payment Failed",
          description: error.message || "Your payment could not be processed",
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        console.log("Payment succeeded:", paymentIntent);
        setPaymentSuccess(true);
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully",
        });
      } else {
        setPaymentError("Payment status is unknown");
      }
    } catch (error: any) {
      console.error("Error processing payment:", error);
      setPaymentError(error.message || "An error occurred while processing payment");
    } finally {
      setLoading(false);
    }
  };
  
  if (paymentSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center bg-green-50">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-center text-gray-700">
              Your payment has been processed successfully.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => window.location.href = "/"}>
              Return to Home
            </Button>
          </CardFooter>
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
          {loading ? (
            <div className="flex flex-col items-center justify-center p-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-gray-500">Setting up payment...</p>
            </div>
          ) : paymentError ? (
            <div className="bg-red-50 border border-red-100 rounded-lg p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Payment Error</h3>
                  <p className="text-sm text-red-700 mt-1">{paymentError}</p>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.reload()}
                    className="mt-3"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div id="payment-element" className="mb-6">
                {/* Stripe payment element will be mounted here */}
              </div>
              <Button
                type="submit"
                disabled={!stripe || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Pay €150.00"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Add declaration for Stripe in window object
declare global {
  interface Window {
    Stripe?: any;
  }
}