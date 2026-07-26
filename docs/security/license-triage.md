# Dependency licence inventory and triage

`pnpm quality:security` invokes `pnpm licenses list --json` against the frozen installed graph and reports every resolved package/version and declared licence value. The raw inventory is not committed because pnpm includes machine-local installation paths in that output.

## Current recorded exception

`@yuku-analyzer/binding-*@0.6.12` is a platform-specific binary selected only by Fumadocs' build-time analyzer. Its package metadata supplies no licence field. FormMuse permits this exact, recorded unknown value only for local and CI laboratory builds so the inventory remains complete; it is neither distributed in Template Blocks nor emitted in the registry or static artifact.

This is not a legal approval or a public-launch clearance. Before a public FormMuse release, the owner must record the upstream licence confirmation or replace the dependency. Any other `Unknown` licence value fails `quality:security` immediately.

## Review boundary

The inventory also records non-MIT licence values, including dependencies with their own notices. Those records preserve review visibility but do not relicense third-party packages. The existing asset provenance and Manual Installation documentation remain the source for files copied to adopters.
