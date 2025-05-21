import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Order, OrderItem, MenuItem } from "@shared/schema";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrderAnnotations from "@/components/client/order-annotations";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Loader2, ArrowLeft, Download, Copy, FileText, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { ChatDialog } from "@/components/chat/chat-dialog";
import { InvoiceButton } from "@/components/ui/invoice-button";

// Helper function to get the status badge color
const getStatusBadge = (status: string) => {
  switch (status) {
    case "delivered":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
    case "in_transit":
      return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">In Transit</Badge>;
    case "ready":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Ready</Badge>;
    case "preparing":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Preparing</Badge>;
    case "processing":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Processing</Badge>;
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
    case "cancelled":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
  }
};

// Format datetime from ISO string
const formatDateTime = (dateString: string, timeString: string) => {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return {
      formattedDate: format(date, "MMMM d, yyyy"),
      formattedTime: timeString
    };
  } catch (error) {
    return {
      formattedDate: dateString,
      formattedTime: timeString
    };
  }
};

// The actual component that will be rendered 
// Wrapper component that extracts params
export default function OrderDetail() {
  const params = useParams();
  console.log("OrderDetail - params:", params);
  
  // If no id param, show error
  if (!params || !params.id) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Order ID is missing.</p>
      </div>
    );
  }
  
  return <OrderDetailContent id={params.id} />;
}

