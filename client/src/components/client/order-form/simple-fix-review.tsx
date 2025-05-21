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
import { useLanguage } from "@/hooks/use-language";

interface ReviewConfirmProps {
  formData: OrderFormData;
  onFormDataChange: (data: Partial<OrderFormData>) => void;
  onPrev: () => void;
}

export default function SimpleFixReview({
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
    queryKey: ["/api/menu-items"]
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

  // Get menu item name by ID
  const getMenuItemName = (id: number): string => {
    if (!menuItems) return "Loading...";
    const menuItem = menuItems.find((item) => item.id === id);
    return menuItem ? menuItem.name : "Unknown Item";
  };

  // Get the proper price in euros for a menu item
  const getItemPrice = (menuItemId: number): number => {
    if (!menuItems) return 0;
    const menuItem = menuItems.find(item => item.id === menuItemId);
    if (!menuItem) return 0;
    
    // Price is stored in cents, convert to euros
    const priceInCents = formData.kitchenLocation === "Thessaloniki" 
      ? menuItem.priceThessaloniki 
      : menuItem.priceMykonos;
    
    // Here's the key fix - we divide by 100 to convert cents to euros
    return priceInCents / 100;
  };

  // Calculate subtotal
  const calculateSubtotal = (): number => {
    return formData.items.reduce((total, item) => {
      const itemPrice = getItemPrice(item.menuItemId);
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  // Calculate total with delivery fee
  const calculateTotal = (): number => {
    return calculateSubtotal() + 150.00; // €150 delivery fee
  };

  // Format price with euro symbol and 2 decimal places
  const formatPrice = (price: number): string => {
    return `€${price.toFixed(2)}`;
  };

  // Handle payment option selection
  const handlePaymentOption = (option: 'card' | 'invoice') => {
    if (option === 'card') {
      // Convert back to cents for the payment system
      const amountInCents = Math.round(calculateTotal() * 100);
      navigate(`/payment?orderId=new&amount=${amountInCents}`);
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
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="items">
              <AccordionTrigger className="text-base font-medium">
                Order Items
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {formData.items?.map((item, index) => {
                    const itemName = getMenuItemName(item.menuItemId);
                    const itemPrice = getItemPrice(item.menuItemId);
                    
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{itemName}</span>
                          <span className="text-sm text-gray-500">
                            {item.quantity} x {formatPrice(itemPrice)}
                          </span>
                          {item.specialInstructions && (
                            <span className="text-xs text-gray-500 mt-1">
                              Note: {item.specialInstructions}
                            </span>
                          )}
                        </div>
                        <span className="font-medium">
                          {formatPrice(itemPrice * item.quantity)}
                        </span>
                      </div>
                    );
                  })}

                  <div className="flex justify-between pt-2 border-t border-gray-200 font-medium">
                    <span>Subtotal</span>
                    <span>{formatPrice(calculateSubtotal())}</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

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
                    <span>{formatPrice(150.00)}</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="bg-gray-50 rounded-lg p-4 mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-base font-medium">Subtotal:</span>
              <span className="text-base font-medium">{formatPrice(calculateSubtotal())}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-base font-medium">Delivery Fee:</span>
              <span className="text-base font-medium">{formatPrice(150.00)}</span>
            </div>
            <div className="flex justify-between items-center text-lg font-semibold border-t border-gray-200 pt-2 mt-2">
              <span>Total:</span>
              <span>{formatPrice(calculateTotal())}</span>
            </div>
          </div>

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