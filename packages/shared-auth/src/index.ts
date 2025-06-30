/**
 * @doctor-dok/shared-auth
 * Shared authentication services extracted from Doctor-Dok template
 */

// Types
export * from './types/auth.types';

// Services
export { BaseAuthService, type AuthServiceConfig } from './services/base-auth.service';

// Utilities
export { 
  EncryptionUtils, 
  sha256Hash, 
  generateRandomString,
  type EncryptionSettings 
} from './utils/crypto';

export { 
  JWTService,
  type TokenPayload,
  type TokenPair,
  type JWTConfig 
} from './utils/jwt';

export {
  InputSanitizer,
  type SanitizeOptions
} from './utils/input-sanitizer';

// Middleware
export { 
  createAuthMiddleware, 
  getUserFromRequest,
  type AuthMiddlewareConfig 
} from './middleware/auth.middleware';

export {
  CSRFProtection,
  csrfProtection,
  type CSRFConfig,
  type CSRFTokenData
} from './middleware/csrf.middleware';