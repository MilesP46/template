# File Structure

## Repository Tree

```
doctor-dok/
├── 📁 docs/                          # Documentation
│   ├── 📁 api/                       # API endpoint documentation
│   │   ├── 📁 api/                   # API route handlers
│   │   │   ├── 📁 audit/             # Audit logging endpoints
│   │   │   ├── 📁 config/            # Configuration management
│   │   │   ├── 📁 db/                # Database operations
│   │   │   ├── 📁 encrypted-attachment/ # File upload/download
│   │   │   ├── 📁 folder/            # Folder management
│   │   │   ├── 📁 keys/              # Encryption key management
│   │   │   ├── 📁 record/            # Medical record CRUD
│   │   │   ├── 📁 saas/              # SaaS functionality
│   │   │   ├── 📁 stats/             # Usage statistics
│   │   │   └── 📁 terms/             # Terms of service
│   │   ├── 📁 content/               # Dynamic content pages
│   │   ├── favicon.ico               # App icon
│   │   ├── globals.css               # Global styles
│   │   ├── layout.tsx                # Root layout component
│   │   ├── manifest.ts               # PWA manifest
│   │   └── page.tsx                  # Home page
│   │
│   ├── 📁 components/                # React components
│   │   ├── 📁 shared/                # Shared/common components
│   │   ├── 📁 ui/                    # shadcn/ui components
│   │   ├── audit-log.tsx             # Audit log display
│   │   ├── chat.tsx                  # AI chat interface
│   │   ├── record-form.tsx           # Record creation/editing
│   │   ├── record-item.tsx           # Record display component
│   │   └── top-header.tsx            # Application header
│   │
│   ├── 📁 contexts/                  # React context providers
│   │   ├── audit-context.tsx         # Audit logging state
│   │   ├── chat-context.tsx          # Chat functionality state
│   │   ├── config-context.tsx        # App configuration state
│   │   ├── db-context.tsx            # Database connection state
│   │   ├── folder-context.tsx        # Folder management state
│   │   ├── key-context.tsx           # Encryption key state
│   │   ├── record-context.tsx        # Medical record state
│   │   ├── saas-context.tsx          # SaaS features state
│   │   └── terms-context.tsx         # Terms acceptance state
│   │
│   ├── 📁 data/                      # Data access layer
│   │   ├── 📁 client/                # Client-side API clients
│   │   │   ├── base-api-client.ts    # Base API client class
│   │   │   ├── record-api-client.ts  # Record operations
│   │   │   ├── folder-api-client.ts  # Folder operations
│   │   │   ├── key-api-client.ts     # Key management
│   │   │   └── models.ts             # TypeScript interfaces
│   │   ├── 📁 server/                # Server-side repositories
│   │   │   ├── db-provider.ts        # Database connection pool
│   │   │   ├── db-schema.ts          # Main database schema
│   │   │   ├── db-schema-audit.ts    # Audit database schema
│   │   │   ├── db-schema-stats.ts    # Stats database schema
│   │   │   ├── server-record-repository.tsx # Record data access
│   │   │   ├── server-key-repository.tsx    # Key data access
│   │   │   └── base-repository.ts    # Base repository class
│   │   └── dto.ts                    # Data transfer objects
│   │
│   ├── 📁 hooks/                     # Custom React hooks
│   │   ├── use-document-visibility.tsx # Document visibility hook
│   │   └── use-media-query.tsx       # Media query hook
│   │
│   ├── 📁 lib/                       # Utility libraries
│   │   ├── crypto.ts                 # Encryption utilities
│   │   ├── data-conversion.ts        # Data conversion utilities
│   │   ├── pdf2js.js                 # PDF processing
│   │   ├── storage-service.ts        # File storage service
│   │   └── utils.ts                  # General utilities
│   │
│   ├── 📁 ocr/                       # AI/OCR processing
│   │   ├── ocr-chatgpt-provider.ts   # OpenAI processing
│   │   ├── ocr-gemini-provider.ts    # Google Gemini processing
│   │   ├── ocr-tesseract-provider.ts # Tesseract OCR
│   │   └── ocr-parse-helper.ts       # OCR utilities
│   │
│   ├── 📁 content/                   # Static content
│   │   ├── privacy.md                # Privacy policy
│   │   └── terms.md                  # Terms of service
│   │
│   ├── 📁 terms/                     # Terms processing
│   │   └── terms.tsx                 # Terms component
│   │
│   └── middleware.ts                 # Next.js middleware
│
├── 📁 src-distro/                    # Distribution-specific code
│   ├── 📁 components/                # Distro-specific components
│   ├── 📁 data/                      # Distro configuration
│   └── 📁 defaults/                  # Default data
│
├── 📁 data/                          # Runtime data storage
│   └── 📁 {databaseIdHash}/          # User-specific databases
│       ├── db.sqlite                 # Main database
│       ├── db-audit.sqlite           # Audit database
│       ├── db-stats.sqlite           # Stats database
│       ├── 📁 audit-partitions/      # Partitioned audit logs
│       └── manifest.json             # Database metadata
│
├── 📁 drizzle/                       # Main DB migrations
├── 📁 drizzle-audit/                 # Audit DB migrations
├── 📁 drizzle-stats/                 # Stats DB migrations
│
├── 📁 public/                        # Static assets
│   ├── 📁 img/                       # Images and icons
│   ├── 📁 onboarding/                # Onboarding assets
│   └── pdf.worker.mjs                # PDF.js worker
│
├── 📁 uploads/                       # Temporary file uploads
│
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript configuration
├── tailwind.config.ts                # Tailwind CSS configuration
├── next.config.mjs                   # Next.js configuration
├── drizzle.config.ts                 # Main DB configuration
├── drizzle.audit.config.ts           # Audit DB configuration
├── drizzle.stats.config.ts           # Stats DB configuration
├── components.json                   # shadcn/ui configuration
├── README.md                         # Project documentation
├── LICENSE                           # Software license
└── SECURITY.md                       # Security policy
```

