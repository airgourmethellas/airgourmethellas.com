import PDFDocument from 'pdfkit';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { Order, OrderItem } from '@shared/schema';
import { storage } from './storage';

// Formatter for price display
function formatPrice(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

/**
 * Generate a PDF invoice for an order
 */
export async function generateInvoice(order: Order, items: OrderItem[]): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Create PDF document
      const doc = new PDFDocument();
      
      // Create directory if it doesn't exist
      const tmpDir = path.join(process.cwd(), 'tmp');
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      
      // Set up file paths
      const filePath = path.join(tmpDir, `invoice-${order.id}.pdf`);
      const writeStream = fs.createWriteStream(filePath);
      
      // Pipe PDF to file
      doc.pipe(writeStream);
      
      // Add logo if available
      try {
        const logoPath = path.join(process.cwd(), 'public', 'AGLogo.png');
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, {
            fit: [150, 100],
            align: 'right'
          });
        }
      } catch (error) {
        console.warn('Could not add logo to invoice', error);
      }
      
      // Add header
      doc.fontSize(20).text('Air Gourmet Hellas', { align: 'left' });
      doc.fontSize(12).text('Flight Catering Services', { align: 'left' });
      doc.moveDown();
      
      // Add invoice title and details
      doc.fontSize(18).text('INVOICE', { align: 'center' });
      doc.fontSize(12).text(`Invoice #: ${order.id}`, { align: 'center' });
      doc.fontSize(10).text(`Order #: ${order.orderNumber}`, { align: 'center' });
      doc.fontSize(10).text(`Date: ${new Date(order.created).toLocaleDateString()}`, { align: 'center' });
      doc.moveDown();
      
      // Add flight details
      doc.fontSize(12).text('Flight Details', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10)
        .text(`Aircraft: ${order.aircraftType}`)
        .text(`Tail Number: ${order.tailNumber}`)
        .text(`Departure: ${order.departureDate} at ${order.departureTime}`)
        .text(`From: ${order.departureAirport}`)
        .text(`To: ${order.arrivalAirport || 'N/A'}`)
        .text(`Passengers: ${order.passengerCount}`)
        .text(`Crew: ${order.crewCount}`);
      doc.moveDown();
      
      // We'll fetch user info outside this function and pass it to the document
      
      // Add order items (with pre-fetched menu item data)
      doc.fontSize(12).text('Order Items', { underline: true });
      doc.moveDown(0.5);
      
      // Draw table headers
      const startY = doc.y;
      doc.font('Helvetica-Bold');
      doc.text('Item', 50, startY, { width: 250 });
      doc.text('Qty', 300, startY, { width: 50, align: 'center' });
      doc.text('Price', 350, startY, { width: 100, align: 'right' });
      doc.text('Total', 450, startY, { width: 100, align: 'right' });
      
      // Draw a line
      doc.moveTo(50, doc.y + 10).lineTo(550, doc.y + 10).stroke();
      doc.moveDown();
      
      // Add items
      doc.font('Helvetica');
      let totalAmount = 0;
      let y = doc.y;
      
      // Process items and add to PDF
      for (const item of items) {
        const itemName = `Item #${item.menuItemId}`;
        const price = item.price;
        const quantity = item.quantity;
        const total = price * quantity;
        totalAmount += total;
        
        doc.text(itemName, 50, y, { width: 250 });
        doc.text(quantity.toString(), 300, y, { width: 50, align: 'center' });
        doc.text(formatPrice(price), 350, y, { width: 100, align: 'right' });
        doc.text(formatPrice(total), 450, y, { width: 100, align: 'right' });
        
        y = doc.y + 15;
        doc.y = y;
        
        // Add new page if needed
        if (doc.y > 700) {
          doc.addPage();
          y = doc.y = 50;
        }
      }
      
      // Draw line before totals
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();
      
      // Add delivery fee if applicable
      if (order.deliveryFee && order.deliveryFee > 0) {
        const deliveryFeeInCents = Math.round(order.deliveryFee * 100);
        doc.text('Delivery Fee:', 350, doc.y, { width: 100, align: 'right' });
        doc.text(formatPrice(deliveryFeeInCents), 450, doc.y, { width: 100, align: 'right' });
        totalAmount += deliveryFeeInCents;
        doc.moveDown();
      }
      
      // Calculate VAT (24% in Greece)
      const vatAmount = Math.round(totalAmount * 0.24);
      doc.text('Subtotal:', 350, doc.y, { width: 100, align: 'right' });
      doc.text(formatPrice(totalAmount), 450, doc.y, { width: 100, align: 'right' });
      doc.moveDown();
      
      doc.text('VAT (24%):', 350, doc.y, { width: 100, align: 'right' });
      doc.text(formatPrice(vatAmount), 450, doc.y, { width: 100, align: 'right' });
      doc.moveDown();
      
      // Total with VAT
      const grandTotal = totalAmount + vatAmount;
      doc.font('Helvetica-Bold');
      doc.text('TOTAL:', 350, doc.y, { width: 100, align: 'right' });
      doc.text(formatPrice(grandTotal), 450, doc.y, { width: 100, align: 'right' });
      doc.moveDown(2);
      
      // Add payment information
      doc.font('Helvetica');
      doc.fontSize(10).text('Payment Information', { underline: true });
      doc.fontSize(8)
        .text('Bank: National Bank of Greece')
        .text('Account Name: Air Gourmet Hellas SA')
        .text('IBAN: GR00 0000 0000 0000 0000 0000 000')
        .text('SWIFT/BIC: ETHNGRAA');
      doc.moveDown();
      
      // Add terms and policies
      doc.fontSize(10).text('Terms & Conditions', { underline: true });
      doc.fontSize(8)
        .text('1. Payment due within 30 days of invoice date')
        .text('2. For any queries regarding this invoice, please contact accounts@airgourmethellas.com')
        .text('3. Cancellation Policy: Orders must be cancelled at least 24 hours before scheduled delivery');
      
      // Add footer
      doc.fontSize(8)
        .text('Air Gourmet Hellas - Your Flight Catering Partner', 50, 750, { align: 'center' })
        .text('Tel: +30 231 123 4567 | Email: info@airgourmethellas.com', { align: 'center' })
        .text('www.airgourmethellas.com', { align: 'center' });
      
      // Finalize PDF
      doc.end();
      
      // Handle stream events
      writeStream.on('finish', () => {
        resolve(filePath);
      });
      
      writeStream.on('error', (err) => {
        reject(err);
      });
      
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Send invoice via email
 */
