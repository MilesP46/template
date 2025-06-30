/**
 * Shared authentication types
 * Common interfaces and types used across auth implementations
 */

import { z } from 'zod';

// User and authentication result types
export interface User {
  id: string;
  email?: string;
  username?: string;
  databaseId: string;
  keyId: string;
  role?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResult {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

// Authentication request/response schemas
export const LoginSchema = z.object({
  databaseId: z.string().min(1),
  password: z.string().min(1),
  keepLoggedIn: z.boolean().optional(),
});

export type LoginDto = z.infer<typeof LoginSchema>;

export const CreateUserSchema = z.object({
  password: z.string().min(8),
  masterKey: z.string().optional(),
  email: z.string().email().optional(),
  username: z.string().min(3).optional(),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>;

// Key management types
export interface KeyData {
  id: string;
  databaseId: string;
  keyHash: string;
  keyLocatorHash: string;
  encryptedKey: string;
  acl: AccessControlList;
  hashParams: HashParams;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccessControlList {
  owner: boolean;
  admin: boolean;
  write: boolean;
  read: boolean;
}

export interface HashParams {
  memory: number;
  iterations: number;
  parallelism: number;
  hashLength: number;
  type: string;
}

// Session types
export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  keepLoggedIn: boolean;
}

// Error types
export class AuthError extends Error {
  constructor(
    message: string,
    public code: AuthErrorCode,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  REFRESH_TOKEN_INVALID = 'REFRESH_TOKEN_INVALID',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  DATABASE_NOT_FOUND = 'DATABASE_NOT_FOUND',
  MASTER_KEY_REQUIRED = 'MASTER_KEY_REQUIRED',
  MASTER_KEY_INVALID = 'MASTER_KEY_INVALID',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
}