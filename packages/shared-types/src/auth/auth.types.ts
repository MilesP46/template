/**
 * Authentication configuration for the application
 */
export interface AuthConfig {
  mode: 'single-tenant' | 'multi-tenant';
  tokenExpiration: {
    access: string | number;  // e.g., '15m' or 900 (seconds)
    refresh: string | number; // e.g., '7d' or 604800 (seconds)
  };
  encryption: {
    algorithm: string;
    keyLength: number;
    saltRounds?: number;
  };
  session?: {
    secret: string;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
  };
}

/**
 * Single-tenant specific configuration
 */
export interface SingleTenantConfig {
  masterKey: string;
  databasePath?: string;
  encryptionKey?: string;
  allowMultipleInstances?: boolean;
}

/**
 * Multi-tenant specific configuration
 */
export interface MultiTenantConfig {
  databaseUrl: string;
  maxUsersPerTenant?: number;
  isolationLevel?: 'strict' | 'moderate' | 'shared';
  tenantIdStrategy?: 'uuid' | 'subdomain' | 'header';
}

/**
 * Combined authentication configuration
 */
export interface FullAuthConfig extends AuthConfig {
  singleTenant?: SingleTenantConfig;
  multiTenant?: MultiTenantConfig;
}

/**
 * Authentication error codes
 */
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  INVALID_CONFIGURATION = 'INVALID_CONFIGURATION',
  DATABASE_ERROR = 'DATABASE_ERROR',
  ENCRYPTION_ERROR = 'ENCRYPTION_ERROR',
  MODE_NOT_SUPPORTED = 'MODE_NOT_SUPPORTED'
}

/**
 * Custom authentication error class
 */
export class AuthError extends Error {
  constructor(
    public code: AuthErrorCode,
    message: string,
    public statusCode: number = 401,
    public details?: any
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * JWT payload structure
 */
export interface JwtPayload {
  sub: string;  // Subject (user ID)
  iat: number;  // Issued at
  exp: number;  // Expiration
  iss?: string; // Issuer
  aud?: string; // Audience
  jti?: string; // JWT ID
  permissions?: string[];
  tenantId?: string;
}

/**
 * Session data structure
 */
export interface SessionData {
  userId: string;
  tenantId?: string;
  permissions: string[];
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
}

/**
 * Authentication middleware options
 */
export interface AuthMiddlewareOptions {
  skipPaths?: string[];
  publicPaths?: string[];
  requirePermissions?: string[];
  customValidator?: (token: string) => Promise<boolean>;
}