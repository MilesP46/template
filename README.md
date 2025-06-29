# Project Template

**A complete development workflow template using Claude as foreman with background agents.**

## 🚀 Quick Start

### Option 1: Use GitHub Template (Recommended)

1. Click "Use this template" button above
2. Create your new repository
3. Clone your new repository locally
4. Run initialization script:
   - **Windows**: `.\.template\scripts\init-project.ps1`
   - **Unix/Mac**: `./.template/scripts/init-project.sh`

### Option 2: Manual Clone

```bash
# Replace with actual repository URL when published
git clone <this-template-repository-url> my-new-project
cd my-new-project
# Windows (PowerShell):
.\.template\scripts\init-project.ps1
# Unix/Mac:
./.template/scripts/init-project.sh
```

## 🔧 What This Template Provides

### **Claude Foreman System**

- Complete rules and workflow for Claude CLI as project foreman
- Strategic delegation and parallel execution capabilities
- Quality gates and traceability throughout development

### **Background Agent System**

- Dynamic instruction templates for background agents
- Specialized modes: Design, Scaffold, Implementation, Validation, Release, Verification
- GitHub Copilot CLI integration guidance

### **Discovery-to-Design Workflow**

- Pre-Claude discovery process for 90% confidence requirements
- Separation of WHAT (requirements) from HOW (implementation)
- Comprehensive project specification workflow

### **Quality & Documentation System**

- Task-ID based traceability
- Documentation staging and organization workflow
- Architecture contracts and engineering standards

## 📋 Post-Initialization Workflow

After running the initialization script:

### 1. **Discovery Phase**

Use cursor discovery agent with the provided template to create comprehensive project specification:

- Reference: `.prompts/cursor_discovery_prompt.md` (template for discovery agent)
- Output: `docs/project-specification.md` (comprehensive requirements)

### 2. **Claude Development Phase**

Start Claude CLI with the enhanced prompts:

- Claude reads project specification and creates `projectplan.md`
- Claude delegates appropriate work to background agents with detailed instructions
- Claude continues strategic foreground work

### 3. **Parallel Execution**

- Claude handles strategic work and integration
- Background agents handle detailed implementation using instruction files
- Documentation is staged and organized automatically

## 🏗️ Project Structure (After Initialization)

```
your-project/
├── README.md                 # Your project README (updated by init script)
├── .rules/                   # Claude and agent rules
│   ├── CLAUDE.md            # Foreman rules for Claude
│   ├── cursorrules.mdc      # Global project rules (updated with your info)
│   ├── always/              # Always-applied rules
│   └── requested/           # On-demand rules
├── .instructions/            # Background agent instruction templates
│   ├── templates/           # Dynamic instruction frameworks
│   └── README.md           # Instruction workflow guide
├── .prompts/                # Discovery and Claude prompts
│   ├── cursor_discovery_prompt.md
│   ├── claude_cli_prompts.md
│   └── .cursor-agent-modes/
├── docs/                    # Project documentation
│   └── architecture/        # Architecture docs (created as needed)
├── scripts/                 # Development utilities
│   ├── idgen.py            # Task-ID generator
│   ├── install-hooks.sh    # Git hooks installer
│   ├── copilot.sh          # Copilot utilities
│   └── hooks/              # Git hooks
├── src/                     # Your source code (created as needed)
├── tests/                   # Your tests (created as needed)
└── reports/                 # Agent reports (created as needed)
```

## ✨ Key Features

- **Language Agnostic**: Works with any technology stack
- **90% Confidence Principle**: Systematic requirement gathering before implementation
- **Parallel Efficiency**: Background agents handle detailed work while Claude focuses on strategy
- **Extended Timeline Support**: Designed for projects spanning days, weeks, or months
- **Quality Assurance**: Built-in verification and documentation workflows

## 🎯 Benefits

- **Faster Development**: Parallel execution reduces overall timeline
- **Higher Quality**: Systematic quality gates and verification
- **Better Documentation**: Automated documentation generation and organization
- **Strategic Focus**: Claude handles high-level decisions while agents handle detailed work
- **Consistent Process**: Template ensures repeatable, high-quality development workflow

## 📚 Learn More

**Before initialization** (while .template/ exists):

- `.template/docs/template-usage.md` - Detailed usage guide
- `.template/README.md` - Template overview

**After initialization** (in your project):

- `.rules/CLAUDE.md` - Complete Claude foreman rules
- `.instructions/README.md` - Background agent workflow guide

## 🤝 Contributing

This template is designed to be customized for your organization's needs. Fork and modify as needed!

## 📄 License

MIT License - see LICENSE file for details
