import { useState, useEffect } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Initialize Stripe outside component
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      console.warn("Stripe.js hasn't yet loaded");
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/stripe-test`,
      },
      redirect: "if_required",
    });

    if (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      setIsProcessing(false);
    } else {
      setIsComplete(true);
      toast({
        title: "Payment successful",
        description: "Your payment has been processed successfully",
        variant: "default",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isComplete ? (
        <div className="bg-green-50 border border-green-100 rounded-lg p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-green-900">Payment Successful</h3>
          <p className="mt-2 text-sm text-green-600">
            Your payment has been processed successfully.
          </p>
        </div>
      ) : (
        <>
          <PaymentElement />
          <Button
            type="submit"
            disabled={!stripe || isProcessing}
            className="w-full"
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
        </>
      )}
    </form>
  );
}

export default function StripeTest() {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const createTestPaymentIntent = async () => {
      try {
        // Create a test payment intent
        console.log("Creating test payment intent...");
        const response = await apiRequest("POST", "/api/payments/test-payment-intent", {
          amount: 15000 // €150.00
        });
        
        if (!response.ok) {
          throw new Error(`Failed to create payment intent: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Payment intent created:", data);
        
        if (!data.clientSecret) {
          throw new Error("No client secret returned from payment service");
        }
        
        setClientSecret(data.clientSecret);
        setLoading(false);
      } catch (err: any) {
        console.error("Error setting up payment:", err);
        setError(err.message || "Failed to initialize payment system");
        setLoading(false);
        toast({
          title: "Payment Setup Error",
          description: err.message || "Could not initialize the payment system",
          variant: "destructive",
        });
      }
    };

    createTestPaymentIntent();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <h1 className="text-2xl font-bold mb-2">Setting Up Payment Test</h1>
        <p className="text-gray-500">Please wait while we connect to Stripe...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 border border-red-100 rounded-lg p-6 max-w-md w-full">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-red-700 mb-4 text-center">Payment Setup Failed</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex justify-center">
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6">Air Gourmet Hellas Payment Test</h1>
        <p className="mb-6 text-gray-600">
          This is a test payment of €150.00. You can use this test card: 
          <br /><code className="bg-gray-100 px-2 py-1 rounded mt-2 block">4242 4242 4242 4242</code>
          <br />Use any future date for expiry and any 3 digits for CVC.
        </p>
        
        {clientSecret && (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PaymentForm />
          </Elements>
        )}
      </div>
    </div>
  );
}