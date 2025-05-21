import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { formatCentsAsCurrency } from '@/utils/format-currency';
import { InvoiceActions } from '@/components/admin/invoice-actions';

export default function AdminOrderDetail() {
  const { id } = useParams();
  const parsedId = id ? parseInt(id) : 0;

  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: ['/api/orders', parsedId],
    enabled: !!parsedId,
  });

  const { data: orderItems, isLoading: itemsLoading } = useQuery({
    queryKey: ['/api/order-items', parsedId],
    enabled: !!parsedId,
  });

  const isLoading = orderLoading || itemsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <Link href="/admin/orders">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
          </Button>
        </Link>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Order not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'confirmed': 'bg-blue-100 text-blue-800 border-blue-200',
      'in-progress': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'ready': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'delivered': 'bg-green-100 text-green-800 border-green-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200',
    };
    
    return variants[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Order #{order.orderNumber}</h2>
          <p className="text-muted-foreground">
            Manage order details and generate invoices
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Link href="/admin/orders">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
            </Button>
          </Link>
          <InvoiceActions orderId={parsedId} />
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl">Order Summary</CardTitle>
          <Badge className={getStatusBadge(order.status)}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Flight Information */}
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-muted-foreground">Flight Details</h3>
              <div className="grid grid-cols-2 gap-1 text-sm">
                <div className="font-medium">Aircraft:</div>
                <div>{order.aircraftType}</div>
                
                <div className="font-medium">Tail Number:</div>
                <div>{order.tailNumber}</div>
                
                <div className="font-medium">Departure:</div>
                <div>{order.departureAirport} - {order.departureDate}, {order.departureTime}</div>
                
                <div className="font-medium">Arrival:</div>
                <div>{order.arrivalAirport || 'N/A'}</div>
                
                <div className="font-medium">Passengers:</div>
                <div>{order.passengerCount}</div>
              </div>
            </div>
            
            {/* Delivery Information */}
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-muted-foreground">Delivery Details</h3>
              <div className="grid grid-cols-2 gap-1 text-sm">
                <div className="font-medium">Location:</div>
                <div>{order.deliveryLocation}</div>
                
                <div className="font-medium">Airport:</div>
                <div>{order.deliveryAirport}</div>
                
                <div className="font-medium">Instructions:</div>
                <div>{order.deliveryInstructions || 'None'}</div>
                
                <div className="font-medium">Contact:</div>
                <div>{order.contactPerson || 'N/A'}</div>
                
                <div className="font-medium">Phone:</div>
                <div>{order.contactPhone || 'N/A'}</div>
              </div>
            </div>
            
            {/* Payment & Invoice Info */}
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-muted-foreground">Payment & Invoice</h3>
              <div className="grid grid-cols-2 gap-1 text-sm">
                <div className="font-medium">Total Amount:</div>
                <div className="font-bold text-primary">{formatCentsAsCurrency(order.totalPrice)}</div>
                
                <div className="font-medium">Payment Status:</div>
                <div>{order.paymentStatus || 'Pending'}</div>
                
                <div className="font-medium">Payment Method:</div>
                <div>{order.paymentMethod || 'N/A'}</div>
                
                <div className="font-medium">Invoice Status:</div>
                <div>{order.invoiceStatus || 'Not generated'}</div>
                
                <div className="font-medium">Created At:</div>
                <div>{new Date(order.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="items">
        <TabsList>
          <TabsTrigger value="items">Order Items</TabsTrigger>
          <TabsTrigger value="history">Order History</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Order Items</CardTitle>
              <CardDescription>
                Items included in this order
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!orderItems || orderItems.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No items found</p>
              ) : (
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
                      <tr>
                        <th scope="col" className="px-6 py-3">Item</th>
                        <th scope="col" className="px-6 py-3">Quantity</th>
                        <th scope="col" className="px-6 py-3">Price</th>
                        <th scope="col" className="px-6 py-3">Total</th>
                        <th scope="col" className="px-6 py-3">Special Instructions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderItems.map((item: any) => (
                        <tr key={item.id} className="bg-white border-b hover:bg-muted/20">
                          <td className="px-6 py-4 font-medium">{item.name}</td>
                          <td className="px-6 py-4">{item.quantity}</td>
                          <td className="px-6 py-4">{formatCentsAsCurrency(item.price)}</td>
                          <td className="px-6 py-4 font-medium">{formatCentsAsCurrency(item.price * item.quantity)}</td>
                          <td className="px-6 py-4">{item.specialInstructions || '-'}</td>
                        </tr>
                      ))}
                      <tr className="bg-muted/10 font-bold">
                        <td colSpan={3} className="px-6 py-4 text-right">Total:</td>
                        <td className="px-6 py-4 text-primary">{formatCentsAsCurrency(order.totalPrice)}</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>
                Timeline of order status changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-4">Order history feature coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Order Notes</CardTitle>
              <CardDescription>
                Internal notes and comments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-4">Notes feature coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}