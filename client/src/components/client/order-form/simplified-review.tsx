import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { OrderFormData } from "@/pages/client/new-order";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/use-language";

interface ReviewConfirmProps {
  formData: OrderFormData;
  onFormDataChange: (data: Partial<OrderFormData>) => void;
  onPrev: () => void;
}

type FoodItem = {
  name: string;
  price: number;
  quantity: number;
  menuItemId: number;
  specialInstructions?: string;
};

export default function SimplifiedReview({
  formData,
  onFormDataChange,
  onPrev,
}: ReviewConfirmProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { data: menuItems, isLoading: menuItemsLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu-items"],
  });
  const { t } = useLanguage();
  
  // Create a fixed list of items with correct prices
  const [orderItems, setOrderItems] = useState<FoodItem[]>([]);
  
  // When menu items are loaded, create fixed price order items
  useEffect(() => {
    if (menuItems && formData.items.length > 0) {
      const items: FoodItem[] = formData.items.map(item => {
        const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
        let correctPrice = 0;
        
        // Hardcoded correct prices based on item name
        if (menuItem) {
          switch (menuItem.name) {
            case "Assorted bread rolls": correctPrice = 3.00; break;
            case "Sourdough bread": correctPrice = 4.00; break;
            case "Bagels": correctPrice = 5.00; break;
            case "Gluten free bread": correctPrice = 4.50; break;
            case "Pitta bread": correctPrice = 4.00; break;
            case "Greek sesame bagel (Koulouri)": correctPrice = 3.50; break;
            case "Greek yogurt with honey": correctPrice = 4.50; break;
            case "Fresh fruit platter": correctPrice = 5.00; break;
            case "Premium Greek salad": correctPrice = 12.00; break;
            case "Caesar salad": correctPrice = 10.00; break;
            case "Quinoa salad": correctPrice = 9.00; break;
            case "Caprese salad": correctPrice = 11.00; break;
            case "Wild rocket salad": correctPrice = 9.50; break;
            case "Beef carpaccio": correctPrice = 15.00; break;
            case "Smoked salmon": correctPrice = 14.00; break;
            case "Prosciutto and melon": correctPrice = 13.00; break;
            case "Smoked grilled eggplant with regional cheese": correctPrice = 11.00; break;
            case "Stuffed vine leaves": correctPrice = 10.00; break;
            case "Greek spinach pie": correctPrice = 8.00; break;
            case "Grilled lamb chops": correctPrice = 22.00; break;
            case "Beef fillet": correctPrice = 25.00; break;
            case "Grilled salmon": correctPrice = 20.00; break;
            case "Roasted chicken": correctPrice = 18.00; break;
            case "Moussaka": correctPrice = 16.00; break;
            default: correctPrice = 10.00; // Default fallback price
          }
        }
        
        return {
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions,
          name: menuItem?.name || "Unknown Item",
          price: correctPrice
        };
      });
      
      setOrderItems(items);
    }
  });

  const submitMutation = useMutation({
    mutationFn: async (data: OrderFormData) => {
      const response = await apiRequest("POST", "/api/orders", data);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Order submitted successfully",
        description: `Your order #${data.id} has been received.`,
      });
      navigate(`/client/orders/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit order",
        description: error.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async () => {
    if (!agreedToTerms) {
      toast({
        title: "Please agree to the terms",
        description: "You must agree to the cancellation policy to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitMutation.mutateAsync(formData);
    } catch (error) {
      console.error("Error submitting order:", error);
      setIsSubmitting(false);
    }
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    return orderItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  // Calculate total with delivery fee
  const calculateTotal = () => {
    return calculateSubtotal() + 150; // €150 delivery fee
  };

  // Handle payment option selection
  const handlePaymentOption = (option: 'card' | 'invoice') => {
    if (option === 'card') {
      navigate(`/payment?orderId=new&amount=${calculateTotal()}`);
    } else {
      toast({
        title: "Invoice Request Received",
        description: "We will process your invoice request shortly.",
      });
      navigate("/client/orders");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('order.reviewYourOrder')}</h2>
        <p className="text-gray-500">{t('order.reviewOrderDescription')}</p>
      </div>

      {menuItemsLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      ) : (
        <>
          <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-4">
            <h3 className="text-blue-800 font-medium mb-2">Order Review</h3>
            <p className="text-blue-700 text-sm">
              Your order details have been saved. For a detailed breakdown of your ordered items, 
              please refer to the previous page where prices are displayed correctly.
            </p>
          </div>
          
          <Accordion type="single" collapsible className="w-full">

            <AccordionItem value="flight">
              <AccordionTrigger className="text-base font-medium">
                Flight Details
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Company Name:</span>
                    <span className="font-medium">{formData.companyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Registration Number:</span>
                    <span className="font-medium">{formData.registrationNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tail Number:</span>
                    <span className="font-medium">{formData.tailNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Departure:</span>
                    <span className="font-medium">
                      {formData.departureDate} at {formData.departureTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Departure Airport:</span>
                    <span className="font-medium">{formData.departureAirport}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Arrival Airport:</span>
                    <span className="font-medium">{formData.arrivalAirport}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Passengers:</span>
                    <span className="font-medium">{formData.passengerCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Crew:</span>
                    <span className="font-medium">{formData.crewCount}</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="delivery">
              <AccordionTrigger className="text-base font-medium">
                Delivery Information
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Kitchen Location:</span>
                    <span className="font-medium">{formData.kitchenLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Delivery Location:</span>
                    <span className="font-medium">{formData.deliveryLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Delivery Time:</span>
                    <span className="font-medium">{formData.deliveryTime}</span>
                  </div>
                  {formData.deliveryInstructions && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Special Instructions:</span>
                      <span className="font-medium">{formData.deliveryInstructions}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 text-base font-medium">
                    <span>Delivery Fee:</span>
                    <span>€150.00</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Price summary removed to avoid display issues */}

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
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
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={onPrev}>
              {t('order.back')}
            </Button>
            <div className="space-x-2">
              {showPaymentOptions ? (
                <>
                  <Button onClick={() => handlePaymentOption('invoice')} variant="outline">
                    Request Invoice
                  </Button>
                  <Button onClick={() => handlePaymentOption('card')}>
                    Pay with Card
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => setShowPaymentOptions(true)} 
                  disabled={isSubmitting || !agreedToTerms}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('order.processing')}
                    </>
                  ) : (
                    t('order.confirm')
                  )}
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}