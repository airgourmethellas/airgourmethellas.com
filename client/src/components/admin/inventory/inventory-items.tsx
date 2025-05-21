import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { InventoryItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-language";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Edit, Package, MoreHorizontal, RefreshCw } from "lucide-react";

interface InventoryItemsProps {
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

const unitOptions = [
  { label: "kg", value: "kg" },
  { label: "g", value: "g" },
  { label: "L", value: "L" },
  { label: "ml", value: "ml" },
  { label: "piece", value: "piece" },
  { label: "box", value: "box" },
  { label: "bottle", value: "bottle" },
  { label: "can", value: "can" },
  { label: "pack", value: "pack" },
];

// Form schema for creating/editing inventory items
const inventoryItemSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  description: z.string().nullable().optional(),
  category: z.string(),
  unit: z.string(),
  cost: z.number().positive("Cost must be a positive number"),
  inStock: z.number().min(0, "In stock must be zero or positive"),
  reorderPoint: z.number().min(0, "Reorder point must be zero or positive"),
  idealStock: z.number().min(0, "Ideal stock must be zero or positive"),
  location: z.string(),
  isActive: z.boolean().default(true),
});

type InventoryItemFormValues = z.infer<typeof inventoryItemSchema>;

export default function InventoryItems({ location }: InventoryItemsProps) {
  const { t } = useTranslation();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [filter, setFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  
  const queryClient = useQueryClient();
  
  // Query to fetch inventory items for the selected location
  const { data: inventoryItems, isLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory/inventory-items", location],
    queryFn: async () => {
      const response = await apiRequest(
        "GET", 
        `/api/inventory/inventory-items?location=${location}`
      );
      return response.json();
    },
  });
  
  // Mutation to create new inventory item
  const createMutation = useMutation({
    mutationFn: async (data: InventoryItemFormValues) => {
      const response = await apiRequest("POST", "/api/inventory/inventory-items", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/inventory-items", location] });
      toast({
        title: t("Inventory Item Created"),
        description: t("The inventory item has been created successfully."),
      });
      setIsAddDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: t("Error"),
        description: error.message || t("Failed to create inventory item."),
        variant: "destructive",
      });
    },
  });
  
  // Mutation to update existing inventory item
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InventoryItemFormValues> }) => {
      const response = await apiRequest("PATCH", `/api/inventory/inventory-items/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/inventory-items", location] });
      toast({
        title: t("Inventory Item Updated"),
        description: t("The inventory item has been updated successfully."),
      });
      setEditingItem(null);
    },
    onError: (error: any) => {
      toast({
        title: t("Error"),
        description: error.message || t("Failed to update inventory item."),
        variant: "destructive",
      });
    },
  });

  // Form for adding/editing inventory items
  const form = useForm<InventoryItemFormValues>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      unit: "",
      cost: 0,
      inStock: 0,
      reorderPoint: 5,
      idealStock: 20,
      location: location,
      isActive: true,
    },
  });
  
  // Filter inventory items by name and category
  const filteredItems = inventoryItems?.filter(item => {
    const matchesFilter = filter === "" || 
      item.name.toLowerCase().includes(filter.toLowerCase()) || 
      (item.description && item.description.toLowerCase().includes(filter.toLowerCase()));
    
    const matchesCategory = categoryFilter === null || item.category === categoryFilter;
    
    return matchesFilter && matchesCategory;
  });
  
  // Handle the submit of the add/edit form
  const onSubmit = (data: InventoryItemFormValues) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };
  
  // Opens the edit dialog and sets the form values
  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    form.reset({
      name: item.name,
      description: item.description,
      category: item.category,
      unit: item.unit,
      cost: item.cost,
      inStock: item.inStock,
      reorderPoint: item.reorderPoint,
      idealStock: item.idealStock,
      location: item.location,
      isActive: item.isActive,
    });
  };
  
  // Add new item, reset form values
  const handleAddNew = () => {
    setEditingItem(null);
    form.reset({
      name: "",
      description: "",
      category: "",
      unit: "",
      cost: 0,
      inStock: 0,
      reorderPoint: 5,
      idealStock: 20,
      location: location,
      isActive: true,
    });
    setIsAddDialogOpen(true);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <Input
            placeholder={t("Search inventory items...")}
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
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" /> {t("Add Item")}
        </Button>
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
                <TableHead>{t("Name")}</TableHead>
                <TableHead>{t("Category")}</TableHead>
                <TableHead>{t("In Stock")}</TableHead>
                <TableHead>{t("Reorder Point")}</TableHead>
                <TableHead>{t("Unit")}</TableHead>
                <TableHead>{t("Cost")}</TableHead>
                <TableHead>{t("Status")}</TableHead>
                <TableHead className="text-right">{t("Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems && filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{t(categoryOptions.find(c => c.value === item.category)?.label || item.category)}</TableCell>
                    <TableCell className={item.inStock <= item.reorderPoint ? "text-red-500 font-bold" : ""}>
                      {item.inStock} {item.unit}
                    </TableCell>
                    <TableCell>{item.reorderPoint} {item.unit}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>€{item.cost.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${item.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                        {item.isActive ? t("Active") : t("Inactive")}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    {t("No inventory items found")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      
      <Dialog open={isAddDialogOpen || !!editingItem} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setEditingItem(null);
        }
      }}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? t("Edit Inventory Item") : t("Add Inventory Item")}
            </DialogTitle>
            <DialogDescription>
              {editingItem 
                ? t("Update the details of this inventory item.") 
                : t("Fill in the details to add a new inventory item to your catalog.")}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Name")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("Enter item name")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Category")}</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("Select a category")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoryOptions.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {t(category.label)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Description")}</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={t("Enter item description (optional)")} 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Unit")}</FormLabel>
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("Select a unit")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {unitOptions.map((unit) => (
                            <SelectItem key={unit.value} value={unit.value}>
                              {unit.label}
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
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Cost (€)")}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          min="0"
                          placeholder="0.00" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="inStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("In Stock")}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="reorderPoint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Reorder Point")}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="5" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="idealStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Ideal Stock")}</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="20" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setEditingItem(null);
                  }}
                >
                  {t("Cancel")}
                </Button>
                <Button 
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingItem ? t("Update Item") : t("Add Item")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}