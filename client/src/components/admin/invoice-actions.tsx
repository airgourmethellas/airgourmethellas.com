import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { FileText, Mail, Download, Printer } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface InvoiceActionsProps {
  orderId: number;
  disabled?: boolean;
}

export function InvoiceActions({ orderId, disabled = false }: InvoiceActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInvoiceAction = async (action: 'generate' | 'email' | 'download' | 'print') => {
    setIsLoading(true);
    
    try {
      if (action === 'generate' || action === 'email') {
        const response = await apiRequest('POST', '/api/invoices/request', {
          orderId,
          sendEmail: action === 'email'
        });
        
        const data = await response.json();
        
        toast({
          title: 'Success!',
          description: action === 'email' 
            ? 'Invoice has been sent to the client.' 
            : 'Invoice has been generated successfully.',
        });
        
        if (action === 'generate' && data.filePath) {
          window.open(`/api/invoices/download/${data.id}`, '_blank');
        }
      } else if (action === 'download') {
        window.open(`/api/invoices/download/${orderId}`, '_blank');
      } else if (action === 'print') {
        const printWindow = window.open(`/api/invoices/download/${orderId}`, '_blank');
        if (printWindow) {
          printWindow.addEventListener('load', () => {
            printWindow.print();
          });
        }
      }
    } catch (error) {
      console.error(`Error with invoice action (${action}):`, error);
      toast({
        title: 'Error',
        description: `Failed to ${action} invoice. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isLoading || disabled}>
          <FileText className="mr-2 h-4 w-4" />
          {isLoading ? 'Processing...' : 'Invoice Actions'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Invoice Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleInvoiceAction('generate')}>
          <FileText className="mr-2 h-4 w-4" />
          Generate Invoice
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleInvoiceAction('email')}>
          <Mail className="mr-2 h-4 w-4" />
          Email to Client
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleInvoiceAction('download')}>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleInvoiceAction('print')}>
          <Printer className="mr-2 h-4 w-4" />
          Print Invoice
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}