# Core Architecture

## System Purpose

Doctor Dok is a **privacy-first medical record management system** that enables users to securely store, organize, and analyze their health documents using AI-powered features. The system provides:

- **Encrypted local storage** of medical records and attachments
- **AI-powered document analysis** for extracting structured health data
- **Intelligent chat interface** for querying medical history
- **Audit logging** for security and compliance
- **Multi-tenant architecture** with user-isolated data

## Guiding Principles

### 1. Privacy by Design
- **End-to-end encryption** for all sensitive data
- **Local-first storage** with user-controlled encryption keys
- **Zero-knowledge architecture** - server cannot decrypt user data
- **Minimal data collection** with explicit user consent

### 2. Security First
- **Multi-layered security** with encryption at rest and in transit
- **Comprehensive audit logging** for all data access
- **Key-based authentication** with ACL support
- **Database isolation** per user/tenant

### 3. AI-Enhanced Experience
- **Intelligent document parsing** using multiple AI providers
- **Natural language querying** of medical records
- **Automated data extraction** from PDFs and images
- **Smart categorization** and tagging

### 4. Scalable Architecture
- **Modular component design** with clear separation of concerns
- **Database partitioning** for performance optimization
- **Connection pooling** for efficient resource usage
- **Horizontal scaling** support through multi-database architecture

## High-Level Component Map

```mermaid
flowchart TD
    subgraph "Frontend Layer"
        UI[Next.js UI Components]
        CTX[React Contexts]
        HOOKS[Custom Hooks]
    end
    
    subgraph "API Layer"
        API[Next.js API Routes]
        MW[Middleware]
        AUTH[Authorization]
    end
    
    subgraph "Business Logic Layer"
        REPO[Repository Layer]
        CRYPTO[Encryption Service]
        AI[AI Processing]
        AUDIT[Audit Service]
    end
    
    subgraph "Data Layer"
        MAIN[(Main Database)]
        AUDIT_DB[(Audit Database)]
        STATS_DB[(Stats Database)]
        FILES[File Storage]
    end
    
    subgraph "External Services"
        OPENAI[OpenAI API]
        GEMINI[Google Gemini]
        TESSERACT[Tesseract OCR]
    end
    
    UI --> CTX
    CTX --> API
    API --> MW
    MW --> AUTH
    AUTH --> REPO
    REPO --> CRYPTO
    REPO --> MAIN
    REPO --> AUDIT_DB
    REPO --> STATS_DB
    AI --> OPENAI
    AI --> GEMINI
    AI --> TESSERACT
    AUDIT --> AUDIT_DB
    REPO --> FILES
```

## Core Components

### Frontend Architecture

**Technology Stack:**
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library
- **React Contexts** - State management

**Key Components:**
- `RecordContext` - Medical record management
- `ChatContext` - AI chat functionality  
- `DatabaseContext` - Database connection management
- `ConfigContext` - Application configuration
- `AuditContext` - Security audit logging

### API Layer

**Next.js API Routes:**
- `/api/record` - Medical record CRUD operations
- `/api/folder` - Folder management
- `/api/encrypted-attachment` - File upload/download
- `/api/db` - Database management (create, authorize, challenge)
- `/api/audit` - Audit log access
- `/api/stats` - Usage statistics
- `/api/config` - Configuration management

**Authentication & Authorization:**
- JWT-based session management
- Key-based database access control
- Middleware for request validation
- ACL enforcement per operation

### Business Logic Layer

**Repository Pattern:**
- `ServerRecordRepository` - Medical record operations
- `ServerKeyRepository` - Encryption key management
- `ServerAuditRepository` - Audit logging
- `ServerConfigRepository` - Configuration storage
- `ServerStatRepository` - Statistics tracking

**Core Services:**
- **Encryption Service** - AES-256 encryption with Argon2 key derivation
- **AI Processing** - Multi-provider document analysis
- **Audit Service** - Comprehensive activity logging
- **File Storage** - Secure attachment management

### Data Layer

**Multi-Database Architecture:**
1. **Main Database** - Core application data
2. **Audit Database** - Security and compliance logs
3. **Stats Database** - Usage analytics and metrics

**Database Provider:**
- Connection pooling (max 50 connections)
- Automatic migration management
- Database partitioning support
- SQLite with WAL mode for concurrency

## Data Flow

### Record Creation Flow

```mermaid
flowchart TD
    U[User] --> UI[Frontend]
    UI --> API[API Layer]
    API --> REPO[Repository]
    REPO --> CRYPTO[Encryption]
    CRYPTO --> REPO2[Repository]
    REPO2 --> DB[(Database)]
    DB --> REPO3[Repository]
    REPO3 --> AI[AI Service]
    AI --> REPO4[Repository]
    REPO4 --> CRYPTO2[Encryption]
    CRYPTO2 --> REPO5[Repository]
    REPO5 --> DB2[(Database)]
    REPO5 --> AUDIT[Audit Log]
    AUDIT --> DB3[(Database)]
    REPO5 --> API2[API Layer]
    API2 --> UI2[Frontend]
    UI2 --> U2[User]
    
    U -.->|"Upload document"| UI
    UI -.->|"POST /api/record"| API
    API -.->|"createRecord()"| REPO
    REPO -.->|"encrypt(data)"| CRYPTO
    CRYPTO -.->|"encryptedData"| REPO2
    REPO2 -.->|"INSERT record"| DB
    DB -.->|"recordId"| REPO3
    REPO3 -.->|"parseDocument()"| AI
    AI -.->|"extractedData"| REPO4
    REPO4 -.->|"encrypt(extractedData)"| CRYPTO2
    CRYPTO2 -.->|"encryptedExtractedData"| REPO5
    REPO5 -.->|"UPDATE record"| DB2
    REPO5 -.->|"logActivity()"| AUDIT
    AUDIT -.->|"INSERT audit_log"| DB3
    REPO5 -.->|"success"| API2
    API2 -.->|"record created"| UI2
    UI2 -.->|"Show success"| U2
```

