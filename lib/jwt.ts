import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'loop_super_secret_key_local_dev_only_32chars';

export interface TokenPayload {
  id: string;
  email: string;
  role: 'USER' | 'BUSINESS' | 'ADMIN' | string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BLOCKED' | string;
}

export function signJwtToken(payload: TokenPayload, expiresIn: string = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as any });
}

export function verifyJwtToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function extractJwtToken(req: Request): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return null;
}
