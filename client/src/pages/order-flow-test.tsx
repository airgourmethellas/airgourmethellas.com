import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function OrderFlowTest() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [testOrderId, setTestOrderId] = useState<number | null>(null);
  const [menuItemsLogged, setMenuItemsLogged] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp}: ${message}`;
    console.log("[ORDER-FLOW-TEST]", logEntry);
    setDebugLog(prev => [...prev, logEntry]);
  };

  // Test 1: Check menu items availability
  const { data: menuItems, isLoading: menuLoading } = useQuery({
    queryKey: ["/api/menu-items"]
  });

  // Log menu items when loaded (using useEffect to prevent render loop)
  useEffect(() => {
    if (menuItems && !menuLoading && !menuItemsLogged) {
      addLog(`Menu items loaded: ${Array.isArray(menuItems) ? menuItems.length : 0} items`);
      setMenuItemsLogged(true);
    }
  }, [menuItems, menuLoading, menuItemsLogged]);

  // Test 2: Create test order
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      addLog("Starting order creation test");
      
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
        specialInstructions: "Test order from flow test",
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

      addLog(`Sending order data: ${JSON.stringify(testOrderData, null, 2)}`);
      
      const res = await apiRequest("POST", "/api/orders", testOrderData);
      
      addLog(`Order response status: ${res.status}`);
      
      if (!res.ok) {
        const errorText = await res.text();
        addLog(`Order error response: ${errorText}`);
        throw new Error(`Order creation failed: ${res.status} - ${errorText}`);
      }
      
      const result = await res.json();
      addLog(`Order created successfully: ID ${result.id}`);
      return result;
    },
    onSuccess: (data) => {
      setTestOrderId(data.id);
      addLog(`Order creation successful, stored ID: ${data.id}`);
      toast({
        title: "Order Created",
        description: `Test order ID: ${data.id}`,
      });
    },
    onError: (error: any) => {
      addLog(`Order creation error: ${error.message}`);
      toast({
        title: "Order Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Test 3: Navigation to payment
  const testPaymentNavigation = () => {
    if (!testOrderId) {
      addLog("No test order ID available for payment navigation");
      toast({
        title: "No Order",
        description: "Create an order first",
        variant: "destructive",
      });
      return;
    }

    addLog(`Testing payment navigation with order ID: ${testOrderId}`);
    const paymentUrl = `/payment?orderId=${testOrderId}&amount=50.00`;
    addLog(`Navigating to: ${paymentUrl}`);
    
    try {
      setLocation(paymentUrl);
      addLog("Payment navigation successful");
      toast({
        title: "Navigation Test",
        description: "Successfully navigated to payment",
      });
    } catch (error: any) {
      addLog(`Payment navigation error: ${error.message}`);
      toast({
        title: "Navigation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Test 4: Check Stripe configuration
  const testStripeConfig = () => {
    addLog("Testing Stripe configuration");
    
    const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
    if (stripePublicKey) {
      addLog(`Stripe public key found: ${stripePublicKey.substring(0, 10)}...`);
    } else {
      addLog("ERROR: Stripe public key not found in environment");
    }
    
    // Test Stripe endpoint
    fetch('/api/test-stripe')
      .then(res => {
        addLog(`Stripe test endpoint status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        addLog(`Stripe test response: ${JSON.stringify(data)}`);
      })
      .catch(error => {
        addLog(`Stripe test error: ${error.message}`);
      });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Order & Payment Flow Comprehensive Test</CardTitle>
            <CardDescription>
              Complete diagnostic tool for order placement and payment navigation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={() => createOrderMutation.mutate()}
                disabled={createOrderMutation.isPending}
                className="w-full"
              >
                {createOrderMutation.isPending ? "Creating Order..." : "1. Create Test Order"}
              </Button>
              
              <Button 
                onClick={testPaymentNavigation}
                disabled={!testOrderId}
                variant="outline"
                className="w-full"
              >
                2. Test Payment Navigation
              </Button>
              
              <Button 
                onClick={testStripeConfig}
                variant="secondary"
                className="w-full"
              >
                3. Check Stripe Config
              </Button>
              
              <Button 
                onClick={() => setLocation('/order-payment-debug')}
                variant="ghost"
                className="w-full"
              >
                4. Go to Debug Tool
              </Button>
            </div>

            {testOrderId && (
              <div className="bg-green-50 p-4 rounded-md">
                <p className="text-green-800 font-medium">
                  Test Order Created: ID {testOrderId}
                </p>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-md">
              <h4 className="font-medium text-blue-800 mb-2">System Status</h4>
              <div className="space-y-1 text-sm text-blue-700">
                <p>Menu Items: {menuLoading ? "Loading..." : `${Array.isArray(menuItems) ? menuItems.length : 0} items available`}</p>
                <p>Stripe Key: {import.meta.env.VITE_STRIPE_PUBLIC_KEY ? "✓ Configured" : "✗ Missing"}</p>
                <p>Test Order: {testOrderId ? `✓ Created (ID: ${testOrderId})` : "Not created"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detailed Debug Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-md max-h-96 overflow-y-auto">
              {debugLog.length === 0 ? (
                <p className="text-gray-500">Run tests above to see detailed logs</p>
              ) : (
                <pre className="text-xs whitespace-pre-wrap">
                  {debugLog.join('\n')}
                </pre>
              )}
            </div>
            {debugLog.length > 0 && (
              <Button 
                onClick={() => setDebugLog([])}
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