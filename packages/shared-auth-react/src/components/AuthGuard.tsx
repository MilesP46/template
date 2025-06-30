/**
 * Authentication Guard Component
 * Protects routes that require authentication
 */

import React, { ReactNode, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
  requireRole?: string;
  onUnauthorized?: () => void;
}

export function AuthGuard({
  children,
  fallback = <div>Loading...</div>,
  redirectTo,
  requireAuth = true,
  requireRole,
  onUnauthorized,
}: AuthGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      if (onUnauthorized) {
        onUnauthorized();
      } else if (redirectTo && typeof window !== 'undefined') {
        window.location.href = redirectTo;
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, onUnauthorized]);

  // Show loading state
  if (isLoading) {
    return <>{fallback}</>;
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    return <>{fallback}</>;
  }

  // Check role requirement
  if (requireRole && user?.role !== requireRole) {
    if (onUnauthorized) {
      onUnauthorized();
    }
    return <>{fallback}</>;
  }

  // All checks passed, render children
  return <>{children}</>;
}