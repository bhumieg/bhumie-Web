import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'ghar24_secret_default_key_production';

export interface JwtPayload {
  userId: string;
  email: string;
  role: 'USER' | 'OWNER' | 'ADMIN';
  name?: string;
}

export function signJwtToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '30d',
  });
}

export function verifyJwtToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (err) {
    return null;
  }
}

export async function getAuthUser(req: NextRequest) {
  // Check Authorization header first (Mobile App & Web API calls)
  const authHeader = req.headers.get('authorization');
  let token: string | null = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // Fallback to cookie (Web browser session)
  if (!token) {
    const cookieToken = req.cookies.get('token')?.value;
    if (cookieToken) token = cookieToken;
  }

  if (!token) return null;

  const payload = verifyJwtToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  return user;
}

