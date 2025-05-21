import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function main() {
  console.log("Creating simple test user...");
  
  // Check if user already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.username, "test123")
  });
  
  if (existingUser) {
    console.log("Simple test user already exists - updating password");
    
    const [updatedUser] = await db.update(users)
      .set({ password: await hashPassword("test123") })
      .where(eq(users.username, "test123"))
      .returning();
    
    console.log("Password updated:", updatedUser.username);
    process.exit(0);
  }
  
  // Create test user
  const [user] = await db.insert(users).values({
    username: "test123",
    password: await hashPassword("test123"),
    firstName: "Test",
    lastName: "User",
    email: "test123@airgourmet.com",
    company: "Air Gourmet",
    phone: "+1234567890",
    role: "client",
  }).returning();
  
  console.log("Simple test user created:", user);
}

main().catch(console.error);
