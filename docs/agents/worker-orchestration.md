# Architect, worker, and reviewer workflow

FormMuse may use a worker coding agent to reduce implementation cost while preserving deliberate architecture and independent review. This workflow is agent-neutral: the current local worker may change without changing the product architecture.

## Roles

### Project owner

- Owns product intent, visual approval, credentials, legal decisions, publication, and every new material decision.
- Resolves ambiguity under the clarification rule in `AGENTS.md`.
- Approves merges and owner-only gates.

### Architect and reviewer

- Reads the authoritative documents and converts one approved work package into a bounded GitHub issue and worker brief.
- Designs and authors the exact patch, replacement content, or complete new-file content that the worker is permitted to apply.
- Defines scope, exclusions, dependencies, expected files, acceptance criteria, prescribed checks, and owner gates before delegation.
- Creates or selects an isolated branch and Git worktree.
- Independently reviews the complete diff, generated output, tests, architecture, accessibility, security, portability, and visual evidence.
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

## Execution cycle

1. The architect selects the next unblocked work package from `docs/implementation-plan.md`.
2. The architect creates or updates one GitHub issue with complete implementation-ready acceptance criteria and applies `ready-for-agent` only when no owner decision remains.
3. The architect creates an isolated worktree from the reviewed baseline.
4. The architect writes a worker brief that links the issue and relevant sources, includes the complete exact code change, and avoids copying unrelated architecture into the prompt.
5. The worker applies the supplied code exactly and runs only the prescribed verification inside the worktree.
6. The worker returns a completion report containing changed files, reasons, commands and exact results, generated diffs, unresolved questions, and remaining risks.
7. The architect inspects the actual worktree and reruns proportionate checks. The report is supporting evidence, not a substitute for inspection.
8. Corrections return to the same worktree with a precise review brief containing the exact architect-authored corrective code. The worker must not design its own correction or broaden scope.
9. The project owner performs any required visual, legal, credential, device, or publication approval.
10. Only after independent acceptance may the architect commit, push, link a pull request, and move the issue toward closure.

## Isolation and safety

- Each worker receives one branch, one worktree, one issue, and one bounded brief.
- Worker tools remain confined to the worktree. Owner-local source references, secrets, deployment credentials, unrelated repositories, and FormMuse website state are unavailable.
- Network, browser, MCP, GitHub mutation, deployment, package publication, destructive Git operations, and unapproved dependency installation are denied by default.
- The worker may not edit `AGENTS.md`, ADRs, `reference.md`, `CONTEXT.md`, `FormMuse Tech Stack.md`, or `docs/implementation-plan.md`. Changes to authority documents remain architect-and-owner work.
- A patch mismatch or failing check does not authorize the worker to devise another implementation. It reports the evidence and waits for an architect-authored correction.
- The worker never uses an option that bypasses all permissions.
- A failed, partial, timed-out, or ambiguous worker run leaves the worktree available for inspection. It does not trigger automatic commits, retries, merges, or deployment.

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

The architect may rewrite or replace worker code when correction would be less reliable than direct repair. Token reduction is valuable, but it never overrides correctness or owner intent.

## Completion report format

Every worker response ends with these headings:

1. `Outcome`
2. `Files changed`
3. `Checks run`
4. `Architecture and safety notes`
5. `Unresolved blockers`
6. `Suggested next action`

An empty blocker section must say `None`; it must never be omitted.

## V4 lean execution profile

V4 is an owner-selected, lower-overhead profile for a bounded stage or other
explicitly approved sequence of related work packages. It preserves the role,
authority, clarification, exact-authorship, isolation, review, and owner-gate
rules above. V3 remains available and unchanged as the high-assurance profile.
Selecting V4 does not convert product, architecture, security, visual, legal,
credential, publication, or scope decisions into worker decisions.

### Activation and boundaries

- The project owner must explicitly select V4 before it is used. The selection
  names the stage or bounded sequence, baseline, cumulative branch, expected
  package order, final pull-request target, and any pre-approved merge action.
- One isolated cumulative branch and worktree may serve the selected sequence.
  Each work package still has its own issue, exact brief, focused checks,
  commit, and completion entry, and packages remain linear.
- The architect resolves every material question before dispatch. A package
  with an unresolved owner decision is not dispatched.
- The worker reads `AGENTS.md`, the issue, the exact brief, and only the
  authority sections or exact excerpts named by the architect. A document path
  is a retrieval pointer, not permission to load an entire document when only a
  named section is relevant.
- V4 does not use V3 task schemas, hash manifests, supervisor passes,
  duplicated check profiles, replay benchmarks, or per-package pull requests.
  V3 files and evidence remain untouched.

### Lean package cycle

1. The architect selects the next unblocked package, reads only its directly
   relevant authority, and authors the complete exact patch.
2. The architect supplies one compact brief containing the issue, baseline,
   permitted paths, exact patch, literal focused checks, exact Git actions,
   exclusions, and stop conditions.
3. The worker applies the patch exactly, runs the listed focused checks once,
   and stops on the first patch mismatch, failed check, uncertainty, unexpected
   path, or need for unsupplied code.
4. On success, the worker may perform only the brief's literal Git actions for
   that package, normally explicit-path staging and one commit. The worker does
   not choose commit contents, messages, branches, merge methods, or targets.
5. The architect inspects the actual diff and compact evidence before accepting
   the package. Passing checks do not replace this review. The architect does
   not repeat successful checks by default; it reruns only the smallest
   proportionate check needed to investigate an anomaly or review a high-risk
   boundary.
6. Any correction is a new exact architect-authored patch and literal command
   list. The worker never invents a repair.
7. After the package is accepted, the next package may begin on the cumulative
   branch. A known failure is never carried forward.

### Verification and evidence economy

- Run the package's smallest meaningful focused checks immediately after its
  patch. Do not run the complete repository, browser, security, portability, or
  compatibility gate after every package unless that package directly changes
  the corresponding boundary or the implementation plan explicitly requires
  it.
- Run the complete stage exit gate once after the final package. Run the final
  GitHub CI and review cycle once on the consolidated stage pull request.
- Reuse still-valid visual approval when rendered composition is unchanged.
  Group new visual review into the fewest meaningful owner checkpoints that
  still expose real design decisions.
- Successful evidence is compact: package and issue, commit, changed paths,
  literal checks with pass/fail results, owner decisions, and blockers. Do not
  duplicate raw logs, source text, authority prose, or already recorded test
  output. Preserve only the relevant failure excerpt when a command fails.
- The six completion-report headings remain required, but each may be one terse
  line. `Unresolved blockers` must still say `None` when empty.

### Narrow Git and GitHub exception

The general worker prohibitions above continue to govern V3 and any task that
does not explicitly select V4. Under an active V4 brief, the worker may execute
only the literal, architect-supplied Git and GitHub commands listed in that
brief. Permitted actions may include status inspection, explicit-path staging,
committing with an exact message, pushing the selected cumulative branch,
opening or updating the selected pull request, observing its checks, posting
compact issue evidence, and closing linked issues. A merge is permitted only
when the owner has pre-approved it, the architect provides the exact target and
merge method, every required check has passed, and no owner gate remains.

This exception never permits the worker to expose credentials, alter repository
settings, change workflow permissions, bypass branch protection, force-push,
rewrite history, use destructive Git commands, merge a different target, or
perform an unlisted network or GitHub action. The architect independently
verifies the resulting branch, pull request, checks, merge commit, issue state,
and preserved local changes before declaring the sequence complete.
