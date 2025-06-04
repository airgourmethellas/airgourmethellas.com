import PDFDocument from 'pdfkit';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { Order, OrderItem } from '@shared/schema';
import dotenv from 'dotenv';
import { formatPriceWithSymbol } from '../utils/price-formatter';
import { resolveProjectPath } from '../path-utils';

// Load environment variables
dotenv.config();

// Check for required environment variables
const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'COMPANY_EMAIL'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn(`Missing email environment variables: ${missingEnvVars.join(', ')}`);
  console.warn('Email functionality will be limited until these are provided');
}

/**
 * Generate a PDF invoice for an order
 */
export async function generateInvoice(order: Order, items: OrderItem[]): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Create a PDF document
      const doc = new PDFDocument({ margin: 50 });
      
      // Set up file path with defensive checks
      const invoiceDir = resolveProjectPath('tmp');
      // Ensure directory exists
      if (!fs.existsSync(invoiceDir)) {
        fs.mkdirSync(invoiceDir, { recursive: true });
      }
      
      // Validate order ID before using in path
      if (!order.id) {
        throw new Error('Order ID is required for invoice generation');
      }
      const filePath = path.join(invoiceDir, `invoice-${order.id}.pdf`);
      const writeStream = fs.createWriteStream(filePath);
      
      // Pipe PDF to file
      doc.pipe(writeStream);
      
      // Configure document metadata
      doc.info.Title = `Air Gourmet Hellas Invoice #${order.id}`;
      doc.info.Author = 'Air Gourmet Hellas';
      
      // Add logo if available with defensive checks
      try {
        const logoPath = resolveProjectPath('public', 'AGLogo.png');
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, {
            fit: [150, 100],
            align: 'right'
          });
        }
      } catch (error) {
        console.warn('Could not add logo to invoice', error);
      }
      
      // Add company information
      doc.fontSize(16).text('Air Gourmet Hellas', { align: 'left' });
      doc.fontSize(10).text('Flight Catering Services', { align: 'left' });
      doc.moveDown();
      doc.fontSize(8)
        .text('1072 Thessaloniki Airport', { align: 'left' })
        .text('Thessaloniki, Greece', { align: 'left' })
        .text('Tel: +30 123 456 7890', { align: 'left' })
        .text('Email: info@airgourmethellas.com', { align: 'left' });
      
      // Add invoice title and number
      doc.moveDown();
      doc.fontSize(20).text('INVOICE', { align: 'center' });
      doc.fontSize(12).text(`Invoice #: ${order.id}`, { align: 'center' });
      doc.fontSize(10).text(`Date: ${new Date(order.created || Date.now()).toLocaleDateString()}`, { align: 'center' });
      doc.moveDown();
      
      // Add customer information
      doc.fontSize(12).text('Flight Information', { underline: true });
      doc.fontSize(10)
        .text(`Aircraft Type: ${order.aircraftType || 'N/A'}`)
        .text(`Tail Number: ${order.tailNumber || 'N/A'}`)
        .text(`Date: ${new Date(order.departureDate || Date.now()).toLocaleDateString()}`)
        .text(`Departure Time: ${order.departureTime || 'N/A'}`)
        .text(`Departure Airport: ${order.departureAirport || 'N/A'}`) 
        .text(`Arrival Airport: ${order.arrivalAirport || 'N/A'}`)
        .text(`Kitchen Location: ${order.kitchenLocation || 'N/A'}`);
      
      doc.moveDown();
      
      // Add order items
      doc.fontSize(12).text('Order Details', { underline: true });
      doc.moveDown();
      
      // Create a table for order items
      const tableTop = doc.y;
      const itemsPerPage = 20;
      let itemCount = 0;
      
      // Column headers
      const tableHeaders = ['Item', 'Quantity', 'Price', 'Total'];
      const columnWidths = {
        item: 250,
        quantity: 50,
        price: 100,
        total: 100
      };
      
      // Draw table headers
      doc.font('Helvetica-Bold')
        .fontSize(10)
        .text(tableHeaders[0], doc.x, tableTop, { width: columnWidths.item, align: 'left' })
        .text(tableHeaders[1], doc.x + columnWidths.item, tableTop, { width: columnWidths.quantity, align: 'center' })
        .text(tableHeaders[2], doc.x + columnWidths.item + columnWidths.quantity, tableTop, { width: columnWidths.price, align: 'right' })
        .text(tableHeaders[3], doc.x + columnWidths.item + columnWidths.quantity + columnWidths.price, tableTop, { width: columnWidths.total, align: 'right' });
      
      doc.moveDown();
      
      // Draw a line under the headers
      doc.moveTo(doc.x, doc.y)
        .lineTo(doc.x + columnWidths.item + columnWidths.quantity + columnWidths.price + columnWidths.total, doc.y)
        .stroke();
      
      doc.moveDown();
      
      // Draw table rows
      doc.font('Helvetica');
      let y = doc.y;
      
      // Calculate subtotal
      let subtotal = 0;
      
      // Add items to table
      items.forEach((item, index) => {
        itemCount++;
        
        // Check if we need a new page
        if (itemCount > itemsPerPage) {
          doc.addPage();
          y = doc.y = 50;
          itemCount = 1;
        }
        
        const price = item.price || 0;
        const totalPrice = price * (item.quantity || 1);
        subtotal += totalPrice;
        
        doc.fontSize(9)
          .text(item.name || 'Unknown Item', doc.x, y, { width: columnWidths.item, align: 'left' })
          .text(item.quantity?.toString() || '1', doc.x + columnWidths.item, y, { width: columnWidths.quantity, align: 'center' })
          .text(formatPriceWithSymbol(price), doc.x + columnWidths.item + columnWidths.quantity, y, { width: columnWidths.price, align: 'right' })
          .text(formatPriceWithSymbol(totalPrice), doc.x + columnWidths.item + columnWidths.quantity + columnWidths.price, y, { width: columnWidths.total, align: 'right' });
        
        y = doc.y + 10;
        doc.y = y;
      });
      
      // Draw a line under the items
      doc.moveTo(doc.x, doc.y)
        .lineTo(doc.x + columnWidths.item + columnWidths.quantity + columnWidths.price + columnWidths.total, doc.y)
        .stroke();
      
      doc.moveDown();
      
      // Add totals
      const vatRate = 0.13; // 13% VAT in Greece
      const vatAmount = subtotal * vatRate;
      const total = subtotal + vatAmount;
      
      doc.fontSize(10)
        .text('Subtotal:', doc.x + columnWidths.item + columnWidths.quantity, doc.y, { width: columnWidths.price, align: 'right' })
        .text(formatPriceWithSymbol(subtotal), doc.x + columnWidths.item + columnWidths.quantity + columnWidths.price, doc.y, { width: columnWidths.total, align: 'right' });
      
      doc.moveDown();
      
      doc.text('VAT (13%):', doc.x + columnWidths.item + columnWidths.quantity, doc.y, { width: columnWidths.price, align: 'right' })
        .text(formatPriceWithSymbol(vatAmount), doc.x + columnWidths.item + columnWidths.quantity + columnWidths.price, doc.y, { width: columnWidths.total, align: 'right' });
      
      doc.moveDown();
      
      doc.font('Helvetica-Bold')
        .text('TOTAL:', doc.x + columnWidths.item + columnWidths.quantity, doc.y, { width: columnWidths.price, align: 'right' })
        .text(formatPriceWithSymbol(total), doc.x + columnWidths.item + columnWidths.quantity + columnWidths.price, doc.y, { width: columnWidths.total, align: 'right' });
      
      // Add payment information
      doc.moveDown(2);
      doc.font('Helvetica');
      doc.fontSize(10).text('Payment Information', { underline: true });
      doc.fontSize(9)
        .text('Bank: National Bank of Greece')
        .text('Account Name: Air Gourmet Hellas SA')
        .text('IBAN: GR1234567890123456789012345')
        .text('SWIFT/BIC: ETHNGRAA');
      
      // Add terms and conditions
      doc.moveDown(2);
      doc.fontSize(10).text('Terms and Conditions', { underline: true });
      doc.fontSize(8)
        .text('1. Payment is due within 30 days of invoice date')
        .text('2. Please include the invoice number in all payments')
        .text('3. For questions about this invoice, please contact accounts@airgourmethellas.com');
      
      // Add footer
      doc.fontSize(8).text('Thank you for your business!', { align: 'center' });
      
      // Finalize the PDF
      doc.end();
      
      // Handle file stream events
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
 * Send an invoice via email
 */
