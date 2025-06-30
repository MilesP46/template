/**
 * Unified Authentication Context for React
 * Provides authentication state and methods across the application
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { 
  User, 
  AuthSession, 
  LoginDto, 
  CreateUserDto,
  AuthError,
  AuthErrorCode 
} from '@doctor-dok/shared-auth';
import { AuthApiClient } from '../api/auth-api-client';
import { StorageService } from '../services/storage.service';

export interface AuthContextValue {
  // State
  user: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;

  // Methods
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: CreateUserDto) => Promise<void>;
  refreshSession: () => Promise<void>;
  clearError: () => void;

  // Config
  authMode: 'single-tenant' | 'multi-tenant';
  requiresMasterKey: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
  apiUrl?: string;
  authMode?: 'single-tenant' | 'multi-tenant';
  storagePrefix?: string;
  autoRefresh?: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({
  children,
  apiUrl = process.env.NEXT_PUBLIC_API_URL || '',
  authMode = process.env.NEXT_PUBLIC_AUTH_MODE as 'single-tenant' | 'multi-tenant' || 'single-tenant',
  storagePrefix = 'dok-auth',
  autoRefresh = true,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  const apiClient = new AuthApiClient(apiUrl);
  const storage = new StorageService(storagePrefix);

  // Check if master key is required based on auth mode
  const requiresMasterKey = authMode === 'single-tenant';

  // Initialize session from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedSession = await storage.getSession();
        if (storedSession && !isTokenExpired(storedSession.expiresAt)) {
          setSession(storedSession);
          setUser(storedSession.user);
          
          // Set API client token
          apiClient.setAuthToken(storedSession.accessToken);
          
          // Refresh if needed
          if (shouldRefreshToken(storedSession.expiresAt)) {
            await refreshSession();
          }
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Auto-refresh logic
  useEffect(() => {
    if (!autoRefresh || !session) return;

    const refreshInterval = setInterval(() => {
      if (shouldRefreshToken(session.expiresAt)) {
        refreshSession().catch(console.error);
      }
    }, 60000); // Check every minute

    return () => clearInterval(refreshInterval);
  }, [session, autoRefresh]);

  const login = useCallback(async (credentials: LoginDto) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await apiClient.login(credentials);
      
      const newSession: AuthSession = {
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        expiresAt: new Date(Date.now() + result.tokens.expiresIn * 1000),
        keepLoggedIn: credentials.keepLoggedIn || false,
      };

      setUser(result.user);
      setSession(newSession);
      
      // Store session if keep logged in
      if (credentials.keepLoggedIn) {
        await storage.saveSession(newSession);
      }
      
      // Set API client token
      apiClient.setAuthToken(result.tokens.accessToken);
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      throw authError;
    } finally {
      setIsLoading(false);
    }
  }, [apiClient, storage]);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Call logout API
      if (session?.user.id) {
        await apiClient.logout(session.user.id);
      }
      
      // Clear local state
      setUser(null);
      setSession(null);
      
      // Clear storage
      await storage.clearSession();
      
      // Clear API client token
      apiClient.clearAuthToken();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [session, apiClient, storage]);

  const register = useCallback(async (data: CreateUserDto) => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate master key requirement
      if (requiresMasterKey && !data.masterKey) {
        throw new AuthError(
          'Master key is required for single-tenant mode',
          AuthErrorCode.MASTER_KEY_REQUIRED as any,
          400
        );
      }

      const result = await apiClient.register(data);
      
      const newSession: AuthSession = {
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        expiresAt: new Date(Date.now() + result.tokens.expiresIn * 1000),
        keepLoggedIn: true,
      };

      setUser(result.user);
      setSession(newSession);
      
      // Store session
      await storage.saveSession(newSession);
      
      // Set API client token
      apiClient.setAuthToken(result.tokens.accessToken);
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      throw authError;
    } finally {
      setIsLoading(false);
    }
  }, [requiresMasterKey, apiClient, storage]);

  const refreshSession = useCallback(async () => {
    if (!session?.refreshToken) return;

    try {
      const tokens = await apiClient.refreshToken(session.refreshToken);
      
      const newSession: AuthSession = {
        ...session,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
      };

      setSession(newSession);
      
      // Update stored session
      if (session.keepLoggedIn) {
        await storage.saveSession(newSession);
      }
      
      // Update API client token
      apiClient.setAuthToken(tokens.accessToken);
    } catch (err) {
      console.error('Token refresh failed:', err);
      // On refresh failure, logout
      await logout();
    }
  }, [session, apiClient, storage, logout]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextValue = {
    user,
    session,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    logout,
    register,
    refreshSession,
    clearError,
    authMode,
    requiresMasterKey,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper functions
function isTokenExpired(expiresAt: Date): boolean {
  return new Date() >= expiresAt;
}

function shouldRefreshToken(expiresAt: Date): boolean {
  // Refresh if less than 5 minutes remaining
  const fiveMinutes = 5 * 60 * 1000;
  return new Date().getTime() + fiveMinutes >= expiresAt.getTime();
}