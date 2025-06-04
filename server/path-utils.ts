import { fileURLToPath } from "url";
import path from "path";

/**
 * Cross-platform ES module directory resolution
 * Provides compatibility for environments that don't support import.meta.dirname
 */
export function getModuleDir(importMetaUrl: string): string {
  return path.dirname(fileURLToPath(importMetaUrl));
}

/**
 * Get the project root directory
 */
export function getProjectRoot(): string {
  // Go up from server directory to project root
  return path.resolve(getModuleDir(import.meta.url), "..");
}

/**
 * Resolve paths relative to project root with validation
 */
export function resolveProjectPath(...segments: string[]): string {
  const projectRoot = getProjectRoot();
  const resolvedPath = path.resolve(projectRoot, ...segments);
  
  // Validate that all segments are defined
  for (const segment of segments) {
    if (segment === undefined || segment === null) {
      throw new Error(`Invalid path segment: ${segment}`);
    }
  }
  
  return resolvedPath;
}