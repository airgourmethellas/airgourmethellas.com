// Simple test script to debug invoice generation
const fetch = require('node-fetch');

async function testInvoiceGeneration() {
  try {
    console.log('Testing invoice generation via API...');
    
    // Test the invoice request endpoint
    const response = await fetch('http://localhost:5000/api/invoices/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        orderId: 1,
        sendEmail: false
      })
    });
    
    const result = await response.json();
    console.log('API Response:', JSON.stringify(result, null, 2));
    
    if (!response.ok) {
      console.error('API Error:', response.status, response.statusText);
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testInvoiceGeneration();