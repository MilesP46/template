/**
 * Authentication Logout API Route
 * T219_phase2.6_cp1: Auth endpoints with CSRF protection
 */

import { NextRequest, NextResponse } from 'next/server';
import { AuthModeFactory } from '@/auth/auth-mode.factory';
import { csrfProtection } from '@doctor-dok/shared-auth';

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
    const { userId } = body;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'User ID is required', code: 'USER_ID_MISSING' },
        { status: 400 }
      );
    }

    // Get auth mode and logout user
    const authMode = AuthModeFactory.getInstance();
    await authMode.logout(userId);

    const response = NextResponse.json({ 
      message: 'Logged out successfully'
    });
    
    // Don't send new CSRF token as user is logging out
    return response;

  } catch (error: any) {
    console.error('Logout error:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Logout failed',
        code: error.code || 'AUTH_ERROR'
      },
      { status: error.statusCode || 500 }
    );
  }
}