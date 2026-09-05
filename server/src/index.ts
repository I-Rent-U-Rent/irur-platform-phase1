import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { initDb } from './db/database.js';
import authRouter from './routes/auth.js';
import propertiesRouter from './routes/properties.js';
import leadsRouter from './routes/leads.js';
import { isGcsEnabled } from './services/storage.js';
import { notificationStatus } from './services/notify.js';

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const IS_PROD = process.env.NODE_ENV === 'production';

// Behind nginx: trust the first proxy hop so the real client IP (X-Forwarded-For)
// reaches the rate limiter, instead of every request looking like it came from nginx.
app.set('trust proxy', 1);

// Security headers. crossOriginResourcePolicy is relaxed so property images can be
// embedded by the same-origin React app; CSP is left to the app's own needs.
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.disable('x-powered-by');

app.use(cors({ origin: IS_PROD ? false : ['http://localhost:5173', 'http://localhost:5174'] }));
app.use(express.json({ limit: '100kb' }));

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
      console.log(`[IRENTURENT] http://localhost:${PORT} (${IS_PROD ? 'production' : 'development'})`);
      console.log(`[notify] lead alerts: ${notificationStatus()}`);
    });
  } catch (err) {
    console.error('[DB] Failed to initialize:', err);
    process.exit(1);
  }
}

start();
