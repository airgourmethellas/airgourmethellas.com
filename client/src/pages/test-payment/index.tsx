import { useState, useEffect } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Make sure to call loadStripe outside of a component's render
// to avoid recreating the Stripe object on every render
let stripePromise: ReturnType<typeof loadStripe> | null = null;

// Function to initialize Stripe with the provided key
const initializeStripe = (key: string) => {
  if (!stripePromise && key) {
    console.log("Initializing Stripe with key:", key.substring(0, 5) + "...");
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

// Component for the actual payment form
const PaymentFormContent = () => {
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
        return_url: `${window.location.origin}/test-payment`,
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
};

// Main payment test page
export default function TestPayment() {
  const [clientSecret, setClientSecret] = useState("");
  const [stripeKey, setStripeKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkStripeConfig = async () => {
      try {
        // First, get the Stripe public key configuration
        console.log("Checking Stripe configuration...");
        const configResponse = await apiRequest("GET", "/api/payments/config");
        
        if (!configResponse.ok) {
          throw new Error(`Failed to get payment configuration: ${configResponse.status}`);
        }
        
        const configData = await configResponse.json();
        console.log("Payment config response:", configData);
        
        if (!configData.enabled || !configData.publicKey) {
          throw new Error("Stripe is not properly configured");
        }
        
        // Set the Stripe key and initialize Stripe
        setStripeKey(configData.publicKey);
        initializeStripe(configData.publicKey);
        
        // Now create a test payment intent
        console.log("Creating test payment intent...");
        const intentResponse = await apiRequest("POST", "/api/payments/test-payment-intent", {
          amount: 15000 // €150.00
        });
        
        if (!intentResponse.ok) {
          throw new Error(`Failed to create payment intent: ${intentResponse.status}`);
        }
        
        const intentData = await intentResponse.json();
        console.log("Payment intent created:", intentData);
        
        if (!intentData.clientSecret) {
          throw new Error("No client secret returned from payment service");
        }
        
        setClientSecret(intentData.clientSecret);
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

    checkStripeConfig();
  }, [toast]);

  // UI for loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <h1 className="text-2xl font-bold mb-2">Setting Up Payment Test</h1>
        <p className="text-gray-500">Please wait while we connect to the payment service...</p>
      </div>
    );
  }

  // UI for error state
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

  // Render payment form with Stripe Elements
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6">Air Gourmet Hellas Payment Test</h1>
        <p className="mb-6 text-gray-600">
          This is a test payment of €150.00. You can use the test card number: 
          <br /><code className="bg-gray-100 px-2 py-1 rounded">4242 4242 4242 4242</code>
          <br />Use any future date for expiry and any 3 digits for CVC.
        </p>
        
        {clientSecret && stripeKey ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PaymentFormContent />
          </Elements>
        ) : (
          <div className="p-4 bg-yellow-50 rounded-md text-yellow-700">
            Unable to initialize payment form. Please reload the page.
          </div>
        )}
      </div>
    </div>
  );
}