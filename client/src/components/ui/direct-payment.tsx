import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CreditCard, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
// Import our new robust price formatter
import { smartFormatPrice } from '@/utils/robust-price-formatter';

interface DirectPaymentProps {
  orderId: number;
  amount: number;
  onSuccess: () => void;
  onError: (message: string) => void;
  onCancel?: () => void;
}

const DirectPayment: React.FC<DirectPaymentProps> = ({
  orderId,
  amount,
  onSuccess,
  onError,
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();

  // Format card number as user types
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const formattedValue = value
      .replace(/(.{4})/g, '$1 ')
      .trim()
      .substring(0, 19);
    setCardNumber(formattedValue);
  };

  // Format expiry date as MM/YY
  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    
    if (value.length <= 2) {
      setExpiryDate(value);
    } else {
      setExpiryDate(`${value.substring(0, 2)}/${value.substring(2, 4)}`);
    }
  };

  // Process payment when form is submitted
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!cardNumber || !expiryDate || !cvc || !cardholderName) {
      toast({
        title: "Incomplete Form",
        description: "Please fill out all payment details",
        variant: "destructive",
      });
      return;
    }

    if (cardNumber.replace(/\s/g, '').length !== 16) {
      toast({
        title: "Invalid Card Number",
        description: "Please enter a valid 16-digit card number",
        variant: "destructive",
      });
      return;
    }

    if (cvc.length < 3) {
      toast({
        title: "Invalid CVC",
        description: "Please enter a valid CVC code",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Send payment info to server
      const response = await fetch(`/api/orders/${orderId}/process-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          // Don't send full card details in a real application
          // This is just for demonstration
          payment: {
            last4: cardNumber.replace(/\s/g, '').slice(-4),
            brand: getCardBrand(cardNumber),
          },
        }),
        credentials: 'include',
      });

      // Simulate payment processing with a delay
      setTimeout(() => {
        if (response.ok) {
          setIsComplete(true);
          onSuccess();
        } else {
          setIsProcessing(false);
          onError("Payment processing failed. Please try again.");
        }
      }, 2000);
    } catch (error) {
      console.error('Payment error:', error);
      setIsProcessing(false);
      onError("An unexpected error occurred. Please try again.");
    }
  };

  // Determine card brand based on first digits
  const getCardBrand = (number: string): string => {
    const cleanNumber = number.replace(/\s/g, '');
    
    if (/^4/.test(cleanNumber)) return 'Visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'Mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'American Express';
    if (/^6(?:011|5)/.test(cleanNumber)) return 'Discover';
    return 'Unknown';
  };

  // Disabled state for the submit button
  const isFormValid = 
    cardNumber.replace(/\s/g, '').length === 16 && 
    expiryDate.length === 5 && 
    cvc.length >= 3 && 
    cardholderName.length > 0;

  if (isComplete) {
    return (
      <Card className="border-green-200 bg-green-50 max-w-md mx-auto">
        <CardContent className="pt-6 flex flex-col items-center text-center">
          <Check className="w-12 h-12 text-green-600 mb-4" />
          <h3 className="text-xl font-medium mb-2">Payment Successful</h3>
          <p className="text-gray-600 mb-2">
            Thank you for your payment of {smartFormatPrice(amount)}
          </p>
          <p className="text-sm text-gray-500">
            A receipt has been sent to your email
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <Label htmlFor="cardholderName">Cardholder Name</Label>
            <Input
              id="cardholderName"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              placeholder="Name on card"
              disabled={isProcessing}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="cardNumber">Card Number</Label>
            <div className="relative">
              <Input
                id="cardNumber"
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                disabled={isProcessing}
                required
              />
              <CreditCard className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                value={expiryDate}
                onChange={handleExpiryDateChange}
                placeholder="MM/YY"
                maxLength={5}
                disabled={isProcessing}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="cvc">CVC</Label>
              <Input
                id="cvc"
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substring(0, 4))}
                placeholder="123"
                maxLength={4}
                disabled={isProcessing}
                required
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isProcessing || !isFormValid}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Processing...
              </>
            ) : (
              `Pay ${smartFormatPrice(amount)}`
            )}
          </Button>
          
          <p className="text-xs text-center text-gray-500 mt-4">
            Your payment information is secure. We use encryption to protect your data.
          </p>
        </div>
      </form>
    </div>
  );
};

export default DirectPayment;