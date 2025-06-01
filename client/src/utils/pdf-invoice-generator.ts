import jsPDF from 'jspdf';
import { OrderFormData } from '@/pages/client/new-order';
import { MenuItem } from '@shared/schema';

interface InvoiceData {
  formData: OrderFormData;
  menuItems: MenuItem[];
  orderNumber?: string;
}

export function generateInvoicePDF(data: InvoiceData): void {
  const { formData, menuItems, orderNumber = `ORD-${Date.now()}` } = data;
  
  // Create new PDF document
  const doc = new jsPDF();
  
  // Set font
  doc.setFont('helvetica');
  
  // Company Header
  doc.setFontSize(20);
  doc.setTextColor(0, 102, 204); // Blue color
  doc.text('Air Gourmet Hellas', 20, 30);
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Flight Catering Services', 20, 40);
  doc.text('1072 Thessaloniki Airport, Greece', 20, 50);
  doc.text('Tel: +30 231 123 4567', 20, 60);
  doc.text('Email: info@airgourmethellas.com', 20, 70);
  
  // Invoice Title
  doc.setFontSize(16);
  doc.setTextColor(0, 102, 204);
  doc.text('INVOICE', 150, 30);
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Invoice #: ${orderNumber}`, 150, 40);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 50);
  
  // Flight Information - More compact layout
  let yPos = 85;
  doc.setFontSize(11);
  doc.setTextColor(0, 102, 204);
  doc.text('Flight Information', 20, yPos);
  
  yPos += 8;
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text(`Aircraft Registration: ${formData.aircraftRegistration || 'N/A'}`, 20, yPos);
  yPos += 6;
  doc.text(`Aircraft Type: ${formData.aircraftType || 'N/A'}`, 20, yPos);
  yPos += 6;
  doc.text(`Handler Company: ${formData.handlerCompany || 'N/A'}`, 20, yPos);
  yPos += 6;
  doc.text(`Departure: ${formData.departureDate || 'N/A'} at ${formData.departureTime || 'N/A'}`, 20, yPos);
  yPos += 6;
  doc.text(`From: ${formData.departureAirport || 'N/A'} to ${formData.arrivalAirport || 'N/A'}`, 20, yPos);
  yPos += 6;
  doc.text(`Passengers: ${formData.passengerCount || 0} | Crew: ${formData.crewCount || 0} | Kitchen: ${formData.kitchenLocation || 'Thessaloniki'}`, 20, yPos);
  
  // Order Items - More compact
  yPos += 15;
  doc.setFontSize(11);
  doc.setTextColor(0, 102, 204);
  doc.text('Order Items', 20, yPos);
  
  // Table headers
  yPos += 10;
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text('Item', 20, yPos);
  doc.text('Qty', 120, yPos);
  doc.text('Price', 140, yPos);
  doc.text('Total', 170, yPos);
  
  // Draw line under headers
  doc.line(20, yPos + 2, 190, yPos + 2);
  
  // Calculate prices and add items
  let subtotal = 0;
  yPos += 8;
  
  if (formData.items && formData.items.length > 0) {
    formData.items.forEach((item) => {
      const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
      const itemName = menuItem ? menuItem.name : `Item #${item.menuItemId}`;
      
      // Get location-based price
      const location = formData.kitchenLocation || "Thessaloniki";
      const priceInCents = menuItem 
        ? (location === "Thessaloniki" ? menuItem.priceThessaloniki : menuItem.priceMykonos)
        : (item.price || 0);
      
      const priceInEuros = priceInCents / 100;
      const totalPrice = priceInEuros * item.quantity;
      subtotal += totalPrice;
      
      // Add item to PDF
      doc.text(itemName.length > 25 ? itemName.substring(0, 25) + '...' : itemName, 20, yPos);
      doc.text(item.quantity.toString(), 120, yPos);
      doc.text(`€${priceInEuros.toFixed(2)}`, 140, yPos);
      doc.text(`€${totalPrice.toFixed(2)}`, 170, yPos);
      
      yPos += 6;
      
      // Add special instructions if any
      if (item.specialInstructions) {
        doc.setFontSize(7);
        doc.setTextColor(128, 128, 128);
        doc.text(`Note: ${item.specialInstructions}`, 25, yPos);
        yPos += 4;
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
      }
      
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 30;
      }
    });
  }
  
  // Draw line before totals
  doc.line(20, yPos + 2, 190, yPos + 2);
  yPos += 8;
  
  // Delivery fee
  const deliveryFee = 150.00;
  doc.setFontSize(9);
  doc.text('Delivery Fee:', 140, yPos);
  doc.text(`€${deliveryFee.toFixed(2)}`, 170, yPos);
  yPos += 6;
  
  // Subtotal
  doc.text('Subtotal:', 140, yPos);
  doc.text(`€${subtotal.toFixed(2)}`, 170, yPos);
  yPos += 6;
  
  // VAT (24% in Greece)
  const totalBeforeVAT = subtotal + deliveryFee;
  const vatAmount = totalBeforeVAT * 0.24;
  doc.text('VAT (24%):', 140, yPos);
  doc.text(`€${vatAmount.toFixed(2)}`, 170, yPos);
  yPos += 6;
  
  // Total
  const grandTotal = totalBeforeVAT + vatAmount;
  doc.setFontSize(11);
  doc.text('TOTAL:', 140, yPos);
  doc.text(`€${grandTotal.toFixed(2)}`, 170, yPos);
  
  // Payment Information - Move it higher up and make more compact
  yPos += 15;
  doc.setFontSize(12);
  doc.setTextColor(0, 102, 204);
  doc.text('PAYMENT INFORMATION', 20, yPos);
  
  // Add a box around payment info
  doc.setDrawColor(0, 102, 204);
  doc.rect(15, yPos + 5, 180, 32);
  
  yPos += 12;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('Bank: Piraeus Bank', 20, yPos);
  yPos += 7;
  doc.text('Account Name: Air Gourmet Hellas SA', 20, yPos);
  yPos += 7;
  doc.text('IBAN: GR 140 17 2066 0005 0661 0896 0468', 20, yPos);
  yPos += 7;
  doc.text('SWIFT Code: PIRBGRAA', 20, yPos);
  
  // Terms & Conditions - Make more compact
  yPos += 15;
  doc.setFontSize(9);
  doc.setTextColor(0, 102, 204);
  doc.text('Terms & Conditions', 20, yPos);
  
  yPos += 8;
  doc.setFontSize(7);
  doc.setTextColor(0, 0, 0);
  doc.text('1. Payment is due within 30 days of invoice date', 20, yPos);
  yPos += 4;
  doc.text('2. For questions about this invoice, contact accounts@airgourmethellas.com', 20, yPos);
  yPos += 4;
  doc.text('3. Cancellation must be made at least 24 hours before scheduled delivery', 20, yPos);
  
  // Footer - Make more compact
  yPos += 10;
  doc.setFontSize(7);
  doc.setTextColor(128, 128, 128);
  doc.text('Thank you for choosing Air Gourmet Hellas for your flight catering needs!', 20, yPos);
  
  // Save the PDF
  const fileName = `Air_Gourmet_Invoice_${orderNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

export function formatPrice(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}