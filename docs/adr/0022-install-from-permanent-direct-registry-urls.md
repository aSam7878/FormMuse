# Install from permanent direct registry URLs

FormMuse V1 will use direct HTTPS registry-item URLs as its primary CLI Installation method. Every Template Page will generate pnpm, npm, Yarn, and Bun commands that invoke the shadcn CLI with `https://<canonical-domain>/r/<canonical-slug>.json`. The Canonical Slug is immutable, and the original direct item URL is part of FormMuse's public compatibility contract.

The generated commands will use exactly these launch forms: `pnpm dlx shadcn@latest add <url>`, `npx shadcn@latest add <url>`, `yarn dlx shadcn@latest add <url>`, and `bunx --bun shadcn@latest add <url>`. FormMuse will not append `--overwrite`, `--yes`, or another automatic-confirmation flag. Developers and coding agents must see file conflicts and choose explicitly how to handle adopter-owned code.

V1 will not require a namespace registration step or inclusion in shadcn's registry directory. FormMuse may add `@formmuse/<slug>` later as an optional shorter address, but it will not remove or change the original direct URL. The production hostname will be recorded only after FormMuse controls its permanent canonical domain; planning examples must not claim an unverified domain.

CLI commands will derive their absolute registry item URLs from the current Build Origin. This lets local and preview builds test their own generated registry files, while public production documentation resolves to the permanent canonical domain. Temporary preview URLs are never treated as permanent installation or SEO identities.
