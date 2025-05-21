import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { FileText } from 'lucide-react';

interface InvoiceButtonProps {
  orderId: number;
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showIcon?: boolean;
  label?: string;
  sendEmail?: boolean;
  disabled?: boolean;
}

export function InvoiceButton({ 
  orderId, 
  variant = "default", 
  size = "default", 
  className = "",
  showIcon = true,
  label = "Request Invoice",
  sendEmail = false,
  disabled = false
}: InvoiceButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleClick = async () => {
    setIsLoading(true);
    
    try {
      const response = await apiRequest('POST', '/api/invoices/request', {
        orderId,
        sendEmail
      });
      
      const data = await response.json();
      
      toast({
        title: 'Success!',
        description: sendEmail 
          ? 'Invoice has been sent to your email.' 
          : 'Invoice has been generated successfully.',
      });
      
      // If not sending via email, open the PDF in a new tab
      if (!sendEmail && data.filePath) {
        // Convert the server path to a URL
        const pdfUrl = `/api/invoices/download/${data.id}`;
        window.open(pdfUrl, '_blank');
      }
    } catch (error) {
      console.error('Error requesting invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate invoice. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleClick}
      disabled={isLoading || disabled}
    >
      {isLoading ? 'Processing...' : (
        <>
          {showIcon && <FileText className="mr-2 h-4 w-4" />}
          {label}
        </>
      )}
    </Button>
  );
}