# Auth Domain

## Scope

The Auth domain manages all authentication, authorization, and access control operations for the Doctor Dok application. It provides secure database authentication using cryptographic keys, database IDs, and optional passwords. The system supports both local database access and remote database synchronization while maintaining end-to-end encryption.

## Components

### Core Authentication Architecture

The system uses a **key-based authentication model** with two primary modes:

1. **Local Database Access**
   - Database ID + Key combination
   - Optional password protection
   - Direct file system access
   - No network communication

2. **Remote Database Access**
   - Database ID + Key + Password
   - Encrypted synchronization
   - API-based authentication
   - Challenge-response protocol

### Authentication Components

#### Key Management (`/src/contexts/key-context.tsx`)
- Manages encryption keys lifecycle
- Handles key derivation and validation
- Stores keys in browser local storage
- Provides key rotation capabilities

#### Database Context (`/src/contexts/db-context.tsx`)
- Manages database connection state
- Handles authentication challenges
- Coordinates with key management
- Provides database access API

#### Authorization Guard (`/src/components/authorization-guard.tsx`)
- Protects routes requiring authentication
- Redirects unauthorized access
- Manages session validation
- Handles authentication UI flow

### API Endpoints

#### Database Authorization (`/api/db/authorize/`)
- Validates database credentials
- Issues authentication tokens
- Returns access permissions
- Manages session creation

#### Challenge Generation (`/api/db/challenge/`)
- Creates cryptographic challenges
- Validates challenge responses
- Prevents replay attacks
- Manages nonce generation

#### Database Creation (`/api/db/create/`)
- Creates new database instances
- Generates initial keys
- Sets up access control
- Returns connection credentials

#### Token Refresh (`/api/db/refresh/`)
- Refreshes expired tokens
- Validates existing sessions
- Extends authentication validity
- Manages token rotation

## Dependencies

### External Dependencies
- **Argon2** - Password hashing and key derivation
- **Crypto (Node.js)** - Cryptographic operations
- **jwt** - JSON Web Token handling

### Internal Dependencies
- **Crypto Module** (`/src/lib/crypto.ts`) - Encryption utilities
- **Database Provider** (`/src/data/server/db-provider.ts`) - Database access
- **Key Repository** (`/src/data/server/server-key-repository.tsx`) - Key storage

### Configuration Dependencies
- Environment variables for auth settings
- Token expiration configuration
- Password policy settings

## Processes

### Authentication Flow

1. **Initial Authentication**
   ```typescript
   // User provides credentials
   const credentials = {
     databaseId: string,
     key: string,
     password?: string
   }
   
   // System validates credentials
   const authResult = await authenticate(credentials)
   
   // Generate session token
   const token = generateToken(authResult)
   ```

2. **Challenge-Response Protocol**
   ```typescript
   // Generate challenge
   const challenge = await generateChallenge(databaseId)
   
   // Client computes response
   const response = computeResponse(challenge, key)
   
   // Server validates response
   const isValid = await validateResponse(databaseId, challenge, response)
   ```

### Key Derivation Process

**Password-Based Key Derivation:**
- Uses Argon2 for secure key derivation
- Configurable memory and iteration parameters
- Salt generation for each database
- Resistant to timing attacks

**Key Storage:**
- Keys encrypted at rest
- Access Control Lists (ACL) per key
- Expiration dates for key rotation
- Audit logging for key usage

### Session Management

**Token Generation:**
- JWT tokens with configurable expiration
- Refresh token mechanism
- Secure token storage
- Session invalidation support

**Token Validation:**
- Signature verification
- Expiration checking
- Permission validation
- Audit trail generation

### Authorization Process

1. **Route Protection**
   - Check for valid authentication token
   - Validate token permissions
   - Allow/deny access based on ACL
   - Log authorization decisions

2. **Resource Access Control**
   - Verify user has database access
   - Check operation permissions
   - Validate data ownership
   - Apply row-level security

## Interfaces

### Authentication Context Interface

```typescript
interface AuthContextType {
  // Authentication state
  isAuthenticated: boolean
  currentDatabase: string | null
  currentUser: UserInfo | null
  
  // Authentication methods
  authenticate(credentials: AuthCredentials): Promise<AuthResult>
  logout(): Promise<void>
  refreshToken(): Promise<string>
  
  // Key management
  validateKey(key: string): Promise<boolean>
  rotateKey(oldKey: string, newKey: string): Promise<void>
}
```

### Authentication API Interface

```typescript
// Authorization endpoint
POST /api/db/authorize
Body: {
  databaseId: string
  key: string
  password?: string
}
Response: {
  token: string
  expiresIn: number
  permissions: string[]
}

// Challenge endpoint
POST /api/db/challenge
Body: {
  databaseId: string
}
Response: {
  challenge: string
  nonce: string
  expiresAt: number
}

// Token refresh endpoint
POST /api/db/refresh
Headers: {
  Authorization: Bearer <token>
}
Response: {
  token: string
  expiresIn: number
}
```

### Key Repository Interface

```typescript
interface KeyRepository {
  // Key CRUD operations
  createKey(keyData: KeyData): Promise<Key>
  getKey(keyLocatorHash: string): Promise<Key | null>
  updateKey(keyLocatorHash: string, updates: Partial<Key>): Promise<void>
  deleteKey(keyLocatorHash: string): Promise<void>
  
  // Key validation
  validateKeyAccess(keyLocatorHash: string, databaseIdHash: string): Promise<boolean>
  checkKeyExpiry(keyLocatorHash: string): Promise<boolean>
  
  // ACL management
  updateACL(keyLocatorHash: string, acl: AccessControlList): Promise<void>
  checkPermission(keyLocatorHash: string, permission: string): Promise<boolean>
}
```

## Security Model

### Multi-Factor Security

1. **Something You Have** - Database ID
2. **Something You Know** - Encryption Key
3. **Something You Create** - Optional Password

### Cryptographic Security

**Key Security:**
- 256-bit encryption keys
- Argon2 key derivation
- Secure random generation
- No key transmission over network

**Token Security:**
- Short-lived access tokens (15 minutes)
- Longer-lived refresh tokens (7 days)
- Secure token storage
- Token rotation on refresh

### Access Control

**Database-Level Isolation:**
- Each database has unique ID
- Keys are database-specific
- No cross-database access
- Complete data isolation

**Permission System:**
- Role-based access control
- Operation-level permissions
- Resource-level restrictions
- Audit trail for all access

## Authentication Modes

### Local Mode
- Direct file system access
- No network communication
- Key-based authentication only
- Suitable for personal use

### Remote Mode
- API-based authentication
- Password required
- Encrypted data transfer
- Suitable for collaboration

## Audit Integration

All authentication events are logged:
- Login attempts (success/failure)
- Key usage and validation
- Permission checks
- Token generation/refresh
- Logout events

## Error Handling

**Authentication Errors:**
- Invalid credentials
- Expired keys
- Database not found
- Permission denied

**Security Responses:**
- Rate limiting on failures
- Account lockout after attempts
- Security alerts on anomalies
- Audit logging of all errors