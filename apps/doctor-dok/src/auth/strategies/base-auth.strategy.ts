import type { 
  IAuthMode, 
  CreateUserDto, 
  User, 
  LoginDto, 
  AuthResult, 
  TokenPair,
  FullAuthConfig,
  JwtPayload
} from '@doctor-dok/shared-types';
import { AuthError, AuthErrorCode } from '@doctor-dok/shared-types';
import jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

/**
 * Base authentication strategy implementing common operations.
 * Specific auth modes (single-tenant, multi-tenant) extend this class.
 */
export abstract class BaseAuthStrategy implements IAuthMode {
  protected config: FullAuthConfig;
  protected initialized: boolean = false;
  
  // Token blacklist to prevent refresh token reuse (T216_phase2.6_cp1)
  private usedRefreshTokens: Set<string> = new Set();

  constructor(config: FullAuthConfig) {
    this.config = config;
  }

  /**
   * Initialize the authentication strategy.
   * Subclasses should override to perform mode-specific initialization.
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Perform common initialization
    await this.validateConfiguration();
    
    // Call mode-specific initialization
    await this.initializeStrategy();
    
    this.initialized = true;
  }

  /**
   * Mode-specific initialization logic.
   * Must be implemented by subclasses.
   */
  protected abstract initializeStrategy(): Promise<void>;

  /**
   * Validate configuration for this auth mode.
   * Can be overridden by subclasses for additional validation.
   */
  protected async validateConfiguration(): Promise<void> {
    if (!this.config.tokenExpiration?.access || !this.config.tokenExpiration?.refresh) {
      throw new AuthError(
        AuthErrorCode.INVALID_CONFIGURATION,
        'Token expiration configuration is required',
        500
      );
    }

    if (!this.config.encryption?.algorithm || !this.config.encryption?.keyLength) {
      throw new AuthError(
        AuthErrorCode.INVALID_CONFIGURATION,
        'Encryption configuration is required',
        500
      );
    }
  }

  /**
   * Create a new user - must be implemented by subclasses
   */
  abstract createUser(userData: CreateUserDto): Promise<User>;

  /**
   * Authenticate a user - must be implemented by subclasses
   */
  abstract authenticateUser(credentials: LoginDto): Promise<AuthResult>;

  /**
   * Delete a user - must be implemented by subclasses
   */
  abstract deleteUser(userId: string): Promise<void>;

  /**
   * Logout a user - can be overridden by subclasses
   */
  async logout(userId: string): Promise<void> {
    // Default implementation - subclasses can override for session management
    // In JWT-based auth, logout is typically handled client-side
    // But we can implement token blacklisting here if needed
    await this.invalidateUserTokens(userId);
  }

  /**
   * Refresh authentication tokens using a refresh token.
   * T216_phase2.6_cp1: Enhanced to prevent refresh token reuse and ensure new tokens
   */
  async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      // Verify the refresh token
      const payload = await this.verifyToken(refreshToken, 'refresh');
      
      // Check if this refresh token has already been used
      if (this.usedRefreshTokens.has(payload.jti || refreshToken)) {
        throw new AuthError(
          AuthErrorCode.INVALID_TOKEN,
          'Refresh token has already been used',
          401
        );
      }
      
      // Check if user still exists and is active
      await this.validateUserStatus(payload.sub);
      
      // Mark this refresh token as used to prevent reuse
      this.usedRefreshTokens.add(payload.jti || refreshToken);
      
      // Generate completely new token pair with new identifiers
      const newTokens = this.generateTokenPair(payload.sub, payload.permissions || []);
      
      // Clean up old used tokens periodically (keep only last 100)
      if (this.usedRefreshTokens.size > 100) {
        const tokensToDelete = Array.from(this.usedRefreshTokens).slice(0, 50);
        tokensToDelete.forEach(token => this.usedRefreshTokens.delete(token));
      }
      
