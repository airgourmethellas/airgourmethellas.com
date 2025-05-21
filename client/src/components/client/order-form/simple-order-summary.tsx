import React from 'react';
import { formatPriceWithSymbol } from '@/utils/price-formatter';

type SimpleOrderSummaryProps = {
  items: Array<{
    name: string;
    price: number; // in cents
    quantity: number;
  }>;
  deliveryFee?: number; // in cents
};

const SimpleOrderSummary: React.FC<SimpleOrderSummaryProps> = ({ 
  items,
  deliveryFee = 15000 // Default €150.00
}) => {
  // Calculate subtotal in cents
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate total in cents
  const total = subtotal + deliveryFee;
  
  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
      
      {items.map((item, index) => (
        <div key={index} className="flex justify-between py-2 border-b">
          <div>
            <div className="font-medium">{item.name}</div>
            <div className="text-sm text-gray-500">
              {item.quantity} x {formatPriceWithSymbol(item.price)}
            </div>
          </div>
          <div className="font-medium">
            {formatPriceWithSymbol(item.price * item.quantity)}
          </div>
        </div>
      ))}
      
      <div className="flex justify-between mt-4 pt-2">
        <span className="font-medium">Subtotal</span>
        <span className="font-medium">{formatPriceWithSymbol(subtotal)}</span>
      </div>
      
      <div className="flex justify-between mt-2">
        <span className="font-medium">Delivery Fee</span>
        <span className="font-medium">{formatPriceWithSymbol(deliveryFee)}</span>
      </div>
      
      <div className="flex justify-between mt-4 pt-2 border-t font-bold">
        <span>Total</span>
        <span>{formatPriceWithSymbol(total)}</span>
      </div>
    </div>
  );
};

export default SimpleOrderSummary;