/**
 * Critical Railway deployment fix
 * Addresses the TypeError [ERR_INVALID_ARG_TYPE] at line 5087
 */
import { fileURLToPath } from "url";
import path from "path";

// Railway-specific path resolution that prevents undefined arguments
export function safeResolve(...segments: (string | undefined)[]): string {
  // Filter out undefined segments
  const validSegments = segments.filter((segment): segment is string => 
    typeof segment === 'string' && segment.length > 0
  );
  
  if (validSegments.length === 0) {
    throw new Error('No valid path segments provided');
  }
  
  return path.resolve(...validSegments);
}

// Get server directory with Railway compatibility
export function getServerDirectory(): string {
  try {
    const filename = fileURLToPath(import.meta.url);
    return path.dirname(filename);
  } catch (error) {
    console.error('[Railway] Failed to get server directory:', error);
    return process.cwd() + '/server';
  }
}

// Override global path operations for Railway
const originalResolve = path.resolve;
path.resolve = (...paths: string[]): string => {
  // Check for undefined arguments that cause Railway crashes
  const validPaths = paths.filter(p => p !== undefined && p !== null);
  
  if (validPaths.length === 0) {
    console.warn('[Railway] path.resolve called with no valid arguments, using cwd');
    return process.cwd();
  }
  
  return originalResolve(...validPaths);
};

console.log('[Railway] Critical path resolution fix applied');