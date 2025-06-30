/**
 * Authentication Registration API Route
 * T219_phase2.6_cp1: Auth endpoints with CSRF protection
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthModeFactory } from '@/auth/auth-mode.factory';
import { csrfProtection, InputSanitizer } from '@doctor-dok/shared-auth';
import type { CreateUserDto, User } from '@doctor-dok/shared-types';

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
    const sanitizedData = InputSanitizer.sanitizeRegistrationData({
      email: body.email,
      password: body.password,
      masterKey: body.encryptionKey,
      databaseId: body.databaseId
    });

    // Additional email domain validation
    const emailValidation = InputSanitizer.validateEmailDomain(sanitizedData.email);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { 
          error: emailValidation.feedback.join(', '),
          code: 'EMAIL_INVALID'
        },
        { status: 400 }
      );
    }

    // Password strength validation
    const passwordValidation = InputSanitizer.validatePasswordStrength(sanitizedData.password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          error: 'Password does not meet security requirements',
          code: 'PASSWORD_WEAK',
          feedback: passwordValidation.feedback
        },
        { status: 400 }
      );
    }

    const userData: CreateUserDto = {
      email: sanitizedData.email,
      password: sanitizedData.password,
      encryptionKey: sanitizedData.masterKey,
      databaseId: sanitizedData.databaseId,
      username: body.username ? InputSanitizer.sanitizeForDatabase(body.username, 50) : undefined,
      metadata: {}
    };

    // Get auth mode and create user
    const authMode = AuthModeFactory.getInstance();
    const user: User = await authMode.createUser(userData);

    // Generate new CSRF token for response
    const newCsrfToken = csrfProtection.generateToken(user.id);

    const response = NextResponse.json({ 
      user,
      message: 'User created successfully'
    });
    response.headers.set('X-CSRF-Token', newCsrfToken);
    
    return response;

  } catch (error: any) {
    console.error('Registration error:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Registration failed',
        code: error.code || 'AUTH_ERROR'
      },
      { status: error.statusCode || 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Generate CSRF token for registration form
  const sessionId = request.headers.get('x-session-id') || undefined;
  const csrfToken = csrfProtection.generateToken(sessionId);
  
  const response = NextResponse.json({ csrfToken });
  response.headers.set('X-CSRF-Token', csrfToken);
  
  return response;
}