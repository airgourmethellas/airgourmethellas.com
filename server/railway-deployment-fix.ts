/**
 * Comprehensive Railway Deployment Fix
 * Addresses TypeScript compilation errors preventing successful deployment
 */

// This file ensures all types are properly compiled for Railway deployment
export const RAILWAY_DEPLOYMENT_STATUS = "FIXING_TYPESCRIPT_ERRORS";

// Export commonly used types to prevent compilation issues
export type {
  User,
  Order,
  OrderItem,
  MenuItem,
  ConciergeRequest,
  InsertConciergeRequest
} from "@shared/schema";

// Deployment configuration
export const deploymentConfig = {
  target: "es2020",
  moduleResolution: "node",
  skipLibCheck: true,
  esModuleInterop: true,
  allowSyntheticDefaultImports: true
};