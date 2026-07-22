# FormMuse V1 detailed execution plan

This document converts the nine-stage FormMuse launch sequence into an issue-ready implementation plan. It is intentionally more detailed than a roadmap: it defines ordering, dependencies, expected outputs, verification, owner checkpoints, and completion gates.

The plan stops at execution design. It does not assign work to a particular coding agent, create GitHub issues, change product architecture, or authorize implementation beyond an approved work package.

## Authority and change control

The following remain authoritative, in this order:

1. Accepted decisions in `docs/adr/`.
2. `reference.md`.
3. `CONTEXT.md`.
4. `FormMuse Tech Stack.md` and the executable pins in `package.json` and `pnpm-lock.yaml`.
5. `docs/launch-collection.md` for V1 collection slots and Interaction Depth.
6. This execution plan.
7. GitHub milestones, issues, pull requests, and agent completion reports.

An issue may narrow one work package, but it must not replace or contradict the sources above. When implementation reveals a genuinely new shared product or architecture decision, stop, explain the decision to the project owner, record the approved outcome in an ADR or the applicable authoritative document, and only then update this plan.

The project-wide clarification rule in `AGENTS.md` applies throughout this plan: never guess about a material requirement, design choice, owner preference, security consequence, deployment capability, legal statement, or scope boundary.

## Status vocabulary

- **Complete**: implemented, verified at the required layer, and present in the public checkpoint.
- **Partial**: useful implementation exists, but one or more required deliverables or gates remain.
- **Not started**: no implementation that satisfies the work package exists.
- **Evidence-blocked**: implementation depends on measurements or an external environment that has not yet been tested.
- **Owner-blocked**: the next safe action requires an explicit owner decision, access grant, visual approval, legal review, or physical-device action.
- **Publication-ready**: every applicable automated and manual template gate passes, but the project may still intentionally retain `draft` status until coordinated publication.
- **Published**: registry metadata is `published`, public discovery and installation are enabled, and all publication evidence is recorded.

## Current verified baseline — 2026-07-21

The current public checkpoint is merge commit `7f03970` on `main`, represented by pull request #27 and the completed Stage 1 exit gate.

| Area                            | Status      | Verified reality                                                                                                                  | Important remaining work                                                                                                                                                                     |
| ------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Architecture and vocabulary     | Complete    | 73 ADRs, `CONTEXT.md`, `reference.md`, the tech stack, launch rules, and agent instructions exist                                 | Maintain consistency as implementation reveals evidence                                                                                                                                      |
| Public repository checkpoint    | Complete    | Stage 1 is merged on `main`; private source references remain excluded                                                            | Continue with the Stage 2 Hanging Gifts distributed vertical slice                                                                                                                           |
| Local Build Toolchain           | Complete    | Local and GitHub CI resolve Node.js 24.18.0 and pnpm 11.15.1 with frozen installation                                             | Preserve the exact pins in preview hosting and reviewed dependency updates                                                                                                                   |
| Static Next.js shell            | Partial     | One App Router application, validated Build Origin, static export, separate site/preview layouts, and deterministic static data exist | Build the real site shell, routes, metadata, headers, and search interface                                                                                                                   |
| shadcn Base UI controls         | Partial     | Initial local Input, Textarea, Select, Field/Label, Button, and Separator exist                                                   | Registry installation validation, dependency ownership, accessibility and compatibility coverage                                                                                             |
| Registry system                 | Partial     | Strict schemas, one draft Hanging Gifts record, deterministic generation, lifecycle filtering, and generated-file checks exist    | Complete installation fixtures, Template Pages, compatibility evidence, and publication gates                                                                                               |
| Headless guide pipeline         | Complete    | Eight canonical MDX guides compile through headless Fumadocs data with preview isolation and deterministic search data             | Build the FormMuse-owned visual documentation experience in Stage 7                                                                                                                          |
| Hanging Gifts composition       | Partial     | Approved page-scale visuals, local hero asset, navbar behavior, gifts, form states, reduced motion, and responsive behavior exist | Formal C01 brief, exact distributed boundary, registry block, examples, changelog, dependency/font justification, compatibility fixtures, and complete publication evidence                  |
| Hanging Gifts automated checks  | Partial     | TypeScript and ESLint pass; 5 Vitest assertions pass; 39 Playwright project cases pass across Chromium, Firefox, and WebKit       | Testing Library, compatibility fixtures, visual baselines, storage/navigation/security checks, Lighthouse, Linkinator, branded-browser/manual-device evidence, and complete gate aggregation |
| Template Page                   | Not started | No `/templates/[slug]` route exists                                                                                               | Shared generated page, Preview/Code, CLI/Manual, Props, examples, changelog, Agent Prompt                                                                                                    |
| Full preview system             | Partial     | A direct static preview route and deterministic submission adapter exist                                                          | Parent iframe chrome, viewport controls, Reset/Replay protocol, sandbox, CSP, Permissions Policy, security evidence, and Catalog Teaser                                                      |
| Website and public guides       | Not started | Current homepage is a temporary development entry point                                                                           | Complete information architecture, catalog, navigation, search, guides, policies, SEO, and 404                                                                                               |
| Quality and security CI         | Partial     | Foundation CI, immutable action pins, Dependency Review, CodeQL, tracked-source formatting, and generated-output gates pass        | Add the Stage 4 compatibility matrix, screenshots, Lighthouse, links, browser/manual gates, and publication evidence                                                                        |
| Preview and production delivery | Not started | Hosting choices are recorded                                                                                                      | Cloudflare preview proof, GitHub production artifact, Hostinger capability audit, safe promotion, rollback, headers, and analytics                                                           |
| Remaining launch templates      | Not started | Nineteen permanent planning slots exist; example concepts remain non-binding                                                      | Owner-selected briefs and complete per-template publication pipeline                                                                                                                         |
| V1 release                      | Not started | Release policy is recorded                                                                                                        | Permanent domain, 20 Published Templates, release matrix, verified artifact, tag, deployment, and rollback readiness                                                                         |

Passing the existing Hanging Gifts tests does **not** make it a Published Template. It remains the approved visual and behavioral prototype until the complete registry, documentation, compatibility, isolation, security, manual, browser, asset, and deployment gates are proven.

## Locked execution sequence

```text
Preflight checkpoint
  → 1. Shared foundation
  → 2. Hanging Gifts distributed template
  → 3. Hanging Gifts Template Page and isolated preview
  → 4. Complete quality and compatibility infrastructure
  → 5. Performance, teaser, and preview-security evidence
  → 6. Cloudflare preview and Hostinger deployment proof
  → 7. Website and eight guides
  → 8. Remaining nineteen templates
  → 9. FormMuse v1.0.0 release
```

Stages may overlap only when their dependencies are complete and the work occurs in isolated branches. Stage 8 must not begin before the Hanging Gifts system has proven Stages 1–7. Stage 9 cannot begin until all 20 templates independently satisfy the publication gate.

## Work-package operating rules

Every implementation work package becomes one parent GitHub issue or one clearly bounded sub-issue. It is ready for implementation only when it contains:

- One objective and explicit exclusions.
- Links to the applicable ADRs and authoritative sections.
- Dependencies that are already complete.
- Expected source and generated outputs.
- Automated and manual acceptance criteria.
- Any required owner or external action.
- A rollback or recovery note when it changes generated output, CI, hosting, deployment, dependencies, or shared infrastructure.

Every completed work package reports:

- Files changed and why.
- Commands and checks run with exact results.
- Generated diffs inspected.
- Assumptions avoided or owner clarifications received.
- Security, accessibility, portability, and dependency effects.
- Remaining blockers and the next unblocked package.

Do not combine unrelated foundation, website, deployment, and template changes in one implementation issue merely because they belong to the same stage.

