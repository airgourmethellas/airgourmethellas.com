import { generateInvoice } from './invoice-handler';
import { Order, OrderItem } from '@shared/schema';

// Create a test order and items to verify PDF generation
const testOrder: Order = {
  id: 1,
  userId: 1,
  orderNumber: "TEST-001",
  aircraftType: "Cessna Citation",
  handlerCompany: "Test Handler Co.",
  departureDate: "2025-06-02",
  departureTime: "14:30",
  departureAirport: "SKG",
  arrivalAirport: "JMK",
  passengerCount: 6,
  crewCount: 2,
  dietaryRequirements: [],
  specialNotes: "Test order",
  deliveryLocation: "Gate 5",
  deliveryTime: "13:30",
  deliveryInstructions: "Test delivery",
  documents: [],
  status: "confirmed",
  kitchenLocation: "Thessaloniki",
  cancellationPolicyAccepted: true,
  deliveryFee: 150,
  paymentStatus: "paid",
  paymentIntentId: null,
  paymentMethod: "invoice",
  created: new Date(),
  updated: new Date(),
  totalPrice: 8500
};

const testItems: OrderItem[] = [
  {
    id: 1,
    orderId: 1,
    menuItemId: 1,
    quantity: 2,
    price: 2800,
    specialInstructions: "No onions"
  },
  {
    id: 2,
    orderId: 1,
    menuItemId: 2,
    quantity: 1,
    price: 3500,
    specialInstructions: null
  }
];

export async function testPDFGeneration() {
  try {
    console.log('Testing PDF invoice generation...');
    const filePath = await generateInvoice(testOrder, testItems);
    console.log('PDF generated successfully at:', filePath);
    return { success: true, filePath };
  } catch (error: any) {
    console.error('PDF generation failed:', error);
    return { success: false, error: error.message };
  }
}