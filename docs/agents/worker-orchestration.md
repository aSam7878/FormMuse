# Architect, worker, and reviewer workflow

FormMuse may use a worker coding agent to reduce implementation cost while preserving deliberate architecture and independent review. This workflow is agent-neutral: the current local worker may change without changing the product architecture. The V3 protocol is architect once, execute externally, and return bounded evidence.

## Roles

### Project owner

- Owns product intent, visual approval, credentials, legal decisions, publication, and every new material decision.
- Resolves ambiguity under the clarification rule in `AGENTS.md`.
- Approves merges and owner-only gates.

### Architect and reviewer

- Reads the authoritative documents and converts one approved work package into a bounded GitHub issue and worker brief.
- Designs and authors the exact patch, replacement content, or complete new-file content that the worker is permitted to apply.
- Reviews the complete exact diff semantically before dispatch; delegation never moves code authorship or architectural judgment to the worker.
- Defines scope, exclusions, dependencies, expected files, acceptance criteria, prescribed checks, and owner gates before delegation.
- Creates or selects an isolated branch and Git worktree.
- Accepts the final tree only after deterministic evidence proves it is byte-identical to the reviewed patch, stays inside scope, and passes the prescribed worker and independent supervisor checks.
- Requests corrections until the result reaches the same standard as architect-authored work.
- Never treats a worker completion report or passing test suite as approval by itself.

### Implementation worker

- Applies only the exact architect-authored code supplied for the assigned issue in the isolated worktree.
- Reads `AGENTS.md`, the issue, and every linked authoritative source before editing.
- Stops and reports a blocker instead of guessing or making a new product or architecture decision.
- Does not invent, generate, refactor, broaden, or independently repair code, including when the supplied change does not apply or a check fails.
- Runs only the checks prescribed by the brief or already authorized by the repository.
- Does not commit, push, open or merge pull requests, deploy, publish, use credentials, change GitHub state, or declare its own work approved.

## Authority

The existing order remains unchanged:

1. Accepted ADRs.
2. `reference.md`.
3. `CONTEXT.md`.
4. `FormMuse Tech Stack.md` and executable dependency pins.
5. The applicable launch and collection documents.
6. `docs/implementation-plan.md`.
7. GitHub issues and the worker brief.

If a lower source conflicts with a higher source, the worker stops. Issues and prompts may narrow an approved decision but cannot replace one.

## V3 execution cycle

1. The architect selects the next unblocked work package from `docs/implementation-plan.md`.
2. The architect creates or updates one GitHub issue with complete implementation-ready acceptance criteria and applies `ready-for-agent` only when no owner decision remains.
3. The architect creates an isolated worktree from the reviewed baseline.
4. The architect reviews the complete exact diff, then writes a compact schema-validated task containing decisions, boundaries, allowed paths, risk, and one named check profile. Exact code stays in a separate patch and is never repeated in task JSON or the worker prompt.
5. The worker applies the supplied patch through the restricted hash-verifying helper and runs only the commands resolved by the named profile. Successful command output remains in owner-local logs.
6. A deterministic supervisor verifies model identity, patch and final-tree identity, changed-path scope, protected paths, report semantics, untracked files, and control-file integrity, then independently reruns the resolved check profile.
7. The supervisor emits one bounded evidence packet. A successful packet is capped at 2 KiB and contains identities, changed paths, check statuses and log references, risk, correction count, and anomaly routing—not successful logs, the patch, or conversational explanation.
8. On a clean result, the architect reviews only the evidence packet. Because it proves the final tree is the exact diff already reviewed before dispatch, the architect does not reread successful logs or repeat the same source review. Any mismatch, failed check, unexpected path, or ambiguous evidence reopens the relevant artifact.
9. Corrections return to the same worker conversation with a new exact architect-authored patch. There are no automatic implementation retries or worker-authored repairs.
10. A fresh read-only exception reviewer may be used only when a deterministic anomaly or difficult high-risk finding is likely to avoid more architect diagnosis than its bounded report costs. It sees no worker transcript, returns `PASS` or at most three evidence-backed findings, and never authors code. It is absent from the normal successful path.
11. The project owner performs any required visual, legal, credential, device, or publication approval.
12. Only after independent acceptance may the architect commit, push, link a pull request, and move the issue toward closure.

## Measurement and learning

- Workflow promotion is judged by Codex usage for comparable accepted tasks, not by Garry or exception-reviewer usage.
- Capture exact Codex input, cached-input, output, reasoning, and total token telemetry when available, plus the displayed account-limit change. Displayed limit percentages may be rounded and must not be presented as a precise token conversion.
- Keep immutable raw runs and logs owner-local. Store only compact metrics and evidence summaries in the normal architect path.
- A minimal owner-local Markdown playbook may index repeated lessons. Open only the lesson matching the current task class, review candidates in batches, and never let the playbook override the authority order above.
- Do not require Obsidian, embeddings, a vector database, an orchestration framework, or native Codex subagents for this workflow.

## Isolation and safety

- Each worker receives one branch, one worktree, one issue, and one bounded brief.
- Worker tools remain confined to the worktree. Owner-local source references, secrets, deployment credentials, unrelated repositories, and FormMuse website state are unavailable.
- Network, browser, MCP, GitHub mutation, deployment, package publication, destructive Git operations, and unapproved dependency installation are denied by default.
- The worker may not edit `AGENTS.md`, ADRs, `reference.md`, `CONTEXT.md`, `FormMuse Tech Stack.md`, or `docs/implementation-plan.md`. Changes to authority documents remain architect-and-owner work.
- A patch mismatch or failing check does not authorize the worker to devise another implementation. It reports the evidence and waits for an architect-authored correction.
- The worker never uses an option that bypasses all permissions.
- A failed, partial, timed-out, or ambiguous worker run leaves the worktree available for inspection. It does not trigger automatic commits, retries, merges, deployment, or an automatic exception-reviewer launch.

## Review standard

Delegation changes who types the first implementation, not the quality bar. Architect review must consider at least:

- Compliance with every linked decision and explicit exclusion.
- Simplicity, maintainability, naming, typing, and error handling.
- React, Next.js, Vite, Tailwind, shadcn Base UI, and registry compatibility where applicable.
- Accessibility, keyboard and focus behavior, reduced motion, responsive behavior, and visual fidelity.
- Security boundaries, privacy, network behavior, assets, licensing, and dependency effects.
- Test quality and missing cases, not merely whether existing tests pass.
- Generated files and static-export behavior.
- Whether the change remains inside the assigned issue.

The architect may replace an unexecuted patch or author an exact correction when the evidence fails. Token reduction is valuable, but it never overrides correctness or owner intent.

## Completion report format

The worker's owner-local response ends with these headings:

1. `Outcome`
2. `Files changed`
3. `Checks run`
4. `Architecture and safety notes`
5. `Unresolved blockers`
6. `Suggested next action`

An empty blocker section must say `None`; it must never be omitted.

Codex receives the bounded supervisor evidence packet on the successful path, not this full response. The response and raw logs remain available locally when an anomaly requires inspection.
