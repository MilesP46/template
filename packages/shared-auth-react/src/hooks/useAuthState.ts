/**
 * Custom hooks for authentication state and operations
 */

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { LoginDto, CreateUserDto } from '@doctor-dok/shared-auth';

/**
 * Hook for login form handling
 */
export function useLogin() {
  const { login, error, clearError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = useCallback(async (credentials: LoginDto) => {
    setIsLoading(true);
    try {
      await login(credentials);
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  return {
    login: handleLogin,
    isLoading,
    error,
    clearError,
  };
}

/**
 * Hook for registration form handling
 */
export function useRegister() {
  const { register, error, clearError, requiresMasterKey } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = useCallback(async (data: CreateUserDto) => {
    setIsLoading(true);
    try {
      await register(data);
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  }, [register]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  return {
    register: handleRegister,
    isLoading,
    error,
    clearError,
    requiresMasterKey,
  };
}

/**
 * Hook for logout handling
 */
export function useLogout() {
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = useCallback(async () => {
    setIsLoading(true);
    try {
      await logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  return {
    logout: handleLogout,
    isLoading,
  };
}

/**
 * Hook for session refresh
 */
export function useSessionRefresh() {
  const { refreshSession, session } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    if (!session) return;
    
    setIsRefreshing(true);
    try {
      await refreshSession();
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshSession, session]);

  return {
    refresh,
    isRefreshing,
    canRefresh: !!session?.refreshToken,
  };
}

/**
 * Hook to check authentication status
 */
export function useIsAuthenticated() {
  const { isAuthenticated, isLoading } = useAuth();
  return { isAuthenticated, isLoading };
}

/**
 * Hook to get current user
 */
export function useCurrentUser() {
  const { user, isLoading } = useAuth();
  return { user, isLoading };
}

/**
 * Hook for role-based access control
 */
export function useHasRole(requiredRole: string) {
  const { user } = useAuth();
  return user?.role === requiredRole;
}

/**
 * Hook for auth mode information
 */
export function useAuthMode() {
  const { authMode, requiresMasterKey } = useAuth();
  return { authMode, requiresMasterKey };
}