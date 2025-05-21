import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { OrderFormData } from "@/pages/client/new-order";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Check } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
import { MenuItem } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

interface ReviewConfirmProps {
  formData: OrderFormData;
  onFormDataChange: (data: Partial<OrderFormData>) => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function UnifiedPricingReview({
  formData,
  onFormDataChange,
  onPrev,
  onNext,
}: ReviewConfirmProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  
  // Get menu items to display names
  const { data: menuItems, isLoading: menuItemsLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu-items"],
  });

  // Function to get menu item name by ID
  const getMenuItemName = (menuItemId: number): string => {
    if (!menuItems) return "Loading...";
    const item = menuItems.find((item) => item.id === menuItemId);
    return item?.name || `Item #${menuItemId}`;
  };

  // CRITICAL FIX: Use CONSISTENT location-based pricing
  // This ensures the same prices are used throughout the order flow
  const getMenuItemPrice = (menuItemId: number): number => {
    if (!menuItems) return 0;
    
    const menuItem = menuItems.find(item => item.id === menuItemId);
    if (!menuItem) return 0;
    
    // IMPORTANT: Use the same location-based pricing that was set during menu selection
    // The formData.kitchenLocation determines which prices to use
    const kitchenLocation = formData.kitchenLocation || "Thessaloniki";
    
    // Get the location-specific price
    const price = kitchenLocation === "Thessaloniki" 
      ? menuItem.priceThessaloniki 
      : menuItem.priceMykonos;
      
    console.log(`[UnifiedPricingReview] Item ${menuItem.name} price from ${kitchenLocation}: ${price} cents`);
    
    return price;
  };

  // Function to format price with euro symbol
  const formatPrice = (cents: number): string => {
    return `€${(cents / 100).toFixed(2)}`;
  };

  // For each order item, use the correct location-based price
  const orderItemsWithCorrectPrices = formData.items.map(item => {
    // If the item already has a price from a previous step, use it for consistency
    // Otherwise, get the correct location-based price
    const price = item.price || getMenuItemPrice(item.menuItemId);
    
    return {
      ...item,
      price
    };
  });

  // Calculate subtotal in cents using consistent prices
  const subtotalInCents = orderItemsWithCorrectPrices.reduce(
    (total, item) => total + (item.price * item.quantity), 
    0
  );
  
  // Get delivery fee based on location
  const deliveryFeeInCents = formData.kitchenLocation === "Mykonos" ? 15000 : 10000; // €150 or €100
  
  // Calculate total amount in cents
  const totalAmountInCents = subtotalInCents + deliveryFeeInCents;
  
  // Log pricing details for verification
  console.log(`[UnifiedPricingReview] Kitchen location: ${formData.kitchenLocation}`);
  console.log(`[UnifiedPricingReview] Subtotal: ${formatPrice(subtotalInCents)}`);
  console.log(`[UnifiedPricingReview] Delivery fee: ${formatPrice(deliveryFeeInCents)}`);
  console.log(`[UnifiedPricingReview] Total: ${formatPrice(totalAmountInCents)}`);

  const handleSubmit = () => {
    if (!formData.cancellationPolicyAccepted) {
      toast({
        title: "Terms Not Accepted",
        description: "Please accept the cancellation policy before proceeding.",
        variant: "destructive",
      });
      return;
    }
    
    // Update formData with consistent pricing before proceeding
    onFormDataChange({
      items: orderItemsWithCorrectPrices,
      totalPrice: totalAmountInCents
    });
    
    onNext();
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
          <Card className="mt-6">
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Selected Menu Items</h3>
              
              <div className="space-y-4">
                {orderItemsWithCorrectPrices.map((item, index) => (
                  <div key={index} className="flex justify-between items-center pb-3 border-b border-gray-100 last:border-b-0 last:pb-0">
                    <div>
                      <p className="font-medium">{getMenuItemName(item.menuItemId)}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      {item.specialInstructions && (
                        <p className="text-xs text-gray-500 mt-1">
                          Note: {item.specialInstructions}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(item.price)}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} × {formatPrice(item.price / item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
                
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatPrice(subtotalInCents)}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span>Delivery Fee:</span>
                    <span>{formatPrice(deliveryFeeInCents)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-base mt-3">
                    <span>Total:</span>
                    <span>{formatPrice(totalAmountInCents)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="border border-gray-200 rounded-lg p-4 mt-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold mb-2">Cancellation Policy</h3>
                <p className="text-sm text-gray-700 mb-2">The following cancellation fees apply:</p>
                <ul className="text-sm text-gray-700 list-disc list-inside space-y-1 mb-3">
                  <li>24 hours or more before delivery time: 0% fee</li>
                  <li>Between 23-12 hours: 25% fee</li>
                  <li>Between 12-6 hours: 50% fee</li>
                  <li>Less than 6 hours: 100% fee</li>
                </ul>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="cancellation-policy"
                  checked={formData.cancellationPolicyAccepted}
                  onCheckedChange={(checked) => {
                    onFormDataChange({
                      ...formData,
                      cancellationPolicyAccepted: checked as boolean,
                    });
                  }}
                />
                <Label
                  htmlFor="cancellation-policy"
                  className="text-sm font-medium text-gray-700"
                >
                  I acknowledge and accept the cancellation policy
                </Label>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Button 
              variant="outline" 
              onClick={onPrev}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Proceed to Checkout'
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}