---

# Preflight — approve and stabilize the public checkpoint

## P.1 Review draft pull request #8

**Status:** Owner-blocked.

**Objective:** Establish the architecture documents, pinned application shell, and approved Hanging Gifts prototype as the shared branch baseline.

**Steps:**

1. Review the draft PR scope and generated GitHub diff.
2. Confirm the approved Hanging Gifts visual composition remains the owner-approved baseline.
3. Confirm private `website-v2/`, `.agents/`, `example tech stack.md`, credentials, and local metadata are absent.
4. Require the existing typecheck, lint, unit, browser, static-export, accessibility, responsive, reduced-motion, animation, and zero-external-request checks.
5. Merge only after review; do not continue long-lived feature work from an unmerged checkpoint.

**Exit:** `main` contains the reviewed checkpoint and the working branch is synchronized from that commit.

## P.2 Preserve the locked Hanging Gifts visual boundary

**Status:** Complete as a decision; ongoing as a guardrail.

The current composition, form appearance, navbar behavior, hero, hanging gifts, supporting content, typography treatment, and approved absence of the Cedar footer/location implementation are visually locked. Underlying accessibility semantics, portability, installation, tests, and security may be improved without redesigning the composition.

If a later quality gate appears to require a visible change, stop and ask the owner before changing the approved design. Do not silently trade visual quality for test convenience or silently weaken an authoritative accessibility requirement to preserve pixels.

---

# Stage 1 — Complete the shared foundation

**Stage status:** Complete.

Completed on 2026-07-22 at merge commit `7f03970`. A clean clone installed the frozen dependency graph on Node.js 24.18.0 and pnpm 11.15.1; registry, guides, search data, deployment fixture, formatting, typecheck, lint, 153 unit tests, and static export passed. The exported search and deployment files were byte-identical to their generated inputs and contained no local, secret-shaped, preview-only, or undeclared source references. Pull request #27 then passed the Foundation source gate, Dependency Review, and CodeQL after the owner explicitly enabled Dependency Graph.

**Outcome:** One reproducible static application can validate authored registry data, generate installable registry files, generate guide/search/deployment data, and build through the exact supported toolchain without runtime services.

**Primary decisions:** ADR 0001–0003, 0009–0012, 0014, 0017, 0020, 0022–0030, 0041, 0049–0050, 0062, 0066, 0069–0073.

## 1.1 Normalize the canonical repository structure

**Status:** Complete.

**Deliverables:**

- Retain the minimal root, `(site)`, and `(preview)` layout split.
- Add the missing `components/site`, `components/template-page`, `components/preview`, `lib/formmuse`, `scripts`, `tests/compatibility`, and `tests/visual` structure only as real files require it.
- Preserve one application and keep compatibility fixtures outside the pnpm workspace package graph.
- Keep `public/r/` and `out/` generated; never hand-author their contents or commit `out/`.
- Keep Local Source References excluded through owner-local Git exclusion rather than publishing them as project artifacts.

**Acceptance:** Repository structure matches ADR 0020 without empty speculative subsystems, a second application, or a monorepo.

## 1.2 Implement validated Build Origin configuration

**Status:** Complete.

**Deliverables:**

- A build-only `lib/formmuse` module validates `FORMMUSE_DEPLOY_ENV` and `FORMMUSE_SITE_URL`.
- Development defaults safely to localhost.
- Preview requires a temporary HTTPS origin and emits global `noindex` behavior without production canonicals or sitemap entries.
- Production requires the owner-verified permanent HTTPS origin and rejects missing, insecure, or localhost values.
- All registry, preview, Open Graph, canonical, documentation, and deployment URLs use this module rather than hardcoded hosts.
- No client component reads these variables and no unnecessary `NEXT_PUBLIC_` copy exists.

**Tests:** Unit tests for all environments, malformed URLs, localhost production, trailing slashes, and URL construction; static builds for development and preview-safe configurations.

**Owner checkpoint:** Supplying a permanent production origin is deferred until the owner controls the domain. Do not invent or publish one.

## 1.3 Define strict registry and FormMuse metadata schemas

**Status:** Complete.

**Deliverables:**

- Reusable semantic-version, ISO calendar-date, kebab-case slug, unique-array, and Transport Value validators.
- A strict `FormMuseMetaSchema` as the only runtime and inferred TypeScript definition.
- Closed values for real categories, layout values used by actual templates, animation technology, lifecycle, and objective appearance.
- Validated open `tags` and `fields` slugs.
- Structured props, examples, usage notes, accessibility notes, version, updated date, featured state, replacement/deprecation information, and safe-installability information required by the lifecycle.
- Standard shadcn fields remain top-level; no duplication under `meta.formmuse`.
- Unknown keys and malformed records fail locally and in CI.

**Tests:** Positive and negative schema fixtures, typo rejection, category/tag duplication rejection, one-category enforcement, semver/date boundaries, draft/deprecated behavior, and inferred-type compile checks.

## 1.4 Author the root registry and deterministic generator

**Status:** Complete.

**Deliverables:**

- One root `registry.json` with Hanging Gifts as a validated `draft` record until all publication gates pass.
- Registry records are the source for installation, catalog, Template Pages, search, lifecycle, and versions.
- A deterministic registry build script invokes the exact pinned shadcn CLI.
- Generated items land only in `public/r/` and are reproducible from clean source.
- Generation excludes draft installation output in production and handles safe deprecated records correctly.
- Generated item files are diffed and checked for undeclared files, wrong targets, dependency drift, secrets, local paths, repository-only files, and nondeterminism.

**Tests:** Clean generation twice produces identical output; invalid metadata fails; draft/public/deprecated fixture behavior passes; generated JSON conforms to shadcn and FormMuse contracts.

## 1.5 Prove Base UI and dependency ownership

**Status:** Complete.

**Deliverables:**

- Audit the existing shadcn controls against Base UI configuration and supported public APIs.
- Verify distributed templates import local `components/ui/*` controls, never `@base-ui/react` directly.
- Registry dependencies contain only the controls a template uses.
- npm dependencies contain only packages the template itself needs.
- Registry installation must not overwrite customized controls automatically or hide conflicts.
- Radix remains unsupported and receives an explicit warning rather than migration behavior.

**Tests:** Pinned shadcn initialization and installation into clean Base UI fixtures, conflict-visible installation, and a negative Radix preflight case.

## 1.6 Complete the headless guide source pipeline

**Status:** Complete.

**Deliverables:**

- Configure `fumadocs-mdx` and `fumadocs-core` only as headless content and structure dependencies.
- Define the eight fixed guide sources and typed metadata.
- Keep guide files ordinary MDX and keep `fumadocs-ui`, visual providers, layouts, and global CSS absent.
- Prove Fumadocs code does not enter the root or preview layout, preview bundles, registry output, or compatibility fixtures.
- Provide a build-time guide data interface for the future FormMuse-owned documentation UI.

**Tests:** MDX compilation, malformed frontmatter rejection, route uniqueness, static export, and bundle/import-boundary checks.

## 1.7 Generate static search and deployment data contracts

**Status:** Complete.

**Deliverables:**

- A build-time search-data generator combines public guides with Published Template metadata.
- Search data excludes previews, drafts, and non-browsable deprecated records.
- A strict deployment-manifest schema and generator accepts CI-provided commit, build time, environment, nullable repository release, and validated Published Template versions.
- Generated data contains no secrets, actor identity, local paths, private environment values, or draft templates.
- Both outputs are deterministic apart from explicitly supplied build identity and timestamp values.

**Tests:** Search inclusion/exclusion and normalization, deployment version agreement, secret-shaped fixture rejection, and static output verification.

## 1.8 Establish the foundation CI and security baseline

**Status:** Complete.

**Deliverables:**

