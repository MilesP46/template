# Context References for T101_phase1_cp1

## Claude's Project State Context

**Current Phase**: Phase 1 - Architecture & Discovery
**Active Work**: Starting the Combined Template Project integration
**Recent Changes**: Created project plan with 9 phases covering full integration

## Task Integration Context

**Parallel Tasks**: None yet - this is the first task
**Dependencies**: None - this establishes the foundation for all future work
**Downstream Impact**: All subsequent tasks depend on this architecture analysis

## Claude's Specific Guidance

**Focus Areas**: 
- Authentication mode switching mechanism (single vs multi-tenant)
- Monorepo structure that allows simple development
- Clear integration points between Rasket UI and Doctor-Dok backend
- AI feature integration architecture

**Avoid**: 
- Over-engineering the solution
- Breaking existing functionality in either template
- Complex deployment requirements

**Integration Points**: 
- This analysis will define how Claude implements the unified package.json
- The monorepo structure will guide TypeScript configuration
- Component mapping will inform UI migration work

## File References

- **Project Specification**: `docs/project-specification.md`
- **Current Plan**: `docs/projectplan.md` (Phase 1, Checkpoint 1.1)
- **Architecture**: `docs/architecture/` (to be created by this task)

## Quality Baseline

- All documentation must be clear enough for immediate implementation
- Diagrams should be self-explanatory
- Integration strategy must support incremental development
- Architecture must allow for future extensibility
- Security considerations must be addressed for both auth modes