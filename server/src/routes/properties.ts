import { Router } from 'express';
import multer from 'multer';
import { db, parsePropertyRow } from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';
import { fetchZillowPhotos } from '../services/zillowPhotos.js';
import { uploadPropertyPhoto } from '../services/storage.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Images only'));
  }
});

// GET all with filters (public)
router.get('/', async (req, res) => {
  try {
    const { search, city, state, minRent, maxRent, beds, baths, type, petFriendly, furnished, status, community } = req.query;

    let sql = 'SELECT * FROM properties WHERE 1=1';
    const params: unknown[] = [];
    let paramIdx = 1;

    if (search) {
      sql += ` AND (LOWER(city) LIKE $${paramIdx} OR LOWER(state) LIKE $${paramIdx} OR LOWER(zip) LIKE $${paramIdx} OR LOWER(address) LIKE $${paramIdx})`;
      params.push(`%${String(search).toLowerCase()}%`);
      paramIdx++;
    } else if (city) { sql += ` AND LOWER(city) LIKE $${paramIdx++}`; params.push(`%${String(city).toLowerCase()}%`); }
    if (state) { sql += ` AND LOWER(state) = $${paramIdx++}`; params.push(String(state).toLowerCase()); }
    if (community) { sql += ` AND LOWER(community) LIKE $${paramIdx++}`; params.push(`%${String(community).toLowerCase()}%`); }
    if (minRent) { sql += ` AND rent >= $${paramIdx++}`; params.push(Number(minRent)); }
    if (maxRent) { sql += ` AND rent <= $${paramIdx++}`; params.push(Number(maxRent)); }
    if (beds) { sql += ` AND bedrooms >= $${paramIdx++}`; params.push(Number(beds)); }
    if (baths) { sql += ` AND bathrooms >= $${paramIdx++}`; params.push(Number(baths)); }
    if (type) { sql += ` AND property_type = $${paramIdx++}`; params.push(String(type)); }
    if (petFriendly === 'true') { sql += ' AND pet_friendly = 1'; }
    if (furnished === 'true') { sql += ' AND furnished = 1'; }
    if (status) { sql += ` AND status = $${paramIdx++}`; params.push(String(status)); }

    sql += ' ORDER BY created_at DESC';

    const { rows } = await db.query(sql, params);
    res.json(rows.map(parsePropertyRow));
  } catch (err) {
    console.error('[properties GET]', err);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// Refreshes image URLs from the Zillow source saved for a property. This is
// deliberately authenticated so public browsing never triggers third-party requests.
router.post('/:id/sync-zillow-photos', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM properties WHERE id = $1', [req.params.id]);
    const property = rows[0];
    if (!property) return res.status(404).json({ error: 'Property not found' });
    if (!property.zillow_url) return res.status(400).json({ error: 'This property has no Zillow listing link' });

    const photos = await fetchZillowPhotos(property.zillow_url);
    if (!photos.length) return res.status(502).json({ error: 'No photos could be retrieved from the Zillow listing' });

    const updated = await db.query('UPDATE properties SET photos = $1 WHERE id = $2 RETURNING *', [JSON.stringify(photos), req.params.id]);
    res.json(parsePropertyRow(updated.rows[0]));
  } catch (err) {
    console.error('[properties Zillow photo sync]', err);
    res.status(500).json({ error: 'Failed to refresh Zillow photos' });
  }
});

// GET single (public)
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM properties WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Property not found' });
    res.json(parsePropertyRow(rows[0]));
  } catch (err) {
    console.error('[properties GET/:id]', err);
    res.status(500).json({ error: 'Failed to fetch property' });
  }
});

