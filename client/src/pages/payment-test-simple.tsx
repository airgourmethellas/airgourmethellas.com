import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function PaymentTestSimple() {
  const [, setLocation] = useLocation();

  const testPaymentNavigation = () => {
    console.log("Testing payment navigation...");
    const testUrl = "/payment?orderId=123&amount=50.00";
    console.log("Navigating to:", testUrl);
    setLocation(testUrl);
    console.log("Navigation called");
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Payment Navigation Test</h1>
        <p className="mb-4">Click the button to test navigation to the payment page.</p>
        <Button onClick={testPaymentNavigation} className="w-full">
          Test Payment Navigation
        </Button>
      </div>
    </div>
  );
}