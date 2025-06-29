import { 
  AuthMode, 
  AuthError, 
  AuthErrorCode
} from '@doctor-dok/shared-types';
import type { 
  IAuthMode, 
  FullAuthConfig 
} from '@doctor-dok/shared-types';
import { SingleTenantAuthMode } from './strategies/single-tenant-auth.strategy';
import { MultiTenantAuthMode } from './strategies/multi-tenant-auth.strategy';
import { AuthConfigService } from './auth.config';

/**
 * Factory class for creating authentication mode implementations.
 * Supports environment-based configuration for single-tenant and multi-tenant modes.
 */
export class AuthModeFactory {
  private static instance: AuthModeFactory;
  private authMode: IAuthMode | null = null;
  private configService: AuthConfigService;

  constructor() {
    this.configService = new AuthConfigService();
  }

  /**
   * Get singleton instance of the factory
   */
  public static getInstance(): AuthModeFactory {
    if (!AuthModeFactory.instance) {
      AuthModeFactory.instance = new AuthModeFactory();
    }
    return AuthModeFactory.instance;
  }

  /**
   * Create a new auth mode instance based on environment configuration.
   * Does not cache the instance.
   * @returns Auth mode implementation
   */
  public async createAuthMode(): Promise<IAuthMode> {
    const config = this.configService.getConfig();
    
    if (!config.mode) {
      throw new AuthError(
        AuthErrorCode.INVALID_CONFIGURATION,
        'AUTH_MODE environment variable must be set to either "single-tenant" or "multi-tenant"',
        500
      );
    }

    // Validate configuration before creating instance
    this.validateConfiguration();

    switch (config.mode) {
      case AuthMode.SINGLE_TENANT:
        return new SingleTenantAuthMode(config);
      
      case AuthMode.MULTI_TENANT:
        return new MultiTenantAuthMode(config);
      
      default:
        throw new AuthError(
          AuthErrorCode.MODE_NOT_SUPPORTED,
          `Invalid AUTH_MODE: ${config.mode}. Must be either "single-tenant" or "multi-tenant"`,
          500
        );
    }
  }

  /**
   * Get or create a cached auth mode instance.
   * Initializes the auth mode before returning.
   * @returns Initialized auth mode implementation
   */
  public async getAuthMode(): Promise<IAuthMode> {
    if (!this.authMode) {
      this.authMode = await this.createAuthMode();
      await this.authMode.initialize();
    }
    return this.authMode;
  }

  /**
   * Validate the current configuration for completeness.
   * Throws detailed errors for missing configuration.
   */
  public validateConfiguration(): void {
    const config = this.configService.getConfig();

    if (!config.mode) {
      throw new AuthError(
        AuthErrorCode.INVALID_CONFIGURATION,
        'AUTH_MODE environment variable must be set',
        500
      );
    }

    switch (config.mode) {
      case AuthMode.SINGLE_TENANT:
        if (!config.singleTenant?.masterKey) {
          throw new AuthError(
            AuthErrorCode.INVALID_CONFIGURATION,
            'Single-tenant mode requires SINGLE_TENANT_KEY environment variable',
            500
          );
        }
        break;

      case AuthMode.MULTI_TENANT:
        if (!config.multiTenant?.databaseUrl) {
          throw new AuthError(
            AuthErrorCode.INVALID_CONFIGURATION,
            'Multi-tenant mode requires MULTI_TENANT_DB_URL environment variable',
            500
          );
        }
        break;

      default:
        throw new AuthError(
          AuthErrorCode.MODE_NOT_SUPPORTED,
          `Unknown auth mode: ${config.mode}`,
          500
        );
    }
  }

  /**
   * Reset the cached auth mode instance.
   * Useful for testing or when configuration changes.
   */
  public reset(): void {
    this.authMode = null;
  }

  /**
   * Get the current auth configuration
   * @returns Full authentication configuration
   */
  public getConfig(): FullAuthConfig {
    return this.configService.getConfig();
  }
}