// POST create (auth)
router.post('/', requireAuth, upload.array('photos', 10), async (req, res) => {
  try {
    const { title, address, city, state, zip, community, rent, bedrooms, bathrooms, sqft,
      property_type, furnished, pet_friendly, description, amenities, availability_date, status } = req.body;

    if (!title || !address || !city || !state || !zip || !rent || !bedrooms || !bathrooms) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const uploadedPhotos = await Promise.all(
      (Array.isArray(req.files) ? req.files : []).map(uploadPropertyPhoto)
    );
    const photosJson = JSON.stringify(uploadedPhotos);
    const amenitiesJson = typeof amenities === 'string' ? amenities : JSON.stringify(amenities || []);

    const { rows } = await db.query(`
      INSERT INTO properties (title,address,city,state,zip,community,rent,bedrooms,bathrooms,sqft,property_type,furnished,pet_friendly,description,amenities,photos,availability_date,status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
      RETURNING *
    `, [
      title, address, city, state, zip, community || null, Number(rent), Number(bedrooms), Number(bathrooms),
      sqft ? Number(sqft) : null, property_type || 'Townhome', furnished ? 1 : 0, pet_friendly ? 1 : 0,
      description || null, amenitiesJson, photosJson, availability_date || null, status || 'available'
    ]);

    res.status(201).json(parsePropertyRow(rows[0]));
  } catch (err) {
    console.error('[properties POST]', err);
    res.status(500).json({ error: 'Failed to create property' });
  }
});

// PUT update (auth)
router.put('/:id', requireAuth, upload.array('photos', 10), async (req, res) => {
  try {
    const existingResult = await db.query('SELECT * FROM properties WHERE id = $1', [req.params.id]);
    const existing = existingResult.rows[0];
    if (!existing) return res.status(404).json({ error: 'Property not found' });

    const { title, address, city, state, zip, community, rent, bedrooms, bathrooms, sqft,
      property_type, furnished, pet_friendly, description, amenities, availability_date, status, existing_photos } = req.body;

    const newPhotos = await Promise.all(
      (Array.isArray(req.files) ? req.files : []).map(uploadPropertyPhoto)
    );
    const keptPhotos: string[] = existing_photos ? JSON.parse(existing_photos) : parsePropertyRow(existing).photos;
    const allPhotos = [...keptPhotos, ...newPhotos];
    const amenitiesJson = typeof amenities === 'string' ? amenities : JSON.stringify(amenities || []);

    const { rows } = await db.query(`
      UPDATE properties SET title=$1,address=$2,city=$3,state=$4,zip=$5,community=$6,rent=$7,bedrooms=$8,bathrooms=$9,sqft=$10,
      property_type=$11,furnished=$12,pet_friendly=$13,description=$14,amenities=$15,photos=$16,availability_date=$17,status=$18
      WHERE id=$19
      RETURNING *
    `, [
      title || existing.title, address || existing.address, city || existing.city, state || existing.state,
      zip || existing.zip, community ?? existing.community, Number(rent || existing.rent),
      Number(bedrooms || existing.bedrooms), Number(bathrooms || existing.bathrooms),
      sqft ? Number(sqft) : existing.sqft, property_type || existing.property_type,
      furnished !== undefined ? Number(!!furnished) : existing.furnished,
      pet_friendly !== undefined ? Number(!!pet_friendly) : existing.pet_friendly,
      description ?? existing.description, amenitiesJson, JSON.stringify(allPhotos),
      availability_date ?? existing.availability_date, status || existing.status,
      req.params.id
    ]);

    res.json(parsePropertyRow(rows[0]));
  } catch (err) {
    console.error('[properties PUT]', err);
    res.status(500).json({ error: 'Failed to update property' });
  }
});

// PATCH status only (auth)
router.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['available', 'occupied', 'maintenance'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    await db.query('UPDATE properties SET status=$1 WHERE id=$2', [status, req.params.id]);
    res.json({ success: true, status });
  } catch (err) {
    console.error('[properties PATCH status]', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// DELETE (auth)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT id FROM properties WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    await db.query('DELETE FROM properties WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('[properties DELETE]', err);
    res.status(500).json({ error: 'Failed to delete property' });
  }
});

export default router;
