import { db } from '../db';
import { eq, asc } from 'drizzle-orm';
import { 
  orders, 
  orderStatusHistory, 
  type OrderStatus, 
  type Order, 
  type OrderStatusHistory, 
  type InsertOrderStatusHistory 
} from '@shared/schema';

/**
 * Gets order status history for a specific order
 */
export async function getOrderStatusHistory(orderId: number): Promise<OrderStatusHistory[]> {
  try {
    const history = await db.select()
      .from(orderStatusHistory)
      .where(eq(orderStatusHistory.orderId, orderId))
      .orderBy(asc(orderStatusHistory.timestamp));
    
    return history;
  } catch (error) {
    console.error('Error fetching order status history:', error);
    return [];
  }
}

/**
 * Create a new status history entry
 */
export async function createOrderStatusHistory(history: InsertOrderStatusHistory): Promise<OrderStatusHistory> {
  try {
    const [newHistory] = await db.insert(orderStatusHistory)
      .values(history)
      .returning();
    
    return newHistory;
  } catch (error) {
    console.error('Error creating order status history:', error);
    throw error;
  }
}

/**
 * Update the status of an order
 */
export async function updateOrderStatus(orderId: number, status: OrderStatus): Promise<Order> {
  try {
    const [updatedOrder] = await db.update(orders)
      .set({ 
        status: status,
        updated: new Date()
      })
      .where(eq(orders.id, orderId))
      .returning();
    
    if (!updatedOrder) {
      throw new Error(`Order with ID ${orderId} not found`);
    }
    
    return updatedOrder;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}