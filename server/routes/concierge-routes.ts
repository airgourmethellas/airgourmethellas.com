import { Router } from "express";
import type { Express } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { sendEmail } from "../services/email-service";

import { insertConciergeRequestSchema } from "@shared/schema";

const router = Router();

// Get all concierge requests (admin only)
router.get("/requests", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Not authorized" });
  }

  try {
    const requests = await storage.getAllConciergeRequests();
    res.json(requests);
  } catch (error) {
    console.error("Error fetching concierge requests:", error);
    res.status(500).json({ message: "Failed to fetch concierge requests" });
  }
});

// Get concierge requests for the authenticated user
router.get("/requests/user", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const requests = await storage.getConciergeRequestsByUser(req.user.id);
    res.json(requests);
  } catch (error) {
    console.error("Error fetching user concierge requests:", error);
    res.status(500).json({ message: "Failed to fetch your concierge requests" });
  }
});

// Get a single concierge request
router.get("/requests/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const requestId = parseInt(req.params.id);
    const conciergeRequest = await storage.getConciergeRequest(requestId);

    if (!conciergeRequest) {
      return res.status(404).json({ message: "Concierge request not found" });
    }

    // Check if the user is an admin or the request belongs to them
    if (req.user.role !== "admin" && conciergeRequest.userId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to view this request" });
    }

    res.json(conciergeRequest);
  } catch (error) {
    console.error("Error fetching concierge request:", error);
    res.status(500).json({ message: "Failed to fetch concierge request" });
  }
});

// Create a new concierge request
router.post("/requests", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    // Validate the request body
    const validatedData = insertConciergeRequestSchema.parse({
      ...req.body,
      userId: req.user.id, // Always use the authenticated user's ID
    });

    // Create the concierge request
    const newRequest = await storage.createConciergeRequest(validatedData);

    // Send notifications
    try {
      // Notify admins via email
      const adminMessage = `
        <h2>New Concierge Request Submitted</h2>
        <p><strong>Service Type:</strong> ${validatedData.requestType}</p>
        <p><strong>Urgency:</strong> ${validatedData.urgentRequest ? 'URGENT' : 'Normal'}</p>
        <p><strong>Description:</strong> ${validatedData.description}</p>
        <p><strong>Requested By:</strong> ${req.user.firstName} ${req.user.lastName} (${req.user.email})</p>
        <p><strong>Delivery Date:</strong> ${validatedData.deliveryDate}</p>
        <p><strong>Delivery Time:</strong> ${validatedData.deliveryTime}</p>
        <p><strong>Delivery Location:</strong> ${validatedData.deliveryLocation}</p>
        ${validatedData.specialInstructions ? `<p><strong>Special Instructions:</strong> ${validatedData.specialInstructions}</p>` : ''}
        <p>Please log in to the system to review and respond to this request.</p>
      `;
      
      await sendEmail({
        subject: `${validatedData.urgentRequest ? '[URGENT] ' : ''}New Concierge Request Received`,
        html: adminMessage,
        to: [process.env.ADMIN_EMAIL || 'operations@airgourmethellas.com'],
      });

      // Create system notification
      await storage.createActivityLog({
        action: "concierge_request_created",
        userId: req.user.id,
        details: `New concierge service request created: ${validatedData.requestType}`,
        resourceId: newRequest.id,
        resourceType: "concierge_request"
      });

      // Confirm receipt via email to client
      const clientMessage = `
        <h2>Your Concierge Service Request Has Been Received</h2>
        <p>Dear ${req.user.firstName},</p>
        <p>Thank you for your concierge service request. Our team will review your request and contact you shortly.</p>
        <p><strong>Request Type:</strong> ${validatedData.requestType}</p>
        <p><strong>Urgency:</strong> ${validatedData.urgentRequest ? 'URGENT' : 'Normal'}</p>
        <p><strong>Delivery Date:</strong> ${validatedData.deliveryDate}</p>
        <p><strong>Delivery Time:</strong> ${validatedData.deliveryTime}</p>
        <p>You can view the status of your request by logging into your account.</p>
        <p>Thank you for choosing Air Gourmet Hellas for your premium aviation services.</p>
        <p>Best regards,<br>The Air Gourmet Hellas Team</p>
      `;

      if (req.user.email) {
        await sendEmail({
          subject: 'Your Concierge Service Request Has Been Received',
          html: clientMessage,
          to: [req.user.email],
        });
      }
    } catch (notificationError) {
      console.error("Error sending notifications:", notificationError);
      // Continue with the request even if notifications fail
    }

    res.status(201).json(newRequest);
  } catch (error) {
    console.error("Error creating concierge request:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid request data", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to create concierge request" });
  }
});

// Update a concierge request (admin only)
router.patch("/requests/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  // Only admins can update concierge requests
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Not authorized" });
  }

  try {
    const requestId = parseInt(req.params.id);
    const conciergeRequest = await storage.getConciergeRequest(requestId);

    if (!conciergeRequest) {
      return res.status(404).json({ message: "Concierge request not found" });
    }

    // Update with admin user ID for tracking
    const updatedRequest = await storage.updateConciergeRequest(requestId, {
      ...req.body,
      adminUserId: req.user.id, // Track which admin made the update
    });

    // Send notifications if status changed
    if (req.body.status && req.body.status !== conciergeRequest.status) {
      try {
        // Send email notification to client
        const user = await storage.getUser(conciergeRequest.userId);
        
        if (user && user.email) {
          const statusMessages: Record<string, string> = {
            reviewed: "Your request has been reviewed and is being processed",
            quoted: "We've prepared a price quote for your request",
            confirmed: "Your request has been confirmed and is being processed",
            completed: "Your request has been completed",
            cancelled: "Your request has been cancelled",
          };
          
          const message = `
            <h2>Concierge Service Request Update</h2>
            <p>Dear ${user.firstName},</p>
            <p>${statusMessages[req.body.status] || `Your request status has been updated to: ${req.body.status}`}</p>
            ${req.body.price ? `<p><strong>Price:</strong> €${req.body.price.toFixed(2)}</p>` : ''}
            ${req.body.priceNotes ? `<p><strong>Notes:</strong> ${req.body.priceNotes}</p>` : ''}
            <p>You can view more details by logging into your account.</p>
            <p>Thank you for choosing Air Gourmet Hellas for your premium aviation services.</p>
            <p>Best regards,<br>The Air Gourmet Hellas Team</p>
          `;
          
          await sendEmail({
            subject: `Concierge Request Update: ${req.body.status.toUpperCase()}`,
            html: message,
            to: [user.email],
          });
        }

        // Create system notification
        await storage.createActivityLog({
          action: "concierge_request_updated",
          userId: conciergeRequest.userId,
          details: `Concierge request status changed to ${req.body.status}`,
          resourceId: requestId,
          resourceType: "concierge_request"
        });
      } catch (notificationError) {
        console.error("Error sending notifications:", notificationError);
        // Continue with the request even if notifications fail
      }
    }

    res.json(updatedRequest);
  } catch (error) {
    console.error("Error updating concierge request:", error);
    res.status(500).json({ message: "Failed to update concierge request" });
  }
});

export function registerConciergeRoutes(app: Express) {
  app.use('/api/concierge', router);
}

export default router;