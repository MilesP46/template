# Authentication Quick Reference

## Quick Start

### 1. Frontend Setup
```tsx
// App.tsx
import { RasketAuthProvider } from '@/providers/AuthProvider';

<RasketAuthProvider>
  <App />
</RasketAuthProvider>
```

### 2. Login Implementation
```tsx
import { useLogin } from '@doctor-dok/shared-auth-react';

function LoginPage() {
  const { login, isLoading, error } = useLogin();
  
  const handleLogin = async (data) => {
    const result = await login({
      databaseId: data.databaseId,
      password: data.password,
      keepLoggedIn: data.rememberMe
    });
    
    if (result.success) {
      navigate('/dashboard');
    }
  };
}
```

### 3. Protected Routes
```tsx
import { AuthGuard } from '@doctor-dok/shared-auth-react';

<AuthGuard redirectTo="/login">
  <ProtectedPage />
</AuthGuard>
```

## Common Patterns

### Check Authentication Status
```tsx
import { useIsAuthenticated } from '@doctor-dok/shared-auth-react';

const { isAuthenticated, isLoading } = useIsAuthenticated();
```

### Get Current User
```tsx
import { useCurrentUser } from '@doctor-dok/shared-auth-react';

const { user, isLoading } = useCurrentUser();
// user.id, user.email, user.username, user.databaseId
```

### Logout
```tsx
import { useLogout } from '@doctor-dok/shared-auth-react';

const { logout, isLoading } = useLogout();
await logout();
```

### Registration with Master Key
```tsx
import { useRegister, useAuthMode } from '@doctor-dok/shared-auth-react';

const { register } = useRegister();
const { requiresMasterKey } = useAuthMode();

// Show master key field if requiresMasterKey is true
```

## Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
VITE_AUTH_MODE=single-tenant
```

### Backend (.env)
```env
# Auth Mode
AUTH_MODE=single-tenant

# JWT
JWT_ACCESS_SECRET=your-secret-here
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=8h

# Database
DATABASE_URL=./data/app.db
ENCRYPTION_ENABLED=true
```

## API Endpoints

| Action | Endpoint | Method | Body |
|--------|----------|--------|------|
| Login | `/api/auth/login` | POST | `{ databaseId, password, keepLoggedIn? }` |
| Register | `/api/auth/register` | POST | `{ email?, username?, password, masterKey? }` |
| Refresh | `/api/auth/refresh` | POST | `{ refreshToken }` |
| Logout | `/api/auth/logout` | POST | `{ userId }` |

## Auth Modes Comparison

| Feature | Single-Tenant | Multi-Tenant |
|---------|--------------|--------------|
| Database | One per user | Shared |
| Encryption | Full DB encryption | Row-level security |
| Master Key | Required | Not used |
| Isolation | Complete | By tenant ID |
| Scaling | More files | More efficient |
| Backup | Per user | Centralized |

## Error Codes

```typescript
INVALID_CREDENTIALS    // Wrong password or databaseId
TOKEN_EXPIRED         // Access token expired
TOKEN_INVALID         // Malformed or tampered token
USER_NOT_FOUND       // User doesn't exist
DATABASE_NOT_FOUND   // Database doesn't exist
MASTER_KEY_REQUIRED  // Single-tenant needs master key
MASTER_KEY_INVALID   // Wrong master key
PERMISSION_DENIED    // Insufficient permissions
```

## Testing Checklist

- [ ] Register new user
- [ ] Login with valid credentials
- [ ] Login with wrong password
- [ ] Access protected route without auth
- [ ] Token expiration and refresh
- [ ] Logout clears session
- [ ] Master key validation (single-tenant)
- [ ] "Keep logged in" persistence

## Common Issues

### "Invalid credentials"
- Check databaseId spelling
- Verify password is correct
- Ensure user exists

### "Master key required"
- Only for single-tenant mode
- Must provide on registration
- Cannot be empty

### Token errors
- Check expiration settings
- Verify secrets match
- Ensure refresh token is valid

### CORS errors
- Configure backend CORS
- Check API URL in frontend
- Verify allowed origins

## Package Structure

```
packages/
├── shared-auth/          # Core auth logic
│   ├── services/        # Base services
│   ├── utils/          # JWT, crypto
│   └── middleware/     # API protection
├── shared-auth-react/   # React integration
│   ├── contexts/       # Auth context
│   ├── hooks/         # Custom hooks
│   └── components/    # Auth UI
└── shared-types/       # TypeScript types
    └── auth/          # Auth interfaces
```

## Migration Commands

```bash
# Install dependencies
npm install

# Build packages
npm run build:packages

# Start development
npm run dev

# Run tests
npm run test
```

## Security Best Practices

1. **Never expose master keys**
2. **Use HTTPS in production**
3. **Rotate JWT secrets regularly**
4. **Implement rate limiting**
5. **Log authentication events**
6. **Use strong passwords**
7. **Enable CORS properly**
8. **Sanitize all inputs**

## Support

- [Full Documentation](./AUTH_FLOW.md)
- [Architecture Guide](./AUTH_ARCHITECTURE.md)
- [Migration Guide](../../../apps/rasket/docs/AUTH_MIGRATION.md)
- [API Reference](../../api/README.md)