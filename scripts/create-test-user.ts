import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function main() {
  console.log("Creating test user...");
  
  // Check if user already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.username, "test")
  });
  
  if (existingUser) {
    console.log("Test user already exists");
    process.exit(0);
  }
  
  // Create test user
  const [user] = await db.insert(users).values({
    username: "test",
    password: await hashPassword("test123"),
    firstName: "Test",
    lastName: "User",
    email: "test@airgourmet.com",
    company: "Air Gourmet",
    phone: "+1234567890",
    role: "client",
  }).returning();
  
  console.log("Test user created:", user);
}

main().catch(console.error);