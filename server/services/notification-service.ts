import { Order, User } from '@shared/schema';
import { storage } from '../storage';
import { sendEmail as sendResendEmail } from './email-service';
import { ZapierService } from './zapier-service';
import { logger } from '../utils/logger';

// Email addresses for different departments
const OPERATIONS_EMAIL = 'ops@airgourmet.gr';
const KITCHEN_EMAIL_THESSALONIKI = 'kitchen-thessaloniki@airgourmet.gr';
const KITCHEN_EMAIL_MYKONOS = 'kitchen-mykonos@airgourmet.gr';
const DELIVERY_EMAIL = 'delivery@airgourmet.gr';

export enum NotificationType {
  NEW_ORDER = 'new_order',
  ORDER_UPDATED = 'order_updated',
  ORDER_CANCELLED = 'order_cancelled',
  ORDER_READY = 'order_ready',
  ORDER_DELIVERED = 'order_delivered',
  ADMIN_ALERT = 'admin_alert',
  CLIENT_ALERT = 'client_alert'
}

/**
 * Log notification to database for tracking
 */
async function logNotification(
  orderId: number, 
  type: NotificationType, 
  recipient: string, 
  success: boolean
): Promise<void> {
  await storage.createActivityLog({
    userId: 0, // System
    action: `NOTIFICATION_${type.toUpperCase()}`,
    details: JSON.stringify({
      orderId,
      recipient,
      success,
      timestamp: new Date().toISOString()
    }),
    entityType: 'order',
    entityId: orderId,
    orderId: orderId
  });
}

/**
 * Generate HTML content for email based on notification type and order
 */
