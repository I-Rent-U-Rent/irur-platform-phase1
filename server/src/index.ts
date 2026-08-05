import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { initDb } from './db/database.js';
import authRouter from './routes/auth.js';
import propertiesRouter from './routes/properties.js';
import leadsRouter from './routes/leads.js';
import { isGcsEnabled } from './services/storage.js';

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const IS_PROD = process.env.NODE_ENV === 'production';

app.use(cors({ origin: IS_PROD ? false : ['http://localhost:5173', 'http://localhost:5174'] }));
app.use(express.json());

if (!isGcsEnabled()) {
  const uploadsDir = path.join(process.cwd(), 'data/uploads');
  fs.mkdirSync(uploadsDir, { recursive: true });
  app.use('/uploads', express.static(uploadsDir));
}

// API routes
app.use('/api/auth', authRouter);
app.use('/api/properties', propertiesRouter);
app.use('/api/leads', leadsRouter);
app.get('/api/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// Serve React build in production
if (IS_PROD) {
  const clientDist = path.join(process.cwd(), 'client/dist');
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
    console.log('[Static] Serving React build from', clientDist);
  }
}

async function start() {
  try {
    await initDb();
    console.log('[DB] PostgreSQL initialized');
    app.listen(PORT, () => {
      console.log(`[IRUR Phase 1] http://localhost:${PORT} (${IS_PROD ? 'production' : 'development'})`);
    });
  } catch (err) {
    console.error('[DB] Failed to initialize:', err);
    process.exit(1);
  }
}

start();
