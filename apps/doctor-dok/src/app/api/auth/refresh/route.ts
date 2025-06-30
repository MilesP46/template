/**
 * Authentication Token Refresh API Route
 * T219_phase2.6_cp1: Auth endpoints with CSRF protection
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthModeFactory } from '@/auth/auth-mode.factory';
import { csrfProtection } from '@doctor-dok/shared-auth';
import type { TokenPair } from '@doctor-dok/shared-types';

export async function POST(request: NextRequest) {
  try {
    // CSRF Protection
    const csrfToken = request.headers.get('x-csrf-token');
    if (!csrfToken || !csrfProtection.validateToken(csrfToken)) {
      return NextResponse.json(
        { error: 'Invalid CSRF token', code: 'CSRF_INVALID' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken || typeof refreshToken !== 'string') {
      return NextResponse.json(
        { error: 'Refresh token is required', code: 'TOKEN_MISSING' },
        { status: 400 }
      );
    }

    // Get auth mode and refresh tokens
    const authMode = AuthModeFactory.getInstance();
    const newTokens: TokenPair = await authMode.refreshToken(refreshToken);

    // Generate new CSRF token for response
    const newCsrfToken = csrfProtection.generateToken();

    const response = NextResponse.json(newTokens);
    response.headers.set('X-CSRF-Token', newCsrfToken);
    
    return response;

  } catch (error: any) {
    console.error('Token refresh error:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Token refresh failed',
        code: error.code || 'TOKEN_ERROR'
      },
      { status: error.statusCode || 401 }
    );
  }
}