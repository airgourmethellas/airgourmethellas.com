import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import DirectPayment from "@/components/ui/direct-payment";

export default function PaymentPage() {
  const [_, params] = useRoute("/client/payment/:orderId");
  const orderId = params?.orderId;
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setError("No order ID provided");
      setIsLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        const response = await apiRequest("GET", `/api/orders/${orderId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch order details");
        }

        const data = await response.json();
        setOrderDetails(data);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError("Could not load order details. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    
    toast({
      title: "Payment Successful",
      description: "Your payment has been processed successfully.",
    });
  };

  const handlePaymentError = (message: string) => {
    toast({
      title: "Payment Failed",
      description: message || "There was an error processing your payment. Please try again.",
      variant: "destructive",
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <h1 className="text-xl font-semibold">Loading Payment Information...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-xl font-semibold mb-2">Payment Error</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link href="/client/orders">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
        <h1 className="text-xl font-semibold mb-2">Payment Successful</h1>
        <p className="text-gray-600 mb-6">
          Your payment for order #{orderDetails?.orderNumber || orderId} has been processed successfully.
        </p>
        <div className="flex space-x-4">
          <Link href="/client/orders">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              View Orders
            </Button>
          </Link>
          <Link href="/client/new-order">
            <Button>Place Another Order</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Complete Your Payment</h1>
        <p className="text-gray-600">
          Order #{orderDetails?.orderNumber || orderId}
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        
        <div className="space-y-2 mb-6">
          {orderDetails && (
            <>
              <div className="grid grid-cols-2 text-sm">
                <span className="text-gray-600">Order ID:</span>
                <span>{orderDetails.orderNumber || orderId}</span>
              </div>
              
              {orderDetails.aircraftType && (
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-gray-600">Flight Details:</span>
                  <span>{orderDetails.aircraftType}, {orderDetails.tailNumber}</span>
                </div>
              )}
              
              {orderDetails.departureDate && (
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-gray-600">Departure:</span>
                  <span>{orderDetails.departureDate}, {orderDetails.departureTime} from {orderDetails.departureAirport}</span>
                </div>
              )}
              
              {orderDetails.deliveryLocation && (
                <div className="grid grid-cols-2 text-sm">
                  <span className="text-gray-600">Delivery Location:</span>
                  <span>{orderDetails.deliveryLocation}</span>
                </div>
              )}
              
              <div className="grid grid-cols-2 text-sm font-medium border-t border-gray-200 pt-2 mt-2">
                <span className="text-gray-700">Total Amount:</span>
                <span>€{(orderDetails.totalPrice || 0).toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
        
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium mb-4">Payment Details</h3>
          
          <DirectPayment
            orderId={orderId ? parseInt(orderId) : 0}
            amount={orderDetails?.totalPrice || 0}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </div>
      </div>
      
      <div className="mt-6">
        <Link href="/client/orders">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </Link>
      </div>
    </div>
  );
}