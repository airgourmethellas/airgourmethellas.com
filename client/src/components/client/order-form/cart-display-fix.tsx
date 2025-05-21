import { useEffect } from 'react';

// This component applies a fix for the cart price display issue
export default function CartDisplayFix() {
  useEffect(() => {
    // Find all cart price elements and fix them to display as €3.00 instead of €0.03
    const fixCartDisplayPrices = () => {
      // For pricing in the "Your Order" section
      const cartItemPriceElements = document.querySelectorAll('.cart-item-price');
      cartItemPriceElements.forEach(element => {
        const priceText = element.textContent;
        if (priceText && priceText.includes('€')) {
          // Extract the price value
          const match = priceText.match(/€(\d+\.\d+)/);
          if (match && match[1]) {
            const priceValue = parseFloat(match[1]);
            // If the price is unusually low (like €0.03 instead of €3.00)
            if (priceValue < 0.1 && priceValue > 0) {
              // Multiply by 100 to get the correct display
              const correctedPrice = priceValue * 100;
              // Update the displayed text
              element.textContent = priceText.replace(
                `€${priceValue.toFixed(2)}`,
                `€${correctedPrice.toFixed(2)}`
              );
            }
          }
        }
      });
    };

    // Run the fix when the component mounts
    fixCartDisplayPrices();

    // Also set up an observer to handle dynamically added elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          fixCartDisplayPrices();
        }
      });
    });

    // Start observing the document for changes
    observer.observe(document.body, { childList: true, subtree: true });

    // Clean up the observer on component unmount
    return () => observer.disconnect();
  }, []);

  return null; // This component doesn't render anything
}