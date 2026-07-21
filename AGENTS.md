# FormMuse agent instructions

ADRs, `reference.md`, `CONTEXT.md`, and `FormMuse Tech Stack.md` remain the architectural sources of truth. GitHub issues describe work but must not replace or contradict those sources without an explicit reviewed decision.

## Non-negotiable clarification rule

Never guess when any requirement, intent, ownership question, design choice, implementation direction, security implication, deployment detail, or other material fact is uncertain. Stop before making the affected decision or change, explain the doubt clearly, and ask the project owner for clarification. Continue only after the owner answers. This rule applies throughout the entire FormMuse project, even when an agent believes an assumption would probably be reasonable.

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
