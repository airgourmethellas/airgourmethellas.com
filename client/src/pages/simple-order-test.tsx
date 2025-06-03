import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function SimpleOrderTest() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [testOrderId, setTestOrderId] = useState<number | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `${timestamp}: ${message}`;
    console.log("[SIMPLE-TEST]", logEntry);
    setLogs(prev => [...prev, logEntry]);
  };

  const createTestOrder = async () => {
    addLog("Starting manual order creation test");
    
    try {
      const orderData = {
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
        specialInstructions: "Simple test order",
        cancellationPolicyAccepted: true,
        totalPrice: 50.00,
        items: [{
          menuItemId: 1,
          quantity: 1,
          price: 300,
          specialInstructions: ""
        }]
      };

      addLog("Sending POST request to /api/orders");
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(orderData)
      });

      addLog(`Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        addLog(`Error response: ${errorText}`);
        throw new Error(`Order creation failed: ${response.status}`);
      }

      const result = await response.json();
      addLog(`Order created successfully: ID ${result.id}`);
      setTestOrderId(result.id);
      
      toast({
        title: "Order Created",
        description: `Test order ID: ${result.id}`,
      });

    } catch (error: any) {
      addLog(`Order creation error: ${error.message}`);
      toast({
        title: "Order Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const testPaymentNavigation = () => {
    if (!testOrderId) {
      addLog("No order ID available for payment test");
      toast({
        title: "No Order",
        description: "Create an order first",
        variant: "destructive",
      });
      return;
    }

    addLog(`Testing payment navigation with order ID: ${testOrderId}`);
    const paymentUrl = `/payment?orderId=${testOrderId}&amount=50.00`;
    addLog(`Attempting navigation to: ${paymentUrl}`);
    
    try {
      setLocation(paymentUrl);
      addLog("Navigation call completed");
      toast({
        title: "Navigation Attempted",
        description: "Check if payment page loaded",
      });
    } catch (error: any) {
      addLog(`Navigation error: ${error.message}`);
      toast({
        title: "Navigation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const testDirectNavigation = () => {
    addLog("Testing direct navigation to payment page");
    const testUrl = "/payment?orderId=999&amount=99.99";
    addLog(`Direct navigation to: ${testUrl}`);
    
    try {
      setLocation(testUrl);
      addLog("Direct navigation completed");
    } catch (error: any) {
      addLog(`Direct navigation error: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Simple Order & Payment Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button onClick={createTestOrder} className="w-full">
                Create Test Order
              </Button>
              
              <Button 
                onClick={testPaymentNavigation}
                disabled={!testOrderId}
                variant="outline"
                className="w-full"
              >
                Test Payment Nav
              </Button>
              
              <Button 
                onClick={testDirectNavigation}
                variant="secondary"
                className="w-full"
              >
                Direct Payment Nav
              </Button>
            </div>

            {testOrderId && (
              <div className="bg-green-50 p-3 rounded-md">
                <p className="text-green-800 text-sm">
                  Test Order Created: #{testOrderId}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-md max-h-64 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-500 text-sm">No logs yet</p>
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
                Clear
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}