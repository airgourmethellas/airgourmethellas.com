// Authentication service functions
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

// Hash password for storage
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Compare a supplied password against a stored hash
export async function comparePasswords(supplied: string, stored: string) {
  console.log("Comparing passwords for:", { 
    suppliedLength: supplied.length,
    storedLength: stored.length,
    storedStartsWith: stored.substring(0, 10),
    isHashed: stored.includes('.')
  });
  
  // If the stored password contains a dot, it's likely a hash.salt format
  if (stored.includes('.')) {
    try {
      const [hashed, salt] = stored.split(".");
      const hashedBuf = Buffer.from(hashed, "hex");
      const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
      
      const result = timingSafeEqual(hashedBuf, suppliedBuf);
      console.log("Secure password comparison result:", result);
      return result;
    } catch (err) {
      console.error("Error in secure password comparison:", err);
      // Fall back to exact comparison if hash comparison fails
      return false;
    }
  } else {
    // For plaintext passwords (DEVELOPMENT ONLY)
    console.log("Plaintext password comparison");
    return supplied === stored;
  }
}