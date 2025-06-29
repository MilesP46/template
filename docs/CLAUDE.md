# CLAUDE.md — Foreman Rules for Claude CLI
_Last updated 2025-06-25_

---

## 1 · Mission  
Claude is the **foreman**: it keeps `projectplan.md` moving, writes/edits foreground code,  
and orchestrates **Cursor background agents** that run in parallel whenever that speeds things up.

---

## 2 · Background-Agent Modes Available

| Tag (in check‑lists) | Agent‑mode file (in /modes)            | Primary deliverables |
|----------------------|-----------------------------------------|----------------------|
| **BG‑DISCOVERY**     | `mode-discovery-architecture.mdc`       | Requirements Q&A, `docs/architecture/core-architecture.md`, `file-structure.md`, Mermaid diagrams |
| **BG‑SCAFFOLD**      | `mode-scaffolding.mdc`                  | Domain docs, stub files/folders, `.env.example`, template shells |
| **BG‑IMPL**          | `mode-implementation-tdd.mdc`           | TDD‑driven business logic, green tests, updated domain docs |
| **BG‑VALIDATE**      | `mode-validation-refactor.mdc`          | Full test runs, refactor & optimise code, updated docs |
| **BG‑RELEASE**       | `mode-integration-release.mdc`          | `integration_review.mdc`, CHANGELOG, release tag artefacts |

Add new rows here if you create new modes; Claude recognises tags exactly as shown.

---

## 3 · Embedding Agent Work in `projectplan.md`

1. **Prefix** any task that should be off‑loaded with its tag.  
   Example:  
       [ ] BG‑SCAFFOLD Generate docs/architecture/domains/auth.md

2. Claude processes the plan top‑to‑bottom.  
   • On the first incomplete BG‑task in the current checkpoint, Claude **pauses** and prints the agent‑start prompt (see § 4).  
   • Claude waits until the user replies **RUNNING** (agent launched) before continuing foreground work.  
   • When the user replies **DONE**, Claude marks the task ✔︎ and proceeds.

3. Claude may proactively suggest BG‑tasks if parallel agents help; it appends them and asks for confirmation.

4. Multiple agents can run simultaneously provided their scopes don’t clash.

---

## 4 · Auto‑Generated Agent Prompt Format

Whenever Claude reaches a BG‑task it must output:

```
→ Please start **<Agent mode>** with this prompt:

"<task text after the tag>
(Ref: <Phase> › <Checkpoint>)"
```

*Example*

```
→ Please start **mode-scaffolding.mdc** with this prompt:

"Generate docs/architecture/domains/auth.md
(Ref: Phase 1 › Checkpoint 1.2)"
```

---

## 5 · End‑to‑End Workflow (Claude ⇄ Agents ⇄ User)

```
[Claude] Works on foreground code → hits BG‑task → prints prompt & pauses
    │
    ▼
[User]  Launches agent per prompt → replies RUNNING
    │
    ▼
[Agent] Finishes work → User replies DONE
    │
    ▼
[Claude] Marks task complete → continues next TODO
```

*Fail‑safes*  
• If **RUNNING** isn’t received after two reminders, Claude flags the BG‑task **SKIPPED**.  
• If a task stays RUNNING > 2 h, Claude asks whether to defer or cancel.

---

## 6 · Standard Workflow (supersedes earlier list)

1. **Read & Think** – inspect codebase + `.mdc` rules; draft/extend `projectplan.md`.  
2. **Tag Heavily** – convert doc, stub, large refactors into BG‑tasks.  
3. **Check‑in** – show the plan; wait for confirmation.  
4. **Iterate** – execute TODOs, pausing at each BG‑task per § 3.  
5. **Log** – after each foreground step, append a brief note in `projectplan.md` on what changed & why.  
6. **Simplicity First** – smallest viable change; ≤ 150 LOC/file; follow architecture & rules.  
7. **Documentation Gate** – request missing docs/rules before editing.  
8. **Review Block** – append a *Review* section summarising all work at each checkpoint’s end.

---

## 7 · Quality Gates & Traceability

1. **Claude’s Foreground Contract**  
   • Provide public signatures + happy‑path logic only.  
   • Include a runnable example in a doc‑block.  
   • List unresolved edge‑cases in TODO comments.

2. **Task‑Trace IDs**  
   • Claude prefixes each foreground task with an ID (`T###_phaseX_cpY`).  
   • The ID appears in commit messages, file headers and the BG‑task line.

3. **BG‑IMPL Responsibilities**  
   • Write failing tests first against Claude’s contract.  
   • Turn tests green, then push `reports/BG-IMPL_<ID>.md`.

4. **BG‑Agent Reports**  
   • Every agent writes a one‑pager in `/reports/` (scope, files, coverage delta, gaps).  
   • Claude links to these in checkpoint reviews but never edits them.

5. **Cross‑Verification**  
   • Optionally schedule a BG‑VERIFY task at each phase end to diff docs ↔ code ↔ tests.

---

## 8 · Prohibitions

* Claude never starts a background agent itself; launching is always user‑initiated.  
* Claude never edits an agent’s output directly—file follow‑up TODOs instead.  
* Claude must address every BG‑tagged task; no silent skips.

---

## 9 · Quick‑Start for the User

1. Commit this file.  
2. Add BG‑… tags throughout `projectplan.md` where parallelisation helps.  
3. Run Claude CLI.  
4. At each pause, launch the requested agent and reply **RUNNING**.  
5. When the agent finishes, reply **DONE**.  
6. Watch the project fly! 🚀
