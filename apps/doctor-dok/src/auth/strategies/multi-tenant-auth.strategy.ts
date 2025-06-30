import type { CreateUserDto, User, LoginDto, AuthResult, FullAuthConfig } from '@doctor-dok/shared-types';
import { AuthError, AuthErrorCode } from '@doctor-dok/shared-types';
import { BaseAuthStrategy } from './base-auth.strategy';
import { InputSanitizer } from '@doctor-dok/shared-auth/utils/input-sanitizer';

/**
 * Multi-tenant authentication strategy.
 * Supports multiple users in a shared database with tenant isolation.
 */
export class MultiTenantAuthMode extends BaseAuthStrategy {
  // In-memory user store for demonstration
  // Real implementation would use database
  private users: Map<string, User> = new Map();
  private userPasswords: Map<string, string> = new Map();

  constructor(config: FullAuthConfig) {
    super(config);
  }

  /**
   * Initialize multi-tenant specific resources
   */
  protected async initializeStrategy(): Promise<void> {
    // Validate multi-tenant specific configuration
    if (!this.config.multiTenant?.databaseUrl) {
      throw new AuthError(
        AuthErrorCode.INVALID_CONFIGURATION,
        'Database URL is required for multi-tenant mode',
        500
      );
    }

    // Initialize database connection
    // This would connect to the shared database (PostgreSQL, MySQL, etc.)
    // await this.initializeDatabase();
  }

  /**
   * Create a new user in the shared database
   */
  async createUser(userData: CreateUserDto): Promise<User> {
    // Sanitize user input to prevent XSS attacks
    const sanitizedData = InputSanitizer.sanitizeRegistrationData({
      email: userData.email,
      password: userData.password,
      databaseId: userData.databaseId
    });

    // Check if user already exists
    const existingUser = Array.from(this.users.values()).find(u => u.email === sanitizedData.email);
    if (existingUser) {
      throw new AuthError(
        AuthErrorCode.MODE_NOT_SUPPORTED,
        'User with this email already exists',
        409
      );
    }

    // Check max users per tenant limit
    if (this.config.multiTenant?.maxUsersPerTenant) {
      const userCount = this.users.size;
      if (userCount >= this.config.multiTenant.maxUsersPerTenant) {
        throw new AuthError(
          AuthErrorCode.MODE_NOT_SUPPORTED,
          'Maximum users per tenant limit reached',
          403
        );
      }
    }

    // Create new user
    const user: User = {
      id: 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      email: sanitizedData.email,
      username: userData.username ? InputSanitizer.sanitizeForDatabase(userData.username, 50) : sanitizedData.email,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        ...userData.metadata,
        tenantId: this.generateTenantId()
      }
    };

    // In real implementation, this would:
    // 1. Hash the password
    // 2. Store user in database with tenant isolation
    // 3. Set up row-level security
    
    this.users.set(user.id, user);
    this.userPasswords.set(user.id, sanitizedData.password); // In real app, this would be hashed

    return user;
  }

  /**
   * Authenticate a user from the shared database
   */
  async authenticateUser(credentials: LoginDto): Promise<AuthResult> {
    // Sanitize login credentials to prevent XSS attacks
    const sanitizedCredentials = InputSanitizer.sanitizeLoginData({
      email: credentials.email,
      password: credentials.password
    });

    // Find user by email or username
    const user = Array.from(this.users.values()).find(u => 
      u.email === sanitizedCredentials.email || 
      u.username === credentials.username
    );

    if (!user) {
      throw new AuthError(
        AuthErrorCode.USER_NOT_FOUND,
        'Invalid credentials',
        401
      );
    }

    // Verify password
    const storedPassword = this.userPasswords.get(user.id);
    if (!storedPassword || storedPassword !== sanitizedCredentials.password) {
      throw new AuthError(
        AuthErrorCode.INVALID_CREDENTIALS,
        'Invalid credentials',
        401
      );
    }

    // Generate tokens with tenant context
    const tokens = this.generateTokenPair(user.id, ['read', 'write']);

    return {
      user,
      tokens,
      permissions: ['read', 'write'],
      expiresIn: this.getTokenExpirationSeconds('access')
    };
  }

  /**
   * Delete a user from the shared database
   */
  async deleteUser(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (!user) {
      throw new AuthError(
        AuthErrorCode.USER_NOT_FOUND,
        'User not found',
        404
      );
    }

    // In real implementation, would:
    // 1. Delete user from database
    // 2. Delete all user's data respecting tenant boundaries
    // 3. Invalidate all user's tokens

    this.users.delete(userId);
    this.userPasswords.delete(userId);
  }

  /**
   * Multi-tenant mode does not require a master key
   */
  requiresMasterKey(): boolean {
    return false;
  }

  /**
   * Multi-tenant mode supports multiple users
   */
  supportsMultipleUsers(): boolean {
    return true;
  }

  /**
   * Validate user status in multi-tenant context
   */
  protected async validateUserStatus(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (!user) {
      throw new AuthError(
        AuthErrorCode.USER_NOT_FOUND,
        'User not found or inactive',
        404
      );
    }

    // In real implementation, would also check:
    // 1. User is active
    // 2. Tenant is active
    // 3. User has not exceeded rate limits
  }

  /**
   * Generate a tenant ID based on configuration strategy
   */
  private generateTenantId(): string {
    const strategy = this.config.multiTenant?.tenantIdStrategy || 'uuid';
    
    switch (strategy) {
      case 'uuid':
        return 'tenant-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      
      case 'subdomain':
        // In real app, would extract from request headers
        return 'default-tenant';
      
      case 'header':
        // In real app, would extract from custom header
        return 'default-tenant';
      
      default:
        return 'default-tenant';
    }
  }
}