import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/utils/price-formatter";

export default function PriceTest() {
  // Test different price formats
  const testPrices = [
    { name: "Assorted bread rolls", value: 300, display: "€3.00" },
    { name: "Sourdough bread", value: 400, display: "€4.00" },
    { name: "Bagels", value: 500, display: "€5.00" },
    { name: "Gluten free bread", value: 450, display: "€4.50" },
    { name: "Greek sesame bagel", value: 350, display: "€3.50" },
    { name: "Premium Greek salad", value: 1200, display: "€12.00" },
    { name: "Beef carpaccio", value: 1500, display: "€15.00" },
    { name: "Beef fillet", value: 2500, display: "€25.00" }
  ];

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Price Format Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Menu Items</h2>
              <div className="grid gap-4">
                {testPrices.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex justify-between items-center p-3 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">Raw value: {item.value} cents</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="font-medium text-green-600">
                        {formatPrice(item.value)}
                      </p>
                      <p className="text-xs text-gray-500">Expected: {item.display}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Total Calculation Test</h2>
              <div className="border rounded-md p-4 bg-gray-50 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal Items:</span>
                  <span>{formatPrice(testPrices.reduce((sum, item) => sum + item.value, 0))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span>{formatPrice(15000)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-2 font-bold">
                  <span>Total:</span>
                  <span>{formatPrice(testPrices.reduce((sum, item) => sum + item.value, 0) + 15000)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-center">
        <Button 
          onClick={() => window.history.back()}
          size="lg"
        >
          Back to Previous Page
        </Button>
      </div>
    </div>
  );
}