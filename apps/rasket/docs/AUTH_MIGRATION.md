# Rasket Authentication Migration Guide

This guide explains how to migrate existing Rasket components to use the new unified authentication system.

## Overview

The new authentication system replaces Rasket's mock authentication with a real JWT-based system that supports both single-tenant and multi-tenant modes.

## Key Changes

### 1. Auth Provider
Replace the old `AuthContext` with the new `RasketAuthProvider`:

```tsx
// Old (in App.tsx)
import { AuthContext } from '@/context/useAuthContext';

// New
import { RasketAuthProvider } from '@/providers/AuthProvider';

// Wrap your app
<RasketAuthProvider>
  <Routes />
</RasketAuthProvider>
```

### 2. Login Component
Update login forms to use the new auth hooks:

```tsx
// Old
import { useAuthContext } from '@/context/useAuthContext';
const { saveSession } = useAuthContext();

// New
import { useLogin } from '@doctor-dok/shared-auth-react';
const { login, isLoading, error } = useLogin();

// Login data structure changed from email/password to:
{
  databaseId: string;
  password: string;
  keepLoggedIn?: boolean;
}
```

### 3. Signup Component
Implement actual signup functionality:

```tsx
import { useRegister, useAuthMode } from '@doctor-dok/shared-auth-react';

const { register, isLoading, error } = useRegister();
const { requiresMasterKey } = useAuthMode();

// Signup data structure:
{
  email: string;
  username: string;
  password: string;
  masterKey?: string; // Required for single-tenant mode
}
```

### 4. Protected Routes
Use the `AuthGuard` component:

```tsx
import { AuthGuard } from '@doctor-dok/shared-auth-react';

<AuthGuard redirectTo="/auth/sign-in">
  <ProtectedComponent />
</AuthGuard>
```

### 5. User Information
Access current user data:

```tsx
// Old
const { session } = useAuthContext();
const user = session?.user;

// New
import { useCurrentUser } from '@doctor-dok/shared-auth-react';
const { user, isLoading } = useCurrentUser();
```

### 6. Logout
Implement logout functionality:

```tsx
import { useLogout } from '@doctor-dok/shared-auth-react';
const { logout, isLoading } = useLogout();
```

## Environment Configuration

Add these variables to your `.env` file:

```env
VITE_API_URL=http://localhost:3000
VITE_AUTH_MODE=single-tenant # or multi-tenant
```

## Component Updates

### Update Existing Components

1. **Navigation/Header Components**
   - Replace mock user data with `useCurrentUser()`
   - Use `UserProfileDropdown` component

2. **Login Page** (`/auth/sign-in`)
   - Replace with new `LoginForm` component
   - Remove mock authentication logic

3. **Signup Page** (`/auth/sign-up`)
   - Replace with new `SignUpForm` component
   - Add master key field for single-tenant mode

4. **Dashboard/Protected Pages**
   - Wrap with `AuthGuard` component
   - Use auth hooks for user data

### Remove Old Files

- `/src/helpers/fake-backend.ts` - No longer needed
- `/src/context/useAuthContext.tsx` - Replaced by shared auth context
- Old login/signup hooks if any

## Migration Checklist

- [ ] Install auth dependencies in package.json
- [ ] Update App.tsx to use RasketAuthProvider
- [ ] Replace login component with new LoginForm
- [ ] Replace signup component with new SignUpForm
- [ ] Update navigation to use UserProfileDropdown
- [ ] Add AuthGuard to protected routes
- [ ] Update environment variables
- [ ] Remove fake backend
- [ ] Test both auth modes (single/multi-tenant)

## API Integration

The new auth system expects these backend endpoints:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - User logout

Make sure your backend implements these endpoints using the shared auth services.