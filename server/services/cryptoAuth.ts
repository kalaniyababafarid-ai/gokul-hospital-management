import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import type { UserRole } from '../../src/types/hospital.ts';
import { getSessionSecret } from './demoConfig.ts';

const SECRET = getSessionSecret();

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, key] = parts;
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(derived, 'hex'));
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  fullName: string;
  doctorId?: string;
  exp: number;
}

export function signToken(payload: Omit<TokenPayload, 'exp'>, expiresInHours = 24): string {
  const fullPayload: TokenPayload = {
    ...payload,
    exp: Date.now() + expiresInHours * 60 * 60 * 1000,
  };
  const data = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  return `${data}.${signature}`;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [data, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
    if (signature !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8')) as TokenPayload;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function extractUser(req: AuthenticatedRequest): TokenPayload | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  return verifyToken(token);
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const user = extractUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required. Please log in to continue.' });
  }
  req.user = user;
  next();
}

export function requireRoles(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = extractUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        error: `Unauthorized access. Required role: ${allowedRoles.join(' or ')}.`,
      });
    }
    req.user = user;
    next();
  };
}

export function sanitizeString(val: unknown, maxLength = 500): string {
  if (typeof val !== 'string') return '';
  return val
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength);
}
