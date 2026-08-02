import { Router } from 'express';
import { db } from '../db/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// POST submit lead (public)
router.post('/', async (req, res) => {
  try {
    const { full_name, email, phone, interest_type, preferred_date, preferred_time, message, property_id, source } = req.body;
    if (!full_name || !email) return res.status(400).json({ error: 'Name and email are required' });

    const { rows } = await db.query(`
      INSERT INTO leads (full_name,email,phone,interest_type,preferred_date,preferred_time,message,property_id,source)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING id
    `, [full_name, email, phone || null, interest_type || 'renting', preferred_date || null, preferred_time || null, message || null, property_id || null, source || 'website']);

    res.status(201).json({ success: true, id: rows[0].id });
  } catch (err) {
    console.error('[leads POST]', err);
    res.status(500).json({ error: 'Failed to submit lead' });
  }
});

// GET all leads (auth)
router.get('/', requireAuth, async (req, res) => {
  try {
    const { contacted } = req.query;
    let sql = `
      SELECT l.*, p.title as property_title, p.address as property_address
      FROM leads l LEFT JOIN properties p ON l.property_id = p.id
    `;
    const params: unknown[] = [];
    if (contacted !== undefined) {
      sql += ' WHERE l.contacted = $1';
      params.push(contacted === 'true' ? 1 : 0);
    }
    sql += ' ORDER BY l.created_at DESC';
    const { rows } = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('[leads GET]', err);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// GET stats for dashboard (auth)
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const total = (await db.query('SELECT COUNT(*)::int AS c FROM leads')).rows[0].c;
    const todayCount = (await db.query('SELECT COUNT(*)::int AS c FROM leads WHERE created_at::date = $1::date', [today])).rows[0].c;
    const newLeads = (await db.query('SELECT COUNT(*)::int AS c FROM leads WHERE contacted = 0')).rows[0].c;
    res.json({ total, today: todayCount, new: newLeads });
  } catch (err) {
    console.error('[leads stats]', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// PATCH mark contacted (auth)
router.patch('/:id/contacted', requireAuth, async (req, res) => {
  try {
    await db.query('UPDATE leads SET contacted = 1 WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('[leads PATCH contacted]', err);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

// DELETE lead (auth)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM leads WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('[leads DELETE]', err);
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

export default router;
