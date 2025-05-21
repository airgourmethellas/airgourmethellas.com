import { Card, CardContent } from "@/components/ui/card";

interface OrderProgressProps {
  currentStep: string;
}

export default function OrderProgress({ currentStep }: OrderProgressProps) {
  const steps = [
    { id: "flight-details", label: "Flight Details" },
    { id: "menu-selection", label: "Menu Selection" },
    { id: "special-requests", label: "Special Requests" },
    { id: "review-confirm", label: "Review & Confirm" },
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };

  return (
    <div className="mt-6">
      <Card>
        <CardContent className="p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Order Progress</h4>
          <ol className="relative border-l border-gray-200">
            {steps.map((step, index) => {
              const currentIndex = getCurrentStepIndex();
              const isActive = index === currentIndex;
              const isCompleted = index < currentIndex;
              
              return (
                <li key={step.id} className="mb-6 ml-4 last:mb-0">
                  <div 
                    className={`absolute w-3 h-3 rounded-full mt-1.5 -left-1.5 ${
                      isActive 
                        ? "bg-primary-600" 
                        : isCompleted 
                          ? "bg-green-500" 
                          : "bg-gray-200"
                    }`}
                  />
                  <p 
                    className={`text-sm ${
                      isActive 
                        ? "font-medium text-primary-600" 
                        : isCompleted 
                          ? "font-medium text-green-600" 
                          : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </p>
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
