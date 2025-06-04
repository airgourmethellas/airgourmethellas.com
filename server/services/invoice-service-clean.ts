import PDFDocument from 'pdfkit';
import { Order, OrderItem } from '@shared/schema';
import nodemailer from 'nodemailer';

// Euro formatting utility
const formatPriceWithSymbol = (price: number): string => {
  return `€${price.toFixed(2)}`;
};

export async function generateInvoicePDF(order: Order, orderItems: OrderItem[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text('Air Gourmet Hellas', { align: 'center' });
      doc.fontSize(12).text('Premium Flight Catering Services', { align: 'center' });
      doc.fontSize(10).text('Thessaloniki | Mykonos', { align: 'center' });
      doc.moveDown();
      
      // Invoice details
      doc.fontSize(16).text('INVOICE', { align: 'center', underline: true });
      doc.fontSize(12).text(`Invoice #: ${order.id}`, { align: 'center' });
      doc.fontSize(10).text(`Date: ${new Date(order.created).toLocaleDateString()}`, { align: 'center' });
      doc.moveDown();
      
      // Flight Information
      doc.fontSize(12).text('Flight Information', { underline: true });
      doc.fontSize(10)
        .text(`Aircraft Type: ${order.aircraftType || 'N/A'}`)
        .text(`Date: ${new Date(order.deliveryTime).toLocaleDateString()}`)
        .text(`Delivery Time: ${order.deliveryTime || 'N/A'}`)
        .text(`Delivery Location: ${order.deliveryLocation || 'N/A'}`) 
        .text(`Arrival Airport: ${order.arrivalAirport || 'N/A'}`);
      
      doc.moveDown();
      
      // Order details table
      doc.fontSize(12).text('Order Details', { underline: true });
      doc.moveDown(0.5);
      
      // Table headers
      const startY = doc.y;
      const columnWidths = {
        item: 200,
        quantity: 80,
        price: 80,
        total: 80
      };
      
      doc.fontSize(10)
        .text('Item', doc.x, startY, { width: columnWidths.item, align: 'left' })
        .text('Qty', doc.x + columnWidths.item, startY, { width: columnWidths.quantity, align: 'center' })
        .text('Price', doc.x + columnWidths.item + columnWidths.quantity, startY, { width: columnWidths.price, align: 'right' })
        .text('Total', doc.x + columnWidths.item + columnWidths.quantity + columnWidths.price, startY, { width: columnWidths.total, align: 'right' });
      
      // Line under headers
      doc.moveTo(doc.x, doc.y + 5)
         .lineTo(doc.x + columnWidths.item + columnWidths.quantity + columnWidths.price + columnWidths.total, doc.y + 5)
         .stroke();
      
      // Order items
      let y = doc.y + 15;
      let subtotal = 0;
      
      orderItems.forEach((item) => {
        const price = item.price || 0;
        const totalPrice = price * (item.quantity || 1);
        subtotal += totalPrice;
        
        doc.fontSize(9)
          .text('Menu Item', doc.x, y, { width: columnWidths.item, align: 'left' })
          .text(item.quantity?.toString() || '1', doc.x + columnWidths.item, y, { width: columnWidths.quantity, align: 'center' })
          .text(formatPriceWithSymbol(price), doc.x + columnWidths.item + columnWidths.quantity, y, { width: columnWidths.price, align: 'right' })
          .text(formatPriceWithSymbol(totalPrice), doc.x + columnWidths.item + columnWidths.quantity + columnWidths.price, y, { width: columnWidths.total, align: 'right' });
        
        y = doc.y + 10;
        doc.y = y;
      });
      
      // Totals
      doc.moveDown();
      const totalsX = doc.x + columnWidths.item + columnWidths.quantity;
      
      doc.fontSize(10)
        .text('Subtotal:', totalsX, doc.y, { width: columnWidths.price, align: 'right' })
        .text(formatPriceWithSymbol(subtotal), totalsX + columnWidths.price, doc.y, { width: columnWidths.total, align: 'right' });
      
      const vat = subtotal * 0.24;
      doc.moveDown(0.5)
        .text('VAT (24%):', totalsX, doc.y, { width: columnWidths.price, align: 'right' })
        .text(formatPriceWithSymbol(vat), totalsX + columnWidths.price, doc.y, { width: columnWidths.total, align: 'right' });
      
      const total = subtotal + vat;
      doc.moveDown(0.5)
        .fontSize(12)
        .text('Total:', totalsX, doc.y, { width: columnWidths.price, align: 'right' })
        .text(formatPriceWithSymbol(total), totalsX + columnWidths.price, doc.y, { width: columnWidths.total, align: 'right' });
      
      // Footer
      doc.moveDown(2);
      doc.fontSize(8)
        .text('Thank you for choosing Air Gourmet Hellas', { align: 'center' })
        .text('For inquiries: info@airgourmethellas.com | +30 210 123 4567', { align: 'center' });
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export async function sendInvoiceEmail(order: Order, invoicePDF: Buffer): Promise<void> {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('Email configuration missing');
  }
  
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: parseInt(process.env.SMTP_PORT || '587') === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  
  const recipients = [process.env.COMPANY_EMAIL || ''];
  
  const deliveryDate = order.deliveryTime 
    ? new Date(order.deliveryTime).toLocaleDateString() 
    : 'Unknown date';
  
  const emailContent = {
    from: `"Air Gourmet Hellas" <${process.env.SMTP_USER}>`,
    to: recipients.join(', '),
    subject: `Invoice #${order.id} - Air Gourmet Hellas`,
    text: `
Dear Customer,

Please find attached your invoice #${order.id} for your catering order on ${deliveryDate}.

If you have any questions about this invoice, please contact us at finance@airgourmethellas.com.

Thank you for choosing Air Gourmet Hellas for your flight catering needs.

Best regards,
Air Gourmet Hellas Team
    `,
    html: `
      <h2>Air Gourmet Hellas - Invoice</h2>
      <p>Dear Customer,</p>
      <p>Please find attached your invoice #${order.id} for your catering order on ${deliveryDate}.</p>
      <p>If you have any questions about this invoice, please contact us at <a href="mailto:finance@airgourmethellas.com">finance@airgourmethellas.com</a>.</p>
      <p>Thank you for choosing Air Gourmet Hellas for your flight catering needs.</p>
      <p>Best regards,<br>Air Gourmet Hellas Team</p>
    `,
    attachments: [{
      filename: `invoice-${order.id}.pdf`,
      content: invoicePDF,
      contentType: 'application/pdf'
    }]
  };
  
  await transporter.sendMail(emailContent);
}