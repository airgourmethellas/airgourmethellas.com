import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/hooks/use-language";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus, ArrowUpDown, Filter, PlusCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// Define InventoryItem interface based on our schema
interface InventoryItem {
  id: number;
  name: string;
  category: string;
  unit: string;
  inStock: number;
  reorderPoint: number;
  location: string;
  cost: number;
  isActive: boolean;
  created: string;
  updated: string;
}

export default function Inventory() {
  const { t } = useLanguage();
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ 
    key: 'name', 
    direction: 'asc' 
  });
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    unit: '',
    inStock: 0,
    reorderPoint: 0,
    location: 'Thessaloniki',
    cost: 0
  });

  // Fetch inventory data
  const { data: inventoryItems, isLoading, refetch } = useQuery<InventoryItem[]>({
    queryKey: ['/api/inventory'],
    // This will fall back to null if 404 since it's likely not yet implemented
    queryFn: async () => {
      try {
        const res = await fetch('/api/inventory');
        if (!res.ok) {
          if (res.status === 404) {
            console.warn('Inventory API not implemented yet, using empty array');
            return [];
          }
          throw new Error('Failed to fetch inventory');
        }
        return res.json();
      } catch (error) {
        console.error('Error fetching inventory:', error);
        return [];
      }
    }
  });
  
  // Handle sorting
  const handleSort = (key: string) => {
    setSortConfig(prevSortConfig => ({
      key,
      direction: prevSortConfig.key === key && prevSortConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Filter and sort inventory items
  const filteredItems = React.useMemo(() => {
    if (!inventoryItems) return [];
    
    let filtered = [...inventoryItems];
    
    // Apply location filter
    if (locationFilter !== 'all') {
      filtered = filtered.filter(item => item.location === locationFilter);
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.category.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let compareValue;
      
      switch (sortConfig.key) {
        case 'name':
          compareValue = a.name.localeCompare(b.name);
          break;
        case 'category':
          compareValue = a.category.localeCompare(b.category);
          break;
        case 'inStock':
          compareValue = a.inStock - b.inStock;
          break;
        case 'reorderPoint':
          compareValue = a.reorderPoint - b.reorderPoint;
          break;
        default:
          compareValue = 0;
      }
      
      return sortConfig.direction === 'asc' ? compareValue : -compareValue;
    });
    
    return filtered;
  }, [inventoryItems, locationFilter, categoryFilter, searchQuery, sortConfig]);

  // Get available categories
  const categories = React.useMemo(() => {
    if (!inventoryItems) return [];
    
    const categorySet = new Set<string>();
    inventoryItems.forEach(item => {
      if (item.category) categorySet.add(item.category);
    });
    
    return Array.from(categorySet);
  }, [inventoryItems]);

  // Handle adding new inventory item
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add inventory item');
      }
      
      // Reset form and close dialog
      setNewItem({
        name: '',
        category: '',
        unit: '',
        inStock: 0,
        reorderPoint: 0,
        location: 'Thessaloniki',
        cost: 0
      });
      setShowAddDialog(false);
      
      // Refetch inventory data
      refetch();
    } catch (error) {
      console.error('Error adding inventory item:', error);
      alert('Failed to add inventory item. Please try again.');
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="py-10 flex justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('inventoryTitle', 'Inventory')}</h2>
          <p className="text-muted-foreground">
            {t('inventoryDescription', 'Manage your inventory items and stock levels')}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                {t('addInventoryItem', 'Add Item')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('addNewInventoryItem', 'Add New Inventory Item')}</DialogTitle>
                <DialogDescription>
                  {t('addInventoryItemDescription', 'Fill in the details to add a new inventory item')}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddItem}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      {t('name', 'Name')}
                    </Label>
                    <Input
                      id="name"
                      value={newItem.name}
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                      {t('category', 'Category')}
                    </Label>
                    <Input
                      id="category"
                      value={newItem.category}
                      onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="unit" className="text-right">
                      {t('unit', 'Unit')}
                    </Label>
                    <Input
                      id="unit"
                      value={newItem.unit}
                      onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="inStock" className="text-right">
                      {t('inStock', 'In Stock')}
                    </Label>
                    <Input
                      id="inStock"
                      type="number"
                      value={newItem.inStock}
                      onChange={(e) => setNewItem({...newItem, inStock: parseInt(e.target.value) || 0})}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="reorderPoint" className="text-right">
                      {t('reorderPoint', 'Reorder Point')}
                    </Label>
                    <Input
                      id="reorderPoint"
                      type="number"
                      value={newItem.reorderPoint}
                      onChange={(e) => setNewItem({...newItem, reorderPoint: parseInt(e.target.value) || 0})}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="location" className="text-right">
                      {t('location', 'Location')}
                    </Label>
                    <Select
                      value={newItem.location}
                      onValueChange={(value) => setNewItem({...newItem, location: value})}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder={t('selectLocation', 'Select Location')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Thessaloniki">Thessaloniki (SKG)</SelectItem>
                        <SelectItem value="Mykonos">Mykonos (JMK)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="cost" className="text-right">
                      {t('cost', 'Cost')}
                    </Label>
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      value={newItem.cost}
                      onChange={(e) => setNewItem({...newItem, cost: parseFloat(e.target.value) || 0})}
                      className="col-span-3"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">{t('addItem', 'Add Item')}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline">
            {t('exportInventory', 'Export')}
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Input
            placeholder={t('searchInventory', 'Search inventory items...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                {t('filters', 'Filters')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <div className="p-2">
                <p className="font-medium text-sm mb-1">{t('location', 'Location')}</p>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('allLocations', 'All Locations')}</SelectItem>
                    <SelectItem value="Thessaloniki">Thessaloniki (SKG)</SelectItem>
                    <SelectItem value="Mykonos">Mykonos (JMK)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="p-2">
                <p className="font-medium text-sm mb-1">{t('category', 'Category')}</p>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('allCategories', 'All Categories')}</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="text-muted-foreground text-sm">
          {filteredItems.length} {t('itemsFound', 'items found')}
        </div>
      </div>
      
      {filteredItems.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
                  <div className="flex items-center">
                    {t('name', 'Name')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort('category')} className="cursor-pointer">
                  <div className="flex items-center">
                    {t('category', 'Category')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>
                  {t('unit', 'Unit')}
                </TableHead>
                <TableHead onClick={() => handleSort('inStock')} className="cursor-pointer">
                  <div className="flex items-center">
                    {t('inStock', 'In Stock')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead onClick={() => handleSort('reorderPoint')} className="cursor-pointer">
                  <div className="flex items-center">
                    {t('reorderPoint', 'Reorder Point')}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>
                  {t('location', 'Location')}
                </TableHead>
                <TableHead>
                  {t('status', 'Status')}
                </TableHead>
                <TableHead>
                  {t('actions', 'Actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.name}
                  </TableCell>
                  <TableCell>
                    {item.category}
                  </TableCell>
                  <TableCell>
                    {item.unit}
                  </TableCell>
                  <TableCell>
                    {item.inStock}
                  </TableCell>
                  <TableCell>
                    {item.reorderPoint}
                  </TableCell>
                  <TableCell>
                    {item.location}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.inStock <= item.reorderPoint ? 'destructive' : 'success'}>
                      {item.inStock <= item.reorderPoint ? t('lowStock', 'Low Stock') : t('inStock', 'In Stock')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      {t('edit', 'Edit')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t('noInventoryItemsFound', 'No inventory items found')}</CardTitle>
            <CardDescription>
              {t('noInventoryItemsDescription', 'Try adjusting your filters or add a new inventory item')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t('addFirstItem', 'Add your first item')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}