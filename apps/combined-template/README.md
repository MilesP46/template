# Combined Template - Migration Workspace

This directory serves as the migration workspace for Phase 3, where we systematically migrate Doctor-Dok components to Rasket's Bootstrap 5 based system.

## Directory Structure

```
src/
├── components/
│   ├── migrated/          # New Bootstrap-based components
│   │   ├── auth/         # Authentication-related components
│   │   ├── layout/       # Layout and navigation components
│   │   ├── ui/           # Basic UI components (buttons, inputs, etc.)
│   │   └── data/         # Data display components
│   └── legacy/           # Temporary storage for Doctor-Dok components during migration
└── styles/
    └── migration/        # Migration-specific styles and utilities
```

## Migration Process

1. **Copy** the original Doctor-Dok component to `legacy/` folder
2. **Create** the new Bootstrap version in appropriate `migrated/` subfolder
3. **Test** both components side-by-side
4. **Replace** imports gradually across the codebase
5. **Remove** legacy component once migration is verified

## Component Naming Convention

- Migrated components keep their original names where possible
- During transition: 
  - Legacy: `legacy/AuthorizeDatabaseForm.tsx`
  - New: `migrated/auth/AuthorizeDatabaseForm.tsx`

## Status Tracking

See [COMPONENT_MAPPING.md](/docs/architecture/phase3/COMPONENT_MAPPING.md) for current migration status.

## Quick Start

```bash
# Example: Migrating a component
# 1. Copy original to legacy
cp ../../templates/backend/doctor-dok/src/components/button.tsx src/components/legacy/

# 2. Create Bootstrap version
touch src/components/migrated/ui/Button.tsx

# 3. Implement Bootstrap version
# 4. Test both versions
# 5. Update imports when ready
```

## Testing

Each migrated component should have:
- Unit tests in `__tests__/` folder
- Storybook story for visual testing
- Integration test with parent components

## Resources

- [Component Mapping Document](/docs/architecture/phase3/COMPONENT_MAPPING.md)
- [Migration Plan](/docs/architecture/phase3/MIGRATION_PLAN.md)
- [Bootstrap 5 Documentation](https://getbootstrap.com/docs/5.0/)
- [React Bootstrap Documentation](https://react-bootstrap.github.io/)