function generateEmailContent(type: NotificationType, order: Order): string {
  // Determine if this is going to a client or internal team
  // For now we'll use the same templates for everyone and enhance later
  const orderLink = `https://airgourmet.gr/admin/orders/${order.id}`;
  
  // Get notification content based on type
  switch (type) {
    case NotificationType.NEW_ORDER:
      // For new orders for clients, use the fancy template
      if (order.userId) {
        return generateClientNewOrderEmail(order);
      }
      // For internal team use the original template
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0047AB;">New Order Received</h2>
          <p>A new order has been placed and requires your attention.</p>
          
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p style="margin: 5px 0;"><strong>Aircraft:</strong> ${order.aircraftType} (${order.tailNumber})</p>
            <p style="margin: 5px 0;"><strong>Departure:</strong> ${order.departureDate} at ${order.departureTime}</p>
            <p style="margin: 5px 0;"><strong>Departure Airport:</strong> ${order.departureAirport}</p>
            <p style="margin: 5px 0;"><strong>Passenger Count:</strong> ${order.passengerCount}</p>
            <p style="margin: 5px 0;"><strong>Crew Count:</strong> ${order.crewCount}</p>
            <p style="margin: 5px 0;"><strong>Delivery Location:</strong> ${order.deliveryLocation}</p>
            <p style="margin: 5px 0;"><strong>Total Amount:</strong> €${(order.totalPrice / 100).toFixed(2)}</p>
          </div>
          
          <a href="${orderLink}" style="background-color: #0047AB; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">View Order Details</a>
          
          <p style="margin-top: 30px; font-size: 12px; color: #777;">This is an automated message from Air Gourmet Hellas. Please do not reply to this email.</p>
        </div>
      `;
      
    case NotificationType.ORDER_UPDATED:
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FFA500;">Order Updated</h2>
          <p>Order #${order.orderNumber} has been updated and requires your attention.</p>
          
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> ${order.status}</p>
            <p style="margin: 5px 0;"><strong>Aircraft:</strong> ${order.aircraftType} (${order.tailNumber})</p>
            <p style="margin: 5px 0;"><strong>Departure:</strong> ${order.departureDate} at ${order.departureTime}</p>
          </div>
          
          <a href="${orderLink}" style="background-color: #FFA500; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">View Updated Order</a>
          
          <p style="margin-top: 30px; font-size: 12px; color: #777;">This is an automated message from Air Gourmet Hellas. Please do not reply to this email.</p>
        </div>
      `;
      
    case NotificationType.ORDER_CANCELLED:
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF0000;">Order Cancelled</h2>
          <p>Order #${order.orderNumber} has been cancelled.</p>
          
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p style="margin: 5px 0;"><strong>Aircraft:</strong> ${order.aircraftType} (${order.tailNumber})</p>
            <p style="margin: 5px 0;"><strong>Departure:</strong> ${order.departureDate} at ${order.departureTime}</p>
          </div>
          
          <a href="${orderLink}" style="background-color: #FF0000; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">View Cancelled Order</a>
          
          <p style="margin-top: 30px; font-size: 12px; color: #777;">This is an automated message from Air Gourmet Hellas. Please do not reply to this email.</p>
        </div>
      `;
      
    case NotificationType.ORDER_READY:
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #008000;">Order Ready for Delivery</h2>
          <p>Order #${order.orderNumber} is now ready for delivery.</p>
          
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p style="margin: 5px 0;"><strong>Pickup Location:</strong> ${order.kitchenLocation || 'Main Kitchen'}</p>
            <p style="margin: 5px 0;"><strong>Delivery Location:</strong> ${order.deliveryLocation}</p>
            <p style="margin: 5px 0;"><strong>Delivery Time:</strong> ${order.deliveryTime || 'As soon as possible'}</p>
          </div>
          
          <a href="${orderLink}" style="background-color: #008000; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">View Order Details</a>
          
          <p style="margin-top: 30px; font-size: 12px; color: #777;">This is an automated message from Air Gourmet Hellas. Please do not reply to this email.</p>
        </div>
      `;
      
    case NotificationType.ORDER_DELIVERED:
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4B0082;">Order Delivered</h2>
          <p>Order #${order.orderNumber} has been successfully delivered.</p>
          
          <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p style="margin: 5px 0;"><strong>Delivery Time:</strong> ${new Date().toLocaleTimeString()}</p>
            <p style="margin: 5px 0;"><strong>Total Amount:</strong> €${(order.totalPrice / 100).toFixed(2)}</p>
          </div>
          
          <a href="${orderLink}" style="background-color: #4B0082; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">View Order Details</a>
          
          <p style="margin-top: 30px; font-size: 12px; color: #777;">This is an automated message from Air Gourmet Hellas. Please do not reply to this email.</p>
        </div>
      `;
    default:
      return '';
  }
}

/**
 * Generate a client-facing stylish email for new orders
 */
function generateClientNewOrderEmail(order: Order): string {
  // Determine the location based on the delivery location
  const location = order.deliveryLocation.includes("Thessaloniki") ? "Thessaloniki" : 
                  order.deliveryLocation.includes("Mykonos") ? "Mykonos" : 
                  "Our Facility";
  
  // Using the provided template
  return `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eaeaea; padding: 20px; border-radius: 8px;">
      <h2 style="color: #004080;">✈️ Air Gourmet Hellas</h2>
      <p>Hello <strong>Client</strong>,</p>

      <p>We have received your order for:</p>

      <ul>
        <li><strong>Flight:</strong> ${order.tailNumber}</li>
        <li><strong>Departure Date:</strong> ${order.departureDate}</li>
        <li><strong>Passengers:</strong> ${order.passengerCount}</li>
        <li><strong>Crew:</strong> ${order.crewCount}</li>
      </ul>

      <p>Your inflight catering is now being prepared with care by our team in <strong>${location}</strong>.</p>

      <p style="margin-top: 20px;">If you have any questions or last-minute changes, feel free to reply to this email or contact us at <a href="mailto:orders@airgourmet.gr">orders@airgourmet.gr</a>.</p>

      <p style="margin-top: 30px;">Thank you for flying with Air Gourmet Hellas.<br>We look forward to delighting your passengers.</p>

      <hr style="margin-top: 30px;">
      <small style="color: #888;">This is an automated message from Air Gourmet Hellas | Thessaloniki & Mykonos</small>
    </div>
  `;
}

/**
 * Determine the appropriate recipients based on notification type and order details
 */
async function getRecipients(type: NotificationType, order: Order): Promise<string[]> {
  const recipients: string[] = [];
  
  // Get client (order creator) email
  const client = await storage.getUser(order.userId);
  
  // Determine kitchen email based on location
  const kitchenEmail = 
    order.kitchenLocation === 'Thessaloniki' ? 
    KITCHEN_EMAIL_THESSALONIKI : KITCHEN_EMAIL_MYKONOS;
  
  switch (type) {
    case NotificationType.NEW_ORDER:
      // Operations team and kitchen staff
      recipients.push(OPERATIONS_EMAIL, kitchenEmail);
      break;
      
    case NotificationType.ORDER_UPDATED:
    case NotificationType.ORDER_CANCELLED:
      // Client, kitchen staff
      if (client?.email) recipients.push(client.email);
      recipients.push(kitchenEmail);
      break;
      
    case NotificationType.ORDER_READY:
      // Client, delivery team
      if (client?.email) recipients.push(client.email);
      recipients.push(DELIVERY_EMAIL);
      break;
      
    case NotificationType.ORDER_DELIVERED:
      // Client, operations team
      if (client?.email) recipients.push(client.email);
      recipients.push(OPERATIONS_EMAIL);
      break;
  }
  
  return recipients;
}

/**
 * Generate subject for email based on notification type and order
 */
function getSubject(type: NotificationType, order: Order): string {
  switch (type) {
    case NotificationType.NEW_ORDER:
      return `[URGENT] New Order #${order.orderNumber} - ${order.kitchenLocation}`;
    case NotificationType.ORDER_UPDATED:
      return `Order #${order.orderNumber} Updated - ${order.kitchenLocation}`;
    case NotificationType.ORDER_CANCELLED:
      return `Order #${order.orderNumber} Cancelled - ${order.kitchenLocation}`;
    case NotificationType.ORDER_READY:
      return `Order #${order.orderNumber} Ready for Delivery - ${order.kitchenLocation}`;
    case NotificationType.ORDER_DELIVERED:
      return `Order #${order.orderNumber} Successfully Delivered`;
    default:
      return `Air Gourmet Hellas - Order #${order.orderNumber} Update`;
  }
}

