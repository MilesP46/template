# Phase 3: Component Migration Plan

## Overview

This document outlines the systematic migration strategy for transitioning Doctor-Dok's custom UI components to Rasket's Bootstrap 5 based system.

## Migration Timeline

### Phase 3a: Foundation Components (Week 1-2)
**Goal**: Establish base components that other components depend on

#### Priority 1: UI Primitives
1. **Button Component** (ui/button.tsx → Button)
   - Simple direct mapping
   - Update all imports across codebase
   
2. **Form Inputs** (ui/input.tsx, ui/textarea.tsx → FormControl)
   - Direct Bootstrap equivalents
   - Maintain react-hook-form integration
   
3. **Checkbox & Label** (ui/checkbox.tsx, ui/label.tsx)
   - Map to Form.Check and Form.Label
   
4. **Card Component** (ui/card.tsx → Card)
   - Direct mapping with style adjustments

#### Priority 2: Layout Components
1. **Authorization Guard** (authorization-guard.tsx)
   - Critical for auth flow
   - Minimal UI changes needed
   
2. **Theme Provider Migration**
   - Create Bootstrap theme adapter
   - Map CSS variables to Bootstrap SCSS

### Phase 3b: Authentication UI (Week 2-3)
**Goal**: Complete auth flow UI migration

1. **Authorize Database Form** (authorize-database-form.tsx)
   - Dependencies: Button, Input, Checkbox, Label
   - Convert Tailwind classes to Bootstrap
   - Maintain form validation logic
   
2. **Modal Components**
   - authorize-popup.tsx → Bootstrap Modal
   - change-key-popup.tsx → Bootstrap Modal
   - Convert Dialog to Modal API

3. **Create Database Form** (create-database-form.tsx)
   - Complex form with multiple steps
   - High priority for user onboarding

### Phase 3c: Data Display Components (Week 3-4)
**Goal**: Core data presentation layer

1. **Navigation Header** (top-header.tsx)
   - Complex component requiring significant refactor
   - Map to Rasket's TopNavigationBar structure
   
2. **Record Display**
   - record-list.tsx → Table component
   - record-item.tsx → Custom Card implementation
   - folder-item.tsx → ListGroup.Item

3. **Audit Components**
   - audit-log.tsx → Table
   - audit-log-item.tsx → Table rows or Cards

### Phase 3d: Advanced Features (Week 4-5)
**Goal**: Complex interactive components

1. **File Upload System**
   - encrypted-attachment-uploader.tsx
   - Integrate with DropzoneFormInput
   - Maintain encryption logic
   
2. **Chat Components** (if required)
   - chat.tsx - Major custom implementation
   - chat-message.tsx - Card-based messages
   
3. **Specialized Popups**
   - settings-popup.tsx
   - stats-popup.tsx
   - shared-keys-popup.tsx

### Phase 3e: Polish & Optimization (Week 5-6)
**Goal**: Final refinements and testing

1. **Remaining UI Components**
   - Modals, Toasts, Alerts
   - Progress indicators
   - Specialized components
   
2. **Style Refinements**
   - Consistent theming
   - Responsive behavior
   - Accessibility improvements

## Component-by-Component Migration Order

### Critical Path (Must complete in order)
```
1. ui/button.tsx
2. ui/input.tsx, ui/label.tsx
3. ui/checkbox.tsx
4. authorization-guard.tsx
5. authorize-database-form.tsx
6. authorize-popup.tsx
7. top-header.tsx
```

### Parallel Tracks (Can be done simultaneously)
**Track A: Forms**
- create-database-form.tsx
- change-key-form.tsx
- record-form.tsx

**Track B: Display**
- record-list.tsx
- record-item.tsx
- folder-list-popup.tsx

**Track C: Modals**
- All popup components
- Dialog to Modal conversions

## Dependencies and Blockers

### Technical Dependencies
```
authorize-database-form.tsx
├── Depends on:
│   ├── ui/button.tsx (MUST migrate first)
│   ├── ui/input.tsx (MUST migrate first)
│   ├── ui/checkbox.tsx (MUST migrate first)
│   └── ui/label.tsx (MUST migrate first)
└── Blocks:
    └── Main auth flow UI

top-header.tsx
├── Depends on:
│   ├── Theme system migration
│   ├── Navigation structure decision
│   └── Multiple UI components
└── Blocks:
    └── Overall app layout
```

### Design Dependencies
- Need Bootstrap theme configuration before starting
- Color palette mapping required
- Typography scale decisions