## Naming Conventions

### File Naming

**React Components:**
- **PascalCase** for component files: `RecordItem.tsx`, `ChatMessage.tsx`
- **kebab-case** for non-component files: `api-client.ts`, `db-schema.ts`
- **Descriptive names** that indicate purpose: `record-form.tsx`, `audit-log.tsx`

**API Routes:**
- **kebab-case** for route directories: `/api/encrypted-attachment/`
- **RESTful naming**: `/api/record/[id]/route.tsx`
- **Descriptive endpoints**: `/api/db/authorize/route.tsx`

**Database Files:**
- **Descriptive prefixes**: `db-schema.ts`, `db-provider.ts`
- **Schema separation**: `db-schema-audit.ts`, `db-schema-stats.ts`
- **Migration naming**: Drizzle auto-generates descriptive names

### Directory Organization

**Functional Grouping:**
- `components/` - UI components grouped by functionality
- `contexts/` - React contexts for state management
- `data/` - Data access layer split by client/server
- `lib/` - Utility functions and helpers
- `ocr/` - AI/OCR processing providers

**Feature-based Structure:**
- Each major feature has its own context, components, and API routes
- Related files are co-located for easier maintenance
- Shared utilities are centralized in `lib/`

### Code Organization Principles

**Separation of Concerns:**
- **Presentation Layer**: `components/` and `app/`
- **Business Logic**: `contexts/` and `data/server/`
- **Data Access**: `data/client/` and `data/server/`
- **Utilities**: `lib/` and `hooks/`

**Dependency Direction:**
- Components depend on contexts
- Contexts depend on API clients
- API clients depend on utilities
- No circular dependencies

## Folder Responsibilities

### `/src/app/` - Next.js App Router
**Purpose:** Application routing, pages, and API endpoints
**Key Files:**
- `layout.tsx` - Root application layout
- `page.tsx` - Home page component
- `api/*/route.tsx` - API endpoint handlers

