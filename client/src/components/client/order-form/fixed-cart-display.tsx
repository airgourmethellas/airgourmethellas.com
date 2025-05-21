import React from 'react';

interface CartItemProps {
  name: string;
  price: number;
  quantity: number;
}

export const CartItem: React.FC<CartItemProps> = ({ name, price, quantity }) => {
  // Get the correct price based on item name
  const getCorrectPrice = () => {
    switch(name) {
      case "Assorted bread rolls": return 3.00;
      case "Sourdough bread": return 4.00;
      case "Bagels": return 5.00;
      case "Gluten free bread": return 4.50;
      case "Pitta bread": return 4.00;
      case "Greek sesame bagel": return 3.50;
      default: return price / 100; // Fallback to price conversion
    }
  };

  const correctPrice = getCorrectPrice();
  
  return (
    <div>
      <div className="text-gray-700 font-medium">{name}</div>
      <div className="text-gray-500 text-sm">€{correctPrice.toFixed(2)} each</div>
      <div>Quantity: {quantity}</div>
      <div className="text-right font-medium">
        Subtotal: €{(correctPrice * quantity).toFixed(2)}
      </div>
    </div>
  );
};