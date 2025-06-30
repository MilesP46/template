import { describe, it, expect } from 'vitest';
import { TEST_CONFIGS, TEST_USERS, PERFORMANCE_TARGETS } from './test.config';

describe('Test Environment Setup', () => {
  it('should have test configurations for both auth modes', () => {
    expect(TEST_CONFIGS['single-tenant']).toBeDefined();
    expect(TEST_CONFIGS['multi-tenant']).toBeDefined();
  });

  it('should have valid single-tenant configuration', () => {
    const config = TEST_CONFIGS['single-tenant'];
    expect(config.AUTH_MODE).toBe('single-tenant');
    expect(config.MASTER_KEY_REQUIRED).toBe(true);
    expect(config.ENCRYPTION_ENABLED).toBe(true);
    expect(config.DATABASE_URL).toContain('single-tenant.db');
  });

  it('should have valid multi-tenant configuration', () => {
    const config = TEST_CONFIGS['multi-tenant'];
    expect(config.AUTH_MODE).toBe('multi-tenant');
    expect(config.MASTER_KEY_REQUIRED).toBe(false);
    expect(config.ENCRYPTION_ENABLED).toBe(false);
    expect(config.DATABASE_URL).toContain('multi-tenant.db');
  });

  it('should have test users for both modes', () => {
    expect(TEST_USERS['single-tenant'].validUser).toBeDefined();
    expect(TEST_USERS['single-tenant'].invalidUser).toBeDefined();
    expect(TEST_USERS['multi-tenant'].validUser).toBeDefined();
    expect(TEST_USERS['multi-tenant'].invalidUser).toBeDefined();
  });

  it('should have performance targets defined', () => {
    expect(PERFORMANCE_TARGETS.registration).toBe(500);
    expect(PERFORMANCE_TARGETS.login).toBe(300);
    expect(PERFORMANCE_TARGETS.tokenVerification).toBe(50);
    expect(PERFORMANCE_TARGETS.tokenRefresh).toBe(200);
    expect(PERFORMANCE_TARGETS.logout).toBe(100);
  });

  it('should have JWT secrets configured', () => {
    const singleTenant = TEST_CONFIGS['single-tenant'];
    const multiTenant = TEST_CONFIGS['multi-tenant'];
    
    expect(singleTenant.JWT_ACCESS_SECRET).toBeTruthy();
    expect(singleTenant.JWT_REFRESH_SECRET).toBeTruthy();
    expect(multiTenant.JWT_ACCESS_SECRET).toBeTruthy();
    expect(multiTenant.JWT_REFRESH_SECRET).toBeTruthy();
  });
});