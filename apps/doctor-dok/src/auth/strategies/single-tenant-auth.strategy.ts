import type { CreateUserDto, User, LoginDto, AuthResult, FullAuthConfig } from '@doctor-dok/shared-types';
import { AuthError, AuthErrorCode } from '@doctor-dok/shared-types';
import { BaseAuthStrategy } from './base-auth.strategy';

/**
 * Single-tenant authentication strategy.
 * Supports one user per database with master key encryption.
 */
export class SingleTenantAuthMode extends BaseAuthStrategy {
  private user: User | null = null;

  constructor(config: FullAuthConfig) {
    super(config);
  }

  /**
   * Initialize single-tenant specific resources
   */
  protected async initializeStrategy(): Promise<void> {
    // Validate single-tenant specific configuration
    if (!this.config.singleTenant?.masterKey) {
      throw new AuthError(
        AuthErrorCode.INVALID_CONFIGURATION,
        'Master key is required for single-tenant mode',
        500
      );
    }

    // Initialize database connection if needed
    // This would connect to the local SQLite database
  }

  /**
   * Create the single user for this database
   */
  async createUser(userData: CreateUserDto): Promise<User> {
    // In single-tenant mode, only one user is allowed
    if (this.user) {
      throw new AuthError(
        AuthErrorCode.MODE_NOT_SUPPORTED,
        'Single-tenant mode only supports one user',
        400
      );
    }

    // Create user with encrypted database
    const user: User = {
      id: 'single-user-' + Date.now(),
      email: userData.email,
      username: userData.username || userData.email,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: userData.metadata || {}
    };

    // In real implementation, this would:
    // 1. Create encrypted SQLite database
    // 2. Store user info in the database
    // 3. Set up encryption with master key
    
    this.user = user;
    return user;
  }

  /**
   * Authenticate the single user
   */
  async authenticateUser(credentials: LoginDto): Promise<AuthResult> {
    if (!this.user) {
      throw new AuthError(
        AuthErrorCode.USER_NOT_FOUND,
        'No user exists in this database',
        404
      );
    }

    // Validate master key
    if (!credentials.encryptionKey || credentials.encryptionKey !== this.config.singleTenant?.masterKey) {
      throw new AuthError(
        AuthErrorCode.INVALID_CREDENTIALS,
        'Invalid encryption key',
        401
      );
    }

    // In real implementation, would also verify:
    // 1. Database ID matches
    // 2. Password if set
    // 3. Database can be decrypted with provided key

    const tokens = this.generateTokenPair(this.user.id);

    return {
      user: this.user,
      tokens,
      permissions: ['all'], // Single tenant has all permissions
      expiresIn: this.getTokenExpirationSeconds('access')
    };
  }

  /**
   * Delete the single user and their database
   */
  async deleteUser(userId: string): Promise<void> {
    if (!this.user || this.user.id !== userId) {
      throw new AuthError(
        AuthErrorCode.USER_NOT_FOUND,
        'User not found',
        404
      );
    }

    // In real implementation, would:
    // 1. Delete the encrypted database file
    // 2. Clear any cached data
    // 3. Invalidate all tokens

    this.user = null;
  }

  /**
   * Single-tenant mode requires a master key
   */
  requiresMasterKey(): boolean {
    return true;
  }

  /**
   * Single-tenant mode supports only one user
   */
  supportsMultipleUsers(): boolean {
    return false;
  }

  /**
   * Validate user status - in single-tenant, just check if user exists
   */
  protected async validateUserStatus(userId: string): Promise<void> {
    if (!this.user || this.user.id !== userId) {
      throw new AuthError(
        AuthErrorCode.USER_NOT_FOUND,
        'User not found or inactive',
        404
      );
    }
  }
}