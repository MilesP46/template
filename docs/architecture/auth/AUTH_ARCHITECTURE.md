# Authentication Architecture

## System Overview

```mermaid
graph TB
    subgraph "Frontend (Rasket)"
        A[React App]
        B[AuthProvider]
        C[Auth Hooks]
        D[Auth Components]
        E[API Client]
    end
    
    subgraph "Shared Packages"
        F[shared-auth]
        G[shared-auth-react]
        H[shared-types]
    end
    
    subgraph "Backend (Doctor-Dok)"
        I[Auth Middleware]
        J[Auth Factory]
        K[Single-Tenant Strategy]
        L[Multi-Tenant Strategy]
        M[JWT Service]
        N[Encryption Service]
    end
    
    subgraph "Storage"
        O[(Single-Tenant DBs)]
        P[(Multi-Tenant DB)]
        Q[Session Storage]
    end
    
    A --> B
    B --> C
    B --> G
    C --> D
    B --> E
    E --> I
    
    G --> F
    G --> H
    
    I --> J
    J --> K
    J --> L
    K --> M
    L --> M
    K --> N
    K --> O
    L --> P
    
    B --> Q
```

## Component Relationships

### 1. Frontend Layer

```mermaid
graph LR
    subgraph "React Components"
        A[LoginForm]
        B[SignUpForm]
        C[LogoutButton]
        D[UserProfileDropdown]
        E[MasterKeyInput]
        F[MasterKeyPrompt]
        G[AuthGuard]
    end
    
    subgraph "Auth Context"
        H[AuthProvider]
        I[useAuth Hook]
    end
    
    subgraph "Custom Hooks"
        J[useLogin]
        K[useRegister]
        L[useLogout]
        M[useCurrentUser]
    end
    
    A --> J
    B --> K
    C --> L
    D --> M
    E --> B
    F --> I
    G --> I
    
    J --> H
    K --> H
    L --> H
    M --> H
```

### 2. Backend Layer

```mermaid
graph TB
    subgraph "API Routes"
        A[/api/auth/login]
        B[/api/auth/register]
        C[/api/auth/refresh]
        D[/api/auth/logout]
    end
    
    subgraph "Auth Factory"
        E[AuthModeFactory]
        F[AuthConfig]
    end
    
    subgraph "Strategies"
        G[BaseAuthStrategy]
        H[SingleTenantStrategy]
        I[MultiTenantStrategy]
    end
    
    subgraph "Services"
        J[JWTService]
        K[EncryptionUtils]
        L[Database Service]
    end
    
    A --> E
    B --> E
    C --> E
    D --> E
    
    E --> F
    E --> G
    G --> H
    G --> I
    
    H --> J
    H --> K
    H --> L
    I --> J
    I --> L
```

## Data Flow

### Registration Flow - Single Tenant

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Auth API
    participant S as Strategy
    participant D as Database
    
    U->>F: Enter credentials + master key
    F->>A: POST /api/auth/register
    A->>S: Create user with encryption
    S->>S: Generate encryption keys
    S->>D: Create encrypted database
    S->>S: Encrypt user key with master
    S->>D: Store encrypted key
    S->>S: Generate JWT tokens
    S-->>A: Return auth result
    A-->>F: Auth result + tokens
    F->>F: Store session
    F-->>U: Redirect to dashboard
```

### Login Flow - Multi Tenant

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Auth API
    participant S as Strategy
    participant D as Database
    
    U->>F: Enter databaseId + password
    F->>A: POST /api/auth/login
    A->>S: Authenticate user
    S->>D: Find user by databaseId
    D-->>S: User data + hash
    S->>S: Verify password with Argon2
    S->>S: Generate JWT tokens
    S-->>A: Return auth result
    A-->>F: Auth result + tokens
    F->>F: Store session
    F-->>U: Redirect to dashboard
```

### Token Refresh Flow

```mermaid
sequenceDiagram
    participant F as Frontend
    participant M as Middleware
    participant A as Auth API
    participant J as JWT Service
    
    F->>M: API request with token
    M->>J: Verify access token
    J-->>M: Token expired
    M-->>F: 401 Unauthorized
    F->>F: Check refresh token
    F->>A: POST /api/auth/refresh
    A->>J: Verify refresh token
    J-->>A: Valid token data
    A->>J: Generate new tokens
    J-->>A: New token pair
    A-->>F: New tokens
    F->>F: Update session
    F->>M: Retry with new token
```

## Security Architecture

### 1. Encryption Layers

```mermaid
graph TD
    subgraph "Single-Tenant Encryption"
        A[Master Key] --> B[PBKDF2]
        B --> C[AES Key]
        C --> D[Encrypt Database]
        C --> E[Encrypt User Key]
        
        F[User Password] --> G[Argon2]
        G --> H[Decrypt User Key]
        H --> I[Access Database]
    end
    
    subgraph "Data at Rest"
        J[Encrypted DB File]
        K[Encrypted User Key]
        L[Password Hash]
    end
    
    D --> J
    E --> K
    G --> L
```

