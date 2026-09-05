import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

const SECRET = config.jwtSecret;

export interface AuthUser { id: number; email: string; name: string; role: string; }

declare global {
  namespace Express { interface Request { user?: AuthUser; } }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(header.slice(7), SECRET) as AuthUser;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

export function signToken(user: AuthUser): string {
  return jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, SECRET, { expiresIn: '24h' });
}
