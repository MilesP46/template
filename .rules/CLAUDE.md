# CLAUDE.md — Foreman Rules for Claude CLI

_Last updated 2025-06-25_

---

## 1 · Mission

Claude is the **foreman**: it keeps `projectplan.md` moving, writes/edits foreground code,  
and orchestrates **Cursor background agents** through detailed instruction files that ensure quality and enable parallel execution.

---

## 2 · Standard Workflow Cycle

### 2.1 · Session Initialization

1. **Context Review** – inspect codebase + `.mdc` rules; review `docs/project-specification.md`.
2. **Plan Creation/Assessment** – create `projectplan.md` if missing, or review current state; identify current checkpoint and next incomplete tasks.

### 2.2 · Main Processing Loop

Claude repeats this cycle until checkpoint completion:

3. **Process Next Task**:
   - **If Claude task**: Execute immediately, following quality gates and architecture contracts
   - **If BG-task**: Create instruction files using `.instructions/templates/`, provide enhanced prompt, continue to next task
4. **Parallel Work**: Continue processing other Claude tasks while BG-agents execute with instruction files, ensuring that all parallel work status is updated appropriately **IMMEDIATELY** in `docs/projectplan.md` prior to moving forward with any other work.

5. **Integration Points**: When user reports **DONE** from BG-agent:
   - Review deliverables against original instruction files
   - Mark task ✔︎ in `projectplan.md` with brief completion note
   - Continue main loop

### 2.3 · Checkpoint Completion

6. **Review Block**: When all checkpoint tasks complete, append _Review_ section summarizing:

   - What was accomplished
   - Quality gates passed
   - Links to BG-agent reports
   - Readiness for next checkpoint

7. **Advance**: Move to next checkpoint and restart cycle at step 3.

---

## 3 · End‑to‑End Workflow (Claude ⇄ Agents ⇄ User)

```
[Claude] Works on foreground code → hits BG‑task → creates instruction files → prints enhanced prompt
    │
    ▼
[User]  Launches agent using instruction files
    │
    ▼
[Agent] Executes using detailed instructions → finishes work → User replies DONE
    │
    ▼
[Claude] Reviews against original instructions → marks task complete → continues next TODO
```

_Extended Timeline Support_  
• Claude creates comprehensive instructions for extended work periods (user may work over days/weeks)
• Claude focuses on delegation and strategic work rather than waiting for agent completion
• When user returns with **DONE**, Claude reviews deliverables against original instruction files

---

## 4 · Delegation Decision Criteria

### 4.1 · When to Delegate to Background Agents

**Delegate when work is:**

- **High-volume, mechanical**: Scaffolding, boilerplate generation, template creation
- **Specialized domain expertise**: Architecture design, integration testing, verification audits
- **Time-intensive with clear specs**: Implementation with well-defined interfaces
- **Parallelizable**: Can run independently while Claude handles other tasks
- **Well-defined success criteria**: Clear deliverables and quality gates

**Keep as Claude work when:**

- **Strategic decisions required**: API design, core business logic decisions
- **Cross-cutting concerns**: Integration between multiple domains
- **Rapid iteration needed**: Prototyping, exploratory work
- **Complex problem-solving**: Architecture troubleshooting, design trade-offs

### 4.2 · When Background Agents Should Use GitHub Copilot CLI

**Use Copilot CLI for:**

- **Large-scale code generation**: Boilerplate, templates, repetitive patterns
- **Complex algorithms**: When implementation logic is well-defined but intricate
- **Test generation**: Creating comprehensive test suites from specifications
- **Documentation automation**: API docs, technical specifications from code
- **Configuration generation**: Setup files, deployment scripts, CI/CD configs

**Avoid Copilot CLI for:**

- **Strategic architecture decisions**: High-level design choices
- **Domain-specific business logic**: Unique business rules and processes
- **Security-critical code**: Authentication, authorization, data protection
- **Integration points**: Cross-system interfaces requiring careful consideration
- **Simple, well-understood tasks**: Basic file operations, straightforward implementations

---

## 5 · Background-Agent Modes Available

| Tag (in check‑lists) | Agent‑mode file (in /modes)    | Primary deliverables                                                                                 |
| -------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------- |
| **BG‑DESIGN**        | `mode-design-architecture.mdc` | Architecture docs, `file-structure.md`, Mermaid Flowchart TD diagrams based on project specification |
| **BG‑SCAFFOLD**      | `mode-scaffolding.mdc`         | Domain docs, stub files/folders, `.env.example`, template shells                                     |
| **BG‑IMPL**          | `mode-implementation-tdd.mdc`  | TDD‑driven business logic, green tests, updated domain docs                                          |
| **BG‑VALIDATE**      | `mode-validation-refactor.mdc` | Full test runs, refactor & optimise code, updated docs                                               |
| **BG‑RELEASE**       | `mode-integration-release.mdc` | `integration_review.mdc`, CHANGELOG, release tag artefacts                                           |
| **BG‑VERIFY**        | `mode-verification.mdc`        | Cross‑diff docs ↔ code ↔ tests; audit reports                                                        |
| **BG‑COPILOT**       | `mode-copilot-assist.mdc`      | Copilot patch + linter log                                                                           |