### 2. Token Security

```mermaid
graph LR
    subgraph "Token Generation"
        A[User Data] --> B[JWT Payload]
        B --> C[Sign with Secret]
        C --> D[Access Token]
        C --> E[Refresh Token]
    end
    
    subgraph "Token Validation"
        F[Incoming Token] --> G[Verify Signature]
        G --> H{Valid?}
        H -->|Yes| I[Extract Claims]
        H -->|No| J[Reject Request]
        I --> K[Check Expiry]
        K --> L{Expired?}
        L -->|No| M[Allow Request]
        L -->|Yes| N[Check Refresh]
    end
```

## Storage Architecture

### 1. Database Structure

```mermaid
graph TD
    subgraph "Single-Tenant Mode"
        A[User Registration] --> B[Create DB File]
        B --> C[user_001.db]
        B --> D[user_002.db]
        B --> E[user_003.db]
        
        F[Keys Table]
        G[User Data]
        
        C --> F
        C --> G
    end
    
    subgraph "Multi-Tenant Mode"
        H[Shared Database]
        I[Users Table]
        J[Keys Table]
        K[Tenant Data]
        
        H --> I
        H --> J
        H --> K
        
        L[Row-Level Security]
        I --> L
        K --> L
    end
```

### 2. Session Storage

```mermaid
graph LR
    subgraph "Client Storage"
        A[Session Data] --> B{Keep Logged In?}
        B -->|Yes| C[Encrypt Data]
        B -->|No| D[Session Storage]
        C --> E[Local Storage]
        
        F[Storage Keys]
        F --> G[auth:session]
        F --> H[auth:creds]
        F --> I[auth:prefs]
    end
    
    subgraph "Token Storage"
        J[Access Token] --> K[Memory/State]
        L[Refresh Token] --> M[Encrypted Storage]
    end
```

## Error Handling Architecture

```mermaid
graph TD
    subgraph "Error Sources"
        A[Invalid Credentials]
        B[Expired Token]
        C[Network Error]
        D[Server Error]
        E[Invalid Master Key]
    end
    
    subgraph "Error Processing"
        F[Auth Error Class]
        G[Error Codes]
        H[HTTP Status]
        I[User Message]
    end
    
    subgraph "Client Handling"
        J[Error Hook]
        K[UI Feedback]
        L[Retry Logic]
        M[Fallback]
    end
    
    A --> F
    B --> F
    C --> F
    D --> F
    E --> F
    
    F --> G
    F --> H
    F --> I
    
    F --> J
    J --> K
    J --> L
    J --> M
```

## Deployment Considerations

### 1. Environment-Based Configuration

```mermaid
graph LR
    subgraph "Development"
        A[Local SQLite]
        B[Dev Secrets]
        C[Debug Logging]
    end
    
    subgraph "Production"
        D[Production DB]
        E[Secure Secrets]
        F[Error Tracking]
    end
    
    subgraph "Configuration"
        G[.env.development]
        H[.env.production]
        I[Runtime Config]
    end
    
    G --> A
    G --> B
    G --> C
    
    H --> D
    H --> E
    H --> F
    
    I --> G
    I --> H
```

### 2. Scaling Architecture

```mermaid
graph TD
    subgraph "Single Instance"
        A[App Server]
        B[Local SQLite]
    end
    
    subgraph "Scaled Deployment"
        C[Load Balancer]
        D[App Server 1]
        E[App Server 2]
        F[App Server N]
        G[Shared Storage]
        H[Redis Session]
    end
    
    C --> D
    C --> E
    C --> F
    
    D --> G
    E --> G
    F --> G
    
    D --> H
    E --> H
    F --> H
```

## Integration Points

### 1. Frontend Integration

- **AuthProvider**: Wraps entire app with auth context
- **API Client**: Handles token management automatically
- **Route Guards**: Protect pages requiring authentication
- **UI Components**: Pre-built auth forms and controls

### 2. Backend Integration

- **Middleware**: Protects API routes automatically
- **User Context**: Available in all protected routes
- **Database Access**: Mode-specific data isolation
- **Audit Logging**: Track all auth events

### 3. External Services

Future integration points:
- OAuth providers (Google, GitHub, etc.)
- SAML for enterprise SSO
- LDAP/Active Directory
- Multi-factor authentication services

## Performance Considerations

1. **Token Caching**: Minimize JWT verification overhead
2. **Database Pooling**: Reuse connections in multi-tenant
3. **Encryption Caching**: Cache derived keys appropriately
4. **Session Storage**: Use efficient serialization
5. **API Batching**: Reduce auth-related API calls