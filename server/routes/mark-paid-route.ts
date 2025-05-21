import { Express, Request, Response } from "express";
import { storage } from "../storage";

export function registerMarkPaidRoute(app: Express) {
  // Route to mark an order as paid without using Stripe
  app.post("/api/orders/:orderId/mark-paid", async (req: Request, res: Response) => {
    try {
      const { orderId } = req.params;
      const { paymentMethod, paymentAmount } = req.body;
      
      console.log(`Marking order ${orderId} as paid with ${paymentMethod} for amount ${paymentAmount}`);
      
      // Get the order
      const order = await storage.getOrder(parseInt(orderId));
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Update order status
      const updatedOrder = await storage.updateOrder(parseInt(orderId), {
        status: "paid",
        paymentMethod: paymentMethod || "card"
      });
      
      // Log this activity
      await storage.createActivityLog({
        orderId: parseInt(orderId),
        userId: req.user?.id || null,
        action: "payment",
        details: `Payment of €${paymentAmount} received via ${paymentMethod || "card"}`
      });
      
      res.status(200).json({ success: true, order: updatedOrder });
    } catch (error) {
      console.error("Error marking order as paid:", error);
      res.status(500).json({ message: "Failed to process payment" });
    }
  });
}