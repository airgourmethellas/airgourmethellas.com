import { ApiError } from "@/lib/queryClient";

/**
 * Simple error tracking utility to record errors
 * In a production app, this would send errors to a service like Sentry
 */

// Create a unique error ID for each error to help with tracking
function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Store recently caught errors to prevent duplicate reports
const recentErrors = new Map<string, { timestamp: number, count: number }>();

// Clean out old errors periodically (errors older than 1 hour)
setInterval(() => {
  const now = Date.now();
  // Using Array.from to convert Map entries to array to avoid iterator issues
  Array.from(recentErrors.entries()).forEach(([key, data]) => {
    if (now - data.timestamp > 3600000) { // 1 hour
      recentErrors.delete(key);
    }
  });
}, 300000); // Check every 5 minutes

interface ErrorDetails {
  message: string;
  stack?: string;
  url: string;
  component?: string;
  statusCode?: number;
}

/**
 * Track an error that occurred in the application
 */
export function trackError(error: Error, component?: string): string {
  // Get basic error information
  const errorDetails: ErrorDetails = {
    message: error.message,
    stack: error.stack,
    url: window.location.href,
    component
  };
  
  // Add HTTP status code for API errors
  if (error instanceof ApiError) {
    errorDetails.statusCode = error.statusCode;
  }
  
  // Create a fingerprint of the error for deduplication
  const errorFingerprint = `${errorDetails.message}:${errorDetails.url}`;
  
  // Check if we've seen this error recently
  const existingError = recentErrors.get(errorFingerprint);
  if (existingError) {
    // Increment the count for this error
    existingError.count += 1;
    existingError.timestamp = Date.now();
    console.log(`Repeated error: ${errorFingerprint} (count: ${existingError.count})`);
    return errorFingerprint;
  }
  
  // Generate a unique ID for this error
  const errorId = generateErrorId();
  
  // Log error details to console in development
  if (process.env.NODE_ENV === 'development') {
    console.group(`Tracked Error: ${errorId}`);
    console.error('Error Details:', errorDetails);
    console.groupEnd();
  }
  
  // In a real app, send to a backend or error tracking service
  // Example: sendToErrorTracking(errorId, errorDetails);
  
  // Record this error to prevent duplicate reports
  recentErrors.set(errorFingerprint, { 
    timestamp: Date.now(),
    count: 1
  });
  
  return errorId;
}

/**
 * Report error from user feedback
 */
export function reportUserFeedback(errorId: string, userFeedback: string): void {
  // In a real app, this would send the feedback to a backend service
  console.log(`User feedback for error ${errorId}:`, userFeedback);
}