- Pull-request CI uses Node 24.18.0, pnpm 11.15.1, frozen lockfile installation, and least-privilege permissions.
- Required checks initially cover formatting, typecheck, ESLint, unit tests, registry validation/generation, and static export.
- Third-party actions are pinned to reviewed immutable commits.
- No `pull_request_target` execution of untrusted checkout code.
- Enable or document the owner actions needed for dependency graph, Dependabot alerts, dependency review, CodeQL, secret scanning, push protection, and branch protection.
- Add generated-output and dependency-change review gates without auto-merging updates.

**Owner checkpoint:** Repository settings that cannot be changed from source require owner approval and account access. Record the exact configuration rather than assuming a GitHub plan feature is enabled.

### Stage 1 exit gate

- A clean clone installs with the frozen lockfile on the pinned runtime.
- Registry validation and deterministic generation pass with one draft Hanging Gifts record.
- Guide compilation, search-data generation, deployment-manifest fixture generation, typecheck, lint, unit tests, and static export pass.
- Generated output contains no local references, secrets, preview-only source, or undeclared dependencies.
- No runtime server feature, monorepo, custom registry server, database, or `fumadocs-ui` dependency has been introduced.

---

# Stage 2 — Complete Hanging Gifts as the distributed vertical slice

**Stage status:** Partial.

**Outcome:** The approved Hanging Gifts composition becomes a complete, portable, installable Template Block with a stable source contract and repository-only documentation/test support.

**Primary decisions:** ADR 0002, 0004–0005, 0013–0015, 0019, 0021, 0026–0048, 0051–0055, 0058–0061, 0064, and 0073.

## 2.1 Formalize C01 and its draft identity

**Status:** Complete.

**Deliverables:**

- Assign Hanging Gifts to planning slot C01 in repository-side launch planning.
- Write its directional Launch Brief: purpose, Audience Lens, approved visual concept, Complete Composition boundary, fields, single-step depth, appearance, animation, differentiation, and asset/dependency requirements.
- Treat `hanging-gifts-contact` as the candidate slug during draft development and canonical immutable identity only when published.
- Record at least three material uniqueness differences from future nearest templates as the collection grows.

**Owner checkpoint:** The current approved visual implementation supplies the brief. Agents must not reinterpret the concept or add/remove major sections without owner approval.

## 2.2 Declare the exact distributed and repository-only boundaries

**Status:** Complete.

**Deliverables:**

- Main component and separate named schema/values/defaults are distributed.
- Include only genuinely required supporting components, scoped CSS Module, and local assets.
- Keep preview adapter, routes, tests, examples, changelog, launch brief, provenance notes, and publication evidence repository-only.
- Use relative imports between template-owned files and adopter aliases only for shadcn controls and `cn`.
- Explicit registry targets install source beneath `@components/formmuse/hanging-gifts-contact/` and raster assets beneath `~/public/formmuse/hanging-gifts-contact/`.
- CLI and Manual Installation derive from and expose the same distributed-file manifest.

**Acceptance:** A generated file inventory makes it impossible for preview-only code or repository documentation to leak into installation.

## 2.3 Audit portability, animation, and typography dependencies

**Status:** Complete.

**Deliverables:**

- Confirm no Next.js module, routing API, server feature, remote asset, global template style, or direct Base UI import exists in distributed source.
- Record why Hanging Gifts requires CSS, Motion, GSAP, `@gsap/react`, and ScrollTrigger; remove any animation dependency that lacks a material concept-level justification.
- Verify all GSAP and Motion instances scope selectors, clean up on unmount, and honor reduced motion.
- Audit the current Mulish package against the exceptional bundled-font policy: distribution need, licence, Next/Vite loading, fallbacks, and per-template ownership.
- Ensure the adopter's global typography is not replaced outside the Complete Composition.

**Owner checkpoint:** If portability or licensing requires a visible typography change, stop and request approval. Do not silently substitute a visually different font.

## 2.4 Complete and test the Form Shape

**Status:** Complete.

**Deliverables:**

- Named Zod schema, `z.output` values type, and complete defaults remain synchronized with rendered fields.
- `onSubmit`, initial-only `defaultValues`, outer-root-only `className`, and raster-only `assetBaseUrl` are the public baseline.
- Parsed Values are Transport Values and preserve message formatting while conservatively normalizing documented single-line fields.
- Intent-specific `maxLength` values agree in schema and controls.
- Requirement instruction, visible labels, optional Last name, native/ARIA requirements, defaults, and Zod agree.
- Submit-first validation, one actionable message per field, first-error focus, pending, duplicate prevention, safe failure, preserved values, Explicit Retry, persistent success, and explicit reset remain accessible.
- No storage, navigation blocking, offline queue, automatic retry, telemetry, legal promise, CAPTCHA, Upload Field, raw backend error, or unsupported configuration API is added.

**Tests:** Expand schema and component tests for every contract above, including two mounted instances, changed `defaultValues`, root-class behavior, JSON round trip, all length boundaries, retry call count, and result focus.

## 2.5 Complete asset packaging and provenance

**Status:** Complete.

**Deliverables:**

- Verify the AI-generated hero image is owner-created, redistribution-safe, optimized, and recorded with generation provenance.
- Verify every SVG, icon, raster, and font visible in the preview ships with the Template Block or comes from a declared dependency.
- Use standard `<img>` with dimensions, normalized `assetBaseUrl`, and correct decorative treatment.
- Confirm no Cedar mark, identity, contact destination, copyrighted map, remote request, or preview-only artwork remains.
- Record all asset licences and any separate notices repository-side.

## 2.6 Finish responsive, keyboard, motion, and interaction behavior

**Status:** Partial.

**Deliverables:**

- Preserve the approved desktop, tablet, and mobile composition.
- Verify 320px, both sides of each real breakpoint, and intended wide rendering without page-level horizontal overflow.
- Ensure artwork never obscures controls, errors, focus, pending text, or result states.
- Verify 44px primary targets, non-overlap, touch and keyboard parity, logical order, mobile navigation, autofill, and multiple instances.
- Reduced motion removes nonessential loops and large choreography while exposing complete content and form states immediately.
- Reset and Replay hooks required by the future preview system are deterministic and do not leak state.

**Owner checkpoint:** Any proposed visible adjustment to the locked composition must be shown and approved before implementation.

## 2.7 Add repository-only template documentation inputs

**Status:** Not started.

**Deliverables:**

- Type-checked basic usage and backend-connection examples.
- Structured props, fields, usage notes, normalization notes, accessibility notes, dependencies, and asset notes in registry metadata.
- Per-template changelog beginning with an unreleased draft section; assign `1.0.0` only at publication.
- Manual Installation source data for every file, package, asset, CSS/animation step, import path, and final usage.
- Agent Handoff metadata with named schema and values exports.

## 2.8 Prove raw source portability before presentation work

**Status:** Not started.

**Deliverables:**

- Install the generated block into clean Next.js and Vite React Base UI fixtures.
- Compile and render the actual installed files rather than importing repository source through FormMuse aliases.
- Verify raster path defaults and an alternate subpath.
- Verify a sample typed `onSubmit` implementation in each fixture.
- Confirm uninstalling FormMuse website dependencies does not remove a declared template requirement.

### Stage 2 exit gate

- Hanging Gifts is a validated `registry:block` with exact distributed files and dependencies.
- CLI and Manual Installation inputs are identical.
- Clean Next.js and Vite fixtures compile and render the installed source.
- All form, asset, accessibility, responsive, reduced-motion, dependency, and portability tests at this stage pass.
- Visual composition remains owner-approved.
- Status remains `draft` until Stages 3–6 complete the remaining publication evidence.

---

# Stage 3 — Build the generated Template Page and isolated preview

