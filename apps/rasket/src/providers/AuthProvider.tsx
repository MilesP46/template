/**
 * Auth Provider for Rasket Frontend
 * Wraps the shared auth context with Rasket-specific configuration
 */

import React from 'react';
import { AuthProvider as SharedAuthProvider } from '@doctor-dok/shared-auth-react';

interface RasketAuthProviderProps {
  children: React.ReactNode;
}

export function RasketAuthProvider({ children }: RasketAuthProviderProps) {
  // Get configuration from environment variables
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const authMode = import.meta.env.VITE_AUTH_MODE as 'single-tenant' | 'multi-tenant' || 'single-tenant';
  
  return (
    <SharedAuthProvider
      apiUrl={apiUrl}
      authMode={authMode}
      storagePrefix="rasket-auth"
      autoRefresh={true}
    >
      {children}
    </SharedAuthProvider>
  );
}