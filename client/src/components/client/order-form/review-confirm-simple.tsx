import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { OrderFormData } from "@/pages/client/new-order";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Check, AlertTriangle, FileDown } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useQuery } from "@tanstack/react-query";
import { MenuItem } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import DirectPayment from "@/components/ui/direct-payment";
import { useToast } from "@/hooks/use-toast";
import { generateInvoicePDF } from "@/utils/pdf-invoice-generator";
import { useLocation } from "wouter";

interface ReviewConfirmProps {
  formData: OrderFormData;
  onPrev: () => void;
  onSuccess: () => void;
  onFormDataChange: (formData: OrderFormData) => void;
}

export default function ReviewConfirmSimple({
  formData,
  onPrev,
  onSuccess,
  onFormDataChange,
}: ReviewConfirmProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  // Get menu items to display names
  const { data: menuItems } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu-items"],
  });

  const [submittedOrderId, setSubmittedOrderId] = useState<number | null>(null);
  // Always show payment options after order submission
  const [showPayment, setShowPayment] = useState(true);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Handle PDF invoice generation
  const handleGeneratePDF = async () => {
    if (!menuItems) {
      toast({
        title: "Please wait",
        description: "Menu data is still loading. Please try again in a moment.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsGeneratingPDF(true);
      
      generateInvoicePDF({
        formData,
        menuItems,
        orderNumber: `ORD-${Date.now()}`
      });
      
      toast({
        title: "Invoice Generated",
        description: "Your PDF invoice has been downloaded successfully.",
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "PDF Generation Failed",
        description: "There was an error generating your invoice. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  console.log("[ReviewConfirm] Starting price calculation for order items:", formData.items);
  
  // Calculate subtotal directly from the order items
  // Prices are stored in cents in the database
  const subtotalInCents = formData.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  
  console.log(`[ReviewConfirm] Calculated subtotal: ${subtotalInCents} cents`);
  
  // Add delivery fee (€150 for both locations)
  const deliveryFeeInCents = 15000; // €150 for both locations
  
  // Calculate total in cents
  const totalAmountInCents = subtotalInCents + deliveryFeeInCents;
  
  // Convert to euros for display
  const subtotal = subtotalInCents / 100;
  const deliveryFee = deliveryFeeInCents / 100;
  const totalBeforeVAT = totalAmountInCents / 100;
  
  // Calculate VAT (13% in Greece)
  const vatAmount = totalBeforeVAT * 0.13;
  const totalAmountWithVAT = totalBeforeVAT + vatAmount;
  
  console.log(`[ReviewConfirm] Subtotal: €${subtotal.toFixed(2)}, Delivery Fee: €${deliveryFee.toFixed(2)}, Total before VAT: €${totalBeforeVAT.toFixed(2)}, VAT: €${vatAmount.toFixed(2)}, Final Total: €${totalAmountWithVAT.toFixed(2)}`);

  // Format price with Euro symbol
  const formatPrice = (amount: number) => {
    return `€${amount.toFixed(2)}`;
  };

  // Log price data for debugging
  console.log("Calculated subtotal:", subtotal);
  console.log("Delivery fee:", deliveryFee);
  console.log("Total amount with VAT:", totalAmountWithVAT);

  // Get menu item name by ID
  const getMenuItemName = (id: number) => {
    if (!menuItems) return "Loading...";
    const item = menuItems.find((item) => item.id === id);
    return item?.name || "Unknown Item";
  };

  // Submit order
  const submitMutation = useMutation({
    mutationFn: async (data: OrderFormData) => {
      setIsSubmitting(true);
      console.log("[FRONTEND] Starting order submission with data:", data);
      console.log("[FRONTEND] Total price being sent:", totalAmountWithVAT);
      
      try {
        const orderData = {
          ...data,
          totalPrice: totalAmountWithVAT
        };
        
        console.log("[FRONTEND] Sending POST request to /api/orders with data:", orderData);
        
        const res = await apiRequest("POST", "/api/orders", orderData);
        
        console.log("[FRONTEND] Response status:", res.status);
        console.log("[FRONTEND] Response headers:", Object.fromEntries(res.headers.entries()));
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error("[FRONTEND] Server error response:", errorText);
          throw new Error(`Server error: ${res.status} - ${errorText}`);
        }
        
        const result = await res.json();
        console.log("[FRONTEND] Order submitted successfully, server response:", result);
        return result;
      } catch (error) {
        console.error("[FRONTEND] Order submission failed:", error);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: (data) => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setSubmittedOrderId(data.id);
      
      console.log("Order submitted successfully, ID:", data.id);
      setShowPayment(true);
    },
    onError: (error: any) => {
      setIsSubmitting(false);
      console.error("Error submitting order:", error);
      
      toast({
        title: "Order Submission Failed",
        description: error.message || "There was an error submitting your order. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = () => {
    if (!formData.cancellationPolicyAccepted) {
      toast({
        title: "Cancellation Policy Required",
        description: "You must accept the cancellation policy before submitting your order.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.items || formData.items.length === 0) {
      toast({
        title: "Menu Items Required",
        description: "You must select at least one menu item before submitting your order.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      submitMutation.mutate(formData);
    } catch (error) {
      console.error("Error in submit handler:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {isSubmitted ? (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <div className="mb-5 flex items-center">
              <Check className="mr-2 h-6 w-6 text-green-500" />
              <h2 className="text-xl font-semibold">
                Order Submitted Successfully
              </h2>
            </div>
            
            <p className="mb-4">
              Your order has been submitted successfully with ID: <strong>{submittedOrderId}</strong>.
              Please proceed with payment.
            </p>
            
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-4">Payment Information</h3>
              
              <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium mb-2">Order Summary</h4>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 text-sm">
                    <span>Order ID:</span>
                    <span className="font-medium">{submittedOrderId}</span>
                  </div>
                  <div className="grid grid-cols-2 text-sm">
                    <span>Flight Details:</span>
                    <span className="font-medium">{formData.aircraftType}, {formData.handlerCompany}</span>
                  </div>
                  <div className="grid grid-cols-2 text-sm">
                    <span>Departure:</span>
                    <span className="font-medium">{formData.departureDate}, {formData.departureTime} from {formData.departureAirport}</span>
                  </div>
                  <div className="grid grid-cols-2 text-sm">
                    <span>Delivery Location:</span>
                    <span className="font-medium">{formData.deliveryLocation}</span>
                  </div>
                  <div className="grid grid-cols-2 text-sm">
                    <span>Total Amount (incl. VAT):</span>
                    <span className="font-medium">{formatPrice(totalAmountWithVAT)}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Select Payment Method</h4>
                
                <div className="grid gap-4">
                  <div className="border border-blue-500 bg-blue-50 rounded-lg p-4 flex items-center">
                    <div className="flex-1">
                      <h5 className="font-medium">Credit Card Payment</h5>
                      <p className="text-sm text-gray-600">Pay securely with your credit or debit card</p>
                    </div>
                    <Button 
                      onClick={() => {
                        // Prevent multiple clicks
                        if (paymentProcessing) return;
                        
                        setPaymentProcessing(true);
                        console.log("Initiating card payment for order:", submittedOrderId);
                        
                        // Pass the amount with VAT in euros to the payment page (not cents)
                        // The payment page will handle the conversion to cents for Stripe
                        console.log("Passing total amount with VAT to payment page:", totalAmountWithVAT, "euros");
                        const paymentUrl = `/payment?orderId=${submittedOrderId}&amount=${totalAmountWithVAT}`;
                        
                        // Navigate to the payment page
                        window.location.href = paymentUrl;
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Pay with Card
                    </Button>
                  </div>
                  

                  
                  <div className="border border-green-300 bg-green-50 rounded-lg p-4 flex items-center">
                    <div className="flex-1">
                      <h5 className="font-medium">Download PDF Invoice</h5>
                      <p className="text-sm text-gray-600">Generate and download your invoice as a PDF document</p>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={handleGeneratePDF}
                      disabled={isGeneratingPDF || !menuItems}
                      className="border-green-600 text-green-700 hover:bg-green-100"
                    >
                      {isGeneratingPDF ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FileDown className="mr-2 h-4 w-4" />
                          Download PDF
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <Accordion type="single" collapsible className="w-full">
            {/* Order items section removed to fix price display issues */}
            <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-4">
              <h3 className="text-blue-800 font-medium mb-2">Order Details Ready for Review</h3>
              <p className="text-blue-700 text-sm">
                Your order details have been reviewed and prepared for submission. The itemized order 
                breakdown with correct prices can be viewed on the previous page.
              </p>
              <p className="text-blue-700 text-sm mt-2">
                Please review the flight details below and confirm your acceptance of our policies.
              </p>
            </div>
          </Accordion>

          <div className="border border-gray-200 rounded-lg p-4 mt-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold mb-2">Advanced Notice & Cancellation Policy</h3>
                <p className="text-sm text-gray-700 font-medium mb-3">
                  IMPORTANT: I am confirming that I am placing this order 24 hrs in advance, unless specifically confirmed by AirGourmet via email.
                </p>
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
              disabled={isSubmitting || !formData.cancellationPolicyAccepted}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('order.submitting')}
                </>
              ) : (
                "Place Order and Proceed to Payment"
              )}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}