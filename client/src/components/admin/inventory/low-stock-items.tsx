import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { InventoryItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-language";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Package, AlertTriangle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface LowStockItemsProps {
  location: string;
}

const categoryOptions = [
  { label: "Fresh Produce", value: "fresh_produce" },
  { label: "Dairy", value: "dairy" },
  { label: "Meat & Poultry", value: "meat_poultry" },
  { label: "Seafood", value: "seafood" },
  { label: "Bakery", value: "bakery" },
  { label: "Dry Goods", value: "dry_goods" },
  { label: "Beverages", value: "beverages" },
  { label: "Alcohol", value: "alcohol" },
  { label: "Frozen", value: "frozen" },
  { label: "Disposables", value: "disposables" },
  { label: "Cleaning Supplies", value: "cleaning" },
];

// Form schema for restocking inventory
const restockFormSchema = z.object({
  quantity: z.number().positive("Quantity must be a positive number"),
  notes: z.string().optional(),
});

type RestockFormValues = z.infer<typeof restockFormSchema>;

export default function LowStockItems({ location }: LowStockItemsProps) {
  const { t } = useTranslation();
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [filter, setFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  
  const queryClient = useQueryClient();
  
  // Query to fetch low stock inventory items
  const { data: lowStockItems, isLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory/inventory-items/low-stock", location],
    queryFn: async () => {
      const response = await apiRequest(
        "GET", 
        `/api/inventory/inventory-items/low-stock?location=${location}`
      );
      return response.json();
    },
  });
  
  // Mutation to create inventory transaction (restock)
  const restockMutation = useMutation({
    mutationFn: async ({ itemId, data }: { itemId: number; data: RestockFormValues }) => {
      const response = await apiRequest("POST", "/api/inventory/inventory-transactions", {
        inventoryItemId: itemId,
        quantity: data.quantity,
        transactionType: "restock",
        location: location,
        notes: data.notes || null,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/inventory-items/low-stock", location] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/inventory-items", location] });
      toast({
        title: t("Inventory Restocked"),
        description: t("The inventory has been restocked successfully."),
      });
      setIsRestockDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: t("Error"),
        description: error.message || t("Failed to restock inventory."),
        variant: "destructive",
      });
    },
  });

  // Form for restocking inventory
  const form = useForm<RestockFormValues>({
    resolver: zodResolver(restockFormSchema),
    defaultValues: {
      quantity: 0,
      notes: "",
    },
  });
  
  // Filter low stock items by name and category
  const filteredItems = lowStockItems?.filter(item => {
    const matchesFilter = filter === "" || 
      item.name.toLowerCase().includes(filter.toLowerCase());
    
    const matchesCategory = categoryFilter === null || item.category === categoryFilter;
    
    return matchesFilter && matchesCategory;
  });
  
  // Handle the restock form submit
  const onSubmit = (data: RestockFormValues) => {
    if (selectedItem) {
      restockMutation.mutate({ 
        itemId: selectedItem.id, 
        data 
      });
    }
  };
  
  // Opens the restock dialog
  const handleRestock = (item: InventoryItem) => {
    setSelectedItem(item);
    form.reset({
      quantity: item.idealStock - item.inStock,
      notes: "",
    });
    setIsRestockDialogOpen(true);
  };
  
  // Calculate the stock percentage for progress bar
  const calculateStockPercentage = (item: InventoryItem) => {
    if (item.idealStock === 0) return 0;
    const percentage = (item.inStock / item.idealStock) * 100;
    return Math.min(percentage, 100); // Cap at 100%
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <Input
            placeholder={t("Search low stock items...")}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-sm"
          />
          <Select 
            value={categoryFilter || ""}
            onValueChange={(value) => setCategoryFilter(value === "" ? null : value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("All Categories")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t("All Categories")}</SelectItem>
              {categoryOptions.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {t(category.label)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">{t("Name")}</TableHead>
                <TableHead>{t("Category")}</TableHead>
                <TableHead>{t("Stock Level")}</TableHead>
                <TableHead>{t("Current / Ideal")}</TableHead>
                <TableHead>{t("Unit")}</TableHead>
                <TableHead className="text-right">{t("Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems && filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {item.inStock === 0 ? (
                          <Badge variant="destructive" className="mr-1">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {t("Out of Stock")}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="mr-1">
                            {t("Low Stock")}
                          </Badge>
                        )}
                        {item.name}
                      </div>
                    </TableCell>
                    <TableCell>{t(categoryOptions.find(c => c.value === item.category)?.label || item.category)}</TableCell>
                    <TableCell className="w-[20%]">
                      <Progress value={calculateStockPercentage(item)} className="h-2" />
                    </TableCell>
                    <TableCell>
                      <span className="text-red-500 font-medium">{item.inStock}</span> / {item.idealStock}
                    </TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => handleRestock(item)}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" /> {t("Restock")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    {t("No low stock items found")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      
      <Dialog open={isRestockDialogOpen} onOpenChange={setIsRestockDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {t("Restock Inventory")}
            </DialogTitle>
            <DialogDescription>
              {selectedItem && (
                <span>
                  {t("Add stock to")} <strong>{selectedItem.name}</strong>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Quantity to add")}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        placeholder="0" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Notes")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("Enter restock notes (optional)")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {selectedItem && (
                <div className="bg-muted p-3 rounded-md text-sm">
                  <div className="flex justify-between mb-1">
                    <span>{t("Current Stock")}:</span>
                    <span className="font-medium">{selectedItem.inStock} {selectedItem.unit}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>{t("After Restock")}:</span>
                    <span className="font-medium">
                      {selectedItem.inStock + (form.watch("quantity") || 0)} {selectedItem.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t("Ideal Stock")}:</span>
                    <span className="font-medium">{selectedItem.idealStock} {selectedItem.unit}</span>
                  </div>
                </div>
              )}
              
              <DialogFooter>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setIsRestockDialogOpen(false)}
                >
                  {t("Cancel")}
                </Button>
                <Button 
                  type="submit"
                  disabled={restockMutation.isPending}
                >
                  {restockMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {t("Restock")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}