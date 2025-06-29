/**
 * Authentication mode interface defining common operations across different auth strategies.
 * Supports both single-tenant (encrypted DB per user) and multi-tenant (shared DB) modes.
 */
export interface IAuthMode {
  /**
   * Initialize the auth mode with any required setup.
   * This may include database connections, key validation, etc.
   */
  initialize(): Promise<void>;

  /**
   * Create a new user account.
   * Implementation varies based on auth mode (single DB vs shared DB).
   * @param userData - User creation data including credentials
   * @returns Created user information
   */
  createUser(userData: CreateUserDto): Promise<User>;

  /**
   * Authenticate a user with provided credentials.
   * @param credentials - Login credentials including username/email and password
   * @returns Authentication result with tokens and user info
   */
  authenticateUser(credentials: LoginDto): Promise<AuthResult>;

  /**
   * Refresh authentication tokens using a refresh token.
   * @param refreshToken - Valid refresh token
   * @returns New token pair (access and refresh tokens)
   */
  refreshToken(refreshToken: string): Promise<TokenPair>;

  /**
   * Logout a user and invalidate their session.
   * @param userId - ID of the user to logout
   */
  logout(userId: string): Promise<void>;

  /**
   * Delete a user account and all associated data.
   * @param userId - ID of the user to delete
   */
  deleteUser(userId: string): Promise<void>;

  /**
   * Check if this auth mode requires a master encryption key.
   * Single-tenant mode typically requires a master key for database encryption.
   * @returns True if master key is required
   */
  requiresMasterKey(): boolean;

  /**
   * Check if this auth mode supports multiple users.
   * Single-tenant mode typically supports only one user per database.
   * @returns True if multiple users are supported
   */
  supportsMultipleUsers(): boolean;
}

/**
 * Data transfer object for user creation
 */
export interface CreateUserDto {
  email: string;
  password: string;
  username?: string;
  metadata?: Record<string, any>;
}

/**
 * Data transfer object for login credentials
 */
export interface LoginDto {
  email?: string;
  username?: string;
  password: string;
  databaseId?: string;
  encryptionKey?: string;
}

/**
 * User entity returned after creation or authentication
 */
export interface User {
  id: string;
  email: string;
  username?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

/**
 * Result of authentication operation
 */
export interface AuthResult {
  user: User;
  tokens: TokenPair;
  permissions?: string[];
  expiresIn: number;
}

/**
 * Access and refresh token pair
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

/**
 * Available authentication modes
 */
export enum AuthMode {
  SINGLE_TENANT = 'single-tenant',
  MULTI_TENANT = 'multi-tenant'
}