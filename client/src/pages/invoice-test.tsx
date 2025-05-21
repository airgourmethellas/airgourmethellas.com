import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InvoiceButton } from '@/components/ui/invoice-button';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export default function InvoiceTest() {
  const [orderId, setOrderId] = useState('');
  const { toast } = useToast();

  // Test invoice generation directly
  const testInvoiceMutation = useMutation({
    mutationFn: async () => {
      if (!orderId) {
        throw new Error('Please enter an order ID');
      }
      
      const id = parseInt(orderId);
      if (isNaN(id)) {
        throw new Error('Order ID must be a number');
      }
      
      const res = await apiRequest('POST', '/api/invoices/request', {
        orderId: id,
        sendEmail: false
      });
      
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Success!',
        description: 'Invoice generated successfully. Path: ' + data.filePath,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error generating invoice',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Invoice Generator Test</CardTitle>
          <CardDescription>Test the invoice generation functionality</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="orderId">Order ID</Label>
            <Input 
              id="orderId" 
              placeholder="Enter order ID" 
              value={orderId} 
              onChange={(e) => setOrderId(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-medium">Test Direct API Call</h3>
            <Button 
              onClick={() => testInvoiceMutation.mutate()}
              disabled={testInvoiceMutation.isPending}
            >
              {testInvoiceMutation.isPending ? 'Generating...' : 'Generate Invoice (Direct API)'}
            </Button>
            
            <h3 className="text-lg font-medium mt-4">Test Invoice Component</h3>
            {orderId ? (
              <InvoiceButton orderId={parseInt(orderId)} />
            ) : (
              <p className="text-muted-foreground text-sm">Enter an order ID to test the component</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}