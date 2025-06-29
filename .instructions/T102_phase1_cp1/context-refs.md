# Context References for T102_phase1_cp1

## Current Project State
- Fresh project combining two mature templates
- Doctor-Dok backend is in `templates/backend/doctor-dok/` 
- Rasket frontend is in `templates/frontend/rasket-template/`
- Need to create unified structure in project root

## Key Technical Details
### Doctor-Dok (Backend)
- Next.js 14+ with App Router
- Drizzle ORM with SQLite
- JWT-based authentication
- Supports encrypted single-tenant and multi-tenant modes
- Uses shadcn/ui components

### Rasket (Frontend)  
- Vite + React + TypeScript
- Bootstrap 5 + SCSS
- Mock authentication currently
- Rich component library
- Dashboard and admin templates

## Integration Requirements
- Preserve both apps' ability to run independently
- Share authentication logic between frontend/backend
- Common TypeScript types for API contracts
- Unified configuration management
- Consistent code style with shared linting

## Related Work
- T101 (BG-DESIGN) will provide architecture strategy
- T103-T105 (Claude) will handle specific config files after structure is ready
- T106 (BG-SCAFFOLD) will create .env.example after this task

## Important Notes
- Monorepo should use Turbo for build orchestration
- NPM workspaces preferred (already used in root package.json)
- Keep template code in `templates/` for reference
- New integrated app goes in `apps/` directory