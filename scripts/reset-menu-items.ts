import { pool, db } from "../server/db";
import { airGourmetMenuItems } from "../server/menu-data";
import { menuItems } from "../shared/schema";
import { sql } from "drizzle-orm";

async function main() {
  console.log("🔄 Resetting menu items...");
  
  try {
    // First, delete all existing menu items
    console.log("🗑️ Deleting existing menu items...");
    await db.delete(menuItems);
    
    // Insert all menu items from the updated data
    console.log(`📥 Inserting ${airGourmetMenuItems.length} menu items...`);
    const result = await db.insert(menuItems).values(airGourmetMenuItems).returning();
    
    console.log(`✅ Successfully inserted ${result.length} menu items.`);
    
    // Count items by category
    const categories = {};
    for (const item of result) {
      if (!categories[item.category]) {
        categories[item.category] = 0;
      }
      categories[item.category]++;
    }
    
    console.log("📊 Menu items by category:");
    for (const [category, count] of Object.entries(categories)) {
      console.log(`  - ${category}: ${count} items`);
    }
    
  } catch (error) {
    console.error("❌ Error resetting menu items:", error);
  } finally {
    // Close DB connection
    await pool.end();
  }
}

main();