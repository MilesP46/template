3️⃣ Validation & Refactor
• Run full test suite; debug until everything is green.  
• Map upstream/downstream impact via **Dependencies** in domain docs; update docs & tests accordingly.  
• Refactor for readability, performance, DRY, SRP, ≤ 150 LOC; behaviour must remain identical.  
• Pull `performance-general` or `secure-by-default` rules as needed.  
• Re-run linter + tests after each refactor; all must stay green. 
• If a refactor touches logging or error-handling files, request the “logging-standard” rule and keep interface + policy intact. 
• **No new features** in this mode.