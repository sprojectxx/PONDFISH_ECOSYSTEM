import { DomainError } from '../middleware/errorHandler';

/**
 * Resolves the JWT Secret for token signing and verification.
 * Enforces strict fail-closed security bounds when NODE_ENV is 'production'.
 */
export function getJwtSecret(): string {
  const env = process.env.NODE_ENV;
  const secret = process.env.JWT_SECRET;

  if (env === 'production') {
    if (!secret || secret.trim().length === 0) {
      throw new DomainError(
        'ERR_CONFIG_MISSING',
        'CRITICAL: JWT_SECRET environment variable is missing in production environment.',
        500
      );
    }
    if (secret.trim().length < 32) {
      throw new DomainError(
        'ERR_JWT_CONFIG_INVALID',
        'CRITICAL: JWT_SECRET in production must be at least 32 characters long for cryptographic safety.',
        500
      );
    }
    return secret.trim();
  }

  // Non-production (development / test): allow configured secret or safe fallback
  return secret && secret.trim().length > 0 ? secret.trim() : 'fallback_dev_jwt_secret';
}