### API Dependencies
- Auth endpoints must remain compatible
- Form submission formats unchanged
- WebSocket connections (for chat) maintained

## Testing Strategy

### Unit Testing Approach
1. **Component Isolation Tests**
   ```typescript
   // Test example for migrated component
   describe('AuthorizeDatabaseForm (Migrated)', () => {
     it('renders all form fields', () => {})
     it('validates input correctly', () => {})
     it('submits with correct data', () => {})
     it('displays errors appropriately', () => {})
   })
   ```

2. **Visual Regression Tests**
   - Screenshot comparisons
   - Responsive breakpoint testing
   - Theme variation testing

### Integration Testing
1. **Form Flow Tests**
   - Complete auth flow
   - Database creation flow
   - Settings management flow

2. **Navigation Tests**
   - Header interactions
   - Route transitions
   - Auth guard redirects

### E2E Testing Priorities
1. User authentication flow
2. Database creation and access
3. Record CRUD operations
4. File upload functionality

## Rollback Strategy

### Component-Level Rollback
1. **Dual Component Strategy**
   ```typescript
   // During migration
   import ButtonOld from '@/components/ui/button'
   import ButtonNew from '@/components/migrated/ui/Button'
   
   // Feature flag controlled
   const Button = useFeatureFlag('useNewComponents') ? ButtonNew : ButtonOld
   ```

2. **Gradual Rollout**
   - Start with low-impact components
   - Monitor error rates
   - Quick revert capability

### Full Rollback Plan
1. Keep all original components in `/legacy` folder
2. Maintain import mappings
3. One-line config to switch back
4. Database migrations not affected

## Risk Mitigation

### High-Risk Mitigations
1. **Chat System**
   - Consider using react-bootstrap-chat library
   - Prototype early to identify issues
   - Have fallback to iframe old version

2. **File Upload Security**
   - Security audit before and after
   - Maintain all encryption logic
   - Extra testing for edge cases

3. **Theme System**
   - Build compatibility layer first
   - Test with multiple themes
   - Gradual migration of styles

### Medium-Risk Mitigations
1. **Form Validation Display**
   - Create consistent error component
   - Map validation states properly
   - Test all error scenarios

2. **Modal Behavior**
   - Document API differences
   - Create migration guide
   - Test nested modal scenarios

## Success Metrics

### Technical Metrics
- [ ] 0% increase in bundle size (target)
- [ ] <10% increase acceptable
- [ ] Page load time maintained or improved
- [ ] All existing features functional

### Quality Metrics
- [ ] 100% feature parity
- [ ] Improved accessibility scores
- [ ] Consistent responsive behavior
- [ ] No regression in user flows

### Code Metrics
- [ ] 80%+ test coverage maintained
- [ ] Reduced component complexity
- [ ] Improved type safety
- [ ] Better code reusability

## Migration Checklist Template

For each component migration:
```markdown
### Component: [component-name.tsx]
- [ ] Analyzed dependencies
- [ ] Created Bootstrap equivalent
- [ ] Migrated styles (Tailwind → Bootstrap)
- [ ] Updated imports across codebase
- [ ] Wrote/updated unit tests
- [ ] Tested responsive behavior
- [ ] Verified theme compatibility
- [ ] Updated documentation
- [ ] Performance benchmarked
- [ ] Accessibility tested
- [ ] Visual regression tested
- [ ] Integration tested
- [ ] Added to rollback mapping
```

## Tools and Resources

### Development Tools
- **Component Explorer**: Set up Storybook for both old/new
- **Style Guide**: Bootstrap class mapping reference
- **Testing Utils**: Component testing helpers
- **Migration Scripts**: Automated import updates

### Documentation Needs
- Component API changes
- Style class mappings
- Common patterns guide
- Troubleshooting guide

## Communication Plan

### Stakeholder Updates
- Weekly progress reports
- Blocker escalation process
- Demo sessions for completed phases

### Team Coordination
- Daily standup focus items
- Pair programming for complex components
- Code review requirements
- Knowledge sharing sessions

## Post-Migration Tasks

1. **Cleanup**
   - Remove legacy components
   - Clean up unused dependencies
   - Optimize bundle size

2. **Documentation**
   - Update component library docs
   - Create migration learnings doc
   - Update onboarding guide

3. **Performance**
   - Bundle analysis
   - Runtime performance profiling
   - Optimization opportunities

4. **Future Improvements**
   - Identify reusable patterns
   - Create shared component library
   - Plan for component standardization