// The actual component that will be rendered 
function OrderDetailContent({ id }: { id: string }) {
  const { t } = useLanguage();
  const orderId = parseInt(id, 10);
  console.log("OrderDetailContent - orderId:", orderId);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);

  // Fetch order details
  const { data: order, isLoading: isLoadingOrder } = useQuery<Order>({
    queryKey: [`/api/orders/${orderId}`],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/orders/${orderId}`);
      return res.json();
    },
    enabled: !isNaN(orderId),
    retry: false
  });

  // Fetch order items
  const { data: orderItems, isLoading: isLoadingItems } = useQuery<OrderItem[]>({
    queryKey: [`/api/orders/${orderId}/items`],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/orders/${orderId}/items`);
      return res.json();
    },
    enabled: !isNaN(orderId)
  });

  // Fetch menu items to get their details
  const { data: menuItems } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu-items"],
  });

  const handleBack = () => {
    navigate("/order-history");
  };

  const handleDuplicateOrder = async () => {
    if (!order) return;
    
    try {
      const { id, orderNumber, created, updated, status, ...orderToDuplicate } = order;
      
      const newOrderRes = await apiRequest("POST", "/api/orders", orderToDuplicate);
      const newOrder = await newOrderRes.json();
      
      toast({
        title: "Order Duplicated",
        description: `Order #${newOrder.orderNumber} has been created based on your previous order.`,
      });

      // Navigate to the new order
      navigate(`/order-detail/${newOrder.id}`);
    } catch (error) {
      console.error("Failed to duplicate order:", error);
      toast({
        title: "Failed to duplicate order",
        description: "There was an error duplicating your order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateInvoice = async () => {
    if (!order) return;
    
    try {
      setIsGeneratingInvoice(true);
      
      // Generate the customs invoice PDF
      const response = await fetch(`/api/orders/${orderId}/customs-invoice`, {
        method: "GET",
        credentials: "include"
      });
      
      if (!response.ok) {
        // Check for error responses
        if (response.status === 401) {
          toast({
            title: "Authentication Error",
            description: "Please log in again to download the invoice.",
            variant: "destructive"
          });
          return;
        } else {
          const errorData = await response.json();
          toast({
            title: "Failed to generate invoice",
            description: errorData.message || "An unexpected error occurred",
            variant: "destructive"
          });
          return;
        }
      }
      
      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customs-invoice-${order.orderNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Invoice Generated",
        description: "Your customs invoice has been downloaded.",
      });
    } catch (error) {
      console.error("Failed to generate invoice:", error);
      toast({
        title: "Failed to generate invoice",
        description: "There was an error generating your invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  if (isLoadingOrder || isLoadingItems) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <p className="text-gray-500">Order not found or you don't have permission to view it.</p>
            <Button variant="outline" className="mt-4" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Order History
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { formattedDate, formattedTime } = formatDateTime(order.departureDate, order.departureTime);
  
  // Calculate totals
  const totalAmount = order.totalPrice / 100;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Order History
        </Button>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleDuplicateOrder}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate Order
          </Button>
          
          <Button
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
            onClick={() => setChatDialogOpen(true)}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            {t('chat.chatWithOperations')}
          </Button>
          
          <Button 
            variant="default" 
            onClick={handleGenerateInvoice} 
            disabled={isGeneratingInvoice}
          >
            {isGeneratingInvoice ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            Generate Customs Invoice
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Order #{order.orderNumber}</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Placed on {new Date(order.created).toLocaleDateString()} at {new Date(order.created).toLocaleTimeString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(order.status)}
              {/* Only show invoice button for completed orders */}
              {(order.status === "delivered" || order.status === "ready" || order.status === "in_transit" || order.paymentStatus === "paid") && (
                <InvoiceButton 
                  orderId={orderId} 
                  disabled={order.status === "cancelled"}
                  className="ml-2" 
                />
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Flight Details</TabsTrigger>
              <TabsTrigger value="items">Order Items</TabsTrigger>
              <TabsTrigger value="delivery">Delivery Information</TabsTrigger>
              <TabsTrigger value="annotations">Team Annotations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Aircraft Details</h3>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500">Company Name</p>
                      <p className="font-medium">-</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Aircraft Type</p>
                      <p className="font-medium">{order.aircraftType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Tail Number</p>
                      <p className="font-medium">{order.tailNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Registration</p>
                      <p className="font-medium">-</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Flight Information</h3>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500">Departure Date</p>
                      <p className="font-medium">{formattedDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Departure Time</p>
                      <p className="font-medium">{formattedTime}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Departure Airport</p>
                      <p className="font-medium">{order.departureAirport}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Arrival Airport</p>
                      <p className="font-medium">{order.arrivalAirport || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Passengers & Crew</h3>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500">Passengers</p>
                      <p className="font-medium">{order.passengerCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Crew</p>
                      <p className="font-medium">{order.crewCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Dietary Requirements</p>
                      <p className="font-medium">
                        {order.dietaryRequirements?.join(", ") || "None"}
                      </p>
                    </div>
                  </div>
                </div>
                
                {order.specialNotes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Special Notes</h3>
                    <p className="mt-2 text-sm">{order.specialNotes}</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="items" className="pt-4">
              {orderItems && orderItems.length > 0 ? (
                <div className="space-y-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orderItems.map((item) => {
                        const menuItem = menuItems?.find(mi => mi.id === item.menuItemId);
                        if (!menuItem) return null;
                        
                        const price = order.departureAirport === "SKG" 
                          ? menuItem.priceThessaloniki / 100 
                          : menuItem.priceMykonos / 100;
                        
                        return (
                          <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {menuItem.name}
                              {item.specialInstructions && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Note: {item.specialInstructions}
                                </p>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                              {item.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                              {menuItem.unit || 'item'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                              €{price.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                              €{(price * item.quantity).toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  
                  <div className="flex justify-end pt-4">
                    <div className="bg-gray-50 p-4 rounded-md w-full md:w-64">
                      <div className="flex justify-between py-1">
                        <span className="text-sm text-gray-500">Subtotal</span>
                        <span className="text-sm font-medium">€{totalAmount.toFixed(2)}</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between py-1">
                        <span className="text-sm font-medium">Total</span>
                        <span className="text-sm font-bold">€{totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No items found for this order.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="delivery" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Location & Time</h3>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500">Kitchen Location</p>
                      <p className="font-medium">{order.kitchenLocation || order.departureAirport}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Delivery Location</p>
                      <p className="font-medium">{order.deliveryLocation}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Delivery Time</p>
                      <p className="font-medium">{order.deliveryTime}</p>
                    </div>
                  </div>
                </div>
                
                {order.deliveryInstructions && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Delivery Instructions</h3>
                    <p className="mt-2 text-sm">{order.deliveryInstructions}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500">Cancellation Policy</h3>
                <div className="mt-2 text-sm text-gray-600 space-y-2">
                  <p>• Free cancellation more than 24 hours before the delivery time</p>
                  <p>• 50% cancellation fee if cancelled between 24 and 12 hours before delivery</p>
                  <p>• 75% cancellation fee if cancelled between 12 and 6 hours before delivery</p>
                  <p>• 100% cancellation fee if cancelled less than 6 hours before delivery</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="annotations" className="pt-4">
              <OrderAnnotations orderId={orderId} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Chat Dialog */}
      <ChatDialog
        open={chatDialogOpen}
        onOpenChange={setChatDialogOpen}
        orderNumber={order?.orderNumber}
        orderId={orderId}
      />
    </div>
  );
}