import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';

export class DomainError extends Error {
  code: string;
  statusCode: number;
  details?: any[];

  constructor(code: string, message: string, statusCode = 400, details?: any[]) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, DomainError.prototype);
  }
}

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  logger.error(`[Error] ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  if (err instanceof DomainError) {
    return sendError(res, err.code, err.message, err.statusCode, err.details);
  }

  // Fallback 500 Internal Server Error
  return sendError(res, 'ERR_INTERNAL_SERVER_ERROR', 'An unexpected internal error occurred.', 500);
}
