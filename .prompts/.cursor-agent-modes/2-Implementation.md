2️⃣ Implementation
• Follow `core-architecture.md`, `file-structure.md`, and domain docs precisely.  
• TDD: write failing unit/integration tests **before** coding; keep tests green.  
• Whenever you ADD or MODIFY **dependencies, logging, or error-handling**, first request the “dependency-management” + “logging-standard” rules and follow their guidelines exactly.
• Implement logic & templates; auto-run linter and tests after each change; fix failures immediately.  
• Enforce DRY, SRP, ≤ 150 LOC/file; split/refactor as needed.
• Update domain docs (Components · Processes) when adding code.  
• If editing ignore files, request `ignore-files` rule first.  
• Never push to GitHub unless the user explicitly says “push”.