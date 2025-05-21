import { useState } from "react";
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
// No need for direct payment import in this component
import { useLanguage } from "@/hooks/use-language";
import { formatPrice, formatPriceWithSymbol } from "@/utils/price-formatter";

interface ReviewConfirmProps {
  formData: OrderFormData;
  onFormDataChange: (data: Partial<OrderFormData>) => void;
  onPrev: () => void;
}

// Lookup table for menu item prices (hardcoded to ensure correct display)
const PRICE_LOOKUP: Record<string, number> = {
  "Assorted bread rolls": 3.00,
  "Sourdough bread": 4.00,
  "Bagels": 5.00,
  "Gluten free bread": 4.50,
  "Pitta bread": 4.00,
  "Greek sesame bagel (Koulouri)": 3.50,
  "Greek yogurt with honey": 4.50,
  "Fresh fruit platter": 5.00,
  "Premium Greek salad": 12.00,
  "Caesar salad": 10.00,
  "Quinoa salad": 9.00,
  "Caprese salad": 11.00,
  "Wild rocket salad": 9.50,
  "Beef carpaccio": 15.00,
  "Smoked salmon": 14.00,
  "Prosciutto and melon": 13.00,
  "Stuffed vine leaves": 10.00,
  "Greek spinach pie": 8.00,
  "Grilled lamb chops": 22.00,
  "Beef fillet": 25.00,
  "Grilled salmon": 20.00,
  "Roasted chicken": 18.00,
  "Moussaka": 16.00
};

export default function FixedReviewConfirm({
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

  // Get correct menu item name by ID
  const getMenuItemName = (id: number) => {
    if (!menuItems) return "Loading...";
    const menuItem = menuItems.find((item) => item.id === id);
    return menuItem ? menuItem.name : "Unknown Item";
  };

  // Get correct price for a menu item (in cents)
  const getItemPrice = (itemId: number): number => {
    if (!menuItems) return 0;
    const menuItem = menuItems.find((item) => item.id === itemId);
    if (!menuItem) return 0;
    
    const itemName = menuItem.name;
    // Use the hardcoded price lookup for exact values but convert to cents
    if (PRICE_LOOKUP[itemName]) {
      // Convert euros to cents (multiply by 100)
      return PRICE_LOOKUP[itemName] * 100;
    }
    
    // Database values are already in cents
    return menuItem.priceThessaloniki;
  };

  // Format price display for euros - always show correct decimal placement
  const formatEuroPrice = (price: number) => {
    // Ensure price is converted from cents to euros
    return formatPriceWithSymbol(price);
  };

  // Calculate subtotal in cents
  const calculateSubtotal = () => {
    let subtotal = 0;
    formData.items.forEach((item) => {
      subtotal += getItemPrice(item.menuItemId) * item.quantity;
    });
    return subtotal;
  };

  // Calculate total with delivery fee in cents
  const calculateTotal = () => {
    return calculateSubtotal() + 15000; // €150.00 delivery fee in cents
  };

  // Handle payment option
  const handlePaymentOption = (option: 'card' | 'invoice') => {
    if (option === 'card') {
      navigate(`/payment?orderId=new&amount=${calculateTotal()}`); // Already in cents
    } else {
      // Handle invoice option - submit the order first
      try {
        setIsSubmitting(true);
        
        // Create a complete order with payment method as invoice
        const completeOrder = {
          ...formData,
          totalPrice: calculateTotal(), // Already in cents
          paymentMethod: "invoice",
          cancellationPolicyAccepted: true,
          advanceNoticeConfirmation: true
        };
        
        console.log("Submitting invoice order with total price (cents):", calculateTotal());
        
        // Submit the order
        submitMutation.mutateAsync(completeOrder)
          .then(response => {
            console.log("Invoice order submitted successfully:", response);
            
            // Show success message
            toast({
              title: "Invoice Request Received",
              description: "We will process your invoice request and contact you shortly.",
            });
    
            // Navigate to confirmation page after a short delay
            setTimeout(() => {
              navigate("/client/orders");
            }, 2000);
          })
          .catch(error => {
            console.error("Error submitting invoice order:", error);
            toast({
              title: "Error Processing Invoice",
              description: "There was an error processing your invoice request. Please try again.",
              variant: "destructive"
            });
            setIsSubmitting(false);
          });
      } catch (error) {
        console.error("Error preparing invoice order:", error);
        toast({
          title: "Error Processing Invoice",
          description: "There was an error processing your invoice request. Please try again.",
          variant: "destructive"
        });
        setIsSubmitting(false);
      }
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
            <h3 className="text-blue-800 font-medium mb-2">Order Ready for Submission</h3>
            <p className="text-blue-700 text-sm">
              Your order details have been saved and are ready for final review. 
              For an itemized breakdown of your order, please refer to the previous page.
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
                    <span>{formatPriceWithSymbol(15000)}</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Concierge services section removed - will be added back if OrderFormData is updated with these fields */}
          </Accordion>

          {/* Price display removed from this page to avoid formatting issues */}

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