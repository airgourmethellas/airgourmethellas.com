import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function OrderDebugComplete() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [logs, setLogs] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [testOrderId, setTestOrderId] = useState<number | null>(null);

  const addLog = (message: string, isError = false) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `${timestamp}: ${isError ? '❌' : '✅'} ${message}`;
    console.log("[ORDER-DEBUG]", logEntry);
    setLogs(prev => [...prev, logEntry]);
  };

  const updateTestResult = (test: string, passed: boolean) => {
    setTestResults(prev => ({ ...prev, [test]: passed }));
  };

  // Test 1: Order Creation API
  const testOrderCreation = async () => {
    addLog("Testing order creation API");
    
    try {
      const orderData = {
        aircraftType: "TEST-737",
        handlerCompany: "Test Handler",
        departureDate: "2025-06-05",
        departureTime: "14:00",
        departureAirport: "SKG",
        arrivalAirport: "JMK",
        deliveryLocation: "Thessaloniki",
        customerEmail: "test@airgourmet.gr",
        customerName: "Test Customer",
        customerPhone: "+30 210 1234567",
        flightNumber: "TG123",
        numberOfPassengers: 4,
        specialInstructions: "Complete debug test order",
        cancellationPolicyAccepted: true,
        totalPrice: 75.50,
        items: [{
          menuItemId: 34,
          quantity: 2,
          price: 600,
          specialInstructions: "Test item"
        }]
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const result = await response.json();
        setTestOrderId(result.id);
        addLog(`Order created successfully: #${result.id}`);
        updateTestResult('orderCreation', true);
        return result.id;
      } else {
        const error = await response.text();
        addLog(`Order creation failed: ${response.status} - ${error}`, true);
        updateTestResult('orderCreation', false);
        return null;
      }
    } catch (error: any) {
      addLog(`Order creation error: ${error.message}`, true);
      updateTestResult('orderCreation', false);
      return null;
    }
  };

  // Test 2: Payment Navigation
  const testPaymentNavigation = () => {
    if (!testOrderId) {
      addLog("No order ID - creating order first", true);
      return testOrderCreation().then(orderId => {
        if (orderId) testPaymentNavigationWithId(orderId);
      });
    }
    testPaymentNavigationWithId(testOrderId);
  };

  const testPaymentNavigationWithId = (orderId: number) => {
    addLog(`Testing payment navigation with order ${orderId}`);
    
    try {
      const paymentUrl = `/payment?orderId=${orderId}&amount=75.50`;
      addLog(`Navigating to: ${paymentUrl}`);
      
      setLocation(paymentUrl);
      addLog("Payment navigation successful");
      updateTestResult('paymentNavigation', true);
      
      toast({
        title: "Navigation Test",
        description: "Check if payment page loaded correctly",
      });
    } catch (error: any) {
      addLog(`Payment navigation failed: ${error.message}`, true);
      updateTestResult('paymentNavigation', false);
    }
  };

  // Test 3: Menu Items API
  const testMenuItems = async () => {
    addLog("Testing menu items API");
    
    try {
      const response = await fetch('/api/menu-items', {
        credentials: 'include'
      });

      if (response.ok) {
        const items = await response.json();
        addLog(`Menu items loaded: ${items.length} items`);
        updateTestResult('menuItems', true);
      } else {
        addLog(`Menu items failed: ${response.status}`, true);
        updateTestResult('menuItems', false);
      }
    } catch (error: any) {
      addLog(`Menu items error: ${error.message}`, true);
      updateTestResult('menuItems', false);
    }
  };

  // Test 4: Stripe Configuration
  const testStripeConfig = async () => {
    addLog("Testing Stripe configuration");
    
    try {
      const response = await fetch('/api/test-stripe');
      
      if (response.ok) {
        const config = await response.json();
        addLog(`Stripe config: ${JSON.stringify(config)}`);
        updateTestResult('stripeConfig', config.configured);
      } else {
        addLog(`Stripe test failed: ${response.status}`, true);
        updateTestResult('stripeConfig', false);
      }
    } catch (error: any) {
      addLog(`Stripe test error: ${error.message}`, true);
      updateTestResult('stripeConfig', false);
    }
  };

  // Test 5: Complete Flow Test
  const testCompleteFlow = async () => {
    addLog("Starting complete order flow test");
    
    // Step 1: Menu items
    await testMenuItems();
    
    // Step 2: Order creation
    const orderId = await testOrderCreation();
    
    if (orderId) {
      // Step 3: Payment navigation
      setTimeout(() => {
        testPaymentNavigationWithId(orderId);
      }, 1000);
    }
    
    // Step 4: Stripe config
    await testStripeConfig();
    
    addLog("Complete flow test finished");
  };

  const getStatusBadge = (test: string) => {
    if (!(test in testResults)) return <Badge variant="secondary">Not Tested</Badge>;
    return testResults[test] ? 
      <Badge variant="default" className="bg-green-600">Passed</Badge> : 
      <Badge variant="destructive">Failed</Badge>;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Complete Order & Payment Flow Debug</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Button onClick={testMenuItems} size="sm">
                Test Menu Items
              </Button>
              <Button onClick={testOrderCreation} size="sm">
                Test Order Creation
              </Button>
              <Button onClick={testPaymentNavigation} size="sm">
                Test Payment Navigation
              </Button>
              <Button onClick={testStripeConfig} size="sm">
                Test Stripe Config
              </Button>
              <Button onClick={testCompleteFlow} className="col-span-2 md:col-span-1">
                Run Complete Test
              </Button>
              <Button 
                onClick={() => setLocation('/')} 
                variant="outline"
                className="col-span-2 md:col-span-1"
              >
                Back to Main App
              </Button>
            </div>

            {testOrderId && (
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-blue-800 font-medium">
                  Test Order Created: #{testOrderId}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Menu Items API</span>
                {getStatusBadge('menuItems')}
              </div>
              <div className="flex justify-between items-center">
                <span>Order Creation API</span>
                {getStatusBadge('orderCreation')}
              </div>
              <div className="flex justify-between items-center">
                <span>Payment Navigation</span>
                {getStatusBadge('paymentNavigation')}
              </div>
              <div className="flex justify-between items-center">
                <span>Stripe Configuration</span>
                {getStatusBadge('stripeConfig')}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Debug Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-md max-h-64 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-500 text-sm">No logs yet - run tests above</p>
              ) : (
                <div className="space-y-1">
                  {logs.map((log, index) => (
                    <div key={index} className="text-xs font-mono">
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {logs.length > 0 && (
              <Button 
                onClick={() => setLogs([])}
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