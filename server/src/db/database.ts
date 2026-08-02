import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { seedPropertiesFromCsv } from './seedProperties.js';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
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

  await seedUsers();
  await seedPropertiesFromCsv();
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
