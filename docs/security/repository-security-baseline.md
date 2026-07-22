# Repository security baseline

This document separates security controls committed in source from GitHub account and repository settings that only the project owner can verify. Its presence does not claim that an account-dependent feature is enabled.

## Source-controlled controls

- `.github/workflows/ci.yml` runs pull-request checks with Node.js 24.18.0, pnpm 11.15.1 from `packageManager`, a frozen lockfile, read-only default permissions, and no repository credential persisted by checkout.
- The foundation gate checks tracked-source formatting, TypeScript, ESLint, unit tests, registry generation, guide compilation, deterministic static-data fixtures, static export, and tracked generated-output drift.
- The dependency-review job fails when a pull request introduces a dependency with a high or critical known vulnerability. It performs licence review without granting pull-request write access.
- `.github/workflows/codeql.yml` analyzes JavaScript and TypeScript on pull requests, `main`, a weekly schedule, and manual dispatch. Only its analysis job receives `security-events: write`.
- `.github/dependabot.yml` proposes weekly npm and GitHub Actions updates. No workflow or source setting auto-merges dependency changes.
- Third-party actions are pinned to complete reviewed commit SHAs. Dependabot may propose pin updates, but they require the normal review and quality gate.
- No workflow uses `pull_request_target`, production credentials, deployment commands, or secrets in untrusted pull-request execution.

## Reviewed action pins

The following official release tags and commits were verified from their upstream GitHub repositories on 2026-07-22:

| Action                             | Release   | Commit                                     |
| ---------------------------------- | --------- | ------------------------------------------ |
| `actions/checkout`                 | `v7.0.1`  | `3d3c42e5aac5ba805825da76410c181273ba90b1` |
| `actions/setup-node`               | `v7.0.0`  | `820762786026740c76f36085b0efc47a31fe5020` |
| `actions/dependency-review-action` | `v5.0.0`  | `a1d282b36b6f3519aa1f3fc636f609c47dddb294` |
| `github/codeql-action`             | `v4.37.3` | `e4fba868fa4b1b91e1fdab776edc8cfbe6e9fb81` |

## Owner-only repository settings

The owner must inspect the repository settings after these workflows merge and record evidence separately. Do not mark an item complete merely because a matching workflow file exists, and do not assume a feature is available on the current plan.

- Enable the dependency graph and verify that the committed `pnpm-lock.yaml` is recognized.
- Enable Dependabot alerts. Enable Dependabot security updates only if the generated pull requests remain subject to review and every required check; never enable auto-merge.
- Confirm Dependency Review is available and the `Dependency review` check completes on a real dependency-changing pull request.
- Select CodeQL advanced setup for the committed workflow, or disable conflicting default setup, then confirm JavaScript/TypeScript results reach code scanning.
- Enable secret scanning and push protection where GitHub makes them available. Keep any bypass restricted, reviewed, and auditable.
- Protect `main` with a ruleset or branch protection requiring a pull request, at least one approving review, dismissal of stale approvals, conversation resolution, and the passing `Foundation source gate`, `Dependency review`, and `JavaScript and TypeScript` checks. Disallow force pushes and branch deletion.
- Keep the repository Actions default token permission read-only and do not allow Actions to create or approve pull requests unless a later reviewed workflow explicitly requires it.

If a named feature is unavailable, retain the source control, document the observed plan limitation, and use the narrowest reviewed alternative rather than claiming the control exists.

## Evidence and review

Record the date, owner, observed setting, required-check names, and any plan limitation when the owner completes the account checkpoint. Repository settings are operational evidence, not architectural source, and credentials or private security details must never be copied into this public file or an issue.

### Stage 1 owner checkpoint — 2026-07-22

- The owner explicitly approved enabling Dependency Graph for `aSam7878/FormMuse`. The repository settings page then showed Dependency Graph enabled, and the `Dependency review` job passed on pull request #27.
- The committed CodeQL advanced setup completed successfully on pull request #27 as both the `JavaScript and TypeScript` analysis job and GitHub's `CodeQL` check.
- The repository settings page showed Secret Protection and push protection enabled.
- Dependabot alerts, Dependabot security updates, and grouped security updates remained disabled and were not changed. The committed `.github/dependabot.yml` supplies review-only version-update proposals without auto-merge.
- Branch protection/ruleset requirements and the repository Actions default token permission were not changed or claimed complete in Stage 1; they remain explicit owner actions before they can be treated as enforced controls.