/**
 * Main function to send notifications for a specific order and event type
 */
export async function sendOrderNotification(
  orderId: number, 
  type: NotificationType
): Promise<boolean[]> {
  try {
    // Get order details
    const order = await storage.getOrder(orderId);
    if (!order) {
      logger.error(`Cannot send notification - Order #${orderId} not found`);
      return [false];
    }
    
    // Get recipients
    const recipients = await getRecipients(type, order);
    if (recipients.length === 0) {
      logger.warn(`No recipients found for notification type ${type} for order #${orderId}`);
      return [false];
    }
    
    // Generate HTML content
    const htmlContent = generateEmailContent(type, order);
    const subject = getSubject(type, order);
    
    // Send email to all recipients
    const emailResult = await sendResendEmail({
      to: recipients,
      subject,
      html: htmlContent
    });
    
    // Log notifications
    await Promise.all(
      recipients.map(recipient => 
        logNotification(orderId, type, recipient, emailResult)
      )
    );
    
    // Only send Zapier webhook for certain notification types
    let zapierResult = false;
    if (type === NotificationType.NEW_ORDER || 
        type === NotificationType.ORDER_UPDATED || 
        type === NotificationType.ORDER_CANCELLED) {
      
      // Map notification type to event name
      const eventName = type === NotificationType.NEW_ORDER 
        ? 'order_created' 
        : type === NotificationType.ORDER_UPDATED 
          ? 'order_updated' 
          : 'order_cancelled';
      
      // Get Zapier service instance
      const zapierService = ZapierService.getInstance();
      
      // Send order data to Zapier for workflow automation
      zapierResult = await zapierService.notifyOrderEvent(eventName, orderId, order);
      
      // Log Zapier notification
      await logNotification(
        orderId, 
        type, 
        'zapier-automation', 
        zapierResult
      );
      
      logger.info(`Zapier integration ${zapierResult ? 'succeeded' : 'failed'} for order #${order.orderNumber} (${type})`);
    }
    
    return [emailResult, zapierResult];
  } catch (error) {
    logger.error('Error sending order notification:', error);
    return [false, false];
  }
}

/**
 * Get the email address for a kitchen based on location
 */
export function getKitchenEmail(location: string): string {
  return location.toLowerCase() === 'thessaloniki' ? 
    KITCHEN_EMAIL_THESSALONIKI : KITCHEN_EMAIL_MYKONOS;
}

/**
 * Function to send SMS notifications (placeholder for future implementation)
 */
export async function sendSMSNotification(
  phoneNumber: string,
  message: string
): Promise<boolean> {
  // This is a placeholder for future SMS integration
  console.log(`SMS would be sent to ${phoneNumber}: ${message}`);
  return true;
}