export async function emailInvoice(order: Order, invoicePath: string): Promise<boolean> {
  // Check for required environment variables
  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('Missing email configuration. Cannot send invoice email.');
    return false;
  }
  
  try {
    // Get user info for email
    const user = await storage.getUser(order.userId);
    if (!user || !user.email) {
      console.warn('Cannot send email: User email not found');
      return false;
    }
    
    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: parseInt(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    });
    
    // Recipient list
    const recipients = [user.email];
    if (process.env.COMPANY_EMAIL) {
      recipients.push(process.env.COMPANY_EMAIL);
    }
    
    // Email content
    const mailOptions = {
      from: `"Air Gourmet Hellas" <${process.env.SMTP_USER}>`,
      to: recipients.join(','),
      subject: `Invoice #${order.id} - Air Gourmet Hellas`,
      text: `
Dear ${user.firstName} ${user.lastName},

Thank you for your order with Air Gourmet Hellas.

Please find attached your invoice #${order.id} for your catering order on flight ${order.tailNumber} departing on ${order.departureDate}.

If you have any questions regarding this invoice, please contact our finance department at finance@airgourmethellas.com.

Thank you for choosing Air Gourmet Hellas for your flight catering needs.

Best regards,
Air Gourmet Hellas Team
      `,
      html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #003366; color: white; padding: 20px; text-align: center;">
    <h1>Air Gourmet Hellas</h1>
    <p>Flight Catering Excellence</p>
  </div>
  
  <div style="padding: 20px; border: 1px solid #ddd; background-color: #f9f9f9;">
    <p>Dear ${user.firstName} ${user.lastName},</p>
    
    <p>Thank you for your order with Air Gourmet Hellas.</p>
    
    <p>Please find attached your invoice <strong>#${order.id}</strong> for your catering order on flight <strong>${order.tailNumber}</strong> departing on ${order.departureDate}.</p>
    
    <p>If you have any questions regarding this invoice, please contact our finance department at <a href="mailto:finance@airgourmethellas.com">finance@airgourmethellas.com</a>.</p>
    
    <p>Thank you for choosing Air Gourmet Hellas for your flight catering needs.</p>
    
    <p>Best regards,<br>
    Air Gourmet Hellas Team</p>
  </div>
  
  <div style="background-color: #f2f2f2; padding: 10px; text-align: center; font-size: 12px; color: #666;">
    <p>Air Gourmet Hellas | Tel: +30 231 123 4567 | Email: info@airgourmethellas.com</p>
    <p><a href="https://www.airgourmethellas.com">www.airgourmethellas.com</a></p>
  </div>
</div>
      `,
      attachments: [
        {
          filename: `Invoice-${order.id}-AirGourmetHellas.pdf`,
          path: invoicePath,
          contentType: 'application/pdf'
        }
      ]
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    return true;
    
  } catch (error) {
    console.error('Error sending invoice email:', error);
    return false;
  }
}

/**
 * Main function to generate and optionally email an invoice
 */
export async function sendInvoice(orderId: number, sendEmail: boolean = false): Promise<{
  success: boolean;
  filePath?: string;
  emailSent?: boolean;
  error?: string;
}> {
  try {
    // Get order and items
    const order = await storage.getOrder(orderId);
    if (!order) {
      return { 
        success: false, 
        error: 'Order not found' 
      };
    }
    
    const items = await storage.getOrderItems(orderId);
    if (!items || items.length === 0) {
      return { 
        success: false, 
        error: 'No items found for this order' 
      };
    }
    
    // Generate invoice
    const filePath = await generateInvoice(order, items);
    
    // Send email if requested
    let emailSent = false;
    if (sendEmail) {
      emailSent = await emailInvoice(order, filePath);
    }
    
    return {
      success: true,
      filePath,
      emailSent
    };
    
  } catch (error: any) {
    console.error('Error sending invoice:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate invoice'
    };
  }
}