**Stage status:** Direct preview partial; Template Page not started.

**Outcome:** `/templates/hanging-gifts-contact` documents and installs the same source rendered by a controlled interactive iframe at `/preview/hanging-gifts-contact`.

**Primary decisions:** ADR 0001, 0006–0008, 0016, 0022, 0025, 0062–0065, and 0070.

## 3.1 Generate template and preview routes from registry records

**Status:** Partial.

**Deliverables:**

- Static params for Template Pages and Preview routes come from validated records, not hardcoded route lists.
- Draft routes exist only in development/review behavior permitted by lifecycle rules.
- Published and safe deprecated route behavior follows registry lifecycle metadata.
- Preview routes remain `noindex` and absent from sitemap, navigation, search, canonicals, and analytics.

## 3.2 Build the shared Template Page shell

**Status:** Not started.

**Deliverables:**

- FormMuse-owned page layout populated by registry data and source manifests.
- Primary Preview and Code tabs.
- Title, description, category, fields, tags, version, dependencies, appearance, and animation implementation details.
- Stable accessible tab semantics, keyboard operation, URL behavior only if it does not create conflicting state, and static-export navigation.
- No per-template MDX page.

## 3.3 Build complete Code and Installation presentation

**Status:** Not started.

**Deliverables:**

- Code shows every distributed source and asset entry, with no repository-only files.
- Installation Preflight states React, TypeScript, Tailwind 4, and shadcn Base UI requirements.
- CLI and Manual tabs show pnpm, npm, Yarn, and Bun forms exactly as locked.
- Commands use the current Build Origin and never include overwrite or automatic-confirmation flags.
- Manual instructions cover dependencies, all files, CSS/animation, assets, imports, and final usage.
- Radix warning and optional agent/troubleshooting `shadcn info` guidance are present.
- CLI/Manual parity is generated and testable, not manually maintained duplicate prose.

## 3.4 Generate examples, Props, notes, changelog, and Agent Prompt

**Status:** Not started.

**Deliverables:**

- Render only referenced type-checked examples.
- Generate the Props table from structured metadata and exported TypeScript contract.
- Link template-specific notes to the canonical Template API guide rather than restating the universal contract inconsistently.
- Expose version and repository-only changelog.
- Copy Agent Prompt tells an adopter's agent to inspect the project, confirm Base UI, install safely, preserve conflicts, connect typed `onSubmit`, hide backend errors, and run target-project checks.
- Do not add a custom FormMuse MCP server, hosted agent, or chat UI.

## 3.5 Separate the distributed composition from the preview adapter

**Status:** Partial.

**Deliverables:**

- Distributed component receives only adopter-owned props.
- Repository-only preview adapter supplies deterministic success, failure, and pending timing without network calls.
- Preview UI can intentionally choose success or failure for testing without adding a production response API.
- Demo destinations remain inert without changing the adopter source's intended semantic structure.

## 3.6 Build parent iframe chrome and viewport controls

**Status:** Not started.

**Deliverables:**

- Fixed internal-scrolling desktop, tablet, and mobile frames.
- Accessible viewport controls with clear selected state.
- Reset remounts the full preview, clears state, restores initial scroll, and restarts entrance animation.
- Replay reruns replayable animation without clearing entered values or submission state.
- Code and installation UI remain outside the iframe.
- Loading, error, and unavailable-preview states are designed and accessible.

## 3.7 Implement the minimum Preview Protocol

**Status:** Not started.

**Deliverables:**

- Versioned, schema-validated readiness, Reset, and Replay messages only.
- Validate expected `Window`, meaningful origin, version, channel, and exact payload.
- Use an exact target origin where meaningful.
- Never transmit values, submitted content, HTML, selectors, URLs, code, arbitrary commands, credentials, analytics, or height.
- Defer pause/resume unless Stage 5 measurements prove it necessary.

## 3.8 Build the Catalog Teaser prototype from the same preview source

**Status:** Not started.

**Deliverables:**

- Opening viewport only, non-interactive, pointer-inert, not focusable, not scrollable, and not the card's accessible name.
- Parent card always contains semantic title, description, and link.
- Stable reserved space and a lightweight local fallback exist before activation.
- Use the same static preview route and distributed source, never separate teaser artwork.
- Keep activation and off-screen policy provisional until Stage 5 measurements.

### Stage 3 exit gate

- The generated Template Page contains all locked documentation and installation surfaces.
- The preview is fully interactive inside an isolated iframe and exposes deterministic validation and Form States.
- Reset and Replay follow distinct tested semantics.
- Code/Manual/CLI file and dependency parity passes.
- Agent Prompt is generated from machine-readable metadata.
- Catalog Teaser renders the same composition without becoming an interactive miniature.

---

# Stage 4 — Add the complete testing and compatibility infrastructure

**Stage status:** Partial tool installation; major infrastructure not started.

**Outcome:** One reproducible quality system can determine whether a template or site change is eligible for publication.

**Primary decisions:** ADR 0011, 0024, 0031–0058, 0066–0067, and 0071–0072.

## 4.1 Define canonical quality commands and gate aggregation

**Status:** Partial.

**Deliverables:**

- Separate scripts for formatting check, typecheck, lint, unit/component tests, registry validation/build/diff, static export, Next fixture, Vite fixture, browser tests, visual tests, accessibility, Lighthouse, links, security, and installation smoke tests.
- A single local/CI aggregate command runs the required non-secret publication checks in a deterministic order.
- Failure output identifies the owning layer and does not mask earlier failures.
- CI and local commands use identical pinned tools and frozen installs.

## 4.2 Complete Vitest and Testing Library coverage

**Status:** Schema tests partial; rendered component tests not started.

**Deliverables:**

- Vitest owns schemas, normalization, metadata, registry, generation, origin, search, deployment manifest, and isolated state utilities.
- Testing Library and `user-event` own rendered labels, typing, submit-first validation, focus, pending, duplicate prevention, failure, retry, success, reset, Initial Values, and root class behavior.
- Tests observe visitor behavior rather than internal state.
- Avoid duplicating real-browser-only behavior at this layer.

## 4.3 Build clean Next.js and Vite compatibility fixtures

**Status:** Not started.

**Deliverables:**

- Minimal generated test projects or temporary fixture directories, not maintained workspace applications.
- Initialize Tailwind 4 and shadcn Base UI as an adopter would.
- Install the generated registry block with the pinned shadcn CLI.
- Compile, build, and render the installed files in both frameworks.
- Verify aliases, CSS Modules, assets, client directives, popups, and typed `onSubmit`.
- Clean fixtures after execution without deleting unrelated workspace data.

## 4.4 Expand Playwright integration coverage

**Status:** Partial.

**Deliverables:**

- Retain existing Chromium, Firefox, and WebKit engine coverage and label it accurately.
- Add configured mobile-emulation projects without calling them real devices.
- Cover parent Template Page plus iframe, viewport controls, keyboard workflows, focus, Reset, Replay, submission simulation, network isolation, storage and navigation prohibitions, static route navigation, hydration and console errors.
- Establish an idle post-load request baseline and fail unexpected later requests during interaction, reset, replay, and scrolling.
- Test two instances, autofill-sensitive label behavior, interaction targets, and breakpoint boundaries.

## 4.5 Establish the Visual Baseline Environment

**Status:** Not started.

**Deliverables:**

- Pin CI OS/container, Playwright/browser builds, fonts, locale, timezone, viewport, device scale, color scheme, reduced-motion setting, and deterministic animation/test clock behavior.
- Store official snapshots under repository-owned visual test paths.
- Capture approved narrow, breakpoint-adjacent, wide, pending, failure, success, reduced-motion, and preview-chrome states.
- Local snapshots are review artifacts and cannot overwrite official baselines automatically.
- Snapshot changes require an explicit visual review, not blind update.

