import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Simulated order data with properly formatted prices
const sampleOrderItems = [
  { name: "Assorted bread rolls", price: 3.00, quantity: 2 },
  { name: "Sourdough bread", price: 4.00, quantity: 1 },
  { name: "Bagels", price: 5.00, quantity: 1 },
  { name: "Greek sesame bagel", price: 3.50, quantity: 1 }
];

// This is a public-facing preview page that doesn't require authentication
export default function PublicPreview() {
  // Calculate subtotal
  const calculateSubtotal = () => {
    return sampleOrderItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  // Calculate total
  const calculateTotal = () => {
    return calculateSubtotal() + 150.00; // €150 delivery fee
  };

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">Price Preview - Air Gourmet Hellas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h2 className="text-xl font-medium">Order Items</h2>
            <div className="border rounded-md p-4">
              {sampleOrderItems.map((item, index) => (
                <div 
                  key={index}
                  className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-sm text-gray-500">
                      {item.quantity} x €{item.price.toFixed(2)}
                    </span>
                  </div>
                  <span className="font-medium">
                    €{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              
              <div className="flex justify-between pt-4 border-t border-gray-200 font-medium">
                <span>Subtotal</span>
                <span>€{calculateSubtotal().toFixed(2)}</span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-base font-medium">Subtotal:</span>
                <span className="text-base font-medium">€{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-base font-medium">Delivery Fee:</span>
                <span className="text-base font-medium">€150.00</span>
              </div>
              <div className="flex justify-between items-center text-lg font-semibold border-t border-gray-200 pt-2 mt-2">
                <span>Total:</span>
                <span>€{calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
              <h3 className="font-semibold text-amber-800 mb-2">Cancellation Policy</h3>
              <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
                <li>Cancellations made 24+ hours before delivery: Full refund</li>
                <li>Cancellations made 12-24 hours before delivery: 50% charge</li>
                <li>Cancellations made less than 12 hours before delivery: Full charge</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}