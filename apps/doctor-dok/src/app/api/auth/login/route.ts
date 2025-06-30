/**
 * Authentication Login API Route
 * T219_phase2.6_cp1: Auth endpoints with CSRF protection
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthModeFactory } from '@/auth/auth-mode.factory';
import { csrfProtection, InputSanitizer } from '@doctor-dok/shared-auth';
import type { LoginDto, AuthResult } from '@doctor-dok/shared-types';

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

    // Input sanitization and validation
    const sanitizedCredentials = InputSanitizer.sanitizeLoginData({
      email: body.email,
      password: body.password,
      masterKey: body.encryptionKey
    });

    const loginData: LoginDto = {
      email: sanitizedCredentials.email,
      password: sanitizedCredentials.password,
      encryptionKey: sanitizedCredentials.masterKey,
      databaseId: body.databaseId,
      username: body.username,
      keepLoggedIn: body.keepLoggedIn
    };

    // Get auth mode and authenticate
    const authMode = AuthModeFactory.getInstance();
    const result: AuthResult = await authMode.authenticateUser(loginData);

    // Generate new CSRF token for response
    const newCsrfToken = csrfProtection.generateToken(result.user.id);

    const response = NextResponse.json(result);
    response.headers.set('X-CSRF-Token', newCsrfToken);
    
    return response;

  } catch (error: any) {
    console.error('Login error:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Login failed',
        code: error.code || 'AUTH_ERROR'
      },
      { status: error.statusCode || 401 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Generate CSRF token for login form
  const sessionId = request.headers.get('x-session-id') || undefined;
  const csrfToken = csrfProtection.generateToken(sessionId);
  
  const response = NextResponse.json({ csrfToken });
  response.headers.set('X-CSRF-Token', csrfToken);
  
  return response;
}