# FormMuse agent instructions

ADRs, `reference.md`, `CONTEXT.md`, and `FormMuse Tech Stack.md` remain the architectural sources of truth. GitHub issues describe work but must not replace or contradict those sources without an explicit reviewed decision.

## Non-negotiable clarification rule

Never guess when any requirement, intent, ownership question, design choice, implementation direction, security implication, deployment detail, or other material fact is uncertain. Stop before making the affected decision or change, explain the doubt clearly, and ask the project owner for clarification. Continue only after the owner answers. This rule applies throughout the entire FormMuse project, even when an agent believes an assumption would probably be reasonable.

## Architect-authored delegated implementation

Delegating implementation does not delegate code authorship. The architect must design and provide the exact patch, replacement content, or complete new-file content for every delegated change. The implementation worker is an execution-only agent: it may apply the supplied code, inspect only what the brief authorizes, run the exact prescribed checks, and report the results, but it must not invent, generate, refactor, broaden, or independently repair implementation code.

Every worker brief and correction brief must reference the separate exact architect-authored patch. If that code cannot be applied exactly, conflicts with the current worktree, fails a check in a way that requires a code change not already supplied, or exposes another material uncertainty, the worker must stop and report the mismatch. It must never improvise a solution. The architect reviews the exact diff before dispatch, authors any correction, and accepts the final tree only after deterministic patch-identity, scope, and verification evidence passes. Successful raw logs and already-reviewed code are reopened only when the evidence reports an anomaly.

## GitHub operating model

Use a hybrid approach, in this priority order:

1. **Local files, diffs, branches, commits, fetch, pull, and push:** Use local `git` over HTTPS, authenticated through GitHub CLI.
2. **Issues and normal pull request operations:** Use `gh` with tightly selected JSON fields, as prescribed by the FormMuse issue-tracker instructions.
3. **Structured pull request review threads, connector-friendly summaries, and operations not cleanly covered by `gh`:** Use the native GitHub plugin.
4. **GitHub Actions failed logs:** Use `gh`, returning only failed-job logs where possible.
5. **Browser:** Use only as a fallback for operations that require the GitHub UI.

## Agent skills

### Issue tracker

Implementation work is tracked in GitHub Issues. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the standard FormMuse triage states. See `docs/agents/triage-labels.md`.

### Domain docs

FormMuse uses one root domain context. See `docs/agents/domain.md`.

### Architect and worker workflow

Implementation may be delegated to an isolated worker agent, but delegation never transfers architectural authority or approval. See `docs/agents/worker-orchestration.md`.
