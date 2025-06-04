/**
 * Vite compatibility patch for Railway deployment
 * Prevents undefined import.meta.dirname crashes
 */
import { fileURLToPath } from "url";
import path from "path";

// Get current directory safely
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Polyfill import.meta.dirname for Railway's Node.js environment
if (typeof import.meta.dirname === 'undefined') {
  Object.defineProperty(import.meta, 'dirname', {
    value: __dirname,
    writable: false,
    enumerable: true,
    configurable: false
  });
}

// Initialize immediately to prevent crashes
const initPatch = (() => {
  console.log('[Railway] ES module compatibility patch loaded');
  return true;
})();

export default initPatch;