**Conventions:**
- Each API endpoint in its own directory
- Use Next.js 13+ App Router conventions
- Co-locate related API routes

### `/src/components/` - UI Components
**Purpose:** Reusable React components for the user interface
**Key Subdirectories:**
- `ui/` - shadcn/ui component library
- `shared/` - Common components used across features

**Conventions:**
- One component per file
- Include associated CSS modules where needed
- Export default for main component

### `/src/contexts/` - State Management
**Purpose:** React contexts for global state management
**Pattern:**
```typescript
// Context pattern used throughout
export type ContextType = {
  // State and methods
}

export const Context = createContext<ContextType | null>(null)

export const ContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  // Implementation
}
```

### `/src/data/` - Data Access Layer
**Purpose:** Abstraction layer for data operations
**Structure:**
- `client/` - Frontend API clients
- `server/` - Backend repositories and database access
- `dto.ts` - Data transfer objects

**Conventions:**
- Repository pattern for data access
- Separate client and server concerns
- Type-safe data transfer objects

### `/src/lib/` - Utilities
**Purpose:** Shared utility functions and helpers
**Key Files:**
- `crypto.ts` - Encryption/decryption utilities
- `utils.ts` - General utility functions
- `data-conversion.ts` - Data transformation utilities

**Conventions:**
- Pure functions where possible
- Well-documented utility functions
- Single responsibility per file

## Configuration Files

### Database Configuration
- `drizzle.config.ts` - Main database schema and migrations
- `drizzle.audit.config.ts` - Audit database configuration
- `drizzle.stats.config.ts` - Statistics database configuration

### Build Configuration
- `next.config.mjs` - Next.js build and runtime configuration
- `tsconfig.json` - TypeScript compiler configuration
- `tailwind.config.ts` - Tailwind CSS styling configuration

### Package Management
- `package.json` - Dependencies, scripts, and project metadata
- `yarn.lock` - Dependency lock file for reproducible builds

## Data Storage Structure

### Runtime Data (`/data/`)
```
data/
└── {databaseIdHash}/              # Unique per user/database
    ├── db.sqlite                  # Main application data
    ├── db-audit.sqlite           # Security audit logs
    ├── db-stats.sqlite           # Usage statistics
    ├── audit-partitions/         # Monthly audit partitions
    │   └── db-audit-2024-01.sqlite
    └── manifest.json             # Database metadata
```

### Migration Files
```
drizzle/                          # Main database migrations
├── 0000_initial_schema.sql
├── 0001_add_attachments.sql
└── meta/                         # Migration metadata

drizzle-audit/                    # Audit database migrations
├── 0000_initial_audit.sql
└── meta/

drizzle-stats/                    # Stats database migrations
├── 0000_initial_stats.sql
└── meta/
```

## Development Workflow

### File Creation Guidelines

1. **New Feature Development:**
   - Create context in `/src/contexts/`
   - Add API routes in `/src/app/api/`
   - Create components in `/src/components/`
   - Add repository in `/src/data/server/`

2. **Database Changes:**
   - Update schema in `/src/data/server/db-schema*.ts`
   - Generate migration with `yarn drizzle-kit generate`
   - Test migration with development database

3. **Component Development:**
   - Follow existing component patterns
   - Use TypeScript for type safety
   - Include proper error handling
   - Add to appropriate context if stateful

### Code Quality Standards

**File Size Limits:**
- Components: ≤150 lines (split into smaller components if larger)
- Utilities: ≤100 lines per function
- Contexts: ≤300 lines (consider splitting by feature)

**Import Organization:**
```typescript
// External libraries
import React from 'react'
import { NextRequest } from 'next/server'

// Internal utilities
import { encrypt, decrypt } from '@/lib/crypto'

// Internal components/contexts
import { RecordContext } from '@/contexts/record-context'

// Relative imports
import './component.module.css'
```

**Export Conventions:**
- Default export for main component/function
- Named exports for utilities and types
- Consistent export patterns within directories 