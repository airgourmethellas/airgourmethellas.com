import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OrderFormData } from "@/pages/client/new-order";
import { useQuery } from "@tanstack/react-query";
import { MenuItem } from "@shared/schema";
import { Loader2, Plus, Minus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { usePricing } from "@/contexts/PricingContext";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface MenuSelectionProps {
  formData: OrderFormData;
  onFormDataChange: (data: Partial<OrderFormData>) => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function MenuSelection({
  formData,
  onFormDataChange,
  onPrev,
  onNext,
}: MenuSelectionProps) {
  const [activeTab, setActiveTab] = useState("breads");
  const [dietaryFilter, setDietaryFilter] = useState<string | null>(null);
  
  // Use PricingContext for consistent location-based pricing
  const {
    location,
    setLocation,
    menuItems: contextMenuItems,
    setMenuItems: setContextMenuItems,
    getItemPrice,
    formatPrice
  } = usePricing();
  
  const [selectedItems, setSelectedItems] = useState<{
    menuItemId: number;
    quantity: number;
    name: string;
    price: number;
    category: string;
    specialInstructions?: string;
  }[]>(
    formData.items.map((item) => ({
      ...item,
      name: "", // Will be populated from the menu items data
      category: "",
    }))
  );

  const { data: menuItems, isLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu-items", { kitchen: formData.kitchenLocation }],
  });

  // Sync location with form data and context
  useEffect(() => {
    if (formData.kitchenLocation && formData.kitchenLocation !== location) {
      setLocation(formData.kitchenLocation);
      console.log(`[MenuSelection] Location synced to: ${formData.kitchenLocation}`);
    }
  }, [formData.kitchenLocation, location, setLocation]);

  // Sync menu items with context when data loads
  useEffect(() => {
    if (menuItems && menuItems !== contextMenuItems) {
      setContextMenuItems(menuItems);
      console.log(`[MenuSelection] Menu items synced: ${menuItems.length} items`);
    }
  }, [menuItems, contextMenuItems, setContextMenuItems]);

  // Update the selected items with names and correct location-based pricing when menu data loads
  useEffect(() => {
    if (menuItems && formData.items.length > 0) {
      console.log(`[MenuSelection] Updating cart items for location: ${formData.kitchenLocation}`);
      
      const updatedItems = formData.items.map((item) => {
        const menuItem = menuItems.find((mi) => mi.id === item.menuItemId);
        if (!menuItem) return item;
        
        // Use PricingContext for consistent location-based pricing
        const correctPrice = getItemPrice(item.menuItemId);
        
        console.log(`[MenuSelection] ${menuItem.name}: ${formData.kitchenLocation} price = ${formatPrice(correctPrice)} (${correctPrice} cents)`);
        
        return {
          ...item,
          name: menuItem.name,
          category: menuItem.category,
          price: correctPrice, // Use PricingContext pricing
        };
      });
      setSelectedItems(updatedItems);
      
      // Also update the form data to ensure consistency
      onFormDataChange({
        items: updatedItems.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions || undefined,
          price: item.price,
        }))
      });
    }
  }, [menuItems, formData.items, formData.kitchenLocation, getItemPrice, formatPrice]);

  // Helper function to get the real price in euros for an item
  const getRealPriceInEuros = (itemName: string, priceInCents: number) => {
    // Hard-coded price mapping for specific items
    switch (itemName) {
      case "Assorted bread rolls": return 3.00;
      case "Sourdough bread": return 4.00;
      case "Bagels": return 5.00;
      case "Gluten free bread": return 4.50;
      case "Pitta bread": return 4.00;
      case "Greek sesame bagel (Koulouri)": return 3.50;
      default: return priceInCents / 100; // Default conversion
    }
  };

  const handleAddItem = (item: MenuItem) => {
    // Check if item is already in the selected items
    const existingItem = selectedItems.find(
      (selectedItem) => selectedItem.menuItemId === item.id
    );

    // Use PricingContext for consistent location-based pricing
    const price = getItemPrice(item.id);
    
    console.log(`[MenuSelection] Adding ${item.name} with price ${formatPrice(price)} from location: ${location}`);

    let updatedItems;
    if (existingItem) {
      // Update quantity if it already exists
      updatedItems = selectedItems.map((selectedItem) =>
        selectedItem.menuItemId === item.id
          ? { ...selectedItem, quantity: selectedItem.quantity + 1 }
          : selectedItem
      );
    } else {
      // Add new item
      updatedItems = [
        ...selectedItems,
        {
          menuItemId: item.id,
          quantity: 1,
          name: item.name,
          price: price, // This price is in cents from PricingContext
          category: item.category,
        },
      ];
    }
    
    setSelectedItems(updatedItems);
    
    // Store the complete updated items in form data to ensure consistent pricing
    onFormDataChange({
      items: updatedItems.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: item.price,
        specialInstructions: item.specialInstructions || null
      }))
    });
  };

  const handleRemoveItem = (itemId: number) => {
    setSelectedItems(
      selectedItems.filter((item) => item.menuItemId !== itemId)
    );
  };

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }

    setSelectedItems(
      selectedItems.map((item) =>
        item.menuItemId === itemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const handleSpecialInstructions = (
    itemId: number,
    instructions: string
  ) => {
    setSelectedItems(
      selectedItems.map((item) =>
        item.menuItemId === itemId
          ? { ...item, specialInstructions: instructions }
          : item
      )
    );
  };

  const handleContinue = () => {
    // Calculate total price using real euro values
    const totalPrice = selectedItems.reduce(
      (total, item) => {
        // Get the real price in euros for this item
        const priceInEuros = getRealPriceInEuros(item.name, item.price);
        
        // Convert back to cents for storage
        return total + priceInEuros * 100 * item.quantity;
      },
      0
    );

    // Prepare the items for the form data
    const formattedItems = selectedItems.map((item) => ({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      specialInstructions: item.specialInstructions,
      price: item.price,
    }));

    onFormDataChange({
      items: formattedItems,
      totalPrice,
    });

    onNext();
  };

  // Filter menu items by category and dietary requirements
  const filteredMenuItems = menuItems
    ? menuItems.filter(
        (item) =>
          (activeTab === item.category || activeTab === "all") &&
          (!dietaryFilter ||
            (item.dietaryOptions &&
              item.dietaryOptions.includes(dietaryFilter))) &&
          item.available === true
      )
    : [];

  // Using our centralized price formatter for consistent display
  // This will format prices correctly across all parts of the application

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Menu Selection</h2>
        <div className="flex items-center space-x-2">
          <Label htmlFor="dietary-filter">Filter by dietary:</Label>
          <Select
            value={dietaryFilter || "all"}
            onValueChange={(value) => setDietaryFilter(value === "all" ? null : value)}
          >
            <SelectTrigger id="dietary-filter" className="w-[180px]">
              <SelectValue placeholder="All options" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All options</SelectItem>
              <SelectItem value="vegetarian">Vegetarian</SelectItem>
              <SelectItem value="vegan">Vegan</SelectItem>
              <SelectItem value="gluten-free">Gluten-Free</SelectItem>
              <SelectItem value="halal">Halal</SelectItem>
              <SelectItem value="kosher">Kosher</SelectItem>
              <SelectItem value="keto">Keto</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 flex flex-wrap">
          <TabsTrigger value="breads">Breads</TabsTrigger>
          <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
          <TabsTrigger value="salad">Salads</TabsTrigger>
          <TabsTrigger value="starter">Starters</TabsTrigger>
          <TabsTrigger value="main">Main Courses</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {isLoading ? (
            <div className="col-span-full flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
          ) : filteredMenuItems.length > 0 ? (
            filteredMenuItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {item.description}
                        </p>
                        <div className="flex gap-1 mt-2">
                          {item.dietaryOptions?.map((option) => (
                            <Badge
                              key={option}
                              variant="outline"
                              className="text-xs"
                            >
                              {option}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {(() => {
                            const price = getItemPrice(item.id);
                            console.log(`[MenuDisplay] ${item.name} - Location: ${location}, Price: ${formatPrice(price)} (${price} cents)`);
                            return formatPrice(price);
                          })()}
                        </p>
                        <p className="text-xs text-gray-500 mb-1">{item.unit || 'per item'}</p>
                        <Button
                          size="sm"
                          onClick={() => handleAddItem(item)}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              No menu items found for the selected criteria.
            </div>
          )}
        </div>
      </Tabs>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Your Order</h3>

        {selectedItems.length > 0 ? (
          <div className="space-y-4">
            {selectedItems.map((item) => (
              <div
                key={item.menuItemId}
                className="bg-white border border-gray-200 rounded-md p-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-500">
                      €{(item.price / 100).toFixed(2)} each
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() =>
                        handleQuantityChange(
                          item.menuItemId,
                          item.quantity - 1
                        )
                      }
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() =>
                        handleQuantityChange(
                          item.menuItemId,
                          item.quantity + 1
                        )
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveItem(item.menuItemId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2">
                  <Label
                    htmlFor={`instructions-${item.menuItemId}`}
                    className="text-sm text-gray-700"
                  >
                    Special Instructions
                  </Label>
                  <Textarea
                    id={`instructions-${item.menuItemId}`}
                    placeholder="Any special requests for this item"
                    className="mt-1 text-sm"
                    value={item.specialInstructions || ""}
                    onChange={(e) =>
                      handleSpecialInstructions(
                        item.menuItemId,
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="mt-2 text-right">
                  <p className="font-medium text-gray-900">
                    Subtotal: {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}

            <div className="bg-gray-50 rounded-md p-4 flex justify-between items-center">
              <p className="font-medium text-lg text-gray-900">Total:</p>
              <p className="font-bold text-xl text-gray-900">
                {(() => {
                  const subtotal = selectedItems.reduce(
                    (total, item) => total + (item.price * item.quantity),
                    0
                  );
                  return formatPrice(subtotal);
                })()}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-md">
            No items selected yet. Browse the menu and add items to your order.
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          Back to Flight Details
        </Button>
        <Button
          onClick={handleContinue}
          disabled={selectedItems.length === 0}
        >
          Continue to Special Requests
        </Button>
      </div>
    </div>
  );
}