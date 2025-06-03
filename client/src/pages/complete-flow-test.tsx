import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export default function CompleteFlowTest() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<string>("idle");
  const [testResults, setTestResults] = useState<Record<string, "pending" | "success" | "failed">>({});
  const [orderId, setOrderId] = useState<number | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `${timestamp}: ${message}`]);
  };

  const updateResult = (step: string, result: "pending" | "success" | "failed") => {
    setTestResults(prev => ({ ...prev, [step]: result }));
  };

  const runCompleteTest = async () => {
    setCurrentStep("running");
    addLog("Starting complete order-to-payment flow test");
    
    // Step 1: Test menu items
    updateResult("menuItems", "pending");
    addLog("Testing menu items API...");
    try {
      const menuResponse = await fetch('/api/menu-items');
      if (menuResponse.ok) {
        const items = await menuResponse.json();
        addLog(`Menu items loaded: ${items.length} items`);
        updateResult("menuItems", "success");
      } else {
        throw new Error(`Menu API failed: ${menuResponse.status}`);
      }
    } catch (error: any) {
      addLog(`Menu items failed: ${error.message}`);
      updateResult("menuItems", "failed");
    }

    // Step 2: Create order
    updateResult("orderCreation", "pending");
    addLog("Creating test order...");
    try {
      const orderData = {
        aircraftType: "Airbus A320",
        handlerCompany: "Skyserv",
        departureDate: "2025-06-10",
        departureTime: "15:30",
        departureAirport: "SKG",
        arrivalAirport: "JMK",
        deliveryLocation: "Thessaloniki",
        customerEmail: "test@airgourmet.gr",
        customerName: "Test Customer",
        customerPhone: "+30 210 1234567",
        flightNumber: "A3123",
        numberOfPassengers: 6,
        specialInstructions: "Complete flow test",
        cancellationPolicyAccepted: true,
        totalPrice: 125.50,
        items: [{
          menuItemId: 34,
          quantity: 3,
          price: 900,
          specialInstructions: "Test items"
        }]
      };

      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(orderData)
      });

      if (orderResponse.ok) {
        const order = await orderResponse.json();
        setOrderId(order.id);
        addLog(`Order created successfully: #${order.id}`);
        updateResult("orderCreation", "success");
      } else {
        const error = await orderResponse.text();
        throw new Error(`Order creation failed: ${orderResponse.status} - ${error}`);
      }
    } catch (error: any) {
      addLog(`Order creation failed: ${error.message}`);
      updateResult("orderCreation", "failed");
    }

    // Step 3: Test payment navigation
    if (orderId) {
      updateResult("paymentNavigation", "pending");
      addLog("Testing payment navigation...");
      try {
        const paymentUrl = `/payment?orderId=${orderId}&amount=125.50`;
        addLog(`Payment URL generated: ${paymentUrl}`);
        updateResult("paymentNavigation", "success");
      } catch (error: any) {
        addLog(`Payment navigation failed: ${error.message}`);
        updateResult("paymentNavigation", "failed");
      }
    }

    // Step 4: Test Stripe configuration
    updateResult("stripeConfig", "pending");
    addLog("Testing Stripe configuration...");
    try {
      const stripeResponse = await fetch('/api/test-stripe');
      if (stripeResponse.ok) {
        const config = await stripeResponse.json();
        if (config.configured && config.hasSecretKey && config.hasPublicKey) {
          addLog("Stripe fully configured");
          updateResult("stripeConfig", "success");
        } else {
          throw new Error("Stripe configuration incomplete");
        }
      } else {
        throw new Error(`Stripe test failed: ${stripeResponse.status}`);
      }
    } catch (error: any) {
      addLog(`Stripe test failed: ${error.message}`);
      updateResult("stripeConfig", "failed");
    }

    setCurrentStep("complete");
    addLog("Complete flow test finished");
  };

  const navigateToPayment = () => {
    if (orderId) {
      const paymentUrl = `/payment?orderId=${orderId}&amount=125.50`;
      addLog(`Navigating to payment: ${paymentUrl}`);
      setLocation(paymentUrl);
    } else {
      toast({
        title: "No Order",
        description: "Run the complete test first to create an order",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: "pending" | "success" | "failed" | undefined) => {
    if (status === "success") return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (status === "failed") return <XCircle className="h-4 w-4 text-red-600" />;
    if (status === "pending") return <Clock className="h-4 w-4 text-yellow-600" />;
    return <div className="h-4 w-4 bg-gray-300 rounded-full" />;
  };

  const getStatusBadge = (status: "pending" | "success" | "failed" | undefined) => {
    if (status === "success") return <Badge className="bg-green-600">Passed</Badge>;
    if (status === "failed") return <Badge variant="destructive">Failed</Badge>;
    if (status === "pending") return <Badge variant="secondary">Running</Badge>;
    return <Badge variant="outline">Not Tested</Badge>;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Complete Order-to-Payment Flow Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                onClick={runCompleteTest}
                disabled={currentStep === "running"}
                className="col-span-2"
              >
                {currentStep === "running" ? "Running Test..." : "Run Complete Test"}
              </Button>
              
              <Button 
                onClick={navigateToPayment}
                disabled={!orderId}
                variant="outline"
              >
                Go to Payment
              </Button>
              
              <Button 
                onClick={() => setLocation('/')}
                variant="ghost"
              >
                Back to Main
              </Button>
            </div>

            {orderId && (
              <div className="bg-green-50 p-4 rounded-md">
                <p className="text-green-800 font-medium">
                  Order Created: #{orderId} - Ready for payment testing
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(testResults.menuItems)}
                  <span>Menu Items Loading</span>
                </div>
                {getStatusBadge(testResults.menuItems)}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(testResults.orderCreation)}
                  <span>Order Creation</span>
                </div>
                {getStatusBadge(testResults.orderCreation)}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(testResults.paymentNavigation)}
                  <span>Payment Navigation</span>
                </div>
                {getStatusBadge(testResults.paymentNavigation)}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(testResults.stripeConfig)}
                  <span>Stripe Configuration</span>
                </div>
                {getStatusBadge(testResults.stripeConfig)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-md max-h-64 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-500 text-sm">No logs yet - run the complete test</p>
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