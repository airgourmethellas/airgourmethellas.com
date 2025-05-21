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
  console.log("Fixing simpletestuser password...");
  
  // Check if user exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.username, "simpletestuser")
  });
  
  if (!existingUser) {
    console.log("User simpletestuser does not exist");
    process.exit(1);
  }
  
  // Update the password with proper hash
  const result = await db.update(users)
    .set({ password: await hashPassword("password123") })
    .where(eq(users.username, "simpletestuser"))
    .returning();
  
  console.log("Password updated for user:", result[0]);
}

main().catch(console.error);
