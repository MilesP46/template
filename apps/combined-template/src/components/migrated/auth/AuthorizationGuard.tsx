/**
 * Phase 3a Priority 2: Authorization Guard Migration
 * 
 * Migration from Doctor-Dok authorization-guard.tsx with minimal UI changes
 * Following MIGRATION_PLAN.md critical path step 4
 * 
 * Uses migrated UI primitives and integrates with shared auth system
 */

import React, { PropsWithChildren, useEffect, useState } from 'react';
import { useAuth } from '@doctor-dok/shared-auth-react';
import { AuthStatus } from '@doctor-dok/shared-types';

interface AuthorizationGuardProps extends PropsWithChildren {
  fallback?: React.ReactNode;
}

const AuthorizationGuard: React.FC<AuthorizationGuardProps> = ({ 
  children, 
  fallback 
}) => {
  const { 
    authStatus, 
    keepLoggedIn, 
    isLoading,
    checkKeepLoggedIn 
  } = useAuth();
  
  const [autoLoginInProgress, setAutoLoginInProgress] = useState(false);

  useEffect(() => {
    // Handle keep logged in functionality (same logic as original)
    if (keepLoggedIn && authStatus === AuthStatus.UNAUTHENTICATED) {
      setAutoLoginInProgress(true);
      checkKeepLoggedIn()
        .catch(() => {
          // Auto-login failed, user will need to manually login
        })
        .finally(() => {
          setAutoLoginInProgress(false);
        });
    }
  }, [keepLoggedIn, authStatus, checkKeepLoggedIn]);

  // Show loading or auto-login progress
  if (isLoading || autoLoginInProgress) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted">
            {autoLoginInProgress ? 'Restoring session...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // User is authenticated - show protected content
  if (authStatus === AuthStatus.AUTHENTICATED) {
    return <>{children}</>;
  }

  // User needs to authenticate - show fallback (will be authorize popup)
  return <>{fallback}</>;
};

export default AuthorizationGuard;