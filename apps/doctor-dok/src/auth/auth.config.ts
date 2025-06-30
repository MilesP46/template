import type { FullAuthConfig } from '@doctor-dok/shared-types';
import { AuthMode } from '@doctor-dok/shared-types';

/**
 * Authentication configuration service.
 * Centralizes environment variable parsing and configuration management.
 */
export class AuthConfigService {
  private config: FullAuthConfig | null = null;

  /**
   * Get the authentication configuration.
   * Parses environment variables on first call and caches the result.
   */
  public getConfig(): FullAuthConfig {
    if (!this.config) {
      this.config = this.parseEnvironment();
    }
    return this.config;
  }

  /**
   * Parse environment variables into a structured configuration object.
   * @returns Full authentication configuration
   */
  private parseEnvironment(): FullAuthConfig {
    const mode = process.env.AUTH_MODE as 'single-tenant' | 'multi-tenant' | undefined;

    const config: FullAuthConfig = {
      mode: mode || AuthMode.SINGLE_TENANT, // Default to single-tenant if not specified
      tokenExpiration: {
        access: process.env.ACCESS_TOKEN_EXPIRATION || '15m',
        refresh: process.env.REFRESH_TOKEN_EXPIRATION || '7d'
      },
      encryption: {
        algorithm: process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm',
        keyLength: parseInt(process.env.ENCRYPTION_KEY_LENGTH || '256', 10),
        saltRounds: parseInt(process.env.SALT_ROUNDS || '10', 10)
      }
    };

    // Add session configuration if available
    if (process.env.SESSION_SECRET) {
      config.session = {
        secret: process.env.SESSION_SECRET,
        secure: process.env.SESSION_SECURE === 'true',
        sameSite: (process.env.SESSION_SAME_SITE as 'strict' | 'lax' | 'none') || 'strict'
      };
    }

    // Parse single-tenant specific configuration
    if (mode === AuthMode.SINGLE_TENANT || !mode) {
      config.singleTenant = {
        masterKey: process.env.SINGLE_TENANT_KEY || '',
        databasePath: process.env.SINGLE_TENANT_DB_PATH,
        encryptionKey: process.env.SINGLE_TENANT_ENCRYPTION_KEY,
        allowMultipleInstances: process.env.SINGLE_TENANT_ALLOW_MULTIPLE === 'true'
      };
    }

    // Parse multi-tenant specific configuration
    if (mode === AuthMode.MULTI_TENANT) {
      config.multiTenant = {
        databaseUrl: process.env.MULTI_TENANT_DB_URL || '',
        maxUsersPerTenant: process.env.MAX_USERS_PER_TENANT 
          ? parseInt(process.env.MAX_USERS_PER_TENANT, 10) 
          : undefined,
        isolationLevel: (process.env.TENANT_ISOLATION_LEVEL as 'strict' | 'moderate' | 'shared') || 'strict',
        tenantIdStrategy: (process.env.TENANT_ID_STRATEGY as 'uuid' | 'subdomain' | 'header') || 'uuid'
      };
    }

    return config;
  }

  /**
   * Reload configuration from environment.
   * Useful for testing or when environment variables change.
   */
  public reload(): void {
    this.config = null;
  }

  /**
   * Get a specific configuration value by path.
   * @param path - Dot-separated path to the configuration value
   * @returns Configuration value or undefined
   */
  public get(path: string): any {
    const config = this.getConfig();
    const keys = path.split('.');
    let value: any = config;

    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Check if running in single-tenant mode
   */
  public isSingleTenant(): boolean {
    return this.getConfig().mode === AuthMode.SINGLE_TENANT;
  }

  /**
   * Check if running in multi-tenant mode
   */
  public isMultiTenant(): boolean {
    return this.getConfig().mode === AuthMode.MULTI_TENANT;
  }

  /**
   * Get token expiration in seconds
   * @param type - 'access' or 'refresh'
   * @returns Expiration time in seconds
   */
  public getTokenExpirationSeconds(type: 'access' | 'refresh'): number {
    const expiration = this.getConfig().tokenExpiration[type];
    
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
}