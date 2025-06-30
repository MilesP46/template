/**
 * Authentication middleware for Next.js
 * Extracted and adapted from Doctor-Dok
 */

import { NextRequest, NextResponse } from 'next/server';
import { JWTService } from '../utils/jwt';
import { AuthError, AuthErrorCode } from '../types/auth.types';

export interface AuthMiddlewareConfig {
  jwtAccessSecret: string;
  publicPaths?: string[];
  authPrefix?: string;
}

export function createAuthMiddleware(config: AuthMiddlewareConfig) {
  const jwtService = new JWTService({
    accessTokenSecret: config.jwtAccessSecret,
    refreshTokenSecret: '', // Not needed for verification only
  });

  const publicPaths = config.publicPaths || [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh',
    '/api/db/create',
    '/api/db/authorize',
    '/api/db/challenge',
  ];

  const authPrefix = config.authPrefix || 'Bearer ';

  return async function authMiddleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Skip auth for public paths
    if (publicPaths.some(path => pathname.startsWith(path))) {
      return NextResponse.next();
    }

    // Skip auth for static files and Next.js internals
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/static') ||
      pathname.includes('.') // files with extensions
    ) {
      return NextResponse.next();
    }

    try {
      // Extract token from Authorization header
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith(authPrefix)) {
        throw new AuthError(
          'No authorization token provided',
          AuthErrorCode.TOKEN_INVALID,
          401
        );
      }

      const token = authHeader.substring(authPrefix.length);

      // Verify token
      const payload = await jwtService.verifyAccessToken(token);

      // Add user info to request headers for downstream use
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId);
      requestHeaders.set('x-database-id', payload.databaseId);
      requestHeaders.set('x-key-id', payload.keyId);
      if (payload.role) {
        requestHeaders.set('x-user-role', payload.role);
      }

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.error('Auth middleware error:', error);
      
      // Return 401 for auth errors
      return NextResponse.json(
        { 
          error: error instanceof AuthError ? error.message : 'Authentication required',
          code: error instanceof AuthError ? error.code : AuthErrorCode.TOKEN_INVALID,
        },
        { status: 401 }
      );
    }
  };
}

/**
 * Helper to extract user info from request headers (set by middleware)
 */
export function getUserFromRequest(request: NextRequest) {
  return {
    userId: request.headers.get('x-user-id'),
    databaseId: request.headers.get('x-database-id'),
    keyId: request.headers.get('x-key-id'),
    role: request.headers.get('x-user-role'),
  };
}