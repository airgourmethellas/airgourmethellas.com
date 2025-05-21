import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { activityLogs } from "@shared/schema";
import { db } from "../db";

// Create router for GDPR-related routes
const router = Router();

// Schema for data deletion request
const dataDeletionRequestSchema = z.object({
  email: z.string().email(),
  reason: z.string().optional(),
});

// Handle data deletion requests
router.post("/data-deletion-request", async (req, res) => {
  try {
    // Validate request body
    const validatedData = dataDeletionRequestSchema.parse(req.body);
    
    // In a real implementation, you would create a task for admin review
    // and handle the actual deletion through an admin workflow
    // For now, we'll log the request in the activity logs
    
    await storage.createActivityLog({
      userId: req.user?.id,
      action: "DATA_DELETION_REQUEST",
      details: JSON.stringify({
        email: validatedData.email,
        reason: validatedData.reason,
        timestamp: new Date(),
        ip: req.ip,
        status: "PENDING",
      }),
      created: new Date(),
    });
    
    // Send an email notification to the admin (implementation would vary)
    // In a real system, you'd want to send an email to both the user and admin
    
    return res.status(200).json({ 
      message: "Data deletion request received successfully",
      status: "PENDING" 
    });
  } catch (error) {
    console.error("Error processing data deletion request:", error);
    return res.status(400).json({ message: "Invalid request data" });
  }
});

// Tracking user consent updates
const userConsentSchema = z.object({
  userId: z.number(),
  processingConsent: z.boolean(),
  marketingEmail: z.boolean().optional(),
  marketingSMS: z.boolean().optional(),
});

router.post("/user-consent", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // Validate request body
    const validatedData = userConsentSchema.parse({
      ...req.body,
      userId: req.user.id
    });
    
    // Log the consent in activity logs
    await storage.createActivityLog({
      userId: req.user.id,
      action: "CONSENT_UPDATE",
      details: JSON.stringify({
        processingConsent: validatedData.processingConsent,
        marketingEmail: validatedData.marketingEmail,
        marketingSMS: validatedData.marketingSMS,
        timestamp: new Date(),
        ip: req.ip,
      }),
      created: new Date(),
    });
    
    // In a production system, you would store this consent in a dedicated table
    // with proper versioning and history
    
    return res.status(200).json({ message: "Consent updated successfully" });
  } catch (error) {
    console.error("Error updating user consent:", error);
    return res.status(400).json({ message: "Invalid request data" });
  }
});

// Endpoint for users to download their personal data
// This is a simplified implementation
router.get("/export-personal-data", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // Log the data export request
    await storage.createActivityLog({
      userId: req.user.id,
      action: "DATA_EXPORT_REQUEST",
      details: JSON.stringify({
        timestamp: new Date(),
        ip: req.ip,
      }),
      created: new Date(),
    });
    
    // Collect user data from various tables
    const userData = await storage.getUser(req.user.id);
    const userOrders = await storage.getOrdersByUser(req.user.id);
    
    // Remove sensitive information
    if (userData) {
      // @ts-ignore: Deleting password for security
      delete userData.password;
    }
    
    // Create the personal data export
    const personalData = {
      user: userData,
      orders: userOrders,
      // Add other relevant data here
    };
    
    // Send the data as a JSON file
    res.setHeader('Content-Disposition', 'attachment; filename=personal-data.json');
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(personalData);
  } catch (error) {
    console.error("Error exporting personal data:", error);
    return res.status(500).json({ message: "Error processing data export request" });
  }
});

export default router;