### Chat Query Flow

```mermaid
flowchart TD
    U[User] --> UI[Chat UI]
    UI --> API[API Layer]
    API --> REPO[Repository]
    REPO --> CRYPTO[Encryption]
    CRYPTO --> REPO2[Repository]
    REPO2 --> API2[API Layer]
    API2 --> AI[AI Provider]
    AI --> API3[API Layer]
    API3 --> AUDIT[Audit Log]
    AUDIT --> STATS[(Stats DB)]
    API3 --> UI2[Chat UI]
    UI2 --> U2[User]
    
    U -.->|"Ask medical question"| UI
    UI -.->|"POST /api/chat"| API
    API -.->|"getRelevantRecords()"| REPO
    REPO -.->|"decrypt(records)"| CRYPTO
    CRYPTO -.->|"decryptedRecords"| REPO2
    REPO2 -.->|"contextData"| API2
    API2 -.->|"generateResponse(question, context)"| AI
    AI -.->|"aiResponse"| API3
    API3 -.->|"logAIUsage()"| AUDIT
    AUDIT -.->|"INSERT stats"| STATS
    API3 -.->|"response"| UI2
    UI2 -.->|"Display answer"| U2
```

## Security Architecture

### Encryption Model

**Data Encryption:**
- **AES-256-GCM** for data encryption
- **Argon2** for key derivation
- **PBKDF2** for password hashing
- **Random IV/Salt** generation per operation

**Key Management:**
- User-provided master password
- Derived encryption keys per database
- Key rotation and expiry support
- ACL-based access control

### Authentication Flow

```mermaid
flowchart TD
    U[User] --> UI[Frontend]
    UI --> API[Auth API]
    API --> CRYPTO[Crypto Service]
    CRYPTO --> API2[Auth API]
    API2 --> DB[(Key Store)]
    DB --> API3[Auth API]
    API3 --> CRYPTO2[Crypto Service]
    CRYPTO2 --> API4[Auth API]
    API4 --> CRYPTO3[Crypto Service]
    CRYPTO3 --> API5[Auth API]
    API5 --> UI2[Frontend]
    UI2 --> U2[User]
    
    U -.->|"Enter password"| UI
    UI -.->|"POST /api/db/challenge"| API
    API -.->|"deriveKey(password, salt)"| CRYPTO
    CRYPTO -.->|"derivedKey"| API2
    API2 -.->|"findKey(keyHash)"| DB
    DB -.->|"keyData"| API3
    API3 -.->|"verifyKey(derivedKey, keyData)"| CRYPTO2
    CRYPTO2 -.->|"isValid"| API4
    API4 -.->|"generateJWT(keyData)"| CRYPTO3
    CRYPTO3 -.->|"jwt"| API5
    API5 -.->|"authToken"| UI2
    UI2 -.->|"Access granted"| U2
```

## Performance Characteristics

### Database Optimization

**Connection Management:**
- Connection pooling (50 max connections)
- Lazy connection initialization
- Automatic connection cleanup
- Database-specific pools

**Query Optimization:**
- Indexed foreign keys and timestamps
- SQLite WAL mode for concurrency
- Prepared statements for security
- Batch operations for bulk data

### Caching Strategy

**Frontend Caching:**
- React Query for API response caching
- Browser storage for user preferences
- Service Worker for offline support

**Backend Caching:**
- Database connection pooling
- Prepared statement caching
- File system caching for attachments

## Scalability Considerations

### Horizontal Scaling

**Database Partitioning:**
- Monthly audit log partitions
- User-isolated database instances
- Configurable partition strategies

**Service Isolation:**
- Separate databases for different data types
- Independent scaling of AI processing
- Microservice-ready architecture

### Vertical Scaling

**Resource Optimization:**
- Efficient memory usage with connection pooling
- Lazy loading of large datasets
- Streaming for file operations
- Background processing for AI tasks

## Development Guidelines

### Code Organization

**Directory Structure:**
- `src/app/` - Next.js App Router pages and API routes
- `src/components/` - Reusable UI components
- `src/contexts/` - React context providers
- `src/data/` - Data access layer (client/server)
- `src/lib/` - Utility functions and helpers
- `src/ocr/` - AI processing providers

**Naming Conventions:**
- PascalCase for components and classes
- camelCase for functions and variables
- kebab-case for file names
- UPPER_CASE for constants

### Security Best Practices

**Data Handling:**
- Always encrypt sensitive data before storage
- Use prepared statements for database queries
- Validate all user inputs
- Log security-relevant events

**Error Handling:**
- Never expose internal errors to users
- Log detailed errors for debugging
- Use appropriate HTTP status codes
- Implement graceful degradation

## Monitoring & Observability

### Audit Logging

**Logged Events:**
- User authentication attempts
- Data access and modifications
- AI API usage and costs
- System errors and exceptions

**Audit Data:**
- Timestamp and user identification
- Operation type and parameters
- Before/after data states
- IP address and user agent

### Performance Monitoring

**Metrics Collection:**
- API response times
- Database query performance
- AI processing duration
- Memory and CPU usage

**Usage Analytics:**
- Feature usage patterns
- AI token consumption
- User engagement metrics
- Error rates and types 