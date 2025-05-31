import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MenuItem } from '@shared/schema';

// Type definitions
type LocationType = 'Thessaloniki' | 'Mykonos';

interface OrderItem {
  menuItemId: number;
  quantity: number;
  price?: number;
  specialInstructions?: string | null;
}

interface PricingContextType {
  location: LocationType;
  setLocation: (location: LocationType) => void;
  menuItems: MenuItem[] | null;
  setMenuItems: (items: MenuItem[]) => void;
  getItemPrice: (menuItemId: number) => number;
  applyConsistentPrices: (orderItems: OrderItem[]) => OrderItem[];
  calculateSubtotal: (orderItems: OrderItem[]) => number;
  getDeliveryFee: () => number;
  calculateTotal: (orderItems: OrderItem[]) => number;
  formatPrice: (cents: number) => string;
}

// Create context
const PricingContext = createContext<PricingContextType | null>(null);

// Menu item prices cache
const priceCache = new Map<number, number>();

export function PricingProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LocationType>('Thessaloniki');
  const [menuItems, setMenuItems] = useState<MenuItem[] | null>(null);
  
  // Reset price cache when location changes
  useEffect(() => {
    priceCache.clear();
    console.log(`[PricingContext] Location set to: ${location}, price cache cleared`);
  }, [location]);
  
  // Get price for a menu item based on location
  const getItemPrice = (menuItemId: number): number => {
    // If price is already in cache, use it for consistency
    if (priceCache.has(menuItemId)) {
      return priceCache.get(menuItemId) || 0;
    }
    
    // Find menu item and calculate price
    if (menuItems) {
      const menuItem = menuItems.find(item => item.id === menuItemId);
      if (menuItem) {
        // Get location-specific price
        const price = location === 'Thessaloniki' 
          ? menuItem.priceThessaloniki 
          : menuItem.priceMykonos;
          
        // Cache price for future consistency
        priceCache.set(menuItemId, price);
        return price;
      }
    }
    
    return 0;
  };
  
  // Apply consistent prices to order items
  const applyConsistentPrices = (orderItems: OrderItem[]): OrderItem[] => {
    return orderItems.map(item => ({
      ...item,
      price: getItemPrice(item.menuItemId)
    }));
  };
  
  // Calculate subtotal from order items
  const calculateSubtotal = (orderItems: OrderItem[]): number => {
    return orderItems.reduce((total, item) => {
      const price = item.price || getItemPrice(item.menuItemId);
      return total + (price * item.quantity);
    }, 0);
  };
  
  // Get delivery fee based on location
  const getDeliveryFee = (): number => {
    return 15000; // €150 for both locations
  };
  
  // Calculate total with delivery fee
  const calculateTotal = (orderItems: OrderItem[]): number => {
    const subtotal = calculateSubtotal(orderItems);
    const deliveryFee = getDeliveryFee();
    return subtotal + deliveryFee;
  };
  
  // Format price from cents to euros
  const formatPrice = (cents: number): string => {
    return `€${(cents / 100).toFixed(2)}`;
  };
  
  const value: PricingContextType = {
    location,
    setLocation,
    menuItems,
    setMenuItems,
    getItemPrice,
    applyConsistentPrices,
    calculateSubtotal,
    getDeliveryFee,
    calculateTotal,
    formatPrice
  };
  
  return (
    <PricingContext.Provider value={value}>
      {children}
    </PricingContext.Provider>
  );
}

// Hook to use the pricing context
export function usePricing(): PricingContextType {
  const context = useContext(PricingContext);
  if (!context) {
    throw new Error('usePricing must be used within a PricingProvider');
  }
  return context;
}