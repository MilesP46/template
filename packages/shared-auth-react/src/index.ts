/**
 * @doctor-dok/shared-auth-react
 * React authentication context and components
 */

// Context
export { AuthProvider, useAuth, type AuthContextValue } from './contexts/AuthContext';

// Components
export { AuthGuard, type AuthGuardProps } from './components/AuthGuard';

// Hooks
export {
  useLogin,
  useRegister,
  useLogout,
  useSessionRefresh,
  useIsAuthenticated,
  useCurrentUser,
  useHasRole,
  useAuthMode,
} from './hooks/useAuthState';

// API Client
export { AuthApiClient } from './api/auth-api-client';

// Services
export { StorageService } from './services/storage.service';

// Re-export types from shared-auth for convenience
export type {
  User,
  AuthSession,
  AuthResult,
  LoginDto,
  CreateUserDto,
  AuthError,
  AuthErrorCode,
} from '@doctor-dok/shared-auth';