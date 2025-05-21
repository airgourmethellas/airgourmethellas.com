// This is a simple script to push the database schema directly using the drizzle API
// It can be run directly with Node
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import * as schema from '../shared/schema.js';
import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  console.log("🔄 Connecting to the database...");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  try {
    console.log("🔄 Creating tables if they don't exist...");
    
    // Execute raw SQL to create each table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        role TEXT DEFAULT 'client' NOT NULL,
        created_at TIMESTAMP DEFAULT now() NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price NUMERIC(10, 2) NOT NULL,
        category TEXT,
        dietary TEXT[],
        kitchen TEXT,
        image TEXT,
        created_at TIMESTAMP DEFAULT now() NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number TEXT NOT NULL UNIQUE,
        user_id INTEGER NOT NULL REFERENCES users(id),
        status TEXT DEFAULT 'pending' NOT NULL,
        flight_number TEXT,
        aircraft_type TEXT,
        tail_number TEXT,
        departure_airport TEXT,
        arrival_airport TEXT,
        departure_time TIMESTAMP,
        arrival_time TIMESTAMP,
        pax_count INTEGER,
        delivery_address TEXT,
        special_instructions TEXT,
        created_at TIMESTAMP DEFAULT now() NOT NULL,
        updated_at TIMESTAMP DEFAULT now() NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id),
        menu_item_id INTEGER NOT NULL REFERENCES menu_items(id),
        quantity INTEGER NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT now() NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS order_templates (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        user_id INTEGER NOT NULL REFERENCES users(id),
        aircraft_type TEXT,
        tail_number TEXT,
        departure_airport TEXT,
        arrival_airport TEXT,
        pax_count INTEGER,
        delivery_address TEXT,
        created_at TIMESTAMP DEFAULT now() NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id INTEGER,
        details JSONB,
        created_at TIMESTAMP DEFAULT now() NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS airports (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        city TEXT,
        country TEXT,
        created_at TIMESTAMP DEFAULT now() NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS aircraft_types (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT now() NOT NULL
      );
    `);
    
    console.log("✅ Tables created successfully!");
  } catch (error) {
    console.error("❌ Error creating tables:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();