import fs from 'fs';
import path from 'path';
import { db } from './database.js';

const PLACEHOLDER_PHOTO = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&q=80';

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

function parseNum(val: string): number | null {
  if (!val || !val.trim()) return null;
  const n = Number(val);
  return Number.isFinite(n) ? n : null;
}

function parseIntVal(val: string): number | null {
  const n = parseNum(val);
  return n === null ? null : Math.round(n);
}

function mapListingStatus(status: string): string {
  switch (status.trim()) {
    case 'Available': return 'available';
    case 'Sold': return 'occupied';
    case 'Listing Removed':
    case 'Unverified':
    default:
      return 'maintenance';
  }
}

function normalizePropertyType(type: string): string {
  const t = type.trim();
  if (!t) return 'Townhome';
  if (t.toLowerCase() === 'townhouse') return 'Townhome';
  if (t.toLowerCase() === 'single family') return 'Single Family';
  return t;
}

function normalizeAvailabilityDate(val: string): string | null {
  const v = val.trim();
  if (!v) return null;
  if (v.toLowerCase() === 'now') {
    return new Date().toISOString().split('T')[0];
  }
  return v;
}

function buildTitle(address: string, city: string, type: string): string {
  const parts = [address];
  if (type) parts.push(type);
  if (city) parts.push(city);
  return parts.filter(Boolean).join(' – ');
}

function buildDescription(row: Record<string, string>): string {
  const parts: string[] = [];
  const type = row.property_type?.trim();
  if (type) parts.push(`${type} in ${row.city || 'Pennsylvania'}.`);
  if (row.bedrooms) parts.push(`${row.bedrooms} bedrooms, ${row.bathrooms || '?'} bathrooms.`);
  if (row.sqft) parts.push(`${row.sqft} sqft.`);
  if (row.year_built) parts.push(`Built in ${row.year_built}.`);
  if (row.listing_status === 'Available' && row.current_monthly_rent) {
    parts.push(`Currently listed at $${row.current_monthly_rent}/month.`);
  } else if (row.listing_status === 'Sold' && row.sold_price) {
    parts.push(`Sold for $${Number(row.sold_price).toLocaleString()}.`);
  }
  return parts.join(' ') || `${row.address_line1}, ${row.city}`;
}

export async function seedPropertiesFromCsv() {
  const { rows } = await db.query('SELECT COUNT(*)::int AS c FROM properties');
  if (rows[0].c > 0) return;

  const csvPath = path.join(process.cwd(), '..', 'properties_cleaned.csv');
  if (!fs.existsSync(csvPath)) {
    console.warn('[DB] properties_cleaned.csv not found at', csvPath);
    return;
  }

  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split(/\r?\n/).filter(Boolean);
  const headers = parseCsvLine(lines[0]);

  let imported = 0;
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h] = values[idx] ?? ''; });

    const address = row.address_line1?.trim();
    const city = row.city?.trim();
    if (!address && !city) continue;

    const propertyType = normalizePropertyType(row.property_type || '');
    const listingStatus = row.status?.trim() || 'Unverified';
    const currentRent = parseNum(row.current_monthly_rent);
    const initialRent = parseNum(row.initial_monthly_rent);
    const rent = Math.round(currentRent ?? initialRent ?? 0);
    const bedrooms = parseIntVal(row.bedrooms) ?? 0;
    const bathrooms = parseNum(row.bathrooms) ?? 0;

    await db.query(`
      INSERT INTO properties (
        title, address, city, state, zip, rent, bedrooms, bathrooms, sqft,
        property_type, description, photos, availability_date, status,
        zillow_url, lot_size, year_built, listing_status,
        initial_monthly_rent, current_monthly_rent, sold_price, source_row
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14,
        $15, $16, $17, $18,
        $19, $20, $21, $22
      )
    `, [
      buildTitle(address || 'Property', city || '', propertyType),
      address || 'Address TBD',
      city || 'Unknown',
      row.state?.trim() || 'PA',
      row.zip_code?.trim() || '',
      rent,
      bedrooms,
      bathrooms,
      parseIntVal(row.sqft),
      propertyType,
      buildDescription({ ...row, listing_status: listingStatus }),
      JSON.stringify([PLACEHOLDER_PHOTO]),
      normalizeAvailabilityDate(row.availability_date || ''),
      mapListingStatus(listingStatus),
      row.zillow_url?.trim() || null,
      parseIntVal(row.lot_size),
      parseIntVal(row.year_built),
      listingStatus,
      initialRent,
      currentRent,
      parseNum(row.sold_price),
      parseIntVal(row.source_row),
    ]);
    imported++;
  }

  console.log(`[DB] Imported ${imported} properties from CSV`);
}
