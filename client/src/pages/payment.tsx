import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import DirectPayment from "@/components/ui/direct-payment";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Order } from "@shared/schema";
// Import our new robust price formatter
import { ensureEuros, smartFormatPrice } from "@/utils/robust-price-formatter";

export default function PaymentPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get orderId and amount from query params
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get("orderId");
  const amount = urlParams.get("amount");
  
  // Ensure we have both orderId and amount
  useEffect(() => {
    if (!orderId || !amount) {
      setError("Missing order information. Please go back and try again.");
    }
  }, [orderId, amount]);
  
  // Parse the amount - it's already in euros from the review page
  let amountNumber = amount ? parseFloat(amount) : 0;
  
  // For debugging
  console.log("Amount from URL parameter:", amount);
  console.log("Parsed amount number:", amountNumber);
  
  // Safely handle invalid numbers
  if (isNaN(amountNumber)) {
    console.error("Invalid amount format, defaulting to 0");
    amountNumber = 0;
  }
  
  // Amount is already in euros, no conversion needed
  const amountInEuros = amountNumber;
  
  // Fetch order details
  const { data: order, isLoading: isOrderLoading } = useQuery<Order>({
    queryKey: [`/api/orders/${orderId}`],
    enabled: !!orderId,
    // If order info is in URL params, use that as fallback if API fails
    placeholderData: orderId ? {
      id: parseInt(orderId),
      totalPrice: amountNumber,
    } as any : undefined,
  });
  
  // Handle successful payment
  const handlePaymentSuccess = () => {
    setIsProcessing(false);
    setIsComplete(true);
    toast({
      title: "Payment Successful",
      description: "Your payment has been processed successfully.",
    });
    
    // Redirect to order history after a short delay
    setTimeout(() => {
      setLocation("/client/orders");
    }, 3000);
  };
  
  // Handle payment error
  const handlePaymentError = (message: string) => {
    setIsProcessing(false);
    setError(message);
    toast({
      title: "Payment Failed",
      description: message,
      variant: "destructive",
    });
  };
  
  return (
    <div className="container max-w-md mx-auto py-12">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Complete Your Payment</CardTitle>
          <CardDescription>
            Secure payment for your catering order #{orderId}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isOrderLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          ) : isComplete ? (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 my-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <p className="text-green-700">Payment processed successfully</p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">Order ID:</span>
                  <span>{orderId}</span>
                </div>
                <div className="flex justify-between font-medium text-lg">
                  <span>Total Amount:</span>
                  <span>€{amountNumber.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium mb-4">Payment Details</h3>
                
                <DirectPayment 
                  orderId={parseInt(orderId || "0")}
                  amount={amountInEuros}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </div>
            </>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline"
            onClick={() => setLocation("/client/orders")}
            disabled={isProcessing}
          >
            {isComplete ? "View Orders" : "Cancel"}
          </Button>
          
          {isComplete && (
            <Button onClick={() => setLocation("/")}>
              Return Home
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}