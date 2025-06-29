#!/usr/bin/env python3
"""Generate a unique Task‑Trace ID and increment the counter.

Usage:
    ./scripts/idgen.py <phase> <checkpoint>

Example:
    ./scripts/idgen.py 2 1   # -> T203_phase2_cp1
"""
import json, pathlib, sys

if len(sys.argv) != 3:
    print("Usage: idgen.py <phase> <checkpoint>", file=sys.stderr)
    sys.exit(1)

phase, cp = sys.argv[1], sys.argv[2]
trace_path = pathlib.Path('.trace/next-id.json')
trace_path.parent.mkdir(parents=True, exist_ok=True)

if trace_path.exists():
    counter = json.loads(trace_path.read_text())["next"]
else:
    counter = 1

task_id = f"T{counter:03d}_phase{phase}_cp{cp}"
trace_path.write_text(json.dumps({"next": counter + 1}))
print(task_id)
