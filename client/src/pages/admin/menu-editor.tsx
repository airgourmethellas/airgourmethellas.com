import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MenuItem, insertMenuItemSchema, updateMenuItemSchema } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Pencil, Plus, Trash2, Check, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

// Using updateMenuItemSchema imported from schema.ts

type FormValues = z.infer<typeof insertMenuItemSchema>;
type UpdateFormValues = z.infer<typeof updateMenuItemSchema>;

export default function MenuEditor() {
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: menuItems, isLoading } = useQuery<MenuItem[]>({
    queryKey: ['/api/menu-items'],
  });

  const createForm = useForm<FormValues>({
    resolver: zodResolver(insertMenuItemSchema),
    defaultValues: {
      name: '',
      description: '',
      priceThessaloniki: 0,
      priceMykonos: 0,
      category: 'main',
      dietaryOptions: [],
      available: true,
      imageUrl: '',
      unit: '',
    },
  });

  const editForm = useForm<UpdateFormValues>({
    resolver: zodResolver(updateMenuItemSchema),
    defaultValues: {
      id: 0,
      name: '',
      description: '',
      priceThessaloniki: 0,
      priceMykonos: 0,
      category: 'main',
      dietaryOptions: [],
      available: true,
      imageUrl: '',
      unit: '',
    },
  });

  React.useEffect(() => {
    if (editItem) {
      editForm.reset({
        id: editItem.id,
        name: editItem.name,
        description: editItem.description,
        priceThessaloniki: editItem.priceThessaloniki,
        priceMykonos: editItem.priceMykonos,
        category: editItem.category,
        dietaryOptions: editItem.dietaryOptions,
        available: editItem.available !== null ? editItem.available : true,
        imageUrl: editItem.imageUrl || '',
        unit: editItem.unit || '',
      });
    }
  }, [editItem, editForm]);

  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest('POST', '/api/menu-items', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menu-items'] });
      setIsCreateDialogOpen(false);
      createForm.reset();
      toast({
        title: "Menu item created",
        description: "The menu item has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating menu item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateFormValues) => {
      const { id, ...updateData } = data;
      const res = await apiRequest('PATCH', `/api/menu-items/${id}`, updateData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menu-items'] });
      setIsEditDialogOpen(false);
      setEditItem(null);
      toast({
        title: "Menu item updated",
        description: "The menu item has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating menu item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/menu-items/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/menu-items'] });
      toast({
        title: "Menu item deleted",
        description: "The menu item has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting menu item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Group by category
  const categories = React.useMemo(() => {
    if (!menuItems) return {};
    
    const result: Record<string, MenuItem[]> = {};
    
    menuItems.forEach(item => {
      if (!result[item.category]) {
        result[item.category] = [];
      }
      result[item.category].push(item);
    });
    
    return result;
  }, [menuItems]);

  const categoryNames: Record<string, string> = {
    "breakfast": "Breakfast",
    "appetizer": "Starters",
    "salad": "Salads",
    "soup": "Soups",
    "main": "Main Courses",
    "dessert": "Desserts",
    "beverage": "Beverages",
    "special_diet": "Special Dietary Options"
  };

  const dietaryOptions = [
    "Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", 
    "Nut-Free", "Low-Carb", "Keto", "Halal", "Kosher"
  ];

  const handleCreateSubmit = (data: FormValues) => {
    // Ensure prices are numbers
    const formattedData = {
      ...data,
      priceThessaloniki: Number(data.priceThessaloniki),
      priceMykonos: Number(data.priceMykonos),
    };
    createMutation.mutate(formattedData);
  };

  const handleEditSubmit = (data: UpdateFormValues) => {
    // Ensure prices are numbers
    const formattedData = {
      ...data,
      priceThessaloniki: Number(data.priceThessaloniki),
      priceMykonos: Number(data.priceMykonos),
    };
    updateMutation.mutate(formattedData);
  };

  const handleDeleteItem = (id: number) => {
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredItems = React.useMemo(() => {
    if (activeCategory === "all") {
      return menuItems || [];
    }
    
    return (menuItems || []).filter(item => item.category === activeCategory);
  }, [menuItems, activeCategory]);

  if (isLoading) {
    return <div>Loading menu items...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Menu Editor</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Menu Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Menu Item</DialogTitle>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Item name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Item description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="priceThessaloniki"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price - Thessaloniki (€)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="priceMykonos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price - Mykonos (€)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="breakfast">Breakfast</SelectItem>
                            <SelectItem value="appetizer">Starters</SelectItem>
                            <SelectItem value="salad">Salads</SelectItem>
                            <SelectItem value="soup">Soups</SelectItem>
                            <SelectItem value="main">Main Courses</SelectItem>
                            <SelectItem value="dessert">Desserts</SelectItem>
                            <SelectItem value="beverage">Beverages</SelectItem>
                            <SelectItem value="special_diet">Special Dietary Options</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={createForm.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., per piece, 300g, per portion" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="dietaryOptions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dietary Options</FormLabel>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {dietaryOptions.map(option => (
                          <Badge 
                            key={option}
                            variant={field.value?.includes(option) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              const current = field.value || [];
                              if (current.includes(option)) {
                                field.onChange(current.filter(item => item !== option));
                              } else {
                                field.onChange([...current, option]);
                              }
                            }}
                          >
                            {option}
                          </Badge>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Creating..." : "Create Item"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="flex flex-wrap justify-start gap-2 mb-6">
          <TabsTrigger value="all">All Items ({menuItems?.length || 0})</TabsTrigger>
          {Object.keys(categories).sort().map(category => (
            <TabsTrigger key={category} value={category}>
              {categoryNames[category] || category} ({categories[category].length})
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value={activeCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <Card key={item.id} className="overflow-hidden">
                <CardHeader className="bg-blue-50 pb-2 flex flex-row justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-semibold">{item.name}</CardTitle>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.dietaryOptions?.map(option => (
                        <Badge variant="outline" key={option} className="text-xs">
                          {option}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setEditItem(item);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <div className="flex flex-col gap-2 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Thessaloniki:</span>
                      <span className="font-bold text-blue-700">
                        €{(item.priceThessaloniki / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Mykonos:</span>
                      <span className="font-bold text-blue-700">
                        €{(item.priceMykonos / 100).toFixed(2)}
                      </span>
                    </div>
                    {item.unit && (
                      <div className="text-xs text-gray-500 mt-1 text-right">
                        {item.unit}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="id"
                render={({ field }) => (
                  <input type="hidden" {...field} />
                )}
              />

              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Item name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Item description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="priceThessaloniki"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price - Thessaloniki (€)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="priceMykonos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price - Mykonos (€)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="breakfast">Breakfast</SelectItem>
                          <SelectItem value="appetizer">Starters</SelectItem>
                          <SelectItem value="salad">Salads</SelectItem>
                          <SelectItem value="soup">Soups</SelectItem>
                          <SelectItem value="main">Main Courses</SelectItem>
                          <SelectItem value="dessert">Desserts</SelectItem>
                          <SelectItem value="beverage">Beverages</SelectItem>
                          <SelectItem value="special_diet">Special Dietary Options</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., per piece, 300g, per portion" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="dietaryOptions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dietary Options</FormLabel>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {dietaryOptions.map(option => (
                        <Badge 
                          key={option}
                          variant={field.value?.includes(option) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            const current = field.value || [];
                            if (current.includes(option)) {
                              field.onChange(current.filter(item => item !== option));
                            } else {
                              field.onChange([...current, option]);
                            }
                          }}
                        >
                          {option}
                        </Badge>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditItem(null);
                }}>Cancel</Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Updating..." : "Update Item"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}