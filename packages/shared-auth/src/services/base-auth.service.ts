/**
 * Base authentication service
 * Provides common authentication functionality extracted from Doctor-Dok
 */

import { JWTService } from '../utils/jwt';
import type { TokenPair, TokenPayload } from '../utils/jwt';
import { EncryptionUtils } from '../utils/crypto';
import type { 
  User, 
  AuthResult, 
  LoginDto, 
  CreateUserDto, 
  KeyData,
  HashParams 
} from '../types/auth.types';
import { AuthError, AuthErrorCode } from '../types/auth.types';

export interface AuthServiceConfig {
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
  jwtAccessExpiry?: string;
  jwtRefreshExpiry?: string;
  masterKeyRequired?: boolean;
  encryptionEnabled?: boolean;
}

export abstract class BaseAuthService {
  protected jwtService: JWTService;
  protected encryptionUtils?: EncryptionUtils;
  protected config: AuthServiceConfig;

  constructor(config: AuthServiceConfig) {
    this.config = config;
    this.jwtService = new JWTService({
      accessTokenSecret: config.jwtAccessSecret,
      refreshTokenSecret: config.jwtRefreshSecret,
      accessTokenExpiry: config.jwtAccessExpiry || '15m',
      refreshTokenExpiry: config.jwtRefreshExpiry || '7d',
    });

    if (config.encryptionEnabled && config.masterKeyRequired) {
      // Encryption will be initialized per-user with their master key
    }
  }

  /**
   * Authenticate user with credentials
   */
  async authenticate(credentials: LoginDto): Promise<AuthResult> {
    try {
      // Verify database exists
      const databaseExists = await this.verifyDatabase(credentials.databaseId);
      if (!databaseExists) {
        throw new AuthError(
          'Database not found',
          AuthErrorCode.DATABASE_NOT_FOUND,
          404
        );
      }

      // Verify credentials
      const keyData = await this.verifyCredentials(credentials);
      if (!keyData) {
        throw new AuthError(
          'Invalid credentials',
          AuthErrorCode.INVALID_CREDENTIALS
        );
      }

      // Create user object
      const user = await this.createUserFromKey(keyData);

      // Generate tokens
      const tokens = await this.generateTokens(user, keyData);

      return {
        user,
        tokens,
      };
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError(
        'Authentication failed',
        AuthErrorCode.INVALID_CREDENTIALS
      );
    }
  }

  /**
   * Create new user/database
   */
  async createUser(data: CreateUserDto): Promise<AuthResult> {
    try {
      // Validate master key if required
      if (this.config.masterKeyRequired && !data.masterKey) {
        throw new AuthError(
          'Master key is required',
          AuthErrorCode.MASTER_KEY_REQUIRED,
          400
        );
      }

      // Create database and user
      const { user, keyData } = await this.createDatabase(data);

      // Generate tokens
      const tokens = await this.generateTokens(user, keyData);

      return {
        user,
        tokens,
      };
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError(
        'Failed to create user',
        AuthErrorCode.CONFIGURATION_ERROR,
        500
      );
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      const payload = await this.jwtService.verifyRefreshToken(refreshToken);
      
      // Verify user still exists and is active
      const keyData = await this.getKeyData(payload.keyId);
      if (!keyData) {
        throw new AuthError(
          'Invalid refresh token',
          AuthErrorCode.REFRESH_TOKEN_INVALID
        );
      }

      const user = await this.createUserFromKey(keyData);
      
      // Generate new token pair
      return await this.generateTokens(user, keyData);
    } catch (error) {
      throw new AuthError(
        'Invalid refresh token',
        AuthErrorCode.REFRESH_TOKEN_INVALID
      );
    }
  }

  /**
   * Verify JWT access token
   */
  async verifyToken(token: string): Promise<TokenPayload> {
    try {
      return await this.jwtService.verifyAccessToken(token);
    } catch (error) {
      throw new AuthError(
        'Invalid access token',
        AuthErrorCode.TOKEN_INVALID
      );
    }
  }

  /**
   * Generate token pair for user
   */
  protected async generateTokens(user: User, keyData: KeyData): Promise<TokenPair> {
    const payload: TokenPayload = {
      userId: user.id,
      databaseId: user.databaseId,
      keyId: keyData.id,
      role: user.role || 'user',
    };

    return await this.jwtService.generateTokenPair(payload);
  }

  /**
   * Get default hash parameters for password hashing
   */
  protected getDefaultHashParams(): HashParams {
    return {
      memory: 19456,
      iterations: 2,
      parallelism: 1,
      hashLength: 32,
      type: 'argon2id',
    };
  }

  // Abstract methods to be implemented by auth mode strategies
  protected abstract verifyDatabase(databaseId: string): Promise<boolean>;
  protected abstract verifyCredentials(credentials: LoginDto): Promise<KeyData | null>;
  protected abstract createDatabase(data: CreateUserDto): Promise<{ user: User; keyData: KeyData }>;
  protected abstract getKeyData(keyId: string): Promise<KeyData | null>;
  protected abstract createUserFromKey(keyData: KeyData): Promise<User>;
}