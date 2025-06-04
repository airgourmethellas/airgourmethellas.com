/**
 * Production build configuration for Railway deployment
 * Handles ES module compatibility and path resolution issues
 */
import { fileURLToPath } from "url";
import path from "path";

// Production-safe path resolution
export function getServerDir(): string {
  try {
    // Try modern approach first
    if (typeof import.meta.dirname !== 'undefined') {
      return import.meta.dirname;
    }
    
    // Fallback for older Node.js versions
    return path.dirname(fileURLToPath(import.meta.url));
  } catch (error) {
    // Ultimate fallback
    return process.cwd() + '/server';
  }
}

export function getProjectRoot(): string {
  return path.resolve(getServerDir(), '..');
}

export function resolveAssetPath(assetPath: string): string {
  const projectRoot = getProjectRoot();
  return path.resolve(projectRoot, assetPath);
}

// Environment-specific configurations
export const config = {
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  port: parseInt(process.env.PORT || '5000'),
  
  paths: {
    public: resolveAssetPath('public'),
    tmp: resolveAssetPath('tmp'),
    client: resolveAssetPath('client'),
    dist: resolveAssetPath('dist')
  }
};