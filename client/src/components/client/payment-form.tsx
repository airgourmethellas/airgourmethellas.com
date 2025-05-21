import { useState, useEffect } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
// We'll initialize Stripe later when we confirm the key is available
let stripePromise: ReturnType<typeof loadStripe> | null = null;

// Function to initialize Stripe with the provided key
const initializeStripe = (key: string) => {
  if (!stripePromise && key) {
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

interface PaymentFormProps {
  orderId: number;
  amount: number;
  onSuccess: () => void;
  onError: (message: string) => void;
}

const PaymentFormContent = ({ orderId, amount, onSuccess, onError }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      // `Elements` instance that was used to create the Payment Element
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders`,
      },
      redirect: "if_required",
    });

    if (error) {
      // Provide user-friendly messages for common payment errors
      let errorMessage = error.message || "An unexpected error occurred.";
      let errorTitle = "Payment failed";
      
      // Handle specific Stripe error types with more helpful messages
      if (error.type === 'card_error') {
        // Card declined, insufficient funds, etc.
        errorTitle = "Card payment failed";
        if (error.code === 'card_declined') {
          errorMessage = "Your card was declined. Please try another payment method.";
        } else if (error.code === 'insufficient_funds') {
          errorMessage = "Your card has insufficient funds. Please try another card.";
        } else if (error.code === 'expired_card') {
          errorMessage = "Your card is expired. Please try another card.";
        } else if (error.code === 'incorrect_cvc') {
          errorMessage = "Your card's security code is incorrect. Please check and try again.";
        } else if (error.code === 'processing_error') {
          errorMessage = "An error occurred while processing your card. Please try again.";
        }
      } else if (error.type === 'validation_error') {
        // Invalid input errors
        errorTitle = "Validation error";
        errorMessage = "Please check your payment details and try again.";
      } else if (error.type === 'invalid_request_error') {
        // Invalid API request
        errorTitle = "System error";
        errorMessage = "A system error occurred. Our team has been notified.";
        // Here you would log the error for monitoring
      }
      
      // Show error to your customer
      onError(errorMessage);
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
      setIsProcessing(false);
      
      // Track the error with our error tracking utility for analytics
      try {
        // Import the tracking utility directly to avoid window reference
        import('@/utils/error-tracking').then(module => {
          module.trackError(new Error(errorMessage), 'PaymentForm');
        });
      } catch (trackingError) {
        console.error('Could not track payment error:', trackingError);
      }
    } else {
      // Payment succeeded
      setIsComplete(true);
      toast({
        title: "Payment successful",
        description: "Your payment has been processed successfully.",
      });
      setTimeout(() => {
        onSuccess();
      }, 1000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {isComplete ? (
        <div className="bg-green-50 border border-green-100 rounded-lg p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-green-900">Payment Successful</h3>
          <p className="mt-2 text-sm text-green-600">
            Your payment has been processed successfully. You will be redirected to your orders.
          </p>
        </div>
      ) : (
        <>
          <PaymentElement />
          <div className="pt-4">
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
                `Pay €${(amount / 100).toFixed(2)}`
              )}
            </Button>
          </div>
        </>
      )}
    </form>
  );
};

export default function PaymentForm({ orderId, amount, onSuccess, onError }: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stripeKey, setStripeKey] = useState<string | null>(null);
  const { toast } = useToast();

  // First, get the payment configuration to check if Stripe is available
  useEffect(() => {
    const getPaymentConfig = async () => {
      try {
        console.log("Fetching payment configuration...");
        console.log("Current order ID:", orderId);
        const response = await apiRequest("GET", "/api/payments/config");
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => "Unknown error");
          console.error("Payment config response:", response.status, errorText);
          throw new Error(`Payment configuration request failed with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Payment configuration response:", data);
        
        if (data.enabled && data.publicKey) {
          console.log("Stripe is properly configured, initializing...");
          setStripeKey(data.publicKey);
          // Initialize Stripe with the public key
          initializeStripe(data.publicKey);
        } else {
          console.warn("Stripe configuration issue:", !data.enabled ? "Stripe is disabled" : "Missing public key");
          throw new Error("Payment system is not properly configured: " + 
            (!data.enabled ? "Stripe is disabled" : "Missing public key"));
        }
      } catch (err: any) {
        console.error("Payment configuration error:", err);
        setError("Payment system is unavailable: " + (err.message || "Unknown error"));
        onError("Payment system is unavailable. Please try again later or contact support. Error: " + 
          (err.message || "Unknown error"));
        setLoading(false);
      }
    };

    getPaymentConfig();
  }, [onError, orderId]);

  // Then, initialize the payment intent if Stripe is available
  useEffect(() => {
    if (!stripeKey) {
      console.log("Skipping payment initialization - no Stripe key available");
      return; // Don't proceed if Stripe key isn't available
    }

    const initializePayment = async () => {
      try {
        setLoading(true);
        
        console.log("Initializing payment for order:", orderId, "with amount:", amount);
        
        // Make sure we have a valid order ID
        if (!orderId || isNaN(orderId) || orderId <= 0) {
          throw new Error(`Invalid order ID: ${orderId}`);
        }
        
        // Request with credentials included to ensure session cookies are sent
        const response = await apiRequest("POST", "/api/payments/create-payment-intent", {
          orderId,
        });
        
        console.log("Payment intent response status:", response.status);
        
        // Handle non-OK responses with detailed error reporting
        if (!response.ok) {
          let errorMessage = "Failed to initialize payment";
          let responseText = "";
          
          try {
            responseText = await response.text();
            console.log("Error response text:", responseText);
            
            try {
              const errorData = JSON.parse(responseText);
              errorMessage = errorData.message || errorMessage;
              console.log("Parsed error details:", errorData);
            } catch (jsonError) {
              console.error("Error response was not valid JSON:", responseText);
            }
          } catch (textError) {
            console.error("Could not read error response:", textError);
          }
          
          throw new Error(`${errorMessage} (Status ${response.status})`);
        }
        
        // Parse the successful response
        try {
          const data = await response.json();
          console.log("Payment intent created successfully:", data);
          
          if (!data.clientSecret) {
            throw new Error("No client secret returned from payment service");
          }
          
          setClientSecret(data.clientSecret);
        } catch (parseError) {
          console.error("Error parsing payment intent response:", parseError);
          throw new Error("Invalid response from payment service");
        }
      } catch (err: any) {
        console.error("Payment initialization error:", err);
        
        // Create user-friendly error message
        const errorMessage = err.message || "Failed to initialize payment";
        setError(errorMessage);
        
        // Show toast notification
        toast({
          title: "Payment System Error",
          description: `We couldn't initialize your payment: ${errorMessage}. Please try again or contact support.`,
          variant: "destructive",
        });
        
        // Report to parent component
        onError(`Payment initialization failed: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    initializePayment();
  }, [orderId, amount, toast, onError, stripeKey]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Initializing payment...</span>
      </div>
    );
  }

  if (error) {
    // Parse the error message to provide more helpful guidance
    let errorTitle = "Payment System Error";
    let errorMessage = error;
    let actionMessage = "Please try again later or contact support.";
    
    // Categorize common payment errors
    if (error.includes("Stripe is disabled") || error.includes("Missing public key")) {
      errorTitle = "Payment System Unavailable";
      errorMessage = "Our payment system is temporarily offline.";
      actionMessage = "Please contact support to complete your order.";
    } else if (error.includes("connection") || error.includes("network")) {
      errorTitle = "Connection Problem";
      errorMessage = "We're having trouble connecting to our payment provider.";
      actionMessage = "Please check your internet connection and try again.";
    } else if (error.includes("authentication") || error.includes("key")) {
      errorTitle = "Authentication Error";
      errorMessage = "Our payment system is experiencing authentication issues.";
      actionMessage = "Our team has been notified. Please try again later.";
    }
    
    return (
      <div className="bg-red-50 border border-red-100 rounded-lg p-6">
        <div className="text-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-red-800">{errorTitle}</h3>
          <p className="text-red-600 mt-2">{errorMessage}</p>
          <p className="text-sm text-gray-600 mt-3">{actionMessage}</p>
        </div>
        
        <div className="border-t border-red-200 pt-4 mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Alternative Options:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Contact our customer service at support@airgourmethellas.com</li>
            <li>• Complete your order via phone at +30 2310 123456</li>
            <li>• Try again in a few minutes</li>
          </ul>
        </div>
        
        <div className="mt-4 flex justify-center">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="mr-2"
          >
            Try Again
          </Button>
          <Button asChild>
            <a href="https://www.airgourmet.gr/contact" target="_blank" rel="noopener noreferrer">
              Contact Support
            </a>
          </Button>
        </div>
      </div>
    );
  }

  const options = clientSecret ? {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#0a84ff',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  } : {};

  return (
    <div className="w-full max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
      {clientSecret && stripeKey && stripePromise ? (
        <Elements stripe={stripePromise} options={options}>
          <PaymentFormContent 
            orderId={orderId} 
            amount={amount} 
            onSuccess={onSuccess} 
            onError={onError} 
          />
        </Elements>
      ) : (
        <div className="p-4 bg-amber-50 rounded-md text-amber-700">
          {error || "Unable to initialize payment. Please try again later or contact support."}
        </div>
      )}
    </div>
  );
}