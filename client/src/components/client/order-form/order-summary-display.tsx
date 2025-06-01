import { MenuItem } from "@shared/schema";
import { OrderFormData } from "@/pages/client/new-order";
import { formatPriceWithSymbol } from "@/utils/price-formatter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface OrderSummaryDisplayProps {
  formData: OrderFormData;
  menuItems?: MenuItem[];
}

export default function OrderSummaryDisplay({ formData, menuItems }: OrderSummaryDisplayProps) {
  // Get the correct price based on kitchen location
  const getLocationBasedPrice = (menuItem: MenuItem): number => {
    const location = formData.kitchenLocation || "Thessaloniki";
    console.log(`[PAGE 1 ORDER SUMMARY] Using location: ${location} for ${menuItem.name}`);
    return location === "Thessaloniki" ? menuItem.priceThessaloniki : menuItem.priceMykonos;
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    if (!formData.items || !menuItems) return 0;
    
    return formData.items.reduce((total, item) => {
      const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
      if (!menuItem) return total;
      
      // Use location-based pricing like Page 2
      const price = getLocationBasedPrice(menuItem);
      console.log(`[PAGE 1 PRICING] ${menuItem.name}: ${formData.kitchenLocation} price = €${(price/100).toFixed(2)} (${price} cents)`);
      return total + (price * item.quantity);
    }, 0);
  };

  // Get the name of a menu item
  const getMenuItemName = (id: number) => {
    if (!menuItems) return "Loading...";
    const menuItem = menuItems.find(item => item.id === id);
    return menuItem ? menuItem.name : "Unknown Item";
  };

  // Get the price of a menu item (in cents) using location-based pricing
  const getItemPrice = (id: number) => {
    if (!menuItems) return 0;
    const menuItem = menuItems.find(item => item.id === id);
    return menuItem ? getLocationBasedPrice(menuItem) : 0;
  };

  // Fixed delivery fee in cents
  const deliveryFee = 15000; // €150.00 in cents
  
  // Calculate the total
  const total = calculateSubtotal() + deliveryFee;

  return (
    <Card className="mt-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Selected Menu Items</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {formData.items && formData.items.length > 0 ? (
          <div className="space-y-3">
            {formData.items.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="font-medium">{getMenuItemName(item.menuItemId)}</div>
                <div className="text-sm text-gray-500">Quantity: {item.quantity}</div>
                <div className="font-medium">{formatPriceWithSymbol(getItemPrice(item.menuItemId))}</div>
                {index < formData.items.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 italic">No menu items selected</div>
        )}

        <div className="bg-gray-50 p-3 rounded-md mt-4 space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Subtotal:</span>
            <span className="font-medium">{formatPriceWithSymbol(calculateSubtotal())}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Delivery Fee:</span>
            <span className="font-medium">{formatPriceWithSymbol(deliveryFee)}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between text-lg font-semibold">
            <span>Total:</span>
            <span>{formatPriceWithSymbol(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}