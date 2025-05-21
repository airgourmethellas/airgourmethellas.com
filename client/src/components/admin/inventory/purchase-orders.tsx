import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { PurchaseOrder, PurchaseOrderItem, Vendor, InventoryItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-language";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  FileText, 
  Package, 
  TruckIcon, 
  ShoppingCart, 
  X, 
  Eye
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { format } from "date-fns";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface PurchaseOrdersProps {
  location: string;
}

// Status options for purchase orders
const statusOptions = [
  { label: "Draft", value: "draft" },
  { label: "Submitted", value: "submitted" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Partially Received", value: "partially_received" },
  { label: "Received", value: "received" },
  { label: "Cancelled", value: "cancelled" },
];

// Schema for purchase order items
const purchaseOrderItemSchema = z.object({
  inventoryItemId: z.number().min(1, "Please select an item"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitCost: z.number().min(0, "Unit cost must be a positive number"),
  notes: z.string().nullable().optional(),
});

// Schema for creating/editing purchase orders
const purchaseOrderSchema = z.object({
  vendorId: z.number().min(1, "Please select a vendor"),
  deliveryDate: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  status: z.string().default("draft"),
  location: z.string(),
  items: z.array(purchaseOrderItemSchema).min(1, "At least one item is required"),
});

type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>;

export default function PurchaseOrders({ location }: PurchaseOrdersProps) {
  const { t } = useTranslation();
  const [isAddOrderDialogOpen, setIsAddOrderDialogOpen] = useState(false);
  const [isViewOrderDialogOpen, setIsViewOrderDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<PurchaseOrder | null>(null);
  const [viewingOrder, setViewingOrder] = useState<PurchaseOrder | null>(null);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  const queryClient = useQueryClient();
  
  // Query to fetch purchase orders for the selected location
  const { data: purchaseOrders, isLoading: isLoadingOrders } = useQuery<PurchaseOrder[]>({
    queryKey: ["/api/inventory/purchase-orders", location],
    queryFn: async () => {
      const response = await apiRequest(
        "GET", 
        `/api/inventory/purchase-orders?location=${location}`
      );
      return response.json();
    },
  });
  
  // Query to fetch vendors
  const { data: vendors } = useQuery<Vendor[]>({
    queryKey: ["/api/inventory/vendors"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/inventory/vendors");
      return response.json();
    },
  });
  
  // Query to fetch inventory items for the selected location
  const { data: inventoryItems } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory/inventory-items", location],
    queryFn: async () => {
      const response = await apiRequest(
        "GET", 
        `/api/inventory/inventory-items?location=${location}`
      );
      return response.json();
    },
  });
  
  // Query to fetch purchase order items for the viewing/editing order
  const { data: orderItems } = useQuery<PurchaseOrderItem[]>({
    queryKey: ["/api/inventory/purchase-order-items", viewingOrder?.id || editingOrder?.id],
    queryFn: async () => {
      const orderId = viewingOrder?.id || editingOrder?.id;
      if (!orderId) return [];
      
      const response = await apiRequest(
        "GET", 
        `/api/inventory/purchase-orders/${orderId}/items`
      );
      return response.json();
    },
    enabled: !!(viewingOrder?.id || editingOrder?.id),
  });
  
  // Mutation to create new purchase order
  const createOrderMutation = useMutation({
    mutationFn: async (data: PurchaseOrderFormValues) => {
      // First create the purchase order
      const orderResponse = await apiRequest(
        "POST", 
        "/api/inventory/purchase-orders", 
        {
          vendorId: data.vendorId,
          location: data.location,
          status: data.status,
          deliveryDate: data.deliveryDate,
          notes: data.notes,
        }
      );
      const order = await orderResponse.json();
      
      // Then create each order item
      for (const item of data.items) {
        await apiRequest(
          "POST", 
          "/api/inventory/purchase-order-items", 
          {
            ...item,
            purchaseOrderId: order.id,
          }
        );
      }
      
      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/purchase-orders", location] });
      toast({
        title: t("Purchase Order Created"),
        description: t("The purchase order has been created successfully."),
      });
      setIsAddOrderDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: t("Error"),
        description: error.message || t("Failed to create purchase order."),
        variant: "destructive",
      });
    },
  });
  
  // Mutation to update existing purchase order
  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<PurchaseOrderFormValues> }) => {
      // Update the purchase order
      const orderResponse = await apiRequest(
        "PATCH", 
        `/api/inventory/purchase-orders/${id}`, 
        {
          vendorId: data.vendorId,
          status: data.status,
          deliveryDate: data.deliveryDate,
          notes: data.notes,
        }
      );
      const order = await orderResponse.json();
      
      // If items are provided, delete existing items and create new ones
      if (data.items) {
        // Get existing items
        const existingItemsResponse = await apiRequest(
          "GET", 
          `/api/inventory/purchase-orders/${id}/items`
        );
        const existingItems: PurchaseOrderItem[] = await existingItemsResponse.json();
        
        // Delete all existing items
        for (const item of existingItems) {
          await apiRequest(
            "DELETE", 
            `/api/inventory/purchase-order-items/${item.id}`
          );
        }
        
        // Create new items
        for (const item of data.items) {
          await apiRequest(
            "POST", 
            "/api/inventory/purchase-order-items", 
            {
              ...item,
              purchaseOrderId: id,
            }
          );
        }
      }
      
      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/purchase-orders", location] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/purchase-order-items"] });
      toast({
        title: t("Purchase Order Updated"),
        description: t("The purchase order has been updated successfully."),
      });
      setEditingOrder(null);
    },
    onError: (error: any) => {
      toast({
        title: t("Error"),
        description: error.message || t("Failed to update purchase order."),
        variant: "destructive",
      });
    },
  });

  // Form for adding/editing purchase orders
  const form = useForm<PurchaseOrderFormValues>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      vendorId: 0,
      status: "draft",
      deliveryDate: "",
      notes: "",
      location: location,
      items: [{ inventoryItemId: 0, quantity: 1, unitCost: 0, notes: "" }],
    },
  });
  
  // Setup field array for order items
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });
  
  // Filter purchase orders by search term and status
  const filteredOrders = purchaseOrders?.filter(order => {
    const matchesFilter = filter === "" || 
      order.orderNumber.toLowerCase().includes(filter.toLowerCase()) || 
      vendors?.find(v => v.id === order.vendorId)?.name.toLowerCase().includes(filter.toLowerCase());
    
    const matchesStatus = statusFilter === null || order.status === statusFilter;
    
    return matchesFilter && matchesStatus;
  });
  
  // Handle the submit of the add/edit form
  const onSubmit = (data: PurchaseOrderFormValues) => {
    if (editingOrder) {
      updateOrderMutation.mutate({ id: editingOrder.id, data });
    } else {
      createOrderMutation.mutate(data);
    }
  };
  
  // Open the edit dialog and set form values
  const handleEdit = (order: PurchaseOrder) => {
    setEditingOrder(order);
    
    // Fetch the order items
    queryClient.fetchQuery({ 
      queryKey: ["/api/inventory/purchase-order-items", order.id],
      queryFn: async () => {
        const response = await apiRequest(
          "GET", 
          `/api/inventory/purchase-orders/${order.id}/items`
        );
        return response.json();
      },
    }).then((items: PurchaseOrderItem[]) => {
      form.reset({
        vendorId: order.vendorId,
        status: order.status,
        deliveryDate: order.deliveryDate || "",
        notes: order.notes || "",
        location: order.location,
        items: items.map(item => ({
          inventoryItemId: item.inventoryItemId,
          quantity: item.quantity,
          unitCost: item.unitCost,
          notes: item.notes || "",
        })),
      });
      setIsAddOrderDialogOpen(true);
    });
  };
  
  // View order details
  const handleView = (order: PurchaseOrder) => {
    setViewingOrder(order);
    setIsViewOrderDialogOpen(true);
  };
  
  // Add new order, reset form values
  const handleAddNew = () => {
    setEditingOrder(null);
    form.reset({
      vendorId: 0,
      status: "draft",
      deliveryDate: "",
      notes: "",
      location: location,
      items: [{ inventoryItemId: 0, quantity: 1, unitCost: 0, notes: "" }],
    });
    setIsAddOrderDialogOpen(true);
  };
  
  // Calculate total cost for an order
  const calculateOrderTotal = (orderItems: PurchaseOrderItem[]) => {
    return orderItems.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
  };
  
  // Get inventory item by ID
  const getInventoryItemById = (id: number) => {
    return inventoryItems?.find(item => item.id === id);
  };
  
  // Get vendor by ID
  const getVendorById = (id: number) => {
    return vendors?.find(vendor => vendor.id === id);
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };
  
  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'draft':
        return "bg-gray-200 text-gray-800";
      case 'submitted':
        return "bg-blue-100 text-blue-800";
      case 'confirmed':
        return "bg-green-100 text-green-800";
      case 'partially_received':
        return "bg-yellow-100 text-yellow-800";
      case 'received':
        return "bg-emerald-100 text-emerald-800";
      case 'cancelled':
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <Input
            placeholder={t("Search purchase orders...")}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-sm"
          />
          <Select 
            value={statusFilter || ""}
            onValueChange={(value) => setStatusFilter(value === "" ? null : value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("All Statuses")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t("All Statuses")}</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {t(status.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleAddNew} disabled={!vendors?.length || !inventoryItems?.length}>
          <ShoppingCart className="mr-2 h-4 w-4" /> {t("Create Order")}
        </Button>
      </div>
      
      {isLoadingOrders ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !vendors?.length ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("No Vendors Available")}</CardTitle>
            <CardDescription>
              {t("You need to add vendors before you can create purchase orders.")}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : !inventoryItems?.length ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("No Inventory Items Available")}</CardTitle>
            <CardDescription>
              {t("You need to add inventory items before you can create purchase orders.")}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : filteredOrders && filteredOrders.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-bold">{order.orderNumber}</CardTitle>
                  <Badge className={getStatusBadgeClass(order.status)}>
                    {t(statusOptions.find(s => s.value === order.status)?.label || order.status)}
                  </Badge>
                </div>
                <CardDescription>
                  {getVendorById(order.vendorId)?.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2 text-sm">
                <div className="space-y-1">
                  {order.deliveryDate && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      {new Date(order.deliveryDate).toLocaleDateString()}
                    </div>
                  )}
                  <div className="flex justify-between items-center font-medium">
                    <span className="text-muted-foreground">{t("Total")}:</span>
                    <span>{formatCurrency(order.totalCost || 0)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleView(order)}
                >
                  <Eye className="h-4 w-4 mr-1" /> {t("View")}
                </Button>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={() => handleEdit(order)}
                  disabled={order.status === 'received' || order.status === 'cancelled'}
                >
                  <Edit className="h-4 w-4 mr-1" /> {t("Edit")}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t("No Purchase Orders")}</CardTitle>
            <CardDescription>
              {t("No purchase orders found for the selected filters.")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" /> {t("Create Your First Order")}
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Add/Edit Purchase Order Dialog */}
      <Dialog open={isAddOrderDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddOrderDialogOpen(false);
          setEditingOrder(null);
        }
      }}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>
              {editingOrder ? t("Edit Purchase Order") : t("Create Purchase Order")}
            </DialogTitle>
            <DialogDescription>
              {editingOrder 
                ? t("Update the purchase order details.")
                : t("Create a new purchase order for inventory items.")}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vendorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Vendor")}</FormLabel>
                      <Select 
                        value={field.value.toString()} 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("Select a vendor")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vendors
                            ?.filter(vendor => vendor.isActive)
                            .map((vendor) => (
                              <SelectItem key={vendor.id} value={vendor.id.toString()}>
                                {vendor.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Status")}</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("Select a status")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {t(status.label)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="deliveryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Delivery Date")}</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          value={field.value || ""} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Location")}</FormLabel>
                      <FormControl>
                        <Input value={field.value === "SKG" ? t("Thessaloniki") : t("Mykonos")} disabled />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Notes")}</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={t("Enter any special instructions or notes")} 
                        {...field} 
                        value={field.value || ""} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">{t("Order Items")}</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ inventoryItemId: 0, quantity: 1, unitCost: 0, notes: "" })}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {t("Add Item")}
                  </Button>
                </div>
                
                <div className="border rounded-md p-4 space-y-4">
                  {fields.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      {t("No items added. Click 'Add Item' to add inventory items to this order.")}
                    </div>
                  ) : (
                    fields.map((field, index) => (
                      <div key={field.id} className="space-y-4 p-4 border rounded-md relative">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2"
                          onClick={() => remove(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`items.${index}.inventoryItemId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("Inventory Item")}</FormLabel>
                                <Select 
                                  value={field.value.toString()} 
                                  onValueChange={(value) => {
                                    field.onChange(parseInt(value));
                                    
                                    // Auto-fill unit cost if available
                                    const item = getInventoryItemById(parseInt(value));
                                    if (item) {
                                      form.setValue(`items.${index}.unitCost`, item.cost);
                                    }
                                  }}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={t("Select an item")} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {inventoryItems?.map((item) => (
                                      <SelectItem key={item.id} value={item.id.toString()}>
                                        {item.name} ({item.unit})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`items.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("Quantity")}</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    min="1"
                                    placeholder="1" 
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`items.${index}.unitCost`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("Unit Cost (€)")}</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00" 
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name={`items.${index}.notes`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("Notes")}</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder={t("Optional notes")} 
                                    {...field} 
                                    value={field.value || ""} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        {/* Show item total price */}
                        <div className="text-right text-sm font-medium">
                          {t("Total")}: {formatCurrency(
                            (form.watch(`items.${index}.quantity`) || 0) * 
                            (form.watch(`items.${index}.unitCost`) || 0)
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {/* Display order total */}
                {fields.length > 0 && (
                  <div className="flex justify-end mt-4">
                    <div className="bg-muted p-3 rounded-md">
                      <span className="font-bold">{t("Order Total")}: </span>
                      {formatCurrency(
                        fields.reduce((sum, _, index) => {
                          return sum + (
                            (form.watch(`items.${index}.quantity`) || 0) * 
                            (form.watch(`items.${index}.unitCost`) || 0)
                          );
                        }, 0)
                      )}
                    </div>
                  </div>
                )}
                
                <FormMessage>
                  {form.formState.errors.items?.message}
                </FormMessage>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => {
                    setIsAddOrderDialogOpen(false);
                    setEditingOrder(null);
                  }}
                >
                  {t("Cancel")}
                </Button>
                <Button 
                  type="submit"
                  disabled={createOrderMutation.isPending || updateOrderMutation.isPending}
                >
                  {(createOrderMutation.isPending || updateOrderMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingOrder ? t("Update Order") : t("Create Order")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* View Purchase Order Dialog */}
      <Dialog open={isViewOrderDialogOpen} onOpenChange={setIsViewOrderDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{t("Purchase Order Details")}</span>
              {viewingOrder && (
                <Badge className={getStatusBadgeClass(viewingOrder.status)}>
                  {t(statusOptions.find(s => s.value === viewingOrder.status)?.label || viewingOrder.status)}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {viewingOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">{t("Purchase Order")}</h3>
                  <p className="text-lg font-bold">{viewingOrder.orderNumber}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">{t("Vendor")}</h3>
                  <p className="text-lg font-medium">{getVendorById(viewingOrder.vendorId)?.name}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">{t("Created Date")}</h3>
                  <p>{new Date(viewingOrder.created).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">{t("Delivery Date")}</h3>
                  <p>{viewingOrder.deliveryDate ? new Date(viewingOrder.deliveryDate).toLocaleDateString() : "-"}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">{t("Location")}</h3>
                <p>{viewingOrder.location === "SKG" ? t("Thessaloniki") : t("Mykonos")}</p>
              </div>
              
              {viewingOrder.notes && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">{t("Notes")}</h3>
                  <p className="text-sm">{viewingOrder.notes}</p>
                </div>
              )}
              
              <div>
                <h3 className="text-base font-medium">{t("Order Items")}</h3>
                
                {orderItems && orderItems.length > 0 ? (
                  <div className="border rounded-md mt-2 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("Item")}</TableHead>
                          <TableHead>{t("Quantity")}</TableHead>
                          <TableHead>{t("Unit Cost")}</TableHead>
                          <TableHead>{t("Total")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orderItems.map((item) => {
                          const inventoryItem = getInventoryItemById(item.inventoryItemId);
                          return (
                            <TableRow key={item.id}>
                              <TableCell>
                                {inventoryItem?.name || t("Unknown Item")}
                                {item.notes && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {item.notes}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                {item.quantity} {inventoryItem?.unit || ""}
                              </TableCell>
                              <TableCell>
                                {formatCurrency(item.unitCost)}
                              </TableCell>
                              <TableCell>
                                {formatCurrency(item.quantity * item.unitCost)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground border rounded-md mt-2">
                    {t("No items found for this purchase order.")}
                  </div>
                )}
              </div>
              
              {orderItems && orderItems.length > 0 && (
                <div className="flex justify-end">
                  <div className="bg-muted p-3 rounded-md">
                    <span className="font-bold">{t("Order Total")}: </span>
                    {formatCurrency(calculateOrderTotal(orderItems))}
                  </div>
                </div>
              )}
              
              <DialogFooter>
                <Button 
                  variant="outline"
                  onClick={() => setIsViewOrderDialogOpen(false)}
                >
                  {t("Close")}
                </Button>
                {viewingOrder.status !== 'received' && viewingOrder.status !== 'cancelled' && (
                  <Button 
                    variant="default"
                    onClick={() => {
                      setIsViewOrderDialogOpen(false);
                      handleEdit(viewingOrder);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" /> {t("Edit")}
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}