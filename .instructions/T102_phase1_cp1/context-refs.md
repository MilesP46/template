# Context References for T102_phase1_cp1

## Current Claude Working Context
- **Phase**: 1 - Architecture & Discovery
- **Checkpoint**: 1.1
- **Task**: T102 - Set up monorepo structure
- **Previous Task**: T101 - Architecture analysis (delegated to BG-DESIGN)
- **Parallel Tasks**: T103-T107 (Claude will work on these while you execute)

## Key Project Decisions
- **Frontend**: Rasket template (React + TypeScript + Vite + Bootstrap 5)
- **Backend**: Doctor-Dok template (Next.js + SQLite + Drizzle ORM)
- **Auth Modes**: Both single-tenant (encrypted DB) and multi-tenant (shared DB)
- **UI Strategy**: Replace all Doctor-Dok UI with Rasket components
- **AI Features**: Integrate Doctor-Dok's AI capabilities

## Integration Approach
- Monorepo structure to manage both templates
- Shared types and utilities packages
- Gradual migration preserving functionality
- Single command development setup goal

## Expected Deliverables
1. Complete monorepo directory structure
2. Workspace configuration for package management
3. Clear README files for navigation
4. Report documenting the scaffolding decisions

## Notes from Claude
This scaffolding task sets the foundation for all subsequent work. Focus on creating a structure that:
- Enables parallel development
- Maintains clear boundaries
- Supports both authentication modes
- Makes integration points obvious
- Facilitates easy testing and deployment