## 4.6 Complete automated and manual accessibility evidence

**Status:** Axe partial; manual evidence not started.

**Deliverables:**

- Axe checks the site document and preview iframe independently.
- JSX accessibility linting remains zero-warning.
- Create a publication checklist and evidence record for keyboard, focus order and visibility, zoom/reflow, screen reader, touch, motion, target size, contrast, and real-device review.
- Record browser, OS, assistive technology, device, tester, date, limitations, and outcome.
- Do not claim Lighthouse or axe establishes WCAG conformance by itself.

## 4.7 Add Lighthouse CI and Linkinator

**Status:** Not started.

**Deliverables:**

- Serve the generated `out/` artifact in a pinned environment.
- Audit the homepage, catalog, one guide, every newly published Template Page, and corresponding preview.
- Enforce Performance at least 90 and Accessibility/Best Practices/SEO at 100 for indexable routes; previews omit only the SEO requirement.
- Linkinator crawls the exported site with narrow exclusions for deliberately inert demo destinations.
- Fail unhandled page errors, promise rejections, hydration warnings, serious/critical axe issues, and broken internal links.

## 4.8 Add supply-chain and generated-output security checks

**Status:** Not started.

**Deliverables:**

- Dependency and lockfile review, licence inventory, vulnerability audit and triage.
- Secret scanning across source, generated registry, and static export.
- Static checks for remote scripts, dynamic execution, unsafe HTML, hidden network behavior, analytics in distributed source, and undeclared dependencies.
- Generated registry and Manual Installation divergence check.
- Relevant unresolved high/critical vulnerabilities block publication.

## 4.9 Test pinned and public shadcn installation paths

**Status:** Not started.

**Deliverables:**

- Every pull request tests the exact pinned CLI.
- Scheduled compatibility tests use `shadcn@latest` without blocking unrelated changes solely because upstream released unexpectedly.
- Template publication and FormMuse release require a fresh latest-version pass.
- pnpm, npm, Yarn, and Bun public command forms are smoke-tested without overwrite/confirmation suppression.
- `--diff` behavior is documented for adopters inspecting updates.

## 4.10 Generate a machine-readable publication report

**Status:** Not started.

**Deliverables:**

- Record each required gate, command, result, environment, artifact identifier, and manual evidence reference.
- Registry status cannot become `published` unless every required result is passing and no publication blocker remains.
- Reports distinguish engine/emulation checks from branded-browser and physical-device evidence.
- Failed or incomplete reports leave the template `draft` automatically or cause generation to fail.

### Stage 4 exit gate

- The complete automated quality system runs reproducibly in CI.
- Existing Hanging Gifts behavior is covered at the cheapest faithful layers.
- Next.js and Vite install-and-build fixtures pass.
- Official visual baselines exist in a pinned environment.
- Manual evidence format exists and automated tools are not misrepresented as certification.
- Publication status is mechanically tied to complete evidence rather than launch-count pressure.

---

# Stage 5 — Measure performance and finalize preview isolation

**Stage status:** Evidence-blocked until Stages 1–4 complete.

**Outcome:** Hanging Gifts supplies measured performance budgets, Catalog Teaser behavior, and a documented minimum preview security model that later templates can reuse.

**Primary decisions:** ADR 0004, 0008, 0037–0038, 0051, and 0064–0067.

## 5.1 Measure the complete Hanging Gifts baseline

**Status:** Not started.

**Measurements:**

- Static HTML, CSS, JavaScript, font, image, and total transfer sizes.
- Template-specific dependency contribution.
- Initial render, hydration, Largest Contentful Paint laboratory result, layout shift, interaction response, and long tasks.
- Main-thread work, memory, frame stability, scroll behavior, continuous animation cost, and reduced-motion behavior.
- One full preview, one inactive teaser, one active teaser, several visited/off-screen teasers, and a representative catalog grid.
- Desktop and mobile-class laboratory profiles in the pinned environment.

**Evidence:** Store raw reports, summarized findings, exact environment, and reproducible commands. Do not call laboratory values field data.

## 5.2 Propose evidence-based budgets

**Status:** Evidence-blocked.

**Deliverables:**

- Proposed JavaScript, image, total-transfer, long-task, memory, and teaser-activation regression thresholds based on measured behavior.
- Separate site-shell, shared-preview, and per-template responsibility where useful.
- A documented process for intentional baseline changes and regressions.

**Owner checkpoint:** The project owner reviews and approves the first budgets. Do not turn measurements into permanent policy without approval.

## 5.3 Prove the minimum iframe sandbox

**Status:** Not started.

**Sequence:**

1. Begin with `allow-scripts` and no same-origin privilege.
2. Test static Next.js loading, local chunks, CSS, assets, form interaction, animation, Reset, Replay, and all supported Playwright engines.
3. Record any failure and its exact browser/security cause.
4. Add no capability unless evidence proves it necessary.
5. If same-origin privilege appears necessary, stop for architecture/security review before combining it with scripts.
6. Evaluate a distinct preview origin only if the minimum same-origin static model cannot meet functional and security requirements.

**Owner checkpoint:** Any decision to weaken the initial sandbox or add a separate preview origin requires explicit owner approval after evidence review.

## 5.4 Prove preview-specific CSP and Permissions Policy

**Status:** Not started.

**Deliverables:**

- Start from denial and allow only required local scripts, styles, images, fonts, and media.
- Explicitly block connections, form actions, objects, nested frames, workers, manifests, external navigation, and unused active content.
- Deny camera, microphone, geolocation, payment, fullscreen, display capture, and other unnecessary capabilities.
- Verify the delivery mechanism with a portable local static server and later on Hostinger; do not assume unavailable per-route headers.
- Record every exception, browser result, and static-host limitation.

## 5.5 Security-test the Preview Protocol

**Status:** Not started.

**Tests:**

- Wrong window, origin, channel, version, type, missing fields, unknown fields, malformed payload, replayed message, and unexpected direction are rejected.
- Values, arbitrary strings, URLs, selectors, HTML, or executable content are not accepted.
- Reset and Replay cannot affect the parent site outside their frame.
- Protocol messages produce no analytics or network side effect.

## 5.6 Finalize Catalog Teaser lifecycle

**Status:** Evidence-blocked.

**Deliverables:**

- Select activation margin, fallback, off-screen unmount/pause strategy, and reactivation behavior from Stage 5 measurements.
- Prefer lazy mounting and unmounting over adding pause/resume protocol commands.
- Add pause/resume only if evidence proves it necessary and document the added protocol surface.
- Verify twenty representative teaser slots do not eagerly load twenty complete previews.

## 5.7 Close the Hanging Gifts publication evidence gap

**Status:** Not started.

**Deliverables:**

- Consolidate Stages 2–5 reports.
- Run current branded Chrome, Edge, Firefox, and Safari smoke checks.
- Run current real iOS Safari and Android Chrome checks using owned devices or an approved device cloud.
- Complete manual accessibility and visual review.
- List any remaining Hostinger-specific CSP/header or deployment evidence deferred to Stage 6.

### Stage 5 exit gate

- Performance and teaser budgets are measured, reviewed, and recorded.
- Minimum sandbox, CSP, Permissions Policy, and protocol are documented with browser evidence.
- Hanging Gifts passes every environment-independent publication gate.
- Any remaining blockers are explicitly limited to Stage 6 host/deployment proof or owner-controlled launch actions.

---

# Stage 6 — Prove Cloudflare previews and safe Hostinger delivery

**Stage status:** Not started; partly owner-blocked.

**Outcome:** Trusted branches receive isolated preview deployments, while GitHub Actions produces and safely promotes the exact verified production artifact to Hostinger with rollback.

