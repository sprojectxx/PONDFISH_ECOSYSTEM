import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { DomainError } from './errorHandler';

export interface AuthenticatedUser {
  id: string;
  role: 'CUSTOMER' | 'WORKER' | 'ADMIN' | 'TV';
  mobileNumber?: string;
  email?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_dev_jwt_secret';

export function authenticateJWT(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new DomainError('ERR_UNAUTHORIZED', 'Missing or invalid Authorization header token.', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (error) {
    throw new DomainError('ERR_UNAUTHORIZED', 'Expired or invalid authentication session token.', 401);
  }
}

export function requireRole(allowedRoles: Array<'CUSTOMER' | 'WORKER' | 'ADMIN' | 'TV'>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new DomainError('ERR_UNAUTHORIZED', 'Authentication required.', 401);
    }
    if (!allowedRoles.includes(req.user.role)) {
      throw new DomainError('ERR_FORBIDDEN', 'Access denied. Insufficient permissions for this resource.', 403);
    }
    next();
  };
}
