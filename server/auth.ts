import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'shadowbyte-forensixplore-jwt-secret-key-r201d-2026';

export interface OrganizerPayload {
  username: string;
  role: 'ORGANIZER';
  iat?: number;
  exp?: number;
}

export function generateOrganizerToken(username: string): string {
  return jwt.sign(
    { username, role: 'ORGANIZER' },
    JWT_SECRET,
    { expiresIn: '12h' }
  );
}

export function verifyOrganizerToken(token: string): OrganizerPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as OrganizerPayload;
    if (decoded && decoded.role === 'ORGANIZER') {
      return decoded;
    }
    return null;
  } catch {
    return null;
  }
}

export function requireOrganizerAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({
      error: 'Unauthorized: Missing Authorization header. Organizer token required.',
      code: 'AUTH_REQUIRED',
    });
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({
      error: 'Unauthorized: Invalid Authorization format. Expected "Bearer <token>".',
      code: 'INVALID_AUTH_FORMAT',
    });
    return;
  }

  const token = parts[1];
  const payload = verifyOrganizerToken(token);

  if (!payload) {
    res.status(403).json({
      error: 'Forbidden: Invalid or expired organizer token. Please log in again.',
      code: 'INVALID_TOKEN',
    });
    return;
  }

  // Attach organizer info to request
  (req as Request & { organizer?: OrganizerPayload }).organizer = payload;
  next();
}