**Primary decisions:** ADR 0009–0010, 0023, 0041, 0049–0050, 0056–0057, 0065, 0068–0069, and 0071.

## 6.1 Configure Cloudflare Pages as Preview Host only

**Status:** Owner-blocked.

**Deliverables:**

- Connect trusted same-repository branches and pull requests.
- Disable Cloudflare production-branch deployment.
- Pin Node, pnpm, frozen install, build command, and preview environment contract to match GitHub Actions.
- Supply preview HTTPS origin, no production credential, no production analytics token, and global `noindex` behavior.
- Fork pull requests receive non-secret CI and no credential-bearing preview.
- Confirm preview canonicals, sitemap, analytics, registry commands, and routes behave as designed.

## 6.2 Build the authoritative GitHub production artifact workflow

**Status:** Not started.

**Deliverables:**

- Trigger from protected `main` only after required checks.
- Generate registry output and deployment manifest before final verification.
- Build one immutable `out/` artifact and retain it with checksums and manifest.
- Scan the artifact for secrets, local paths, preview origins, draft installation files, broken links, and unexpected external resources.
- Use least permissions and one-at-a-time production concurrency.
- Do not deploy until Hostinger promotion is proven.

## 6.3 Audit the real Hostinger account

**Status:** Owner-blocked.

**Questions to answer from hPanel and a safe non-production path:**

- Available SSH, SFTP, FTP, key, password, user, and directory-scope capabilities.
- Whether symbolic-link or atomic directory promotion is supported.
- Document root and ability to create versioned release directories.
- Static header configuration, redirects/fallbacks, and custom 404 behavior.
- Retention space for at least two artifacts.
- Narrowest practical Production Deployment Credential.

Do not assume an independently scoped SFTP user or store credentials in source, issues, logs, preview builds, or artifacts.

## 6.4 Prove upload, verification, promotion, and rollback

**Status:** Evidence-blocked.

**Sequence:**

1. Upload to a temporary or versioned location.
2. Verify file count, checksums, deployment manifest, registry files, critical routes, and absence of partial content.
3. Promote only a complete verified release using the safest host-supported operation.
4. Confirm production route, registry URL, preview isolation, assets, headers, and 404 behavior.
5. Retain the previous artifact and manifest pair.
6. Roll back without rebuilding an old commit.
7. Verify rollback route, registry, manifest, and checksums.
8. Demonstrate concurrency protection against two overlapping deploys.

**Owner checkpoint:** Approve the observed credential and promotion strategy before production use.

## 6.5 Verify host-delivered security headers

**Status:** Evidence-blocked.

**Deliverables:**

- HTTPS, MIME sniffing protection, referrer policy, Permissions Policy, CSP, and appropriate HSTS behavior.
- Preview-specific restrictions work through the actual static-host delivery mechanism.
- No header breaks local assets, hydration, code copying, downloads of registry JSON, or iframe operation.
- Record portability differences rather than introducing a Hostinger-only application runtime.

## 6.6 Isolate production-only Cloudflare Web Analytics

**Status:** Not started.

**Deliverables:**

- One replaceable site-only adapter loaded from `(site)` routes only in production with a configured public token.
- No analytics in root/preview layouts, preview frames, development, Cloudflare previews, registry source/output, examples, fixtures, or distributed templates.
- Only reviewed Cloudflare script/reporting origins are permitted; no broad wildcard, custom events, query capture, UTM workaround, form values, or search text.
- Beacon failure and blocking cannot affect site, registry, previews, or installation.
- Document the current SRI exception and re-verification requirement.

## 6.7 Record deployment and rollback evidence

**Status:** Not started.

**Deliverables:**

- Sanitized repository-side runbook with no credentials.
- Exact build identity, artifact checksum, manifest, host capabilities, promotion method, rollback method, headers, smoke results, and known limitations.
- Protected-environment and branch-rule screenshots or textual evidence where safe.

### Stage 6 exit gate

- A trusted PR receives a correct noindex Cloudflare preview with no production secret.
- GitHub Actions creates the sole verified production artifact.
- The artifact can be safely uploaded, verified, promoted, and rolled back on the real Hostinger account.
- Preview isolation and production headers work on the actual host.
- Analytics is production-site-only and failure-isolated.
- Hanging Gifts has no remaining host-specific publication blocker.

---

# Stage 7 — Complete the FormMuse website and guides

**Stage status:** Not started beyond temporary scaffolding.

**Outcome:** The public static product clearly presents, documents, searches, previews, and installs the curated templates without empty product areas or runtime services.

**Primary decisions:** ADR 0006–0007, 0012, 0016–0018, 0056–0057, 0062–0064, 0067, and 0070.

## 7.1 Design and implement the FormMuse site shell

**Status:** Not started.

**Deliverables:**

- Original FormMuse visual language; do not copy Magic UI or Aceternity site layout, prose, branding, or assets.
- Site-only navigation with Templates, Guides, GitHub, Search, and theme toggle.
- Footer, responsive navigation, skip/navigation accessibility, focus management, and theme behavior.
- Root layout remains minimal and preview routes remain free of site shell and documentation providers.

**Owner checkpoint:** Approve the FormMuse website art direction and future logo/brand assets before they are treated as final.

## 7.2 Complete the homepage

**Status:** Not started.

**Deliverables:**

- Concise project introduction and mission.
- Direct catalog and installation paths.
- Selected Published Templates and category entry points.
- Explanation of adopter-owned code, provider-agnostic `onSubmit`, and agent-friendly installation.
- No separate About, Pricing, Pro, Blog, Showcase, Community, or speculative product area.

## 7.3 Build the category-only catalog

**Status:** Not started.

**Deliverables:**

- Exactly All, Contact, Newsletter, and Quote Request views.
- Category views use controlled query parameters but canonicalize to `/templates` and do not become separately indexed pages.
- Preserve authored registry order and show only Published Templates.
- Accessible ordinary links work without Site Search.
- Cards include semantic content and measured lazy Catalog Teasers.
- No sort, counts, chips, marketplace filters, popularity, ratings, favorites, accounts, or catalog-specific search input.

## 7.4 Build accessible static Site Search

**Status:** Not started.

**Deliverables:**

- Client-side command interface over generated guide and Published Template data.
- Match titles, descriptions, categories, tags, fields, and guide content as defined by the search contract.
- Exclude previews, drafts, and non-browsable deprecated records.
- Accessible dialog naming, focus, keyboard behavior, result announcements, and ordinary-link fallback.
- Search text never enters analytics or URLs.

## 7.5 Write and publish the eight guides

**Status:** Introduction placeholder only.

**Required guides:**

1. Introduction.
2. Installation.
3. Template API.
4. Connecting a Backend.
5. Customizing Templates.
6. Using FormMuse with Agents.
7. Accessibility.
8. Changelog.

**Deliverables:** FormMuse-owned documentation layouts, navigation, table of contents, syntax highlighting only where needed, copy controls, responsive reading, heading links, static search integration, and no `fumadocs-ui` visual dependency.

## 7.6 Complete policy and legal surfaces

**Status:** Root MIT present; public policy set incomplete.

**Deliverables:**

- Root `SECURITY.md` with private reporting route and supported-version/disclosure policy.
- Root `TRADEMARKS.md` and `public/brand/README.md` with exact designated Brand Assets.
- README and brand README carry the approved MIT/brand boundary statement.
- Readable `/privacy`, `/license`, `/trademarks`, and `/security` pages.
- Privacy notice accurately describes active analytics behavior.
- No private reports, credentials, or confidential material are published.

**Owner checkpoint:** Qualified legal review is required before final trademark/brand wording or broader legal claims are published.

## 7.7 Complete metadata, SEO, sitemap, and not-found behavior

**Status:** Not started.

**Deliverables:**