export async function sendInvoiceEmail(order: Order, invoicePath: string): Promise<boolean> {
  // Check if all required environment variables are set
  if (missingEnvVars.length > 0) {
    console.error('Cannot send email: Missing environment variables');
    return false;
  }
  
  try {
    // Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: parseInt(process.env.SMTP_PORT || '587') === 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    
    // Prepare recipients
    const recipients = [process.env.COMPANY_EMAIL || ''];
    if (order.customerEmail) {
      recipients.push(order.customerEmail);
    }
    
    // Format flight date
    const flightDate = order.flightDate 
      ? new Date(order.flightDate).toLocaleDateString() 
      : 'Unknown date';
    
    // Create email content
    const emailContent = {
      from: `"Air Gourmet Hellas" <${process.env.SMTP_USER}>`,
      to: recipients.join(', '),
      subject: `Invoice #${order.id} - Air Gourmet Hellas`,
      text: `
Dear ${order.customerName || 'Customer'},

Please find attached your invoice #${order.id} for your catering order on flight ${order.flightNumber || ''} (${flightDate}).

If you have any questions about this invoice, please contact us at finance@airgourmethellas.com.

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
    <p>Dear ${order.customerName || 'Customer'},</p>
    
    <p>Please find attached your invoice <strong>#${order.id}</strong> for your catering order on flight <strong>${order.flightNumber || ''}</strong> (${flightDate}).</p>
    
    <p>If you have any questions about this invoice, please contact us at <a href="mailto:finance@airgourmethellas.com">finance@airgourmethellas.com</a>.</p>
    
    <p>Thank you for choosing Air Gourmet Hellas for your flight catering needs.</p>
    
    <p>Best regards,<br>
    Air Gourmet Hellas Team</p>
  </div>
  
  <div style="background-color: #f2f2f2; padding: 10px; text-align: center; font-size: 12px; color: #666;">
    <p>Air Gourmet Hellas | Thessaloniki Airport | Tel: +30 123 456 7890</p>
    <p><a href="https://www.airgourmethellas.com">www.airgourmethellas.com</a></p>
  </div>
</div>
      `,
      attachments: [
        {
          filename: `Invoice-${order.id}-AirGourmetHellas.pdf`,
          path: invoicePath,
          contentType: 'application/pdf',
        }
      ]
    };
    
    // Send the email
    await transporter.sendMail(emailContent);
    
    return true;
  } catch (error) {
    console.error('Failed to send invoice email:', error);
    return false;
  }
}

/**
 * Generate and send an invoice for an order
 */
export async function processInvoiceRequest(order: Order, items: OrderItem[]): Promise<{
  success: boolean;
  invoicePath?: string;
  emailSent?: boolean;
  error?: string;
}> {
  try {
    // Generate the PDF invoice
    const invoicePath = await generateInvoice(order, items);
    
    // Try to send the email
    const emailSent = await sendInvoiceEmail(order, invoicePath);
    
    return {
      success: true,
      invoicePath,
      emailSent
    };
  } catch (error: any) {
    console.error('Invoice processing error:', error);
    return {
      success: false,
      error: error.message || 'Failed to process invoice request'
    };
  }
}