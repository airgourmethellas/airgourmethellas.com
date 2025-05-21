import { Express } from 'express';
import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

// Initialize Stripe if the key is available
let stripe: Stripe | null = null;
if (STRIPE_SECRET_KEY) {
  stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2025-04-30.basil',
  });
  console.log('✓ Stripe initialized successfully');
} else {
  console.warn('⚠️ Stripe secret key not found, payment features will be unavailable');
}

export function registerPaymentRoutes(app: Express) {
  // Create a payment intent without requiring authentication
  app.post('/api/create-payment-intent-public', async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({
          message: 'Stripe is not configured',
          details: 'Please add STRIPE_SECRET_KEY to the environment variables'
        });
      }

      const { amount } = req.body;
      
      if (!amount || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({
          message: 'Invalid amount',
          details: 'Amount must be a positive number'
        });
      }

      // Create a PaymentIntent with the specified amount (in cents)
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'eur',
        payment_method_types: ['card'],
        metadata: {
          test: 'true',
          public: 'true'
        }
      });

      // Return the client secret
      res.status(200).json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      
      res.status(500).json({
        message: 'Payment processing error',
        details: error.message || 'Unknown error'
      });
    }
  });

  // Create a payment intent that requires authentication
  app.post('/api/create-payment-intent', async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({
          message: 'Authentication required',
          details: 'You must be logged in to create a payment'
        });
      }

      if (!stripe) {
        return res.status(500).json({
          message: 'Stripe is not configured',
          details: 'Please add STRIPE_SECRET_KEY to the environment variables'
        });
      }

      const { amount, orderId } = req.body;
      
      if (!amount || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({
          message: 'Invalid amount',
          details: 'Amount must be a positive number'
        });
      }

      // Create a PaymentIntent with the specified amount
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'eur',
        payment_method_types: ['card'],
        metadata: {
          orderId: orderId || 'unknown',
          userId: req.user?.id?.toString() || 'unknown'
        }
      });

      // Return the client secret
      res.status(200).json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      
      res.status(500).json({
        message: 'Payment processing error',
        details: error.message || 'Unknown error'
      });
    }
  });

  // Webhook to handle payment events from Stripe
  app.post('/api/webhook/stripe', async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ error: 'Stripe is not configured' });
      }

      const payload = req.body;
      // In production, you should verify the webhook signature
      // const sig = req.headers['stripe-signature'];
      // const event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);

      // For now, just use the payload directly
      const event = payload;

      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          console.log(`Payment succeeded: ${paymentIntent.id}`);
          // Here you would update your database to mark the payment as completed
          break;
        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object;
          console.log(`Payment failed: ${failedPayment.id}`);
          // Here you would update your database to mark the payment as failed
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('Error in Stripe webhook:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Get payment status
  app.get('/api/payment-status/:paymentIntentId', async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ error: 'Stripe is not configured' });
      }

      const { paymentIntentId } = req.params;

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      res.status(200).json({
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100, // Convert cents to dollars/euros
        currency: paymentIntent.currency
      });
    } catch (error: any) {
      console.error('Error retrieving payment status:', error);
      res.status(500).json({ error: error.message });
    }
  });
}