- Production canonicals and sitemap derive from verified Build Origin.
- Preview and temporary builds remain noindex and omit temporary canonicals/sitemap publication.
- Template structured data only where accurate and useful.
- Local redistribution-safe Open Graph assets.
- Static custom not-found artifact verified on local server, Cloudflare preview, and Hostinger.
- Preview routes remain absent from sitemap, search, navigation, analytics, and canonical metadata.

## 7.8 Apply the Whole-site Quality Gate

**Status:** Not started.

**Deliverables:**

- Lighthouse, axe, link, console, hydration, navigation, responsive, theme, keyboard, zoom, screen-reader, reduced-motion, browser, and real-device checks.
- Catalog with measured teaser behavior satisfies approved budgets.
- Every public link, code copy, CLI command, Manual step, Agent Prompt, and registry URL is verified from the built artifact.
- No empty routes, placeholder legal promises, external template requests, or inaccessible search-only navigation.

### Stage 7 exit gate

- Every locked public route exists and every excluded V1 area remains absent.
- Hanging Gifts has a complete public-quality Template Page, catalog card, search entry, and installation documentation.
- Eight guides and four policy pages are complete.
- The entire exported site passes the Whole-site Quality Gate and approved performance budgets.
- The shared system is frozen enough to begin scaling templates without redesigning infrastructure per template.

---

# Stage 8 — Create and publish the remaining nineteen templates

**Stage status:** Not started and intentionally blocked until Stages 1–7 pass.

**Outcome:** The owner-curated collection reaches ten contact, five newsletter, and five quote-request Published Templates without reducing the quality gate.

**Primary decisions:** ADR 0011, 0013, 0018–0019, 0021, 0031–0048, 0051–0061, and all shared publication decisions proven by Stages 1–7.

## 8.1 Maintain the fixed planning ledger

**Deliverables:**

- C01–C10, N01–N05, and Q01–Q05 remain permanent repository planning IDs.
- C01 is Hanging Gifts.
- Category totals remain 10 contact, 5 newsletter, and 5 quote request.
- Interaction Depth remains 9+1 contact, 5+0 newsletter, and 2+3 quote request.
- Example concepts remain inspiration only and are never treated as assignments.
- Track draft, publication-ready, published, and blocker state without inventing popularity or moderation data.

## 8.2 Activate one owner-selected concept at a time

**Status:** Owner-blocked for each slot.

For each unassigned planning ID:

1. Ask the owner to select or describe the concept.
2. Write the directional Launch Brief without over-specifying the design.
3. Confirm category and required Interaction Depth allocation.
4. Compare against every existing and active brief.
5. Record at least three material uniqueness differences from the nearest template.
6. Finalize a candidate title and draft slug when implementation-ready.
7. Do not start visual implementation until the owner approves the brief.

## 8.3 Build each template through the proven authoring pipeline

For every selected template:

1. Define named schema, `z.output` values type, complete defaults, Form Shape, states, and public props.
2. Build accessible controls with local shadcn Base UI primitives.
3. Build the distinct Complete Composition using the smallest justified support and dependency set.
4. Apply CSS first, Motion when required, and GSAP only with written justification.
5. Implement reduced motion, responsive frames, interaction targets, and every form state with the visual concept—not as generic afterthoughts.
6. Package only original or redistribution-safe local assets and record provenance.
7. Add registry metadata, examples, changelog, Manual inputs, Agent Prompt data, preview adapter, and tests.
8. Install into clean Next.js and Vite fixtures.
9. Run the complete publication gate.
10. Keep `draft` status whenever any automated, manual, legal, asset, browser, device, security, or visual check is incomplete.

## 8.4 Prove the first remaining examples by risk, not by a mandatory visual roster

Before mass production, the owner selects:

- One newsletter template to prove the compact single-step category path.
- One quote-request template to prove category-specific fields.
- One multi-step quote-request template to prove the complete Step Flow contract.

These are system-validation checkpoints, not a commitment to a particular concept, name, layout, or visual order. After those paths pass, remaining owner-selected concepts may proceed in bounded batches.

## 8.5 Re-run shared gates after shared changes

Any change to shared controls, registry generation, metadata, Template Page, preview protocol, compatibility fixtures, or quality infrastructure must:

- Re-run every affected existing template.
- Re-run the complete current-and-previous-major Browser Support Window when the change affects shared compatibility.
- Re-measure performance when shared bundle or teaser behavior changes materially.
- Update no approved baseline merely to make a regression disappear.

## 8.6 Publish independently

- Every template owns its semantic version and changelog.
- First public version is `1.0.0` only after every gate passes.
- Unrelated site or template changes do not bump its version.
- Installation exposes the latest source but never overwrites adopter code automatically.
- Deprecated replacements receive new slugs; published slugs remain stable.

### Stage 8 exit gate

- Exactly 20 templates are genuinely Published: C01–C10, N01–N05, Q01–Q05.
- Exactly 16 are single-step and four are justified multi-step.
- Every template is materially distinct and broadly reusable.
- Every template has complete registry, documentation, preview, examples, changelog, compatibility, browser/device, accessibility, visual, security, asset, and publication evidence.
- No recolor, copy-only variant, minor rearrangement, or dependency swap is counted as a unique template.

---

# Stage 9 — Release FormMuse v1.0.0

**Stage status:** Not started.

**Outcome:** One verified immutable static artifact serves the public repository, permanent registry URLs, complete documentation, and 20-template catalog, with rollback ready.

**Primary decisions:** ADR 0001, 0009–0013, 0018–0024, 0041, 0049–0051, 0055–0057, 0067–0069, and 0071–0072.

## 9.1 Complete owner-controlled launch prerequisites

**Status:** Owner-blocked.

- Acquire and verify the permanent FormMuse HTTPS domain.
- Configure production DNS/Hostinger target without changing static architecture.
- Approve final FormMuse name/logo/Brand Asset inventory and legally reviewed trademark policy.
- Approve final site and 20-template visual review.
- Provide or approve the narrowest verified Hostinger deployment credential through the protected GitHub environment.

## 9.2 Run the release freeze audit

**Deliverables:**

- Confirm all 20 records are Published and no draft is publicly installable.
- Confirm exact direct dependencies and frozen lockfile; review licences and known vulnerabilities.
- Confirm source, generated registry, Manual files, and deployed registry items agree.
- Confirm no placeholder domain, Cedar identity, source reference, private path, secret, fake link, remote template asset, unsupported promise, or preview analytics remains.
- Confirm README, licence, security, privacy, trademark, brand, changelog, and release notes are final.

## 9.3 Run public installation compatibility

- Test pinned shadcn generation and fresh `shadcn@latest` publication smoke tests.
- Test pnpm, npm, Yarn, and Bun command forms against the permanent HTTPS registry URLs.
- Test clean Next.js and Vite Base UI installations.
- Verify conflicts remain explicit and `--diff` guidance works without overwrite automation.

## 9.4 Run the complete browser, device, accessibility, and performance release matrix

- Current and previous stable major Chrome, Edge, Firefox, Safari, iOS Safari, and Android Chrome.
- Pinned Playwright engines and mobile emulation, labelled accurately.
- Real devices or approved real-device cloud.
- Manual keyboard, focus, zoom/reflow, screen reader, touch, reduced motion, contrast, and target checks.
- Whole-site Lighthouse, axe, links, console, hydration, responsive, visual, and approved performance budgets.
- Record exact environments and never claim an untested version.

## 9.5 Build and retain the release artifact

- Build from the exact reviewed `main` commit in GitHub Actions.
- Generate `/formmuse-deployment.json` with schema version, commit, timestamp, `production`, repository release `v1.0.0`, and all Published Template versions.
- Verify checksums, registry contents, routes, headers, analytics isolation, CSP, sitemap, canonicals, 404, and permanent URLs.
- Retain the immutable artifact and previous rollback artifact.

