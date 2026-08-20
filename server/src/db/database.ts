import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { seedPropertiesFromCsv, syncBundledPropertyPhotos } from './seedProperties.js';

const pool = new Pool({
  // PostgreSQL runs locally on the Debian VM and never needs a public port.
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'irur',
});

export const db = pool;

export async function initDb() {
  fs.mkdirSync(path.join(process.cwd(), 'data/uploads'), { recursive: true });

  await db.query(`
    CREATE TABLE IF NOT EXISTS properties (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL DEFAULT 'PA',
      zip TEXT NOT NULL DEFAULT '',
      community TEXT,
      rent INTEGER NOT NULL DEFAULT 0,
      bedrooms INTEGER NOT NULL DEFAULT 0,
      bathrooms REAL NOT NULL DEFAULT 0,
      sqft INTEGER,
      property_type TEXT DEFAULT 'Townhome',
      furnished INTEGER DEFAULT 0,
      pet_friendly INTEGER DEFAULT 0,
      description TEXT,
      amenities JSONB DEFAULT '[]',
      photos JSONB DEFAULT '[]',
      availability_date TEXT,
      status TEXT DEFAULT 'available',
      zillow_url TEXT,
      lot_size INTEGER,
      year_built INTEGER,
      listing_status TEXT,
      initial_monthly_rent NUMERIC,
      current_monthly_rent NUMERIC,
      sold_price NUMERIC,
      source_row INTEGER,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      interest_type TEXT DEFAULT 'renting',
      preferred_date TEXT,
      preferred_time TEXT,
      message TEXT,
      property_id INTEGER REFERENCES properties(id) ON DELETE SET NULL,
      contacted INTEGER DEFAULT 0,
      source TEXT DEFAULT 'website',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'employee',
      active INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await migrateLegacyProperties();

  // Bring records already imported from properties_cleaned.csv in line with
  // its listing status: Available listings are rentable; every other listing
  // is shown as occupied/not currently rentable.
  await db.query(`
    UPDATE properties
    SET status = CASE WHEN listing_status = 'Available' THEN 'available' ELSE 'occupied' END
    WHERE listing_status IS NOT NULL
  `);

  await seedUsers();
  await seedPropertiesFromCsv();
  await syncBundledPropertyPhotos();
}

async function migrateLegacyProperties() {
  // Earlier imports created a CSV-shaped `properties` table. Keep the data and
  // add the application columns instead of requiring a destructive re-import.
  await db.query(`
    ALTER TABLE properties
      ADD COLUMN IF NOT EXISTS title TEXT,
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS zip TEXT,
      ADD COLUMN IF NOT EXISTS community TEXT,
      ADD COLUMN IF NOT EXISTS rent INTEGER,
      ADD COLUMN IF NOT EXISTS furnished INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS pet_friendly INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS amenities JSONB DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS listing_status TEXT;
  `);

  const { rows } = await db.query(`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'properties' AND column_name = 'address_line1'
    ) AS is_legacy
  `);
  if (!rows[0].is_legacy) return;

  // The import table restricted status values to the original CSV labels.
  // Remove that legacy constraint before translating them to app statuses.
  await db.query('ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_status_check');

  await db.query(`
    UPDATE properties
    SET
      listing_status = COALESCE(listing_status, status),
      title = COALESCE(NULLIF(title, ''), CONCAT_WS(' – ', NULLIF(address_line1, ''), NULLIF(property_type, ''), NULLIF(city, ''))),
      address = COALESCE(NULLIF(address, ''), address_line1, 'Address TBD'),
      zip = COALESCE(NULLIF(zip, ''), zip_code, ''),
      rent = CASE WHEN rent IS NULL OR rent = 0 THEN ROUND(COALESCE(current_monthly_rent, initial_monthly_rent, 0))::integer ELSE rent END,
      furnished = COALESCE(furnished, 0),
      pet_friendly = COALESCE(pet_friendly, 0),
      amenities = COALESCE(amenities, '[]'::jsonb),
      photos = COALESCE(photos, '[]'::jsonb)
  `);
}

async function seedUsers() {
  const { rows } = await db.query('SELECT COUNT(*)::int AS c FROM users');
  if (rows[0].c > 0) return;

  const hash = bcrypt.hashSync('IRUR@2024', 10);
  await db.query(
    `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)`,
    ['IRUR Employee', 'employee@irur.com', hash, 'employee']
  );
  await db.query(
    `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)`,
    ['Admin User', 'admin@irur.com', bcrypt.hashSync('Admin@IRUR2024', 10), 'admin']
  );
  console.log('[DB] Default users seeded');
}

export function parsePropertyRow(row: Record<string, unknown>) {
  return {
    ...row,
    amenities: Array.isArray(row.amenities) ? row.amenities : JSON.parse(String(row.amenities || '[]')),
    photos: Array.isArray(row.photos) ? row.photos : JSON.parse(String(row.photos || '[]')),
  };
}
