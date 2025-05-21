import { useState, useEffect } from "react";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Load Stripe outside of component render
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

// The actual payment form component that's wrapped by the Elements provider
function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      console.error("Stripe has not initialized yet");
      return;
    }

    setIsProcessing(true);

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: "if_required",
      });

      if (result.error) {
        console.error("Payment failed:", result.error);
        toast({
          title: "Payment failed",
          description: result.error.message || "An unexpected error occurred",
          variant: "destructive",
        });
      } else {
        setIsComplete(true);
        toast({
          title: "Payment successful!",
          description: "Your payment has been processed successfully.",
        });
      }
    } catch (error: any) {
      console.error("Error in payment processing:", error);
      toast({
        title: "Payment processing error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isComplete) {
    return (
      <div className="bg-green-50 border border-green-100 rounded-lg p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="mt-3 text-lg font-medium text-green-900">Payment Successful!</h3>
        <p className="mt-2 text-sm text-green-700">
          Your payment has been processed successfully.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <PaymentElement />
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Pay €150.00"
        )}
      </Button>
    </form>
  );
}

export default function PaymentTest() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function createPaymentIntent() {
      try {
        console.log("Creating test payment intent...");
        const response = await fetch("/api/payments/test-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount: 15000 }), // €150.00
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Payment intent created successfully", data);
        setClientSecret(data.clientSecret);
      } catch (err: any) {
        console.error("Error creating payment intent:", err);
        setError(err.message || "Failed to create payment intent");
        toast({
          title: "Payment Setup Error",
          description: err.message || "Could not initialize payment form",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    createPaymentIntent();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
        <h1 className="mb-2 text-2xl font-bold">Setting Up Payment</h1>
        <p className="text-gray-500">Please wait while we connect to the payment service...</p>
      </div>
    );
  }

  if (error || !stripePromise) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertCircle className="mr-2 h-5 w-5" />
              Payment Setup Failed
            </CardTitle>
            <CardDescription>
              We couldn't connect to the payment service.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600">
              {error || "Stripe public key is missing. Please check your environment configuration."}
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => window.location.reload()} className="w-full">
              Try Again
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
          <CardTitle>Payment Test</CardTitle>
          <CardDescription>
            This is a test payment of €150.00 for Air Gourmet Hellas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm />
            </Elements>
          ) : (
            <div className="rounded-md bg-yellow-50 p-4 text-sm text-yellow-800">
              Payment initialization failed. Please try again.
            </div>
          )}
        </CardContent>
        <CardFooter className="text-xs text-gray-500">
          <p>
            For testing, use card number: <code className="bg-gray-100 p-1 rounded">4242 4242 4242 4242</code>
            <br />Use any future expiration date, any 3 digit CVC, and any postal code.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}