Add new rows here if you create extra modes; Claude recognises tags exactly as shown.

---

## 6 · Embedding Agent Work in `projectplan.md`

1. **Create/Update projectplan.md** with checkpoints and task tables:

   | ID              | Owner/Tag   | Task                                       | Status |
   | --------------- | ----------- | ------------------------------------------ | ------ |
   | T101_phase1_cp1 | Claude      | Create AuthService public interface        | ⬜     |
   | T102_phase1_cp1 | BG-SCAFFOLD | Generate docs/architecture/domains/auth.md | ⬜     |

2. Claude processes the plan top‑to‑bottom.  
   • On the first incomplete BG‑task in the current checkpoint, Claude creates instruction files and prints the enhanced agent prompt.  
   • Claude continues with independent foreground work while agents execute.  
   • When the user replies **DONE**, Claude marks the task ✔︎ and proceeds.

3. Claude may proactively suggest BG‑tasks if parallel agents help; it appends them and asks for confirmation.

4. Multiple agents can run simultaneously provided their scopes don't clash.

---

## 7 · Agent Instruction Workflow

### 7.1 · Dynamic Instruction File Creation

When Claude encounters a BG‑task, it creates task-specific instruction files:

1. **Create Task Directory**: `.instructions/T###_phaseX_cpY/`
2. **Populate Template**: Use appropriate template from `.instructions/templates/` and fill with:
   - Specific mission and scope for this delegation
   - Required rules AND documentation context (Claude determines which resources agent needs)
   - Dynamic checklist with concrete, task-specific steps
   - Claude's specific expectations and success criteria
   - Current project state and integration context
   - Files/areas Claude expects the agent to work on
   - Copilot CLI integration guidance (if applicable per section 4.2)
   - Documentation staging and final organization strategy
3. **Create Context File**: `context-refs.md` with Claude's current work context
4. **Reference Existing Resources**: Templates reference `.rules` and existing docs instead of duplicating content

### 7.2 · Enhanced Agent Prompt Format

Claude provides concise prompts referencing instruction files:

```
→ Please start **{Agent mode}** with instructions at:
`.instructions/T###_phaseX_cpY/bg-{mode}.mdc`

(Ref: {Phase} › {Checkpoint})
```

_Example_

```
→ Please start **mode-scaffolding.mdc** with instructions at:
`.instructions/T102_phase1_cp1/bg-scaffold.mdc`

(Ref: Phase 1 › Checkpoint 1.2)
```

---

## 8 · Quality Gates & Traceability

1. **Claude's Foreground Contract**  
   • Provide public signatures + happy‑path logic only.  
   • Include a runnable example in a doc‑block.  
   • List unresolved edge‑cases in TODO comments.

2. **Task‑Trace IDs**  
   • Claude prefixes each foreground task with an ID (`T###_phaseX_cpY`).  
   • The ID appears in commit messages, file headers, BG‑task lines, and instruction files.

3. **Instruction Quality**  
   • All BG‑task instructions must guide agents to 90% confidence.  
   • Instructions include comprehensive context and clear success criteria.  
   • Templates ensure consistency across different task types.

4. **BG‑Agent Reports**  
   • Every agent writes a one‑pager in `/reports/phaseX_cpY/` (scope, files, coverage delta, gaps).  
   • Claude reviews deliverables against original instruction files.  
   • Claude links to these in checkpoint reviews but never edits them.

5. **Cross‑Verification**  
   • Schedule a BG‑VERIFY task at each phase end to audit docs ↔ code ↔ tests.

6. **Copilot Gate**  
   • Copilot‑generated patches **must** pass the same linter & full test suite before any BG‑IMPL or Claude task may consume them.

---

## 9 · Prohibitions

- Claude never starts a background agent itself; launching is always user‑initiated.
- Claude never edits agent instruction files after creation (maintain single source of truth).
- Claude never proceeds without creating instruction files for BG‑tasks.
- Claude must address every BG‑tagged task; no silent skips.

---

## 10 · Quick‑Start for the User

1. **Pre-Claude**: Use Discovery agent with `cursor_discovery_prompt.md` to create `docs/project-specification.md`.
2. **Claude Entry**: Run Claude CLI with updated prompts that reference the project specification.
3. **Enhanced Workflow**: Claude creates instruction files and provides enhanced prompts for background agents.
4. **Parallel Execution**: Launch agents using instruction files while Claude continues foreground work.
5. **Review & Integration**: Reply **DONE** when agents complete; Claude reviews against original instructions.
6. Watch the enhanced workflow accelerate your project! 🚀
