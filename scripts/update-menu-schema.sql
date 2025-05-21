-- Drop the menu_items table to recreate it with the new schema
DROP TABLE IF EXISTS menu_items CASCADE;

-- Create menu_items table with updated schema
CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  dietary_options TEXT[],
  price_thessaloniki INTEGER NOT NULL,
  price_mykonos INTEGER NOT NULL,
  available BOOLEAN DEFAULT true,
  image_url TEXT,
  unit TEXT
);