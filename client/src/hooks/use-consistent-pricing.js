/**
 * Hook for Consistent Pricing
 * 
 * This hook ensures the same prices are used consistently across
 * all components in the order flow.
 */
import { useState, useEffect } from 'react';

// Global state for consistent pricing across components
const priceState = {
  location: null,         // "Thessaloniki" or "Mykonos"
  menuItems: null,        // Cached menu items
  itemPrices: new Map(),  // Price cache by item ID
};

export function useConsistentPricing(initialLocation = null, menuItemsData = null) {
  const [location, setLocationState] = useState(priceState.location || initialLocation);
  const [menuItems, setMenuItemsState] = useState(priceState.menuItems || menuItemsData);
  
  // Set location effect
  useEffect(() => {
    if (location && location !== priceState.location) {
      console.log(`[useConsistentPricing] Setting location: ${location}`);
      priceState.location = location;
      
      // Clear price cache if location changes
      if (priceState.location !== location) {
        priceState.itemPrices.clear();
      }
    }
  }, [location]);
  
  // Set menu items effect
  useEffect(() => {
    if (menuItems && (!priceState.menuItems || priceState.menuItems.length !== menuItems.length)) {
      console.log(`[useConsistentPricing] Setting menu items: ${menuItems.length} items`);
      priceState.menuItems = menuItems;
    }
  }, [menuItems]);
  
  // Set location function
  const setLocation = (newLocation) => {
    if (newLocation === "Thessaloniki" || newLocation === "Mykonos") {
      setLocationState(newLocation);
      return true;
    }
    return false;
  };
  
  // Set menu items function
  const setMenuItems = (items) => {
    if (items && Array.isArray(items)) {
      setMenuItemsState(items);
      return true;
    }
    return false;
  };
  
  // Get item price - uses cached price if available for consistency
  const getItemPrice = (menuItemId) => {
    // Use cached price if available
    if (priceState.itemPrices.has(menuItemId)) {
      return priceState.itemPrices.get(menuItemId);
    }
    
    // Find menu item and calculate price
    if (priceState.menuItems) {
      const menuItem = priceState.menuItems.find(item => item.id === menuItemId);
      if (menuItem) {
        // Calculate price based on location
        const price = priceState.location === "Thessaloniki" 
          ? menuItem.priceThessaloniki 
          : menuItem.priceMykonos;
          
        // Cache price for future consistency
        priceState.itemPrices.set(menuItemId, price);
        return price;
      }
    }
    
    return 0;
  };
  
  // Apply consistent prices to order items
  const applyConsistentPrices = (orderItems) => {
    return orderItems.map(item => ({
      ...item,
      price: getItemPrice(item.menuItemId)
    }));
  };
  
  // Calculate consistent subtotal
  const calculateSubtotal = (orderItems) => {
    return orderItems.reduce((total, item) => {
      const price = item.price || getItemPrice(item.menuItemId);
      return total + (price * item.quantity);
    }, 0);
  };
  
  // Get delivery fee based on location
  const getDeliveryFee = () => {
    return 15000; // €150 for both locations
  };
  
  // Calculate total with delivery fee
  const calculateTotal = (orderItems) => {
    const subtotal = calculateSubtotal(orderItems);
    const deliveryFee = getDeliveryFee();
    return subtotal + deliveryFee;
  };
  
  // Format price from cents to euros
  const formatPrice = (cents) => {
    return `€${(cents / 100).toFixed(2)}`;
  };
  
  return {
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
}