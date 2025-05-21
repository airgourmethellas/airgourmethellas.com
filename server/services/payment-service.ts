import Stripe from "stripe";

// Initialize Stripe with the secret key
let stripe: Stripe | null = null;
let stripeEnabled = false;

try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16" as any, // Using type assertion for compatibility
    });
    stripeEnabled = true;
    console.log("✓ Stripe initialized successfully");
  } else {
    console.log("⚠️ Stripe secret key not found - payment features will be disabled");
  }
} catch (error) {
  console.error("Failed to initialize Stripe:", error);
}

/**
 * Check if Stripe integration is enabled
 */
export function isStripeEnabled(): boolean {
  return stripeEnabled && !!stripe;
}

/**
 * Get configuration details for the frontend
 */
export function getStripeConfig() {
  return {
    enabled: stripeEnabled && !!process.env.VITE_STRIPE_PUBLIC_KEY,
    publicKey: process.env.VITE_STRIPE_PUBLIC_KEY || null
  };
}

/**
 * Create a test payment intent for integration testing
 */
export async function createTestPaymentIntent(amount: number) {
  if (!stripe || !stripeEnabled) {
    throw new Error("Stripe is not configured properly");
  }

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    throw new Error("Invalid amount provided");
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "eur",
    metadata: {
      integration_test: "true",
      test_payment: "true"
    }
  });

  console.log(`Created test payment intent: ${paymentIntent.id}`);

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id
  };
}

/**
 * Create a payment intent for a real order
 */
export async function createOrderPaymentIntent(orderId: number, amount: number) {
  if (!stripe || !stripeEnabled) {
    throw new Error("Stripe is not configured properly");
  }

  if (!orderId) {
    throw new Error("Order ID is required");
  }

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    throw new Error("Invalid amount provided");
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "eur",
    metadata: {
      order_id: orderId.toString()
    }
  });

  console.log(`Created payment intent for order ${orderId}: ${paymentIntent.id}`);

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id
  };
}

/**
 * Process Stripe webhook event
 */
export async function processWebhookEvent(event: any) {
  if (!stripe || !stripeEnabled) {
    throw new Error("Stripe is not configured properly");
  }

  console.log(`Processing Stripe webhook: ${event.type}`);

  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log(`💰 Payment succeeded: ${paymentIntent.id}`);
      
      // If this has an order ID in metadata, update the order payment status
      if (paymentIntent.metadata && paymentIntent.metadata.order_id) {
        const orderId = paymentIntent.metadata.order_id;
        console.log(`Updating order ${orderId} payment status to paid`);
        
        // TODO: Implement order payment status update logic
        // await storage.updateOrderPaymentStatus(orderId, "paid");
      }
      return { success: true, action: "payment_processed" };
      
    case 'payment_intent.payment_failed':
      const failedPaymentIntent = event.data.object;
      console.log(`❌ Payment failed: ${failedPaymentIntent.id}`);
      
      // If this has an order ID in metadata, update the order payment status
      if (failedPaymentIntent.metadata && failedPaymentIntent.metadata.order_id) {
        const orderId = failedPaymentIntent.metadata.order_id;
        console.log(`Updating order ${orderId} payment status to failed`);
        
        // TODO: Implement order payment status update logic
        // await storage.updateOrderPaymentStatus(orderId, "failed");
      }
      return { success: true, action: "payment_failed" };
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
      return { success: true, action: "event_ignored" };
  }
}