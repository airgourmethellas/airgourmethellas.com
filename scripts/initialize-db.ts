import { db } from "../server/db";
import { users, menuItems } from "../shared/schema";
import { airGourmetMenuItems } from "../server/menu-data";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function main() {
  console.log("🔄 Initializing database...");

  try {
    // Create admin user
    const hashedPassword = await hashPassword("admin123");
    const [admin] = await db
      .insert(users)
      .values({
        username: "admin",
        password: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        email: "admin@airgourmet.com",
        role: "admin",
      })
      .onConflictDoNothing()
      .returning();

    if (admin) {
      console.log("✅ Admin user created");
    } else {
      console.log("⏩ Admin user already exists");
    }

    // Seed menu items
    console.log("🔄 Seeding menu items...");
    
    // Insert menu items
    for (const item of airGourmetMenuItems) {
      try {
        await db
          .insert(menuItems)
          .values(item)
          .onConflictDoNothing();
      } catch (error) {
        console.error(`❌ Error inserting menu item ${item.name}:`, error);
      }
    }

    console.log(`✅ Menu items seeded`);
    
    console.log("✅ Database initialization complete!");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
  } finally {
    process.exit(0);
  }
}

main();