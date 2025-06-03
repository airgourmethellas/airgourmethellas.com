import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function OrderPaymentDebug() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebug = (message: string) => {
    console.log("[DEBUG]", message);
    setDebugInfo(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  // Test order creation
  const testOrderMutation = useMutation({
    mutationFn: async () => {
      addDebug("Starting test order creation");
      
      const testOrderData = {
        aircraftType: "TEST-AIRCRAFT",
        handlerCompany: "TEST-HANDLER",
        departureDate: "2025-06-04",
        departureTime: "10:00",
        departureAirport: "SKG",
        arrivalAirport: "JMK",
        deliveryLocation: "Thessaloniki",
        customerEmail: "test@example.com",
        customerName: "Test User",
        customerPhone: "+30 123 456 7890",
        flightNumber: "TEST123",
        numberOfPassengers: 2,
        specialInstructions: "Test order",
        cancellationPolicyAccepted: true,
        totalPrice: 50.00,
        items: [
          {
            menuItemId: 1,
            quantity: 1,
            price: 300, // 3.00 euros in cents
            specialInstructions: ""
          }
        ]
      };

      addDebug(`Sending order data: ${JSON.stringify(testOrderData, null, 2)}`);
      
      const res = await apiRequest("POST", "/api/orders", testOrderData);
      
      addDebug(`Response status: ${res.status}`);
      addDebug(`Response headers: ${JSON.stringify(Object.fromEntries(res.headers.entries()))}`);
      
      if (!res.ok) {
        const errorText = await res.text();
        addDebug(`Error response: ${errorText}`);
        throw new Error(`Order creation failed: ${res.status} - ${errorText}`);
      }
      
      const result = await res.json();
      addDebug(`Order created successfully: ${JSON.stringify(result)}`);
      return result;
    },
    onSuccess: (data) => {
      toast({
        title: "Test Order Created",
        description: `Order ID: ${data.id}`,
      });
      addDebug(`Order creation successful, ID: ${data.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Order Creation Failed",
        description: error.message,
        variant: "destructive",
      });
      addDebug(`Order creation error: ${error.message}`);
    }
  });

  // Test payment navigation
  const testPaymentNavigation = () => {
    addDebug("Testing payment navigation");
    const testUrl = "/payment?orderId=123&amount=50.00";
    addDebug(`Navigating to: ${testUrl}`);
    
    try {
      setLocation(testUrl);
      addDebug("Navigation successful");
      toast({
        title: "Navigation Test",
        description: "Successfully navigated to payment page",
      });
    } catch (error: any) {
      addDebug(`Navigation error: ${error.message}`);
      toast({
        title: "Navigation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Order & Payment Debug Tool</CardTitle>
            <CardDescription>
              Test order creation and payment navigation to identify issues
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={() => testOrderMutation.mutate()}
                disabled={testOrderMutation.isPending}
                className="w-full"
              >
                {testOrderMutation.isPending ? "Creating Test Order..." : "Test Order Creation"}
              </Button>
              
              <Button 
                onClick={testPaymentNavigation}
                variant="outline"
                className="w-full"
              >
                Test Payment Navigation
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Debug Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-md max-h-96 overflow-y-auto">
              {debugInfo.length === 0 ? (
                <p className="text-gray-500">No debug information yet. Run tests above.</p>
              ) : (
                <pre className="text-sm whitespace-pre-wrap">
                  {debugInfo.join('\n')}
                </pre>
              )}
            </div>
            {debugInfo.length > 0 && (
              <Button 
                onClick={() => setDebugInfo([])}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Clear Log
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}