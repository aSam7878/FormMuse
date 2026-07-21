# FormMuse V1 implementation plan

This plan turns the locked ADRs, `reference.md`, and `FormMuse Tech Stack.md` into one build sequence. It deliberately proves the complete Hanging Gifts vertical slice before FormMuse scales to the remaining 19 templates.

## Phase 0 — Repository and reproducible toolchain

1. Connect the workspace root to the public GitHub repository through the `form-prod` SSH alias.
2. Keep `website-v2/`, `.agents/`, `example tech stack.md`, and operating-system metadata local-only.
3. Pin Node.js 24.18.0, pnpm 11.15.1, exact direct dependencies, and the frozen pnpm lockfile.
4. Add the root MIT licence, README, contribution-neutral project policies, security reporting placeholder, trademark structure, and public architecture documentation.
5. Establish one Next.js App Router application with static export and no runtime server features.

Exit: a clean install, typecheck, lint, and empty static export work from the documented toolchain.

## Phase 1 — Static application, registry, and documentation foundations

1. Create the minimal root layout plus separate `(site)` and `(preview)` layouts.
2. Implement validated build-origin and deployment-environment configuration.
3. Define the strict standard registry and `FormMuseMetaSchema` contracts.
4. Create the canonical repository directories and generated-output boundaries.
5. Configure shadcn with Base UI and install only the initial controls required by Hanging Gifts.
6. Configure headless Fumadocs MDX for the eight general guides without `fumadocs-ui`.
7. Generate the static site-search index and deployment manifest from validated source.

Exit: registry validation, guide generation, search-index generation, deployment-manifest generation, and static export pass with one draft placeholder record.

## Phase 2 — Hanging Gifts distributed template

1. Audit `website-v2` contact-page source and asset provenance without importing framework or Cedar coupling.
2. Create the C01 Launch Brief and finalize the implementation-ready slug `hanging-gifts-contact`.
3. Rebuild the Complete Composition under `registry/base/hanging-gifts-contact/` using portable React, TypeScript, Tailwind 4, local shadcn Base UI controls, React Hook Form, Zod, and the resolver.
4. Preserve the premium page-scale idea: entrance choreography, hanging gifts, usable contact form, supporting sections, and an original local map-style ending.
5. Replace Next.js APIs, Cedar tokens and business data, Google Maps, remote assets, and local simulated submission with portable source and the universal typed `onSubmit` contract.
6. Implement validation, submitting, failure, explicit retry, persistent success, optional “Send another,” initial-only defaults, accessibility, responsive behavior, and reduced motion.
7. Add the registry block, metadata, changelog, examples, asset provenance, and Manual Installation parity.

Exit: the distributed template compiles independently in both Next.js and Vite and contains no preview-only or external runtime dependency.

## Phase 3 — Complete-composition Template Page and preview

1. Generate `/templates/hanging-gifts-contact` from registry metadata and source files.
2. Add Preview and Code tabs, CLI and Manual Installation, every distributed file, examples, Props, usage notes, accessibility notes, changelog, and Copy Agent Prompt.
3. Generate `/preview/hanging-gifts-contact` through the isolated preview layout with deterministic success and failure simulation and no network submission.
4. Implement desktop, tablet, and mobile controls plus Reset and Replay.
5. Prototype the smallest viable iframe sandbox, CSP, Permissions Policy, and versioned message protocol.
6. Add the lazy non-interactive Catalog Teaser from the same preview route.

Exit: full interaction, Reset, Replay, isolation, zero unexpected requests, preview parity, static export, and supported-browser behavior are proven and documented.

## Phase 4 — Quality infrastructure and compatibility evidence

1. Add Vitest, Testing Library, user-event, Playwright, axe, screenshots, Lighthouse CI, Linkinator, and accessibility linting at their locked ownership layers.
2. Create Next.js and Vite compatibility fixtures without making a monorepo.
3. Pin the Visual Baseline Environment and add responsive/state snapshots.
4. Test validation, values, retry, success, defaults, accessibility, keyboard, targets, reduced motion, preview controls, installation parity, security, and asset licensing.
5. Measure Hanging Gifts loading, transfer, JavaScript, rendering, main-thread work, memory, scrolling, and teaser behavior.
6. Establish evidence-based performance and teaser activation budgets from those measurements.

Exit: Hanging Gifts satisfies every publication gate or remains `draft` with explicit blockers.

## Phase 5 — Production and preview delivery prototype

1. Configure same-repository Cloudflare Pages branch and pull-request previews with production deployment disabled.
2. Configure protected GitHub Actions production builds and immutable artifacts.
3. Audit the real Hostinger account for the narrowest supported deployment credential.
4. Prove temporary/versioned upload, verification, promotion, serial deployment, retained previous artifact, and rollback.
5. Add `/formmuse-deployment.json`, production-only Cloudflare Web Analytics, CSP allowances, privacy disclosure, and failure isolation.

Exit: a verified `main` artifact can be deployed and rolled back without exposing production credentials or partially replacing the live site.

## Phase 6 — Website and guide completion

1. Complete the homepage, category-only catalog, command search, shared navigation, theme toggle, footer, and mission section.
2. Complete the eight long-form guides and readable privacy, licence, trademark, and security pages.
3. Add metadata, canonical URLs, sitemap behavior, Open Graph assets, structured data where justified, and the static not-found page.
4. Finalize `README.md`, `SECURITY.md`, `TRADEMARKS.md`, and `public/brand/README.md` with legal review where required.

Exit: the complete site passes the Whole-site Quality Gate and contains no empty launch navigation or placeholder legal promise.

## Phase 7 — Scale the curated launch collection

For each remaining owner-selected Planning ID:

1. Write a directional Launch Brief and originality comparison.
2. Build the portable Complete Composition under the shared template contract.
3. Add registry metadata, docs, examples, changelog, assets, tests, and preview.
4. Run the complete publication gate independently.
5. Publish only after all checks pass.

Maintain the fixed collection shape: C01–C10, N01–N05, and Q01–Q05; 16 single-step and four justified multi-step templates. Example concepts remain non-binding.

Exit: ten contact, five newsletter, and five quote-request templates are genuinely published; recolors and minor rearrangements do not count.

## Phase 8 — Public V1 release

1. Verify the permanent HTTPS domain and production build origin.
2. Reconfirm dependency versions, licences, browser matrix, analytics behavior, security headers, and registry installation through `shadcn@latest`.
3. Complete real-device, branded-browser, accessibility, performance, and deployment evidence.
4. Generate the final deployment manifest and registry output.
5. Tag and publish FormMuse `v1.0.0`, deploy the verified artifact, and confirm rollback readiness.

Exit: the public repository, permanent registry URLs, documentation, and 20-template catalog are live from one verified static artifact.

## Immediate work order

Only these steps begin before the first vertical slice:

1. Finish Phase 0.
2. Build the minimum Phase 1 infrastructure needed by Hanging Gifts.
3. Complete Phases 2–5 for Hanging Gifts.
4. Revisit shared abstractions and measured budgets once, after evidence exists.
5. Scale only then.
