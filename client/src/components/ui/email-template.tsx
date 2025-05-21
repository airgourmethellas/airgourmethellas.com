// This component is used to generate HTML email templates for invoice delivery
// It's used in the server-side code to create stylish HTML emails

export function generateInvoiceEmailTemplate(params: {
  orderNumber: string;
  customerName: string;
  invoiceNumber: string;
  orderDate: string;
  orderTotal: string;
  companyLogo?: string;
}): string {
  const {
    orderNumber,
    customerName,
    invoiceNumber,
    orderDate,
    orderTotal,
    companyLogo = 'https://airgourmethellas.com/images/logo.png'
  } = params;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Invoice from Air Gourmet Hellas</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 1px solid #eee;
        }
        .logo {
          max-width: 200px;
          height: auto;
        }
        .content {
          padding: 20px 0;
        }
        .invoice-details {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          font-size: 12px;
          text-align: center;
          color: #777;
          padding: 20px 0;
          border-top: 1px solid #eee;
        }
        .button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #4a90e2;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          margin-top: 15px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        th {
          background-color: #f5f5f5;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${companyLogo}" alt="Air Gourmet Hellas" class="logo">
          <h1>Invoice for Your Order</h1>
        </div>
        
        <div class="content">
          <p>Dear ${customerName},</p>
          
          <p>Thank you for choosing Air Gourmet Hellas. Your invoice for order #${orderNumber} is attached to this email.</p>
          
          <div class="invoice-details">
            <table>
              <tr>
                <th>Invoice Number:</th>
                <td>${invoiceNumber}</td>
              </tr>
              <tr>
                <th>Order Number:</th>
                <td>${orderNumber}</td>
              </tr>
              <tr>
                <th>Order Date:</th>
                <td>${orderDate}</td>
              </tr>
              <tr>
                <th>Total Amount:</th>
                <td>${orderTotal}</td>
              </tr>
            </table>
          </div>
          
          <p>Please find the attached PDF invoice for detailed information about your order. You can also view your order details by logging into your account on our website.</p>
          
          <p>If you have any questions or concerns regarding your invoice or order, please don't hesitate to contact our customer service team at <a href="mailto:support@airgourmethellas.com">support@airgourmethellas.com</a> or by phone at +30 210 123 4567.</p>
          
          <p>Thank you for your business!</p>
        </div>
        
        <div class="footer">
          <p>Air Gourmet Hellas | Thessaloniki (SKG) & Mykonos (JMK), Greece</p>
          <p>This email was sent to you because you made a purchase from Air Gourmet Hellas.</p>
          <p>&copy; ${new Date().getFullYear()} Air Gourmet Hellas. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}