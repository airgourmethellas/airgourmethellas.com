import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { PageTitle } from "@/components/ui/page-title";
import { smartFormatPrice } from "@/utils/robust-price-formatter";

export default function PaymentSuccess() {
  const [location, setLocation] = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const { t } = useLanguage();
  
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const paymentIntentId = searchParams.get("payment_intent");
    const redirectStatus = searchParams.get("redirect_status");
    
    console.log("Payment success page loaded with:", { paymentIntentId, redirectStatus });
    
    if (!paymentIntentId) {
      setIsVerifying(false);
      setPaymentSuccess(false);
      setErrorMessage("Missing payment information");
      return;
    }
    
    // Verify the payment status
    const verifyPayment = async () => {
      try {
        // Simple direct fetch to verify payment
        const response = await fetch(`/api/payments/verify/${paymentIntentId}`, {
          credentials: "include"
        });
        
        if (!response.ok) {
          throw new Error(`Verification failed with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Payment verification result:", data);
        
        setPaymentInfo(data);
        setPaymentSuccess(data.status === "succeeded");
        
        if (data.status !== "succeeded") {
          setErrorMessage(`Payment status: ${data.status}`);
        }
      } catch (err: any) {
        console.error("Error verifying payment:", err);
        setPaymentSuccess(false);
        setErrorMessage(err.message || "Failed to verify payment status");
      } finally {
        setIsVerifying(false);
      }
    };
    
    verifyPayment();
  }, []);
  
  const handleReturnToOrders = () => {
    setLocation("/client/orders");
  };
  
  const handleReturnHome = () => {
    setLocation("/");
  };
  
  // Loading state
  if (isVerifying) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle>{t("payment.verifying")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-6">
            <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
            <p className="text-center text-muted-foreground">{t("payment.processingMessage")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Success state
  if (paymentSuccess) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
        <PageTitle title={t("payment.successTitle")} subtitle={t("payment.successSubtitle")} />
        
        <Card className="w-full max-w-md shadow-lg mt-8 border-green-100">
          <CardHeader className="text-center bg-green-50 border-b border-green-100">
            <div className="mx-auto rounded-full bg-green-100 w-16 h-16 flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-green-700">{t("payment.paymentSuccessful")}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {paymentInfo && (
              <div className="mb-6 p-4 bg-slate-50 rounded-md text-sm">
                <h3 className="font-medium mb-2">{t("payment.paymentDetails")}</h3>
                <div className="space-y-1">
                  <p><span className="font-medium">{t("payment.amount")}:</span> {smartFormatPrice(paymentInfo.amount)}</p>
                  <p><span className="font-medium">{t("payment.transactionId")}:</span> {paymentInfo.id}</p>
                  {paymentInfo.metadata?.orderNumber && (
                    <p><span className="font-medium">{t("payment.orderNumber")}:</span> {paymentInfo.metadata.orderNumber}</p>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex flex-col space-y-3">
              <Button onClick={handleReturnToOrders} className="w-full">
                {t("payment.viewOrders")}
              </Button>
              <Button onClick={handleReturnHome} variant="outline" className="w-full">
                {t("payment.returnHome")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Error state
  return (
    <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
      <PageTitle title={t("payment.problemTitle")} subtitle={t("payment.problemSubtitle")} />
      
      <Card className="w-full max-w-md shadow-lg mt-8 border-red-100">
        <CardHeader className="text-center bg-red-50 border-b border-red-100">
          <div className="mx-auto rounded-full bg-red-100 w-16 h-16 flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-red-700">{t("payment.paymentIssue")}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 rounded-md text-sm border border-red-100">
              <p className="text-red-700">{errorMessage}</p>
            </div>
          )}
          
          <div className="flex flex-col space-y-3">
            <Button onClick={handleReturnToOrders} className="w-full">
              {t("payment.checkOrderStatus")}
            </Button>
            <Button onClick={handleReturnHome} variant="outline" className="w-full">
              {t("payment.returnHome")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}