      return newTokens;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError(
        AuthErrorCode.INVALID_TOKEN,
        'Invalid or expired refresh token',
        401
      );
    }
  }

  /**
   * Check if this auth mode requires a master key - must be implemented by subclasses
   */
  abstract requiresMasterKey(): boolean;

  /**
   * Check if this auth mode supports multiple users - must be implemented by subclasses
   */
  abstract supportsMultipleUsers(): boolean;

  /**
   * Generate a JWT token pair (access and refresh tokens)
   * T216_phase2.6_cp1: Fix token refresh to generate new tokens instead of returning same token
   */
  protected generateTokenPair(userId: string, permissions: string[] = []): TokenPair {
    const accessTokenExpiration = this.getTokenExpirationSeconds('access');
    const refreshTokenExpiration = this.getTokenExpirationSeconds('refresh');
    
    // Generate unique identifiers for each token to ensure they're always different
    const currentTime = Math.floor(Date.now() / 1000);
    const accessTokenId = crypto.randomBytes(16).toString('hex');
    const refreshTokenId = crypto.randomBytes(16).toString('hex');

    const basePayload: Partial<JwtPayload> = {
      sub: userId,
      permissions,
      iss: 'doctor-dok',
      aud: this.config.mode,
      iat: currentTime // Explicit issued at timestamp
    };

    const accessToken = jwt.sign(
      {
        ...basePayload,
        type: 'access',
        jti: accessTokenId // Unique ID for access token
      },
      this.getJwtSecret(),
      {
        expiresIn: accessTokenExpiration,
        algorithm: 'HS256'
      }
    );

    const refreshToken = jwt.sign(
      {
        ...basePayload,
        type: 'refresh',
        jti: refreshTokenId, // Unique ID for refresh token
        // Add slight delay to ensure different iat if called rapidly
        iat: currentTime + 1
      },
      this.getJwtSecret(),
      {
        expiresIn: refreshTokenExpiration,
        algorithm: 'HS256'
      }
    );

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: accessTokenExpiration
    };
  }

  /**
   * Verify a JWT token
   */
  protected async verifyToken(token: string, type: 'access' | 'refresh'): Promise<JwtPayload> {
    try {
      const payload = jwt.verify(token, this.getJwtSecret()) as any;
      
      if (payload.type !== type) {
        throw new Error(`Invalid token type: expected ${type}, got ${payload.type}`);
      }

      return payload as JwtPayload;
    } catch (error) {
      throw new AuthError(
        AuthErrorCode.INVALID_TOKEN,
        `Invalid ${type} token`,
        401
      );
    }
  }

  /**
   * Get JWT secret from configuration or generate one
   */
  protected getJwtSecret(): string {
    // In production, this should come from environment variable
    return process.env.JWT_SECRET || this.generateDefaultSecret();
  }

  /**
   * Generate a default JWT secret (for development only)
   */
  private generateDefaultSecret(): string {
    // This is only for development - in production, JWT_SECRET must be set
    if (process.env.NODE_ENV === 'production') {
      throw new AuthError(
        AuthErrorCode.INVALID_CONFIGURATION,
        'JWT_SECRET must be set in production',
        500
      );
    }
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Get token expiration in seconds
   */
  protected getTokenExpirationSeconds(type: 'access' | 'refresh'): number {
    const expiration = this.config.tokenExpiration[type];
    
    if (typeof expiration === 'number') {
      return expiration;
    }

    // Parse string format (e.g., '15m', '7d', '1h')
    const match = expiration.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(`Invalid token expiration format: ${expiration}`);
    }

    const [, value, unit] = match;
    const numValue = parseInt(value, 10);

    switch (unit) {
      case 's': return numValue;
      case 'm': return numValue * 60;
      case 'h': return numValue * 60 * 60;
      case 'd': return numValue * 60 * 60 * 24;
      default: throw new Error(`Unknown time unit: ${unit}`);
    }
  }

  /**
   * Validate user status - to be implemented by subclasses
   */
  protected abstract validateUserStatus(userId: string): Promise<void>;

  /**
   * Invalidate user tokens - enhanced for refresh token blacklisting
   * T216_phase2.6_cp1: Add method to blacklist refresh token on logout
   */
  protected async invalidateUserTokens(userId: string): Promise<void> {
    // Default implementation blacklists all refresh tokens for this user
    // In a real implementation, we'd store user-token mapping in database
    // For now, we clear all used tokens as a security measure
    this.usedRefreshTokens.clear();
  }

  /**
   * Blacklist a specific refresh token (T216_phase2.6_cp1)
   */
  protected blacklistRefreshToken(tokenOrJti: string): void {
    this.usedRefreshTokens.add(tokenOrJti);
  }

  /**
   * Hash a password using the configured algorithm
   */
  protected async hashPassword(password: string): Promise<string> {
    // Implementation depends on the chosen hashing library
    // This is a placeholder that should be implemented based on requirements
    throw new Error('Password hashing not implemented');
  }

  /**
   * Verify a password against a hash
   */
  protected async verifyPassword(password: string, hash: string): Promise<boolean> {
    // Implementation depends on the chosen hashing library
    // This is a placeholder that should be implemented based on requirements
    throw new Error('Password verification not implemented');
  }
}