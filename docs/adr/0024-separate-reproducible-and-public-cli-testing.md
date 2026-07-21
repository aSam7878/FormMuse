# Separate reproducible and public CLI testing

FormMuse will pin `shadcn` exactly at 4.13.1 in `package.json` and `pnpm-lock.yaml` for reproducible local development, pull-request checks, registry validation, and registry generation. Public pnpm, npm, Yarn, and Bun installation commands will use `shadcn@latest`, matching the shadcn CLI's public usage convention and giving adopters the currently supported CLI.

Every normal pull request will test with the pinned version. A scheduled compatibility workflow will smoke-test FormMuse registry installation with `shadcn@latest` so upstream incompatibilities are discovered without allowing an unexpected release to block unrelated development. Publishing a Form Template or FormMuse release requires a fresh passing latest-version smoke test. FormMuse will update its internal pin only through a deliberate reviewed change after checking generated output and compatibility.

Public command smoke tests will cover pnpm, npm, Yarn, and Bun using their documented invocation forms without overwrite or automatic-confirmation flags. Conflict handling remains visible and interactive rather than being bypassed for convenience.