## 9.6 Tag, release, deploy, and verify

1. Create signed or otherwise owner-approved repository tag `v1.0.0` from the verified commit.
2. Publish a GitHub Release with product-level notes and links to individual template changelogs.
3. Promote the exact verified artifact to Hostinger using the proven process.
4. Run production smoke tests for homepage, catalog, guides, every Template Page, every preview, registry downloads, commands, analytics isolation, and deployment manifest.
5. Confirm the previous artifact remains rollback-ready.
6. Roll back immediately if a launch-blocking defect appears; do not patch production files manually.

## 9.7 Begin post-launch observation without changing the contract

- Confirm Cloudflare Web Analytics reports aggregate site traffic without entering previews or templates.
- Once representative production data exists, evaluate LCP ≤ 2.5s, INP ≤ 200ms, and CLS ≤ 0.1 at the 75th percentile separately for mobile and desktop.
- Treat field regressions as issues; do not rewrite approved budgets or add intrusive tracking to explain them.
- Continue independent template versions and meaningful repository releases rather than tagging every deployment.

### Stage 9 exit gate

- Public repository and release are available under the approved MIT/brand boundary.
- Permanent HTTPS registry URLs install all 20 templates through every documented command path.
- The complete static site and previews pass production smoke checks.
- Deployment manifest identifies the exact artifact and template versions.
- Previous production artifact can be restored without rebuilding.
- FormMuse V1 is released as `v1.0.0`.

---

# Cross-stage owner checkpoints

These actions must not be guessed or delegated as autonomous decisions:

1. Approve and merge the foundation checkpoint.
2. Approve any visible change to the locked Hanging Gifts composition.
3. Approve a typography substitution if the current font cannot satisfy redistribution or compatibility rules.
4. Approve the first evidence-based performance budgets.
5. Approve any iframe capability expansion or separate preview origin.
6. Grant Cloudflare and Hostinger access and approve observed deployment capabilities.
7. Approve the final Hostinger credential, promotion, and rollback design.
8. Select and approve every remaining Launch Brief.
9. Approve FormMuse website art direction, name/logo/Brand Assets, and final product visuals.
10. Obtain qualified legal review of final trademark/brand language.
11. Acquire and verify the permanent domain.
12. Perform or authorize branded-browser, physical-device, and final launch review.
13. Approve the `v1.0.0` release and production promotion.

# Evidence-driven decisions intentionally deferred

The grill deliberately left these values unset until Hanging Gifts supplies evidence:

- Exact iframe sandbox flags.
- Exact preview CSP and its portable static-host delivery mechanism.
- Whether a distinct preview origin is necessary.
- Whether Preview Protocol pause/resume is necessary.
- Catalog Teaser activation margin, off-screen retention, and unmount/pause policy.
- JavaScript, image, transfer, main-thread, memory, and visual-performance budgets.
- Exact Hostinger credential type, upload path, promotion command, and rollback command.
- Any visual change that a measured accessibility or compatibility failure appears to require.

Each is resolved in the named work package, supported by recorded evidence, and escalated to the owner when it changes architecture, security posture, visual intent, cost, credentials, or public commitments.

# Suggested GitHub milestone and issue boundaries

Create issues only after the owner approves this plan. Use one milestone for each numbered stage and keep the preflight work attached to Stage 1.

- **Stage 1 milestone:** Issues 1.1–1.8.
- **Stage 2 milestone:** Issues 2.1–2.8.
- **Stage 3 milestone:** Issues 3.1–3.8.
- **Stage 4 milestone:** Issues 4.1–4.10.
- **Stage 5 milestone:** Issues 5.1–5.7.
- **Stage 6 milestone:** Issues 6.1–6.7.
- **Stage 7 milestone:** Issues 7.1–7.8.
- **Stage 8 milestone:** One collection-ledger issue, one owner-approved Launch Brief issue per planning ID, one implementation parent issue per template, and bounded sub-issues only when a template genuinely needs them.
- **Stage 9 milestone:** Issues 9.1–9.7 plus the final release checklist.

Use `needs-triage` until scope and dependencies are confirmed. Use `ready-for-agent` only when the issue is sufficiently specified and contains no unresolved owner decision. Use `ready-for-human` for visual approval, access, credentials, legal review, branded-browser/physical-device work, or another owner action. GitHub issues link to authority; they do not duplicate or amend it.

# ADR coverage audit

This plan intentionally covers every accepted ADR:

| ADR range | Execution coverage                                                                                                                                                     |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0001–0003 | Stages 1–3 establish source distribution, portability, and the one-app registry architecture                                                                           |
| 0004–0008 | Stages 2–5 implement animation policy, form contract, Agent Handoff, documentation, and isolated previews                                                              |
| 0009–0013 | Stages 1, 3, 6, 8, and 9 implement MIT/public source, static export, quality, registry ownership, and independent template versions                                    |
| 0014–0018 | Stages 1–3 and 7–8 implement Base UI controls, file boundaries, generated pages, strict metadata, and lifecycle                                                        |
| 0019–0025 | Stages 1–3 and 8–9 implement the 20-template target, repository layout, immutable slugs, direct URLs, Build Origin, CLI compatibility, and Base UI preflight           |
| 0026–0030 | Stages 1–2 implement registry blocks, CSS Modules, typography, local assets, and raster paths                                                                          |
| 0031–0039 | Stages 2, 4, and 8 implement validation, identity, feedback, Step Flow, content props, palette, responsive frames, targets, and adopter-owned Form Shape               |
| 0040–0048 | Stages 1–4 and 8 implement trust boundaries, security, upload exclusion, Transport/Parsed Values, length, requirement, validation-copy, and root-class contracts       |
| 0049–0058 | Stages 1–2, 4, 6–7, and 9 implement public source/brand boundaries, browser support, ephemeral state, navigation, legal copy, telemetry, analytics, and Explicit Retry |
| 0059–0061 | Stage 8 implements permanent planning IDs, reusable visual concepts, and the 16/4 Interaction Depth distribution                                                       |
| 0062–0065 | Stages 3, 5, and 7 implement lean routes, category-only catalog, Complete Composition previews, teasers, and layered preview isolation                                 |
| 0066–0067 | Stages 4–5, 7, and 9 implement the repository-owned Quality Toolchain and laboratory/manual/field gates                                                                |
| 0068–0069 | Stages 1, 6, and 9 implement deployment authority, rollback, independent product releases, and deployment manifests                                                    |
| 0070      | Stages 1 and 7 implement the headless Fumadocs guide pipeline                                                                                                          |
| 0071–0072 | Preflight and all build/CI/release stages preserve the exact compatible stable toolchain and reviewed update policy                                                    |
| 0073      | Preflight and Stage 2 keep Local Source References outside public source and adapt only reviewed redistribution-safe material                                          |

# Immediate next action after plan approval

The owner approved this execution plan on 2026-07-21. The separate architect → worker → reviewer contract is documented in `docs/agents/worker-orchestration.md`; Antigravity-specific runner and safety configuration remain owner-local under `.agents/` in accordance with ADR 0073.

Proceed in this order:

1. Commit this approved plan and worker contract to draft pull request #8.
2. Review and merge draft pull request #8 so `main` becomes the shared baseline.
3. Create only the Stage 1 milestone and its bounded issues.
4. Start with work package 1.1 and proceed in dependency order through the isolated worker and independent-review cycle.

Do not begin Stage 2 or create the complete nine-stage issue hierarchy before Stage 1 dependencies and gates justify that work.

The plan is complete when it makes the next safe action obvious without deciding any unapproved visual, legal, security, deployment, or launch detail on the owner's behalf.
