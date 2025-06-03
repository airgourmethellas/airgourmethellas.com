import { generateInvoice } from './invoice-handler';
import { Order, OrderItem } from '@shared/schema';

// Create a simple test order to verify VAT calculation
const testOrder: Order = {
  id: 999,
  userId: 1,
  orderNumber: "VAT-TEST-001",
  aircraftType: "Test Aircraft",
  handlerCompany: "Test Handler",
  departureDate: "2025-06-03",
  departureTime: "15:30",
  departureAirport: "SKG",
  arrivalAirport: "JMK",
  passengerCount: 4,
  crewCount: 2,
  dietaryRequirements: [],
  specialNotes: "VAT test order",
  deliveryLocation: "Gate 1",
  deliveryTime: "14:30",
  deliveryInstructions: "Test delivery",
  documents: [],
  status: "confirmed",
  kitchenLocation: "Thessaloniki",
  cancellationPolicyAccepted: true,
  deliveryFee: 150,
  paymentStatus: "pending",
  paymentIntentId: null,
  paymentMethod: "invoice",
  created: new Date(),
  updated: new Date(),
  totalPrice: 5000 // €50.00
};

const testItems: OrderItem[] = [
  {
    id: 1,
    orderId: 999,
    menuItemId: 1,
    quantity: 2,
    price: 2000, // €20.00 each
    specialInstructions: "Test item 1"
  },
  {
    id: 2,
    orderId: 999,
    menuItemId: 2,
    quantity: 1,
    price: 1000, // €10.00
    specialInstructions: "Test item 2"
  }
];

export async function testVATCalculation() {
  try {
    console.log('=== VAT CALCULATION TEST ===');
    
    // Calculate expected values
    const subtotal = 4000; // 2*2000 + 1*1000 = 4000 cents = €40.00
    const deliveryFee = 15000; // €150.00 in cents
    const totalBeforeVAT = subtotal + deliveryFee; // €190.00
    const vatAmount = Math.round(totalBeforeVAT * 0.13); // 13% VAT
    const grandTotal = totalBeforeVAT + vatAmount;
    
    console.log(`Subtotal: ${subtotal} cents (€${(subtotal/100).toFixed(2)})`);
    console.log(`Delivery Fee: ${deliveryFee} cents (€${(deliveryFee/100).toFixed(2)})`);
    console.log(`Total Before VAT: ${totalBeforeVAT} cents (€${(totalBeforeVAT/100).toFixed(2)})`);
    console.log(`VAT (13%): ${vatAmount} cents (€${(vatAmount/100).toFixed(2)})`);
    console.log(`Grand Total: ${grandTotal} cents (€${(grandTotal/100).toFixed(2)})`);
    
    console.log('Generating PDF invoice...');
    const filePath = await generateInvoice(testOrder, testItems);
    console.log('PDF generated successfully at:', filePath);
    
    return { 
      success: true, 
      filePath,
      calculations: {
        subtotal: subtotal / 100,
        deliveryFee: deliveryFee / 100,
        totalBeforeVAT: totalBeforeVAT / 100,
        vatRate: '13%',
        vatAmount: vatAmount / 100,
        grandTotal: grandTotal / 100
      }
    };
  } catch (error: any) {
    console.error('VAT test failed:', error);
    return { success: false, error: error.message };
  }
}