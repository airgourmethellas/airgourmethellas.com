/**
 * Railway deployment crash fix
 * Addresses TypeError [ERR_INVALID_ARG_TYPE]: The "paths[0]" argument must be of type string. Received undefined
 * at line 5087 in dist/index.js
 */
import { fileURLToPath } from "url";
import path from "path";

// Override path.resolve to handle undefined arguments safely
const originalResolve = path.resolve;

path.resolve = (...paths: (string | undefined)[]): string => {
  // Filter out undefined/null values that cause Railway crashes
  const validPaths = paths.filter((p): p is string => 
    typeof p === 'string' && p !== null && p !== undefined
  );
  
  if (validPaths.length === 0) {
    console.warn('[Railway Fix] path.resolve called with no valid arguments, using current working directory');
    return process.cwd();
  }
  
  return originalResolve(...validPaths);
};

// Safe directory resolution for ES modules
export function getSafeServerDir(): string {
  try {
    return path.dirname(fileURLToPath(import.meta.url));
  } catch (error) {
    console.warn('[Railway Fix] Failed to resolve server directory, using fallback');
    return path.join(process.cwd(), 'server');
  }
}

// Safe environment variable resolution
export function getSafeEnvVar(key: string, defaultValue: string = ''): string {
  const value = process.env[key];
  if (value === undefined || value === null || value === '') {
    console.warn(`[Railway Fix] Environment variable ${key} is undefined, using default: ${defaultValue}`);
    return defaultValue;
  }
  return value;
}

// Apply all Railway fixes
export function applyRailwayFixes(): void {
  // Ensure critical environment variables have defaults
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production';
  }
  
  if (!process.env.PORT) {
    process.env.PORT = '5000';
  }
  
  console.log('[Railway Fix] Deployment crash prevention measures applied');
}

// Auto-apply fixes when module loads
applyRailwayFixes();