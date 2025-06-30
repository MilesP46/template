# Context References for T210_phase2.5_cp1

## Current Claude Working Context
- **Phase**: 2.5 - Environment & Build System Fix
- **Checkpoint**: Critical Path
- **Task**: T210 - Fix workspace dependencies and install Turbo
- **Type**: Infrastructure task - unblocking development

## Current Build Issues
From T208 validation report:
1. **Turbo not installed**: `sh: turbo: command not found`
2. **Workspace protocol error**: `Unsupported URL Type "workspace:"`
3. **Dependencies cannot install**: Blocking all development

## Monorepo Structure
```
combined/
├── apps/
│   ├── rasket/        # React frontend
│   └── doctor-dok/    # Next.js backend
├── packages/
│   ├── shared-auth/      # Core auth logic
│   ├── shared-auth-react/# React auth integration
│   └── shared-types/     # TypeScript types
├── package.json       # Root workspace config
├── turbo.json        # Needs creation
└── tsconfig.json     # TypeScript config
```

## Expected Dependencies
Based on existing package.json:
- Workspace packages should reference each other
- Apps should import from packages
- All TypeScript packages need proper build setup

## Success Metrics
- Zero npm install errors
- Build completes in < 60 seconds
- All packages properly linked
- TypeScript references working
- Tests can import packages

## Related Files to Review
- `/reports/phase2_cp1/T208_validation_report.md`
- Root `package.json`
- All `packages/*/package.json`
- All `apps/*/package.json`

## Notes from Claude
This is critical path work. The entire project is blocked until the build system is fixed. Focus on:
1. Minimal changes to fix immediate issues
2. Don't refactor unnecessarily
3. Preserve existing structure
4. Document any breaking changes