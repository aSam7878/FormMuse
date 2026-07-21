# Issue tracker: GitHub

Specifications and implementation work for FormMuse live as GitHub Issues in `aSam7878/FormMuse`. Use the `gh` CLI for issue operations from this repository.

## Authority

ADRs, `reference.md`, `CONTEXT.md`, and `FormMuse Tech Stack.md` remain the architectural sources of truth. Issues should link to the relevant decisions instead of duplicating or replacing them. If an issue conflicts with an authoritative source, stop and surface the conflict for an explicit reviewed decision.

## Scope

Use public issues for:

- Specifications and implementation tickets.
- Bugs and compatibility problems.
- Documentation work.
- Quality, accessibility, security-remediation, and release tasks.

Keep the workflow lean with labels, milestones, sub-issues, native issue dependencies where available, and linked pull requests. Do not add a GitHub Project board in V1.

Never place credentials, deployment secrets, private vulnerability details, personal data, analytics data, private business plans, or other confidential material in public issues. Follow `SECURITY.md` for private security reporting once that file is finalized.

## Basic operations

- Create: `gh issue create --title "..." --body "..."`
- Read: `gh issue view <number> --comments`
- List: `gh issue list --state open`
- Comment: `gh issue comment <number> --body "..."`
- Label: `gh issue edit <number> --add-label "..."`
- Close: `gh issue close <number> --comment "..."`

Infer the repository from `git remote -v`; `gh` resolves it from the current checkout.

## Pull requests as a triage surface

**PRs as a request surface: no.** Pull requests implement reviewed work but do not enter the issue-triage queue as feature requests in V1.

GitHub shares one number space across issues and pull requests. When a bare reference such as `#42` is ambiguous, resolve its type before acting.

## Skill conventions

When a skill says “publish to the issue tracker,” create a GitHub issue. When it says “fetch the relevant ticket,” read the issue and its comments, labels, dependencies, and linked authoritative sources.

`wayfinder` may use one map issue with child issues. Prefer GitHub sub-issues and native dependencies when available; otherwise use an explicit task list and `Blocked by: #<number>` lines. A ticket is implementation-ready only after every blocker is closed.
