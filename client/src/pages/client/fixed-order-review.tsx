import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { MenuItem } from "@shared/schema";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent } from "@/components/ui/card";
import { formatPriceFromCents, formatPriceInEuros } from "@/utils/robust-price-formatter";

export default function FixedOrderReview() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { t } = useLanguage();
  
  // Sample order items with prices in cents (matching database storage)
  // This is for display purposes - in real orders, prices come from the database
  const orderItems = [
    { name: "Caesar salad with prawns", price: 4650, quantity: 1 }, // €46.50 
    { name: "Breakfast garnishing", price: 600, quantity: 1 },      // €6.00
    { name: "French croissant", price: 1550, quantity: 1 }          // €15.50
  ];
  
  // Calculate subtotal in cents first
  const calculateSubtotalCents = () => {
    return orderItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  // Calculate subtotal in euros (for display)
  const calculateSubtotal = () => {
    return calculateSubtotalCents() / 100;
  };

  // Calculate total with delivery fee - delivery fee is 15000 cents (€150.00)
  const calculateTotalCents = () => {
    return calculateSubtotalCents() + 15000;
  };
  
  // Calculate total in euros (for display)
  const calculateTotal = () => {
    return calculateTotalCents() / 100;
  };

  // Handle payment options
  const handlePaymentOption = (option: 'card' | 'invoice') => {
    if (option === 'card') {
      toast({
        title: "Redirecting to payment page",
        description: "You will be redirected to the payment page.",
      });
      // Use the total in cents directly for Stripe
      navigate(`/payment?orderId=new&amount=${calculateTotalCents()}`);
    } else {
      toast({
        title: "Invoice Request Received",
        description: "We will process your invoice request shortly.",
      });
      navigate("/client/orders");
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Review Your Order</h1>
        <p className="text-gray-600">Please review your order details below before proceeding to payment.</p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Order Items</h2>
          <div className="space-y-4">
            {orderItems.map((item, index) => (
              <div 
                key={index}
                className="flex justify-between py-2 border-b border-gray-100 last:border-b-0"
              >
                <div>
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.quantity} x {formatPriceFromCents(item.price)}</p>
                </div>
                <p className="font-medium">{formatPriceFromCents(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between mb-2">
              <span>Subtotal:</span>
              <span>{formatPriceFromCents(calculateSubtotalCents())}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Delivery Fee:</span>
              <span>{formatPriceFromCents(15000)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
              <span>Total:</span>
              <span>{formatPriceFromCents(calculateTotalCents())}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6 bg-amber-50 border-amber-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-amber-800 mb-2">Cancellation Policy</h3>
          <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
            <li>Cancellations made 24+ hours before delivery: Full refund</li>
            <li>Cancellations made 12-24 hours before delivery: 50% charge</li>
            <li>Cancellations made less than 12 hours before delivery: Full charge</li>
            <li>No-shows will be charged the full amount</li>
          </ul>
          <div className="mt-3 flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
            />
            <Label
              htmlFor="terms"
              className="text-sm cursor-pointer"
            >
              I understand and agree to the cancellation policy
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={() => navigate("/client/new-order")}>
          Back
        </Button>
        <div className="space-x-3">
          <Button
            variant="outline"
            onClick={() => handlePaymentOption('invoice')}
            disabled={!agreedToTerms}
          >
            Request Invoice
          </Button>
          <Button
            onClick={() => handlePaymentOption('card')}
            disabled={!agreedToTerms}
          >
            Pay with Card
          </Button>
        </div>
      </div>
    </div>
  );
}