import { db } from '../server/db';
import { orders, orderItems } from '@shared/schema';

async function createTestOrder() {
  try {
    console.log('Creating test order directly in database...');
    
    // Create a test order
    const [testOrder] = await db.insert(orders).values({
      userId: 1,
      orderNumber: `TEST-${Date.now()}`,
      aircraftType: 'Test Aircraft',
      handlerCompany: 'Test Handler Company',
      departureDate: '2025-06-03',
      departureTime: '15:30',
      departureAirport: 'SKG - Thessaloniki',
      arrivalAirport: 'JMK - Mykonos',
      passengerCount: 4,
      crewCount: 2,
      specialNotes: 'Database test order',
      deliveryLocation: 'Gate 1',
      deliveryTime: '14:30',
      deliveryInstructions: 'Test delivery instructions',
      status: 'pending',
      kitchenLocation: 'Thessaloniki',
      cancellationPolicyAccepted: true,
      advanceNoticeConfirmation: true,
      deliveryFee: 150.0,
      paymentStatus: 'pending',
      paymentMethod: 'invoice',
      totalPrice: 5000 // €50.00
    }).returning();
    
    console.log('Test order created:', testOrder);
    
    // Create test order items
    const testItems = await db.insert(orderItems).values([
      {
        orderId: testOrder.id,
        menuItemId: 1,
        quantity: 2,
        price: 2000, // €20.00
        specialInstructions: 'Test item 1'
      },
      {
        orderId: testOrder.id,
        menuItemId: 2,
        quantity: 1,
        price: 1000, // €10.00
        specialInstructions: 'Test item 2'
      }
    ]).returning();
    
    console.log('Test order items created:', testItems);
    
    console.log('\n=== TEST COMPLETED ===');
    console.log(`Order ID: ${testOrder.id}`);
    console.log(`Order Number: ${testOrder.orderNumber}`);
    console.log('Now check the admin panel to see if this order appears.');
    
    return {
      success: true,
      orderId: testOrder.id,
      orderNumber: testOrder.orderNumber
    };
    
  } catch (error) {
    console.error('Error creating test order:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
createTestOrder().then(result => {
  console.log('Test result:', result);
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});