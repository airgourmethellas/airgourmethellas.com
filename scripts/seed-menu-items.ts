import { pool, db } from "../server/db";
import { airGourmetMenuItems } from "../server/menu-data";
import { menuItems } from "../shared/schema";

async function main() {
  console.log("Seeding menu items...");
  
  try {
    // Insert menu items
    const result = await db.insert(menuItems).values(airGourmetMenuItems).returning();
    
    console.log(`Successfully inserted ${result.length} menu items.`);
  } catch (error) {
    console.error("Error seeding menu items:", error);
  } finally {
    // Close DB connection
    await pool.end();
  }
}

main();