import PDFDocument from 'pdfkit';
import { Order, OrderItem, MenuItem } from '@shared/schema';
import { db } from '../db';

/**
 * Service to generate PDF documents for orders
 */
export class PDFService {
  /**
   * Creates a customs invoice PDF for an order
   * @param order The complete order with items
   * @param menuItems List of menu items referenced in the order
   * @returns Buffer containing the PDF document
   */
  static async generateCustomsInvoice(
    order: Order, 
    orderItems: OrderItem[], 
    menuItems: MenuItem[]
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        // Create a document
        const doc = new PDFDocument({ 
          size: 'A4',
          margin: 50,
          info: {
            Title: `Air Gourmet Hellas - Customs Invoice #${order.orderNumber}`,
            Author: 'Air Gourmet Hellas',
            Subject: 'Customs Documentation',
            Keywords: 'catering, aviation, customs, invoice'
          }
        });

        // Buffer to store PDF
        const chunks: Buffer[] = [];
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Add company logo and header
        doc.fontSize(18)
          .font('Helvetica-Bold')
          .text('AIR GOURMET HELLAS', { align: 'center' })
          .fontSize(12)
          .font('Helvetica')
          .text(`Location: ${order.departureAirport}`, { align: 'center' })
          .moveDown(0.5);

        // Add invoice title
        doc.fontSize(16)
          .font('Helvetica-Bold')
          .text('CUSTOMS INVOICE', { align: 'center' })
          .moveDown(0.5);

        // Flight Information
        doc.fontSize(12)
          .font('Helvetica-Bold')
          .text('FLIGHT DETAILS')
          .moveDown(0.3);

        doc.font('Helvetica')
          .fontSize(10);

        // Get user info for company name
        const company = 'Private Operator';  // Default value

        const flightDetails = [
          ['Invoice Number:', order.orderNumber],
          ['Date:', new Date(order.created).toLocaleDateString('en-GB')],
          ['Aircraft Type:', order.aircraftType],
          ['Registration Number:', order.tailNumber],
          ['Departure:', `${order.departureAirport} - ${order.departureDate} at ${order.departureTime}`],
          ['Arrival:', order.arrivalAirport || 'N/A'],
          ['Passengers:', order.passengerCount.toString()],
          ['Crew:', order.crewCount.toString()],
        ];

        // Draw headers and values manually instead of using table
        let y = doc.y;
        const colWidth = 250;
        const detailsStartX = 50;
        
        doc.font('Helvetica-Bold').fontSize(10);
        doc.text('Field', detailsStartX, y);
        doc.text('Value', detailsStartX + 150, y);
        y += 20;
        
        flightDetails.forEach(row => {
          doc.font('Helvetica-Bold').fontSize(10);
          doc.text(row[0], detailsStartX, y);
          doc.font('Helvetica').fontSize(10);
          doc.text(row[1], detailsStartX + 150, y);
          y += 20;
        });
        
        doc.y = y;

        doc.moveDown(1);

        // Add a line for visual separation
        doc.strokeColor('#cccccc')
          .lineWidth(1)
          .moveTo(50, doc.y)
          .lineTo(550, doc.y)
          .stroke()
          .moveDown(0.5);

        // Catering items header
        doc.fontSize(12)
          .font('Helvetica-Bold')
          .text('CATERING ITEMS')
          .moveDown(0.3);

        // Draw headers manually
        const headers = ['Item Description', 'Quantity', 'Unit', 'Unit Price', 'Total'];
        const colWidths = [200, 60, 80, 80, 80];
        const tableStartX = 50;
        
        let tableY = doc.y;
        
        // Draw header row
        doc.font('Helvetica-Bold').fontSize(10);
        headers.forEach((header, i) => {
          let x = tableStartX;
          // Calculate x position
          for (let j = 0; j < i; j++) {
            x += colWidths[j];
          }
          doc.text(header, x, tableY, { width: colWidths[i], align: i === 0 ? 'left' : 'right' });
        });
        
        tableY += 20;
        
        // Draw item rows
        orderItems.forEach(item => {
          const menuItem = menuItems.find(m => m.id === item.menuItemId);
          if (!menuItem) return;
          
          const price = order.departureAirport.includes('SKG') ? 
            menuItem.priceThessaloniki / 100 : menuItem.priceMykonos / 100;
          
          const total = price * item.quantity;
          
          const rowData = [
            menuItem.name, 
            item.quantity.toString(), 
            menuItem.unit || 'item',
            `€${price.toFixed(2)}`,
            `€${total.toFixed(2)}`
          ];
          
          doc.font('Helvetica').fontSize(10);
          
          let x = tableStartX;
          rowData.forEach((cellData, i) => {
            if (i > 0) x += colWidths[i-1];
            doc.text(cellData, x, tableY, { 
              width: colWidths[i], 
              align: i === 0 ? 'left' : 'right'
            });
          });
          
          tableY += 20;
          
          // Check if we need a new page
          if (tableY > doc.page.height - 150) {
            doc.addPage();
            tableY = 50;
          }
        });
        
        doc.y = tableY + 20;

        // Total amount
        doc.fontSize(11)
          .font('Helvetica-Bold')
          .text(`TOTAL AMOUNT: €${(order.totalPrice / 100).toFixed(2)}`, { align: 'right' })
          .moveDown(1);

        // Customs declaration
        doc.fontSize(10)
          .font('Helvetica')
          .text('CUSTOMS DECLARATION', { underline: true })
          .moveDown(0.5)
          .text('This is to certify that the above-listed items are exclusively for consumption on board the declared aircraft and comply with all applicable customs and health regulations. All listed food items are not intended for commercial sale and will be consumed in international airspace or disposed of before arrival at the destination.', { align: 'justify' })
          .moveDown(1);

        // Signatures
        doc.fontSize(10)
          .text('Authorized Signature: _________________________', { align: 'left' })
          .moveDown(0.5)
          .text('Air Gourmet Hellas Representative: _________________________', { align: 'left' })
          .moveDown(0.5)
          .text('Date: _________________________', { align: 'left' })
          .moveDown(1);

        // Footer with contact info
        doc.fontSize(8)
          .text('Air Gourmet Hellas | Tel: +30 2310 123456 | Email: info@airgourmethellas.com', { align: 'center' })
          .text('VAT Reg: EL123456789 | www.airgourmethellas.com', { align: 'center' });

        // Finalize the PDF
        doc.end();

      } catch (error) {
        reject(error);
      }
    });
  }
}