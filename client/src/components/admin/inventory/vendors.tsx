import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Vendor } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-language";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Edit, Trash2, Phone, Mail, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Form schema for creating/editing vendors
const vendorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Please enter a valid email").nullable().optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  contactName: z.string().nullable().optional(),
  preferredPaymentMethod: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

type VendorFormValues = z.infer<typeof vendorSchema>;

export default function Vendors() {
  const { t } = useTranslation();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [filter, setFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
  
  const queryClient = useQueryClient();
  
  // Query to fetch all vendors
  const { data: vendors, isLoading } = useQuery<Vendor[]>({
    queryKey: ["/api/inventory/vendors"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/inventory/vendors");
      return response.json();
    },
  });
  
  // Mutation to create new vendor
  const createMutation = useMutation({
    mutationFn: async (data: VendorFormValues) => {
      const response = await apiRequest("POST", "/api/inventory/vendors", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/vendors"] });
      toast({
        title: t("Vendor Created"),
        description: t("The vendor has been created successfully."),
      });
      setIsAddDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: t("Error"),
        description: error.message || t("Failed to create vendor."),
        variant: "destructive",
      });
    },
  });
  
  // Mutation to update existing vendor
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<VendorFormValues> }) => {
      const response = await apiRequest("PATCH", `/api/inventory/vendors/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/vendors"] });
      toast({
        title: t("Vendor Updated"),
        description: t("The vendor has been updated successfully."),
      });
      setEditingVendor(null);
    },
    onError: (error: any) => {
      toast({
        title: t("Error"),
        description: error.message || t("Failed to update vendor."),
        variant: "destructive",
      });
    },
  });

  // Mutation to delete a vendor
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/inventory/vendors/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/vendors"] });
      toast({
        title: t("Vendor Deleted"),
        description: t("The vendor has been deleted successfully."),
      });
    },
    onError: (error: any) => {
      toast({
        title: t("Error"),
        description: error.message || t("Failed to delete vendor."),
        variant: "destructive",
      });
    },
  });

  // Form for adding/editing vendors
  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      contactName: "",
      preferredPaymentMethod: "",
      notes: "",
      isActive: true,
    },
  });
  
  // Filter vendors by name and active status
  const filteredVendors = vendors?.filter(vendor => {
    const matchesFilter = filter === "" || 
      vendor.name.toLowerCase().includes(filter.toLowerCase()) || 
      (vendor.contactName && vendor.contactName.toLowerCase().includes(filter.toLowerCase()));
    
    const matchesActiveStatus = 
      activeFilter === "all" || 
      (activeFilter === "active" && vendor.isActive) || 
      (activeFilter === "inactive" && !vendor.isActive);
    
    return matchesFilter && matchesActiveStatus;
  });
  
  // Handle the submit of the add/edit form
  const onSubmit = (data: VendorFormValues) => {
    if (editingVendor) {
      updateMutation.mutate({ id: editingVendor.id, data });
    } else {
      createMutation.mutate(data);
    }
  };
  
  // Opens the edit dialog and sets the form values
  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    form.reset({
      name: vendor.name,
      email: vendor.email || "",
      phone: vendor.phone || "",
      address: vendor.address || "",
      contactName: vendor.contactName || "",
      preferredPaymentMethod: vendor.preferredPaymentMethod || "",
      notes: vendor.notes || "",
      isActive: vendor.isActive,
    });
    setIsAddDialogOpen(true);
  };
  
  // Add new vendor, reset form values
  const handleAddNew = () => {
    setEditingVendor(null);
    form.reset({
      name: "",
      email: "",
      phone: "",
      address: "",
      contactName: "",
      preferredPaymentMethod: "",
      notes: "",
      isActive: true,
    });
    setIsAddDialogOpen(true);
  };
  
  // Toggle vendor active status
  const toggleActive = (vendor: Vendor) => {
    updateMutation.mutate({
      id: vendor.id, 
      data: { isActive: !vendor.isActive }
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <Input
            placeholder={t("Search vendors...")}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-sm"
          />
          <Tabs 
            value={activeFilter} 
            onValueChange={(value) => setActiveFilter(value as "all" | "active" | "inactive")}
            className="w-[300px]"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">{t("All")}</TabsTrigger>
              <TabsTrigger value="active">{t("Active")}</TabsTrigger>
              <TabsTrigger value="inactive">{t("Inactive")}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" /> {t("Add Vendor")}
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
                <TableHead className="w-[20%]">{t("Name")}</TableHead>
                <TableHead>{t("Contact")}</TableHead>
                <TableHead>{t("Phone")}</TableHead>
                <TableHead>{t("Payment Method")}</TableHead>
                <TableHead>{t("Status")}</TableHead>
                <TableHead className="text-right">{t("Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors && filteredVendors.length > 0 ? (
                filteredVendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell className="font-medium">{vendor.name}</TableCell>
                    <TableCell>
                      {vendor.contactName && (
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1 text-muted-foreground" />
                          {vendor.contactName}
                        </div>
                      )}
                      {vendor.email && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Mail className="h-3 w-3 mr-1" />
                          {vendor.email}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {vendor.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1 text-muted-foreground" />
                          {vendor.phone}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {vendor.preferredPaymentMethod || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Switch 
                          checked={vendor.isActive} 
                          onCheckedChange={() => toggleActive(vendor)}
                          className="mr-2"
                        />
                        <span className={vendor.isActive ? "text-green-600" : "text-gray-500"}>
                          {vendor.isActive ? t("Active") : t("Inactive")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(vendor)}>
                            <Edit className="h-4 w-4 mr-2" />
                            {t("Edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => {
                              if (confirm(t("Are you sure you want to delete this vendor?"))) {
                                deleteMutation.mutate(vendor.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t("Delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    {t("No vendors found")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setEditingVendor(null);
        }
      }}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>
              {editingVendor ? t("Edit Vendor") : t("Add Vendor")}
            </DialogTitle>
            <DialogDescription>
              {editingVendor 
                ? t("Update the details of this vendor.") 
                : t("Fill in the details to add a new vendor to your system.")}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Vendor Name")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("Enter vendor company name")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Contact Person")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("Enter contact name")} {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Email")}</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder={t("Enter email address")} 
                          {...field} 
                          value={field.value || ""} 
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Phone")}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t("Enter phone number")} 
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
                  name="preferredPaymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Preferred Payment Method")}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={t("e.g. Bank Transfer, Credit Card")} 
                          {...field} 
                          value={field.value || ""} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Address")}</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={t("Enter vendor address")} 
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
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Notes")}</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={t("Enter additional notes")} 
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
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>{t("Active Vendor")}</FormLabel>
                      <FormDescription>
                        {t("Inactive vendors will not appear in dropdown selections")}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setEditingVendor(null);
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
                  {editingVendor ? t("Update Vendor") : t("Add Vendor")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}