# Background Agent Instructions Directory

This directory contains detailed instruction files for background agents, organized by Task-ID and mode type.

## Enhanced Dynamic Workflow

Claude creates **task-specific** instruction files using **dynamic templates**. These templates are frameworks that Claude populates with:

- **Task-Specific Context**: What only Claude knows about the current project state
- **Dynamic Resource Selection**: Which specific rules AND documentation each agent needs
- **Dynamic Checklists**: Concrete, task-specific steps for maximum clarity
- **Copilot CLI Integration**: Specific guidance for leveraging AI assistance when appropriate
- **Documentation Workflow**: Staging and nesting strategy for generated documentation

## Core Principles

- **DRY**: Templates reference existing `.rules` and documentation instead of duplicating content
- **Dynamic**: Claude fills in placeholders with task-specific information and checklists
- **Focused**: Each instruction file contains only what's needed for that specific task
- **Strategic**: Claude continues independent work while agents execute with clear guidance
- **Documentation-Aware**: Proper workflow for generating, staging, and nesting documentation

## Structure

```
.instructions/
├── README.md                    # This file
├── templates/                   # Dynamic frameworks for Claude to populate
│   ├── bg-design-template.mdc   # Framework for design tasks
│   ├── bg-scaffold-template.mdc # Framework for scaffolding tasks
│   ├── bg-impl-template.mdc     # Framework for implementation tasks
│   ├── bg-validate-template.mdc # Framework for validation tasks
│   ├── bg-release-template.mdc  # Framework for release tasks
│   ├── bg-verify-template.mdc   # Framework for verification tasks
│   ├── bg-docs-template.mdc     # Framework for documentation organization
│   └── context-template.md      # Framework for task context
└── T###_phaseX_cpY/            # Task-specific instructions (created per task)
    ├── bg-{mode}.mdc           # Claude's populated instruction file
    └── context-refs.md         # Claude's task-specific context
```

## Template Framework Design

Each template provides a structure for Claude to populate with:

1. **Required Resources**:
   - **Rules**: Claude determines which `.rules` files the agent needs
   - **Documentation Context**: Existing docs relevant to the task
2. **Dynamic Checklists**: Claude creates task-specific, concrete steps
3. **Mission & Expectations**: Claude defines the specific work and success criteria
4. **Copilot CLI Integration**: Specific guidance for AI-assisted development when appropriate
5. **Documentation Workflow**: Staging strategy and final organization plan
6. **Review Criteria**: How Claude will evaluate the deliverables

## Documentation Workflow Strategy

### Three-Stage Documentation Process

1. **Generation**: Agents create documentation in staging areas during work
2. **Review**: Claude reviews all deliverables (code + documentation) together
3. **Organization**: BG-DOCS agent moves approved documentation to proper project structure

### Staging Locations

- `reports/phase{X}_cp{Y}/{TASK_ID}_{MODE}_staging/`
- Allows Claude to review all outputs before final organization
- Maintains traceability throughout the workflow

### Final Organization

- BG-DOCS agent handles post-approval documentation nesting
- Ensures proper project structure and cross-referencing
- Updates documentation indexes and navigation

## GitHub Copilot CLI Integration

Claude can instruct background agents to leverage Copilot CLI for:

### Design Phase

- Architecture Mermaid Flowchart TD diagram generation
- System design documentation
- Technical specification creation

### Scaffolding Phase

- Boilerplate code generation
- Template creation
- Configuration file setup

### Implementation Phase

- Complex algorithm implementation
- Test generation assistance
- API documentation creation

### Validation Phase

- Code refactoring assistance
- Performance optimization
- Quality improvement suggestions

### Verification Phase

- Automated verification scripts
- Compliance checking tools
- Report generation automation

## Workflow Integration

1. **Claude Planning**: Identifies work that can be delegated to background agents
2. **Dynamic Instruction Creation**: Claude populates templates with:
   - Task-specific mission and checklist
   - Required rules and documentation context
   - Copilot CLI guidance (if applicable)
   - Documentation staging strategy
3. **Resource Specification**: Claude tells agents exactly which rules and docs to reference
4. **Parallel Execution**: Claude continues foreground work while agents execute with clear guidance
5. **Review & Integration**: Claude evaluates all deliverables against original instructions
6. **Documentation Organization**: BG-DOCS agent handles final documentation nesting

## Benefits

- **90% Confidence**: Detailed, task-specific instructions with concrete checklists
- **Single Source of Truth**: Persistent instructions prevent miscommunication
- **No Duplication**: Templates reference existing resources rather than repeating them
- **Strategic Delegation**: Claude focuses on what only it can do while agents handle detailed work
- **AI-Enhanced Productivity**: Strategic use of Copilot CLI for appropriate tasks
- **Proper Documentation Flow**: Clear workflow for generating, reviewing, and organizing documentation
- **Extended Timeline Support**: Works even when Claude isn't running continuously
