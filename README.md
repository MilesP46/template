# Combined Template - Rasket + Doctor-Dok

**A unified SaaS template combining Rasket's modern React UI with Doctor-Dok's secure backend authentication and AI capabilities.**

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url> my-saas-app
cd my-saas-app

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Start development servers (frontend + backend)
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## ✨ Features

### **Modern UI Framework**
- React 18 with TypeScript
- Bootstrap 5 components from Rasket template
- Responsive design with mobile-first approach
- Rich component library (tables, charts, forms, etc.)
- Dark/light theme support

### **Secure Authentication**
- JWT-based authentication from Doctor-Dok
- Two authentication modes:
  - **Single-tenant**: Encrypted SQLite database per user
  - **Multi-tenant**: Shared database with user isolation
- Master key encryption for sensitive data
- Secure session management

### **Backend Architecture**
- Next.js 14 API routes
- SQLite with Drizzle ORM
- Type-safe database queries
- Built-in audit logging
- Scalable monorepo structure

### **AI Integration** (Optional)
- OpenAI API support
- Google AI integration
- Ollama for local AI
- Document analysis capabilities
- Configurable AI features

### **Developer Experience**
- Hot reload for both frontend and backend
- TypeScript throughout
- ESLint + Prettier configuration
- Workspace-based monorepo
- Comprehensive documentation

## 🏗️ Project Structure

```
combined/
├── apps/
│   ├── frontend/          # React application (Rasket-based)
│   └── backend/           # Next.js API (Doctor-Dok-based)
├── packages/
│   ├── shared-types/      # Shared TypeScript interfaces
│   ├── shared-utils/      # Common utility functions
│   └── config/            # Shared configuration files
├── scripts/               # Development and build scripts
├── docs/                  # Project documentation
├── .instructions/         # Claude agent instructions
├── .rules/                # Development rules and workflows
├── package.json           # Monorepo workspace configuration
├── tsconfig.json          # TypeScript configuration
├── .eslintrc.json         # ESLint configuration
├── .prettierrc.json       # Prettier configuration
└── .env.example           # Environment variables template
```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Authentication Mode
AUTH_MODE=single-tenant  # or 'multi-tenant'

# Database
DATABASE_URL=./data/app.db
ENCRYPTION_ENABLED=true

# JWT Configuration
JWT_SECRET=your-secret-key
REFRESH_SECRET=your-refresh-secret

# AI Services (Optional)
OPENAI_API_KEY=your-openai-key
GOOGLE_AI_API_KEY=your-google-key
```

### Authentication Modes

#### Single-Tenant Mode
- Each user gets their own encrypted SQLite database
- Master key required for encryption
- Complete data isolation
- Best for sensitive data applications

#### Multi-Tenant Mode
- Shared database with row-level security
- More efficient resource usage
- Easier to manage and backup
- Best for typical SaaS applications

## 📦 Available Scripts

### Development
```bash
npm run dev              # Start both frontend and backend
npm run frontend:dev    # Start frontend only
npm run backend:dev     # Start backend only
```

### Building
```bash
npm run build           # Build all packages and apps
npm run frontend:build  # Build frontend only
npm run backend:build   # Build backend only
```

### Database
```bash
npm run db:generate     # Generate database migrations
npm run db:migrate      # Run database migrations
```

### Code Quality
```bash
npm run lint            # Run ESLint
npm run format          # Format code with Prettier
npm run type-check      # Run TypeScript checks
```

## 🚧 Development Workflow

### Phase 1: Architecture & Setup ✅
- Monorepo structure configuration
- Development environment setup
- Shared configuration files
- Base documentation

### Phase 2: Authentication Integration (In Progress)
- JWT authentication implementation
- Database mode configuration
- User management system
- Session handling

### Phase 3: UI Integration (Upcoming)
- Rasket component migration
- Theme system setup
- Responsive layouts
- Form validation

### Phase 4: API Development (Upcoming)
- RESTful API design
- TypeScript interfaces
- Error handling
- Data validation

## 📚 Documentation

- [Project Specification](docs/project-specification.md) - Detailed requirements
- [Architecture Guide](docs/architecture/README.md) - System design (coming soon)
- [API Documentation](docs/api/README.md) - Endpoint reference (coming soon)
- [Component Library](docs/components/README.md) - UI components (coming soon)

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Bootstrap 5** - UI framework
- **React Router** - Navigation
- **React Hook Form** - Form handling
- **Axios** - HTTP client

### Backend
- **Next.js 14** - Full-stack framework
- **SQLite** - Database
- **Drizzle ORM** - Type-safe ORM
- **JWT** - Authentication
- **Argon2** - Password hashing
- **Zod** - Schema validation

### Development
- **npm Workspaces** - Monorepo management
- **ESLint** - Linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Concurrently** - Parallel commands

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📄 License

MIT License - see LICENSE file for details

---

**Note**: This template is actively being developed. Check back for updates and new features!
