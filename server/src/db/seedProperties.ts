import fs from 'fs';
import path from 'path';
import { db } from './database.js';

const PLACEHOLDER_PHOTO = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&q=80';
const LOGO_PHOTO = '/logo.jpeg';

// The supplied photo folders are grouped by development rather than by an
// individual address.  `source_row` is retained from IRURDATA.xlsx, so it is
// a stable way to associate each imported listing with its matching set.
const PHOTO_GROUPS: Array<{ rows: number[]; directory: string; count: number }> = [
  { rows: [2, ...Array.from({ length: 18 }, (_, index) => index + 13), 60], directory: 'pottstown', count: 7 },
  { rows: [5, 6, 7, 8, 9, 10, 11, 12, 64], directory: 'spring-city', count: 8 },
  { rows: [...Array.from({ length: 19 }, (_, index) => index + 31), 55, 56, 57, 58, 59], directory: 'bridgeport', count: 8 },
  { rows: [50], directory: 'coatesville', count: 9 },
  { rows: [51], directory: 'downingtown', count: 10 },
  { rows: [3, 4, 52, 53, 54, 61, 62, 63, 65, 66], directory: 'phoenixville', count: 7 },
];

function photosForSourceRow(sourceRow: number | null): string[] {
  const group = PHOTO_GROUPS.find(({ rows }) => sourceRow !== null && rows.includes(sourceRow));
  const propertyPhotos = group
    ? Array.from({ length: group.count }, (_, index) => `/property-images/${group.directory}/image-${index + 1}.webp`)
    : [PLACEHOLDER_PHOTO];

  // The client gallery and the database agree on this ordering: the IRUR
  // logo is always the final image, after all property-specific photos.
  return [...propertyPhotos, LOGO_PHOTO];
}

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
  // The CSV is the source of truth for public listing availability. The site
  // intentionally presents only the two requested states.
  return status.trim() === 'Available' ? 'available' : 'occupied';
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

  const csvPath = [
    path.join(process.cwd(), 'properties_cleaned.csv'),
    path.join(process.cwd(), '..', 'properties_cleaned.csv'),
  ].find(fs.existsSync);
  if (!csvPath) {
    console.warn('[DB] properties_cleaned.csv not found');
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
      JSON.stringify(photosForSourceRow(parseIntVal(row.source_row))),
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

// Existing databases are not reseeded, so keep their imported records aligned
// with the bundled images too. This deliberately targets only rows that came
// from IRURDATA.xlsx and leaves employee-created listings untouched.
export async function syncBundledPropertyPhotos() {
  for (const group of PHOTO_GROUPS) {
    const sampleRow = group.rows[0];
    await db.query(
      'UPDATE properties SET photos = $1 WHERE source_row = ANY($2::int[])',
      [JSON.stringify(photosForSourceRow(sampleRow)), group.rows]
    );
  }
}
