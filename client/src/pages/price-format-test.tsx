import { useEffect, useState } from "react";
import { formatPrice, formatPriceWithSymbol, debugPrice } from "@/utils/price-formatter";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PriceFormatTest() {
  const [price, setPrice] = useState<number>(300);
  const [debugOutput, setDebugOutput] = useState<string>("");

  useEffect(() => {
    setDebugOutput(debugPrice(price));
  }, [price]);

  // Common menu item prices for testing
  const samplePrices = [
    { name: "Assorted bread rolls", cents: 300 },
    { name: "Bagels", cents: 500 },
    { name: "Greek sesame bagel", cents: 350 },
    { name: "Premium Greek salad", cents: 1200 },
    { name: "Beef fillet", cents: 2500 },
    { name: "Delivery Fee", cents: 15000 }
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Price Format Testing Tool</h1>
      
      <Tabs defaultValue="test">
        <TabsList className="mb-4">
          <TabsTrigger value="test">Test Price Formatting</TabsTrigger>
          <TabsTrigger value="examples">Sample Menu Prices</TabsTrigger>
        </TabsList>
        
        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle>Price Format Testing</CardTitle>
              <CardDescription>
                Enter a price value to see how it will be formatted
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="price">Price value (as stored in database):</Label>
                  <Input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                  />
                  <p className="text-sm text-gray-500">
                    Enter cents value (e.g., 300 for €3.00)
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Formatting Results:</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm font-medium">formatPrice:</div>
                    <div>{formatPrice(price)}</div>
                    
                    <div className="text-sm font-medium">formatPriceWithSymbol:</div>
                    <div>{formatPriceWithSymbol(price)}</div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Debug Information:</h3>
                  <pre className="whitespace-pre-wrap text-sm">{debugOutput}</pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="examples">
          <Card>
            <CardHeader>
              <CardTitle>Sample Menu Prices</CardTitle>
              <CardDescription>
                Common menu item prices as they should be formatted
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Menu Item</th>
                      <th className="px-4 py-2 text-left">DB Value (cents)</th>
                      <th className="px-4 py-2 text-left">Formatted Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {samplePrices.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3">{item.name}</td>
                        <td className="px-4 py-3">{item.cents}</td>
                        <td className="px-4 py-3 font-medium">{formatPriceWithSymbol(item.cents)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}