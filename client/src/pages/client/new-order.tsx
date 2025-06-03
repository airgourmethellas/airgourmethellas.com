import { useState } from "react";
import OrderProgress from "@/components/client/order-progress";
import FlightDetails from "@/components/client/order-form/flight-details";
import MenuSelection from "@/components/client/order-form/new-menu-selection";
import SpecialRequests from "@/components/client/order-form/special-requests";
import ReviewConfirm from "@/components/client/order-form/fixed-review-confirm";
import ReviewConfirmSimple from "@/components/client/order-form/review-confirm-simple";
import { useToast } from "@/hooks/use-toast";

// Define document type for better type safety
export type OrderDocument = File | string;
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { AircraftType, Airport } from "@shared/schema";
import { useLocation } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { ChatDialog } from "@/components/chat/chat-dialog";

// Define the steps for the order form
const STEPS = ["flight-details", "menu-selection", "special-requests", "review-confirm"];

export type OrderFormData = {
  aircraftType: string;  // Keeping for backward compatibility
  companyName?: string;  // New field for company name
  customerEmail?: string;  // New field for invoice delivery
  handlerCompany: string;
  registrationNumber?: string;  // New field for aircraft registration
  aircraftRegistration?: string;  // For PDF generation compatibility
  departureDate: string;
  departureTime: string;
  departureAirport: string;
  arrivalAirport: string;
  passengerCount: number;
  crewCount: number;
  dietaryRequirements: string[];
  specialNotes: string;
  deliveryLocation: string;
  deliveryTime: string;
  deliveryInstructions: string;
  documents: OrderDocument[];
  items: Array<{
    menuItemId: number;
    quantity: number;
    specialInstructions?: string;
    price: number;
  }>;
  totalPrice: number;
  kitchenLocation: string;
  cancellationPolicyAccepted: boolean;
  advanceNoticeConfirmation?: boolean; // Added for 24-hour advance notice confirmation
};

export default function NewOrder() {
  const [step, setStep] = useState<string>("flight-details");
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const { t } = useLanguage();
  const [formData, setFormData] = useState<OrderFormData>({
    aircraftType: "",
    companyName: "",
    handlerCompany: "",
    registrationNumber: "",
    departureDate: "",
    departureTime: "",
    departureAirport: "",
    arrivalAirport: "",
    passengerCount: 4,
    crewCount: 2,
    dietaryRequirements: ["regular"],
    specialNotes: "",
    deliveryLocation: "",
    deliveryTime: "",
    deliveryInstructions: "",
    documents: [],
    items: [],
    totalPrice: 0,
    kitchenLocation: "Thessaloniki",
    cancellationPolicyAccepted: false
  });
  const { toast } = useToast();
  const [location, navigate] = useLocation();

  // Fetch necessary data for the form
  const { data: aircraftTypes } = useQuery<AircraftType[]>({
    queryKey: ["/api/aircraft-types"],
  });

  const { data: airports } = useQuery<Airport[]>({
    queryKey: ["/api/airports"],
  });

  const handleNextStep = () => {
    const currentIndex = STEPS.indexOf(step);
    if (currentIndex < STEPS.length - 1) {
      setStep(STEPS[currentIndex + 1]);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevStep = () => {
    const currentIndex = STEPS.indexOf(step);
    if (currentIndex > 0) {
      setStep(STEPS[currentIndex - 1]);
      window.scrollTo(0, 0);
    }
  };

  const handleFormDataChange = (data: Partial<OrderFormData> | OrderFormData) => {
    setFormData(prev => ({
      ...prev,
      ...data
    }));
  };

  // Helper to determine which step component to render
  const renderStepComponent = () => {
    switch (step) {
      case "flight-details":
        return (
          <FlightDetails 
            formData={formData} 
            onFormDataChange={handleFormDataChange} 
            onNext={handleNextStep}
            aircraftTypes={aircraftTypes || []}
            airports={airports || []}
          />
        );
      case "menu-selection":
        return (
          <MenuSelection 
            formData={formData} 
            onFormDataChange={handleFormDataChange} 
            onPrev={handlePrevStep} 
            onNext={handleNextStep} 
          />
        );
      case "special-requests":
        return (
          <SpecialRequests 
            formData={formData} 
            onFormDataChange={handleFormDataChange} 
            onPrev={handlePrevStep} 
            onNext={handleNextStep} 
          />
        );
      case "review-confirm":
        return (
          <ReviewConfirmSimple 
            formData={formData} 
            onPrev={handlePrevStep}
            onFormDataChange={handleFormDataChange}
            onSuccess={() => {
              toast({ 
                title: "Order Submitted Successfully", 
                description: "Please complete the payment process." 
              });
              // Do not navigate away - stay on the payment page
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="md:grid md:grid-cols-3 md:gap-6">
      <div className="md:col-span-1">
        <div className="sticky top-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Order Details</h3>
          <p className="mt-1 text-sm text-gray-500">
            Provide the details of your flight for accurate catering and delivery.
          </p>
          
          {/* Order Progress */}
          <OrderProgress currentStep={step} />

          {/* Certification */}
          <div className="mt-6 bg-blue-50 shadow rounded-lg p-4 border border-blue-200">
            <h4 className="text-sm font-medium text-blue-900 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Certified Provider
            </h4>
            <p className="mt-2 text-xs text-blue-800 font-medium leading-relaxed">
              Our company is certified from the Greek Civil Aviation Authorities as a REGULATED SUPPLIER OF IN FLIGHT SERVICES
            </p>
          </div>

          {/* Quick Help */}
          <div className="mt-6 bg-blue-50 shadow rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Need Help?
            </h4>
            <p className="mt-2 text-xs text-blue-800">
              For immediate assistance, contact our operations team.
            </p>
            <Button 
              variant="outline" 
              className="mt-3 w-full text-blue-900 bg-blue-100 hover:bg-blue-200 border-blue-200"
              onClick={() => setChatDialogOpen(true)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {t('chat.chatWithOperations')}
            </Button>
            
            <ChatDialog
              open={chatDialogOpen}
              onOpenChange={setChatDialogOpen}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 md:mt-0 md:col-span-2">
        <Card>
          <CardContent className="pt-6">
            {renderStepComponent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
