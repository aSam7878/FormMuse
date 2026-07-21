# FormMuse Form Template Authoring Reference

This is the implementation handoff for any coding agent creating or reviewing a FormMuse Form Template. It is intentionally agent-neutral: Codex, Gemini, and other coding agents should be able to follow it without relying on prior conversation.

## Authority

Before changing a template, read:

1. `CONTEXT.md` for canonical FormMuse language.
2. Every applicable decision in `docs/adr/`.
3. The template's Registry Record, source, examples, tests, preview, and changelog.
4. This document for the repeatable authoring workflow.

For V1 collection planning and assignment, also read `docs/launch-collection.md`. It records the stable slot and Interaction Depth rules plus a non-binding inspiration bank. Its example concepts are not an approved roster, assigned work, or a commitment to build those designs.

If this reference conflicts with a newer ADR, the newer ADR wins. Do not silently invent a new product or architecture rule. Record a genuinely new cross-template decision before applying it broadly.

## V1 launch target

The public V1 Launch Collection contains exactly these minimum quantities:

| Primary category | Required | Existing starting point | Remaining to create |
| --- | ---: | --- | ---: |
| Contact | 10 | Hanging Gifts Contact Form Template | 9 |
| Newsletter | 5 | None | 5 |
| Quote request | 5 | None | 5 |
| **Total** | **20** | **1 starting implementation** | **19** |

There is no separate internal-alpha launch. A template counts toward the launch total only after it becomes a Published Template by passing the complete quality gate.

Plan the collection through 20 permanent repository-side Template Planning IDs:

- `C01`–`C10`: contact.
- `N01`–`N05`: newsletter.
- `Q01`–`Q05`: quote request.

Each ID is a permanent planning slot. The project owner chooses the actual concept according to their taste when that template is ready to begin; FormMuse does not pre-assign a mandatory visual roster. At that point, attach a directional Launch Brief to the selected ID. The ID remains stable when a draft concept, title, or candidate slug changes. It is not a public installation identity, Registry Record field, catalog label, route segment, or replacement for the canonical slug. Keep the mapping in repository-side launch planning. Finalize a candidate public title and slug when the brief is implementation-ready and its source and Registry Record are created; changes remain possible while the template is a draft, but the slug becomes immutable at publication.

Every Launch Brief must state:

- Purpose and intended audience.
- Distinct visual concept.
- Layout type.
- Core fields.
- Primary interaction or animation.
- Objective appearance mode: `light`, `dark`, or `adaptive`.
- What distinguishes it from the other 19 briefs.
- Notable technical or asset requirements, including when none are expected.

During planning, describe layout in plain language at the level needed to communicate the concept. Do not pre-allocate templates to a speculative fixed layout taxonomy or force a design into `inline`, `centered`, `split`, or `full-page`. When a template becomes implementation-ready, map its actual composition to an existing validated layout value or add a new value because the real Published Template requires it, following the controlled-vocabulary policy.

Briefs are guardrails for originality and collection balance, not final art direction. Do not prescribe every color, transition, illustration detail, line of copy, or responsive measurement before implementation. Codex, Gemini, and other agents must retain room to develop and test a premium visual result while preserving the brief's purpose and differentiator.

Do not treat an inspiration list, agent proposal, provisional name, or example concept as an approved template assignment. Agents may suggest concepts, but only the project owner's explicit selection activates a Template Planning ID. A future concept may replace any example freely while the category counts, Interaction Depth distribution, portability contract, originality rule, and quality gate remain fixed.

Organize the V1 Launch Collection around broadly reusable premium visual concepts rather than a checklist of industries. A Launch Brief may use an Audience Lens to make its demo copy, hierarchy, and mood coherent, but that audience must not become a structural dependency or public limitation. Do not embed industry-specific APIs, provider integrations, proprietary assets, unexplained jargon, or assumptions that make the template difficult to repurpose. Example copy must be straightforward to replace in adopter-owned source.

Require genuine range in visual character and interaction intensity. The collection may include playful, highly animated concepts such as Hanging Gifts alongside minimal, editorial, luxurious, dark, restrained, quietly refined, and experimental work. Premium quality means intentional composition, typography, interaction, states, responsiveness, and craft; it does not mean every template needs heavy or continuous animation.

Quote-request briefs may create meaningful functional variety through combinations such as budget, timeline, project type, service, scope, or reference URL. Keep those fields broadly adaptable to agencies, consultants, freelancers, studios, and service businesses rather than coupling them to one trade or backend workflow.

Use this Interaction Depth distribution across the Launch Briefs:

| Primary category | Single-step | Multi-step | Total |
| --- | ---: | ---: | ---: |
| Contact | 9 | 1 | 10 |
| Newsletter | 5 | 0 | 5 |
| Quote request | 2 | 3 | 5 |
| **Total** | **16** | **4** | **20** |

Contact and newsletter forms should remain friction-light. The one multi-step contact template must have a coherent conversational concept rather than dividing a short form merely for animation. Newsletter templates remain single-step even when they progressively reveal optional preferences. Quote requests may use Step Flow when grouping service, scope, budget, timeline, and contact details reduces cognitive load. A single-step template may still be visually immersive, full-page, richly composed, and animated; Interaction Depth does not measure visual ambition.

V1 is intentionally concentrated: exactly 20 premium-quality, ready-to-paste public-facing Form Templates, using Magic UI and Aceternity UI as quality references for presentation, documentation, installation, portability, and source ownership. Quality describes the craft standard, not a requirement for paid hosting or a future business model.

Do not add infrastructure for hypothetical later features. The FormMuse site remains a fully static catalog and documentation experience; its templates remain interactive client components connected to adopter-owned backends only through the provider-agnostic Submission Connection.

## Product definition

A Form Template is a complete, copy-pasteable public-facing form with:

- A distinctive visual concept and purposeful animation.
- Accessible fields and validation.
- Submitting, success, and failure states.
- A provider-agnostic typed asynchronous `onSubmit` prop.
- Source that the adopter owns after installation.
- Working Next.js and Vite React compatibility.
- CLI and complete Manual Installation documentation.
- An isolated, interactive, no-network preview.

A Form Template's Complete Composition may be a compact embedded section, a substantial page section, or an entire scrollable form page. The project owner's selected design determines that boundary; V1 does not force every newsletter, contact, or quote request into one layout scale. Everything inside the Complete Composition shown in the full Template Preview ships as adopter-owned source and local assets under Preview Parity.

FormMuse provides no form backend. Adopters connect their own API, email service, automation, database, or form provider through `onSubmit`.

## Explicit V1 upload exclusion

No V1 Form Template will render an `<input type="file">`, drag-and-drop Upload Field, attachment picker, or upload-looking interaction. V1 values remain ordinary serializable form data rather than browser `File` or `File[]` values. Quote-request, project-inquiry, contact, and similar templates may request an optional portfolio, brief, folder, or document URL instead when that supports the visitor intent.

An Upload Field is not merely another visual control. It requires a dedicated contract for `File` values, accepted types, size and count limits, multipart or direct-upload transport, progress and cancellation, storage, authorization, malware handling, privacy, retention, failure recovery, and accessible drag-and-drop and keyboard behavior. FormMuse will not add dormant upload utilities, storage adapters, provider SDKs, metadata, tests, or backend infrastructure in V1.

Upload support may be reconsidered after demonstrated adopter demand. If pursued, it receives a separate decision and dedicated Form Templates or recipes with explicit value types, provider-agnostic boundaries where practical, backend guidance, accessibility requirements, secure handling documentation, compatibility tests, and truthful previews. This is a possible later direction, not a promised feature or date.

## What “unique” means

Every launch template must have its own recognizable design idea. It must differ meaningfully from existing templates in several of these areas:

- Central visual metaphor or art direction.
- Page or section composition.
- Form-container shape and spatial hierarchy.
- Interaction pattern or field progression.
- Animation choreography and feedback.
- Success and failure presentation.
- Intended audience or use-case emphasis.

The following do **not** create a new template by themselves:

- Recoloring an existing template.
- Changing fonts, border radii, shadows, or copy only.
- Adding or removing one field.
- Swapping Motion for CSS or GSAP without changing the experience.
- Mirroring a split layout.
- Reusing the same artwork with different icons.

Agents must compare a proposed concept with the existing template inventory before implementation. If the central idea can be described as “Template X, but with different colors/content,” redesign it.

## Hanging Gifts as the creative reference

The starting implementation lives at:

- `website-v2/components/contact/contact-layout.tsx`
- `website-v2/components/contact/hanging-gifts.tsx`

Use it as a quality reference for:

- A memorable visual signature: individually timed hanging gifts and intermittent sparkles.
- Layered composition: cinematic introduction, decorated transition, and a strong form surface.
- Motion with character rather than generic fade-ins.
- A form that feels integrated with the visual story.
- A designed success state rather than a plain text alert.
- Responsive reduction of decorative elements when space is limited.

The existing gift boxes and sparkles are portable in concept because they are authored as JSX SVG artwork. Keep that approach and add decorative accessibility treatment. The existing `next/image` cinematic background is page-specific and must be removed, rebuilt with CSS/SVG, or replaced by an explicitly distributed local asset in the FormMuse adaptation.

Do **not** distribute the existing page unchanged. Its FormMuse adaptation may preserve the complete page-scale journey—opening composition, hanging gifts, supporting contact content, interactive form, designed result state, alternative contact methods, and a concluding location treatment—when each part is made generic, portable, local, and included in the Template Block. It must remove or replace:

- `next/image` and all other Next.js-only APIs.
- Page routing, the live Google Maps embed, Cedar phone numbers, email addresses, social destinations, and Cedar-specific business copy. Replace the external map with original local CSS/SVG map-style artwork when the concluding location section remains part of the concept. Use polished generic contact examples and prevent preview-only links from navigating or launching external applications.
- Direct raw controls where a suitable local shadcn Base UI component exists.
- Local `setTimeout` submission logic; simulation belongs only in the preview wrapper.
- Unnecessary animation dependencies. The hanging sway can use Motion and sparkles can use scoped CSS; GSAP is allowed only if the final template genuinely needs its sequencing capabilities.
- Unscoped selectors and app-specific design tokens such as `cedar-green` or `cedar-orange` unless the distributed template defines safe scoped equivalents.
- Missing reduced-motion behavior.

Preserve the idea and craft quality, not the framework coupling or the original business page.

## Locked V1 technical baseline

- Node.js 24.18.0 LTS.
- pnpm 11.15.1.
- `@types/node` 24.13.3, matching the selected Node runtime major.
- Next.js 16.2.10 for the FormMuse website.
- React 19.2.7.
- TypeScript 6.0.3, the newest stable release supported by the selected linting toolchain.
- Tailwind CSS 4.3.3.
- shadcn 4.13.1 with Base UI as the sole supported Component Foundation.
- React Hook Form 7.82.0.
- Zod 4.4.3.
- `@hookform/resolvers` 5.4.0.
- Motion 12.42.2 when JavaScript animation is needed.
- GSAP 3.15.0 and `@gsap/react` 2.1.2 only when justified.
- pnpm for FormMuse repository development.

Pin the exact Node and pnpm versions in `package.json`, `pnpm-lock.yaml`, runtime-version files, GitHub Actions, and Cloudflare preview configuration. Node 26 is not a production runtime while it remains Current. Reaching LTS makes a newer Node major eligible for an explicit reviewed compatibility upgrade; it never updates the Build Toolchain automatically.

Select the newest stable dependency version officially compatible with the complete FormMuse toolchain, not merely the numerically newest publication. Do not suppress peer-dependency or unsupported-version warnings to force a newer package. TypeScript 7 remains excluded until the selected `typescript-eslint` and critical framework ecosystem officially supports it and the full quality gate passes.

Pin `shadcn` exactly at 4.13.1 in `package.json` and `pnpm-lock.yaml`. Local development, registry generation, and normal pull requests use this pin. Public installation commands use `shadcn@latest`; scheduled compatibility checks and every template or site publication must smoke-test the public latest-version command. Upgrade the internal pin only through a reviewed change.

User-facing installation documentation must still show pnpm, npm, Yarn, and Bun commands that invoke the shadcn CLI.

V1 uses one-step direct HTTPS registry-item URLs:

```text
https://<canonical-domain>/r/<canonical-slug>.json
```

Generate this direct URL for all four package-manager command variants. Do not require namespace configuration. A future `@formmuse/<slug>` alias may be added as an extra convenience, but the original direct URL remains supported. Never substitute an unverified or temporary hostname for `<canonical-domain>` in published documentation.

Generate exactly these command forms:

```bash
# pnpm
pnpm dlx shadcn@latest add https://<canonical-domain>/r/<canonical-slug>.json

# npm
npx shadcn@latest add https://<canonical-domain>/r/<canonical-slug>.json

# Yarn
yarn dlx shadcn@latest add https://<canonical-domain>/r/<canonical-slug>.json

# Bun
bunx --bun shadcn@latest add https://<canonical-domain>/r/<canonical-slug>.json
```

Never add `--overwrite`, `--yes`, or another automatic-confirmation flag to published commands. File conflicts must remain visible so the adopter or their coding agent makes an explicit choice.

Before CLI and Manual Installation, show a compact Requirements section:

- React.
- TypeScript.
- Tailwind CSS 4.
- shadcn configured with Base UI.

When shadcn is not initialized, show these setup commands separately from the FormMuse item command:

```bash
# pnpm
pnpm dlx shadcn@latest init --base base

# npm
npx shadcn@latest init --base base

# Yarn
yarn dlx shadcn@latest init --base base

# Bun
bunx --bun shadcn@latest init --base base
```

If an existing project uses Radix, state: “FormMuse V1 officially supports shadcn projects using Base UI. Radix projects are not currently supported.” Never migrate or reconfigure the project automatically. Recommend `shadcn info` to coding agents and for troubleshooting, but do not require it from every human installer.

All absolute URLs come from build-time configuration:

```text
FORMMUSE_DEPLOY_ENV=development|preview|production
FORMMUSE_SITE_URL=<absolute origin of this build>
```

- Development may default to `http://localhost:3000`.
- Preview CI supplies its temporary HTTPS origin, marks the deployment `noindex`, omits production sitemap entries and temporary canonical URLs, and may use its origin in registry commands for testing.
- Production requires the verified permanent HTTPS domain, generates canonical metadata and the public sitemap, and fails on a missing, insecure, or localhost origin.

Keep parsing, validation, and URL construction in one build-only `lib/formmuse` configuration module. Do not read these environment variables from client components or prefix them with `NEXT_PUBLIC_` unless a future client-only requirement is explicitly approved.

### Hosting and site analytics

Use Hostinger Premium static hosting as the Initial Production Host, deployed from GitHub. This is an operational launch choice rather than part of the product architecture. The generated `out/` directory must remain portable to Cloudflare Pages, Vercel, Firebase Hosting, or another static host without changing Form Templates, registry URLs beyond their Build Origin, or the application architecture.

GitHub Actions is the sole production build and verification authority. After all required checks pass on `main`, deploy the exact verified Production Artifact to Hostinger; do not ask Hostinger to rebuild source and do not commit `out/`. Protect the production job with a GitHub production environment, minimum permissions, branch restrictions, and a concurrency group that permits only one production deployment at a time.

Use a dedicated Production Deployment Credential with the narrowest access the real Hostinger plan supports. Do not promise an independently directory-scoped SFTP user before inspecting hPanel: Hostinger currently documents SFTP through the main FTP/SSH identity and documents directory-scoped accounts separately for FTP. During the Hostinger capability audit, prefer a restricted SSH key, SSH-only password, SFTP identity, or other supported mechanism over a broadly reusable account password. Store the selected credential only in the protected production environment and expose it only to the deployment job.

Use Cloudflare Pages only as the Preview Host for trusted same-repository branches and pull requests. Disable automatic Cloudflare production-branch deployments. Preview builds remain `noindex`, receive only preview-safe variables, and never receive production credentials. Forked pull requests run non-secret CI but receive no credential-bearing deployment preview.

Cloudflare's Git integration may rebuild previews independently. Keep its pinned Node and pnpm versions, frozen lockfile install, build command, and environment contract identical to GitHub Actions, while retaining GitHub Actions as the authority for the Production Artifact.

Do not upload a production release over the live site file by file without protection. The Hostinger deployment prototype must prove a safe mechanism that uploads to a temporary or versioned release location, verifies completeness, promotes only a complete artifact, retains at least the previous successful release, supports rollback, and prevents concurrent production deployments. Record the exact mechanism after testing the real account's filesystem and SSH/SFTP capabilities during the Hanging Gifts vertical slice.

The FormMuse website may use Site Analytics to understand aggregate pageviews, visitor estimates, referrers, broad device/browser context, coarse geography, and performance. Keep the analytics integration provider-agnostic behind one small site-only adapter owned by `app/(site)/layout.tsx` or `components/site`; never load it from the minimal root layout or `app/(preview)/layout.tsx`.

Site Analytics loads only when `FORMMUSE_DEPLOY_ENV=production` and the selected provider's required public configuration is present. It must be absent in development, branch and pull-request previews, isolated Template Preview routes and iframes, `registry/base`, generated registry items, Manual Installation source, compatibility fixtures, and distributed templates. Analytics failure must never affect site navigation, documentation, registry downloads, previews, or copying and installing templates.

Any selected provider must offer a suitable free launch tier or be explicitly approved, work independently of the static hosting provider, collect only aggregate data, and avoid cookies, `localStorage`, fingerprinting, cross-site tracking, session replay, heatmaps, advertising profiles, and collection of form values. Do not send email addresses, names, message contents, search text, copied code, Agent Prompts, query strings that may contain sensitive data, or custom event payloads containing visitor content. Do not use analytics to create public popularity scores, rankings, or catalog metadata in V1.

Document the chosen provider, collected categories, purposes, retention, data location where known, and contact or opt-out rights in FormMuse's public privacy notice. Review provider behavior and terms before enabling it and whenever the provider changes. Allow only the minimum analytics script and connection origins in the production Content Security Policy; a provider change must update and test that allowlist. No analytics credential may be treated as a server secret inside the static client bundle.

For the initial public launch, use Cloudflare Web Analytics as the replaceable Launch Analytics Provider while the site is hosted on Hostinger Premium. Integrate its manual JavaScript beacon only through the site-only analytics adapter. Load it only in production, only on `(site)` routes, and only when its public site token is configured. Do not place it in the root layout, preview layout, preview iframe document, registry source or output, documentation examples, or distributed files.

The launch integration is limited to Cloudflare Web Analytics' aggregate page-traffic and performance capabilities. Do not build a custom-event layer, capture query strings to recreate UTM attribution, add tracking parameters to copied links, or work around missing funnel and campaign features. Re-evaluate providers after demonstrated traction instead of expanding the launch beacon beyond the Site Analytics policy.

For a Hostinger-served production build, allow only the reviewed Cloudflare beacon origin in `script-src` and its reporting origin in `connect-src`, currently `https://static.cloudflareinsights.com` and `https://cloudflareinsights.com`. Do not add broader Cloudflare wildcards. Cloudflare's manually embedded beacon is not version-pinned and currently cannot use Subresource Integrity, so document this supply-chain exception, monitor provider changes, keep the script non-blocking, and verify that blocking or failing the beacon cannot affect the website. Reconfirm the required origins, privacy behavior, retention, free-tier availability, and limitations immediately before launch and after provider updates.

## Canonical repository structure

FormMuse V1 is a Public Source Repository. Publish the complete original repository—including the static Next.js website and its layouts, documentation system, registry source and generation tooling, all Form Templates, examples, tests, compatibility fixtures, CI configuration, and build scripts—under the root MIT License. The goal is the same transparent copy-paste ownership model demonstrated by Magic UI; do not copy Magic UI's site design, branding, prose, or assets.

Build the FormMuse application at the workspace root. Keep `website-v2/` as an untouched Local Source Reference outside FormMuse version control, builds, tests, deployment, and MIT licensing. Keep workspace-only third-party `.agents/` skills, `example tech stack.md`, and `.DS_Store` local as well. Record these owner-local paths in `.git/info/exclude`; do not delete, move, publish, or silently relicense them. Adapt only reviewed original and redistribution-safe Hanging Gifts source into the canonical FormMuse registry directory.

The root MIT License applies to FormMuse-authored software and associated documentation. Preserve separate notices for any Redistribution-safe Asset whose licence requires them; do not imply that FormMuse can relicense third-party work beyond its actual terms. Keep all credentials, deployment tokens, private security reports, unpublished business material, and environment-specific secrets outside the repository. Commit example environment files with names and safe placeholders only.

Keep the standard root `LICENSE` text unchanged. Add a concise root `TRADEMARKS.md` and `public/brand/README.md` before public launch. `TRADEMARKS.md` governs use of the FormMuse name, logo, domain references, official affiliation, and endorsement claims. `public/brand/README.md` lists the exact Brand Asset files excluded from MIT and their permitted uses; do not rely on a vague exclusion for an undefined “official visual identity.”

The root README and `public/brand/README.md` must state clearly:

> FormMuse-authored software and documentation are licensed under the MIT License. The FormMuse name, logo, and brand assets identified in `public/brand/README.md` are not licensed under MIT and are subject to the FormMuse trademark and brand policy.

The brand policy must allow truthful, non-misleading references such as “built with FormMuse,” “compatible with FormMuse,” and “forked from FormMuse,” while prohibiting a fork or derivative from presenting itself as the official FormMuse project or implying sponsorship, endorsement, or affiliation. It must not claim that the policy itself registers a trademark, grant control over unrelated uses of the word, or add restrictions to MIT-covered source. Obtain qualified legal review in the relevant jurisdictions before publishing the final policy or making broader protection claims.

Public source does not change the Curated Library model. V1 remains owner-authored and has no community submissions, public uploads, creator profiles, marketplace, moderation system, or GitHub contribution workflow for new Form Templates. People may exercise their MIT rights to fork and modify the software, but a fork does not become part of the official FormMuse catalog.

## Website information architecture

Keep the V1 website deliberately lean. Use these canonical public routes:

```text
/
/templates
/templates/[slug]
/docs/introduction
/docs/installation
/docs/template-api
/docs/connecting-a-backend
/docs/customizing-templates
/docs/using-with-agents
/docs/accessibility
/docs/changelog
/privacy
/license
/trademarks
/security
```

Generate `/templates/[slug]` and `/preview/[slug]` paths statically from the registry. Preview routes are internal presentation surfaces: exclude them from primary navigation, breadcrumbs outside preview chrome, Site Search, sitemap generation, canonical metadata, analytics, and indexing. They must declare `noindex` under the existing preview policy.

Primary navigation contains Templates, Guides, GitHub, Site Search, and a theme toggle. “Guides” enters the documentation area at Introduction. Use “Templates” in compact navigation and “Form Templates” where a descriptive page heading is useful. Site Search is an accessible client-side command interface over build-time Published Template and guide data, not a runtime search service or required route. Ensure all content remains reachable through ordinary links when search is unavailable; manage dialog naming, focus, keyboard operation, and result announcements accessibly. Never send search text to Site Analytics.

The homepage introduces FormMuse, links directly to the catalog and installation path, presents selected Published Templates and category entry points, explains copy-paste ownership and the provider-agnostic Submission Connection, describes agent-friendly installation, and includes a concise project mission. Do not add a separate About page in V1.

Keep V1 catalog discovery intentionally small. `/templates` provides exactly four Catalog Views: All, Contact, Newsletter, and Quote Request. Use the existing controlled category query parameter for the three filtered views, for example `/templates?category=contact`, while All uses `/templates`. Preserve the intentional `registry.json` order in All and within each category. Generate views only from Published Templates; deprecated templates remain accessible by their direct Template Page under the lifecycle policy but do not appear in ordinary catalog browsing.

Every catalog card includes a Catalog Teaser: a live, non-interactive opening-window view loaded from the template's same-origin static preview route. Render the card's semantic title, concise description, and destination link in the parent document immediately. The teaser is decorative supporting media: it must not enter the tab order, capture pointer input, duplicate the card's accessible name, or become the only way to understand or open the template.

Do not mount all 20 Complete Compositions during initial catalog render. Reserve stable teaser space, show a lightweight local fallback while inactive, and mount a teaser only when it is close enough to the viewport to be useful. Pause or remove off-screen teaser animation so catalog scrolling does not leave every visited template consuming CPU. Respect reduced motion in teaser and full-preview contexts. Use the Hanging Gifts vertical slice to measure loading, main-thread work, scrolling, memory, and animation behavior before choosing exact activation margins, off-screen retention, or numeric performance budgets.

The Catalog Teaser shows only the template's opening viewport and cannot be scrolled or used as a miniature form. Selecting its surrounding card opens the Template Page, where the complete scrollable and interactive preview is available. Do not create separate teaser artwork or a second implementation of the design; both teaser and full preview render from the same template source and static preview infrastructure.

Do not add a catalog-specific search box, sorting controls, result counts, active-filter chips, or filters for Interaction Depth, appearance, animation intensity, animation technology, layout, fields, or tags in V1. Site Search may match template title, description, Primary Category, tags, and included fields for visitors who need more specific discovery. Implementation dependencies remain visible on each Template Page rather than becoming catalog filters.

Every category query-string view uses `/templates` as its canonical URL and must not create separately indexed catalog pages. The category controls must use links or progressively enhanced navigation so all four views remain reachable and understandable without Site Search.

`/docs/template-api` is the canonical general guide for the universal V1 contract: `onSubmit`, parsed values, `defaultValues`, `className`, exported schemas and values types, pending/failure/success behavior, duplicate-submit prevention, explicit retry, and reset behavior. Template Pages document their concrete exported names, fields, props, examples, and template-specific notes without redefining the shared contract inconsistently.

`/privacy`, `/license`, `/trademarks`, and `/security` present the corresponding public policies in readable website form while the repository retains the authoritative source files where applicable. The security page provides the approved private reporting path without exposing private reports or unresolved vulnerability details.

Author a custom `app/not-found.tsx` and verify the static export produces the host-compatible not-found artifact. Do not treat `/404` as a canonical content route. Do not add Blog, Showcase, Pricing, Pro, Community, or a separate About section in V1; introduce a new top-level area only when real maintained content and a product need exist.

All agents must use this one-application layout:

```text
FormMuse/
├── app/
│   ├── layout.tsx                         # minimal shared html/body only
│   ├── (site)/
│   │   ├── layout.tsx                     # site shell and site styling
│   │   ├── page.tsx
│   │   ├── not-found.tsx                  # custom static not-found UI
│   │   ├── templates/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── docs/                           # fixed public guide routes
│   │   ├── privacy/page.tsx
│   │   ├── license/page.tsx
│   │   ├── trademarks/page.tsx
│   │   └── security/page.tsx
│   └── (preview)/
│       ├── layout.tsx                     # isolated preview styling
│       └── preview/[slug]/page.tsx
├── components/
│   ├── site/
│   ├── template-page/
│   ├── preview/
│   └── ui/
├── lib/formmuse/
│   ├── formmuse-meta.schema.ts
│   ├── registry.ts
│   ├── catalog.ts
│   └── documentation.ts
├── registry/
│   └── base/
│       └── <template-slug>/
│           ├── <template-slug>-form.tsx
│           ├── <template-slug>-form.schema.ts
│           ├── components/                # optional distributed support
│           ├── examples/                  # repository-only
│           ├── preview.tsx                # repository-only
│           ├── <template-slug>.test.tsx   # repository-only
│           └── changelog.md                # repository-only
├── tests/
│   ├── compatibility/
│   ├── e2e/
│   └── visual/
├── scripts/
├── public/
│   ├── brand/
│   │   └── README.md                      # exact assets excluded from MIT
│   └── r/                                 # generated registry JSON
├── registry.json                          # single authored manifest
├── LICENSE                                # MIT for FormMuse-authored source
├── TRADEMARKS.md                          # name, logo and affiliation policy
├── SECURITY.md                            # private vulnerability reporting
├── CONTEXT.md
└── reference.md
```

The root layout must not add the FormMuse website shell or site-specific styles to preview routes. Both template and preview slug routes are generated statically from `registry.json`. Compatibility fixtures are test inputs, not workspace packages or separately maintained applications.

`public/r/` and `out/` are Generated Output. Never edit either manually, always recreate them through the build, and never commit `out/`.

## Compatibility boundary

Distributed Form Templates must work in both Next.js and Vite React applications. They must not use:

- `next/image`, `next/link`, Next.js routing, or other Next-only modules.
- Server Actions, API routes, server components as a requirement, middleware, ISR, or server functions.
- A FormMuse server, database, CMS, runtime sandbox, or hosted submission service.
- Direct imports from `@base-ui/react`.
- Radix-specific source or assumptions. Radix is not supported or tested in V1.

Interactive distributed components should include `"use client"` when required by Next.js; Vite safely treats the directive as a string expression. Prefer inline SVG, CSS artwork, or redistribution-safe local assets over framework image components.

### Browser support window

At each tagged FormMuse release, officially support the current and immediately previous stable major releases of desktop Chrome, Edge, Firefox, and Safari, plus iOS Safari and Android Chrome. Do not support Internet Explorer or other legacy browsers. A supported version must also satisfy Tailwind CSS 4's own minimum browser requirements; FormMuse will not add compatibility shims for a browser outside the framework baseline.

Support means that core rendering, input, validation, keyboard and assistive-technology operation, Submission Connection behavior, Form States, responsive layout, and Template Preview controls work correctly and the template remains visually polished. Pixel-identical rendering across engines is not required. A nonessential animation or decorative effect may progressively simplify when an unsupported optional platform feature is absent, but content, meaning, controls, focus, contrast, and submission behavior may not degrade.

Use a pinned Playwright version and its matching Chromium, Firefox, WebKit, and mobile-emulation projects as the continuous automated baseline on every pull request. This is engine and emulation coverage, not evidence that branded Safari or a physical mobile device passed. Playwright WebKit must never be reported as Safari, and an emulated device profile must never be reported as real-device testing.

Before publishing an individual Form Template, smoke-test it in the current stable branded Chrome, Edge, Firefox, and Safari browsers and on current real iOS Safari and Android Chrome devices. A device owned by the project or a reputable real-device testing cloud qualifies; viewport or user-agent emulation does not.

Run the complete current-and-previous-major Browser Support Window before the initial public launch, every tagged FormMuse release, and any publication that changes shared Control Primitives, compatibility infrastructure, registry installation behavior, preview infrastructure, or another shared layer capable of affecting multiple templates. Historical versions may be exercised through maintained test environments or a reputable browser/device service. Record exact browser, engine, operating-system, and device versions in release evidence. Never advertise support for a version that has not actually passed the applicable matrix.

## shadcn-first controls

Use local shadcn control paths, for example:

```tsx
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
```

Use the suitable local shadcn Base UI components for Input, Textarea, Field or Label, Button, Checkbox, Radio Group, Select, Calendar, Popover, and Command. Add only the Control Primitives used by that template to `registryDependencies`.

Semantic HTML remains correct for `<form>`, headings, paragraphs, lists, sections, decorative structures, status regions, and cases with no suitable shadcn component. Do not use raw HTML controls merely to save a negligible dependency.

Never install an entire FormMuse design system, globally restyle an adopter's controls, directly overwrite customized shadcn files, or add controls the template does not use.

## Distributed file contract

Use a predictable small multi-file structure:

```text
<template-slug>/
├── <template-slug>-form.tsx
├── <template-slug>-form.schema.ts
└── <supporting-component>.tsx       # only when genuinely needed
```

The main component and schema module are always distributed. Supporting components are optional. Avoid both a giant all-in-one file and unnecessary one-component-per-file fragmentation.

Every installable Form Template is a top-level `registry:block`:

- `registry:component` for template-owned React components.
- `registry:lib` for schemas and utilities.
- `registry:hook` for a genuinely necessary template-owned custom hook.
- `registryDependencies` for local shadcn Control Primitives.
- `dependencies` for npm packages.

Give every distributed file an explicit target under the same `@components/formmuse/<canonical-slug>/` directory. Never list repository-only tests, previews, examples, documentation, changelogs, or snapshots in installable `files`.

Prefer styles that remain local to the installed folder. Use registry-level `css` or `cssVars` only when a shared keyframe, utility, or variable is genuinely required. Because those mechanisms modify adopter global CSS, scope every name to the Canonical Slug and document the exact changes in Manual Installation.

Use this styling hierarchy:

1. Tailwind CSS for ordinary styling and simple transitions.
2. A colocated `<canonical-slug>-form.module.css` for complex selectors, pseudo-elements, and keyframe animations.
3. Registry-level `css` or `cssVars` only when genuinely global behavior is unavoidable.

Distribute a CSS Module as `registry:file` with an explicit target beside the other template files and import it relatively. Keep reduced-motion behavior inside the module. Never inject runtime `<style>` elements or use `dangerouslySetInnerHTML` to install CSS. The Hanging Gifts adaptation must move its generated sparkle keyframe string into its Template Stylesheet.

Registry targets install the folder under:

```text
@components/formmuse/<template-slug>/
```

Use relative imports between template-owned files:

```tsx
import { hangingGiftsContactFormSchema } from "./hanging-gifts-contact-form.schema"
import { HangingGifts } from "./hanging-gifts"
```

This relative-import rule does not apply to local shadcn controls; those continue to use the adopter's configured UI import paths.

Keep these repository-only and exclude them from installation:

- Tests and test fixtures.
- Preview wrappers and static preview routes.
- Type-checked documentation examples.
- Documentation metadata and general guides.
- Per-template changelogs.
- Visual-regression snapshots.

The CLI payload and Manual Installation must expose exactly the same distributed source files.

## Schema and values contract

The schema module must export a clearly named Zod schema, inferred values type, and complete internal defaults:

```ts
import { z } from "zod"

export const hangingGiftsContactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter your name.")
    .max(100, "Use 100 characters or fewer."),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .max(254, "Use 254 characters or fewer.")
    .email("Enter an email address like name@example.com."),
  message: z
    .string()
    .refine((value) => value.trim().length > 0, "Enter a message.")
    .refine(
      (value) => value.trim().length >= 10,
      "Enter at least 10 characters.",
    )
    .max(5000, "Use 5,000 characters or fewer."),
})

export type HangingGiftsContactFormValues = z.output<
  typeof hangingGiftsContactFormSchema
>

export const hangingGiftsContactFormDefaultValues: HangingGiftsContactFormValues = {
  name: "",
  email: "",
  message: "",
}
```

Names must identify the template; avoid generic exports such as `formSchema` or `FormValues`, which collide when agents compose multiple templates.

Every published schema must produce only Transport Values:

```ts
type TransportValue =
  | string
  | number
  | boolean
  | null
  | TransportValue[]
  | { [key: string]: TransportValue }
```

Numbers must be finite; do not submit `NaN` or `Infinity`. Do not expose `Date`, `File`, `Map`, `Set`, `bigint`, functions, symbols, promises, DOM objects, events, custom class instances, or another value that needs custom serialization. Avoid own properties whose runtime value is `undefined`. Represent optional empty data deliberately with a documented empty string, `null`, empty array, or omitted key, and keep complete internal defaults consistent with that choice.

Date and time fields use documented ISO 8601-compatible strings with explicit semantics:

- Calendar date without a time: `YYYY-MM-DD`.
- Wall-clock time without a date: `HH:mm`, adding seconds only when the template requires them.
- An absolute instant: an RFC 3339 timestamp containing `Z` or an explicit UTC offset.

A Calendar or other Control Primitive may use a temporary `Date` internally for its UI, but the schema output, exported values type, defaults, and `onSubmit` value must contain the documented string. Do not call `toISOString()` for a date-only choice when that could shift the visitor's calendar date through timezone conversion.

`onSubmit` always receives the schema's successful Parsed Values, and the public values type must be declared from `z.output<typeof templateSchema>`. `z.infer` is equivalent for an ordinary Zod schema, but `z.output` makes the public boundary explicit when reviewing a template.

Normalization must be conservative, schema-defined, documented, and tested:

- Trim accidental leading and trailing whitespace from ordinary single-line fields such as names, email addresses, phone strings, and URLs unless whitespace is meaningful to that field.
- Preserve textarea wording, leading and trailing content, and internal line breaks in the submitted value. Validation may inspect `value.trim()` to reject an effectively empty message without transforming the original text.
- Do not silently lowercase email addresses, reformat names or phone numbers, rewrite URLs, normalize Unicode, infer units, or otherwise reinterpret visitor content.
- When a field promises a number, convert it through an explicit field parser or narrowly defined schema preprocessing and return a finite number. Blank input remains empty or invalid according to the Form Shape; it must never become `0` accidentally. Reject `NaN`, `Infinity`, and ambiguous partial input.
- Document every transformation that affects submitted output in structured usage notes and test the raw-input-to-output examples.

Avoid type-changing transformations when the control can write the documented Transport Value directly. If a justified schema has different input and output types, use React Hook Form's input and transformed-output generics correctly while keeping only the output type as the public `FormValues` contract.

### Field length contract

Every visitor-authored free-text field must define an intent-appropriate maximum length. Use the same numeric limit in the Zod schema and the native control's `maxLength`; never use one arbitrary global maximum for names, email addresses, URLs, subjects, short notes, messages, and project briefs. Complete defaults and provided `defaultValues` must satisfy the same contract.

Longer fields whose limit affects writing may show a visible character counter, for example `438 / 1,000`. Give the counter an instance-unique ID and include it in that field's `aria-describedby` references alongside any hint and error. The counter is supporting text, not a replacement for validation or a label.

Do not make the changing counter an `aria-live` region and do not force a screen-reader announcement on every keystroke. If a template provides spoken threshold feedback, announce only meaningful transitions—such as entering a near-limit range or reaching the limit—and avoid repeating the same warning. Short fields normally need no counter; their documented constraint and validation message are enough.

Test each Field Length Contract at the limit and one unit beyond it through both the Zod schema and rendered control. FormMuse's client limit improves usability and constrains its own Parsed Values, but adopters must enforce the corresponding maximum again at the Submission Trust Boundary.

## Universal component API

Every template exposes this V1 baseline, using its own values type:

```ts
export interface HangingGiftsContactFormProps {
  onSubmit: (values: HangingGiftsContactFormValues) => Promise<void>
  defaultValues?: Partial<HangingGiftsContactFormValues>
  className?: string
}
```

Limited template-specific props are allowed only when they provide meaningful reusable behavior or content. Do not expose a giant configuration object or props for every color, radius, animation duration, decorative coordinate, or visual detail. Adopters own the source and can edit it.

`className` is the Root Class Extension. Apply it only to the outermost rendered element and merge it after the template's default root classes with the adopter's normal shadcn `cn` utility:

```tsx
<section className={cn(styles.root, "relative w-full", className)}>
```

This ordering lets intentional conflicting Tailwind utilities supplied by the adopter win where `cn` can resolve them, while preserving scoped CSS Module behavior. Do not spread `className` onto an inner form or multiple elements. Do not expose a universal `classNames` slot object, inline-style configuration object, theme object, or root `style` prop in V1. Templates may expose a narrowly justified template-specific class prop only if a real reusable composition requires it; ordinary deep customization remains an edit to the copied source.

Do not expose `schema`, `fields`, validation-rule, validation-message, or step-definition configuration props in V1. The Form Shape is part of the designed, adopter-owned source: every template exports its named Zod schema and inferred values type, while the fields, messages, defaults, matching UI, accessibility associations, animation, layout, and any step placement remain coordinated in the copied files.

When an adopter or coding agent changes the Form Shape, update the schema, inferred type, complete defaults, rendered fields, labels and error associations, step field maps when present, structured metadata, examples, and relevant tests together. Do not permit a schema/UI mismatch such as validating a field that is not rendered or rendering a field absent from the values type.

Templates ship with complete designed default copy. They may expose a few optional template-specific Content Slots such as `title`, `description`, or `successMessage` only where the composition has a natural reusable slot. Do not require these props across every template, create a universal `content` object, use render props for ordinary wording, or expose every label, hint, button, and decorative phrase. Validation and safe failure copy remain template-authored. Document every Content Slot in `meta.formmuse` and the Props table; deeper copy changes and localization are source edits in V1.

## Initial values

`defaultValues` are initial-only, not controlled. Merge them with complete internal defaults once when the component mounts and retain that snapshot for explicit resets:

```tsx
const [initialValues] = React.useState<HangingGiftsContactFormValues>(() => ({
  ...hangingGiftsContactFormDefaultValues,
  ...defaultValues,
}))

const form = useForm<HangingGiftsContactFormValues>({
  resolver: zodResolver(hangingGiftsContactFormSchema),
  defaultValues: initialValues,
})
```

Do not reapply changed `defaultValues` props. An explicit “Send another” action resets to the original `initialValues`. Dynamic controlled values are outside V1.

### Ephemeral drafts

Every V1 Form Template keeps unsubmitted values only as an Ephemeral Draft inside its mounted React Hook Form instance. Templates must not read or write draft values through `localStorage`, `sessionStorage`, IndexedDB, cookies, Cache Storage, service workers, browser history state, query parameters, or URL fragments. They must not add autosave, draft recovery, cross-tab synchronization, unload beacons, or another hidden persistence mechanism.

When the template unmounts, navigation replaces the page, or the document reloads, FormMuse-owned draft state ends. This is not a promise to defeat browser-managed autofill, form restoration, password managers, or adopter-added persistence; the existing semantic `autoComplete` policy remains in force. Documentation must describe the FormMuse behavior accurately and must not claim that the browser itself can never retain or suggest a value.

An adopter may deliberately add persistence to their copied source, but then owns consent, disclosure, retention, expiry, deletion, security, multi-tab behavior, schema migration, and testing. Persistence is not a V1 prop, shared utility, registry dependency, preview feature, or agent-default modification.

### Navigation ownership

Form Templates must not register `beforeunload`, install framework route blockers, intercept links or browser back/forward navigation, manipulate history to keep a visitor on the page, or show a leave-confirmation dialog for an Ephemeral Draft. They retain values while the form remains mounted—including between steps in a Step Flow—but refreshing, navigating away, closing the tab, or unmounting ends that form session without a FormMuse warning.

Navigation Ownership belongs to the adopter application because only it knows whether the page is a short public interaction or a high-stakes workflow. An adopter may add application-level protection around copied source when justified. FormMuse will not expose a `warnOnLeave`, `isDirty`, navigation-blocker, or router-integration prop in V1, and agents must not add one by default.

## Submission contract and states

The universal contract is:

```ts
onSubmit: (values: FormValues) => Promise<void>
```

Required behavior:

1. Validate with React Hook Form, Zod, and the Zod resolver, producing Parsed Values.
2. Prevent duplicate submission while the first promise is pending.
3. Await the adopter's `onSubmit(values)`.
4. Treat resolution as success.
5. Treat a thrown error or rejected promise as failure.
6. Never expose the raw thrown value or error message to the visitor.
7. Show safe template-defined failure copy and preserve entered values after failure.
8. Show the designed success state indefinitely after success.
9. Never automatically clear, redirect, dismiss, or return to the form.
10. Optionally provide an explicit “Send another” action when repeated submission makes sense; it resets values and submission state.

When `onSubmit` rejects, preserve the current values and present the designed failure state only while the form remains mounted. Any new attempt must be an Explicit Retry initiated by the visitor through the visible submit or “Try again” action. Do not automatically retry, schedule a resend, queue an offline submission, register Background Sync, use a service worker for delivery, or durably store a failed or pending submission. FormMuse cannot know whether the backend accepted the first request before the client observed failure and therefore must not assume idempotency or risk a duplicate message, signup, or quote request.

Refreshing, navigating, closing, or unmounting discards the values, pending state, and failure state under the Ephemeral Draft policy. Browser connectivity changes do not trigger submission. An adopter that needs retries, idempotency keys, offline delivery, or durable queues must implement and secure that behavior behind its own Submission Connection and backend.

Do not add a FormMuse response object, `onSuccess`, or `onError` prop in V1. Adopters perform analytics, navigation, and other side effects inside `onSubmit` before it resolves.

The preview wrapper supplies a deterministic simulated `onSubmit`; distributed production source must not contain fake timers or network calls.

### Telemetry-free templates

Every distributed Form Template is Telemetry-free. Do not include analytics or telemetry SDKs, tracking pixels, hidden images, beacons, fingerprinting, visitor identifiers, analytics-specific props such as `onAnalyticsEvent`, automatic event emission, or FormMuse-owned network requests. Do not declare analytics packages in `dependencies` or registry dependencies. Internal event handlers may implement visible form behavior such as validation, step movement, reset, and submission, but must not report those interactions elsewhere.

The universal functional integration remains `onSubmit`. Adopters may add analytics inside that callback or in their surrounding application, but optional tracking must handle its own failures and must not accidentally reject a submission after the backend has already succeeded. For example:

```tsx
onSubmit={async (values) => {
  await sendForm(values)

  try {
    await Promise.resolve(analytics.track("contact_form_submitted"))
  } catch {
    // Optional telemetry must not turn a completed submission into failure.
  }
}}
```

Do not pass submitted field values to analytics by default; that is a separate adopter-owned privacy and data-governance decision.

FormMuse website Site Analytics follow the separate production-only policy above. Website-only analytics code must remain outside `registry/base`, generated registry items, Manual Installation source, compatibility fixtures, and Template Preview iframes. Installing or rendering a Form Template must never contact FormMuse.

## Submission trust boundary and abuse prevention

Client-side Zod validation exists to give visitors prompt, designed feedback. It is bypassable and must never be described as a security boundary. Every value passed through `onSubmit` remains untrusted. Adopters must validate syntactic and business rules again at the trusted backend before storing, sending, rendering, or acting on a submission.

FormMuse V1 provides no built-in CAPTCHA provider, honeypot, rate limiter, bot score, spam filter, privacy system, consent guarantee, or anti-abuse security promise. Do not add provider SDKs, remote challenge scripts, secret keys, or hidden anti-spam fields to the universal template API.

### Legal copy and consent

Do not add a universal privacy checkbox, consent field, legal disclaimer, Terms acknowledgement, or policy link to Form Templates. Contact and quote-request templates should not request unnecessary consent by default. Legal Copy or a visible consent control may appear only when it is integral to a particular Form Shape and dominant visitor intent; it is template-specific rather than part of the universal API.

Any included Legal Copy is clearly documented as placeholder content that the adopter must review and replace for their jurisdiction, organization, processing purpose, backend, and retention practices. FormMuse does not provide legal advice or claim that a field or sentence makes an implementation compliant. Never pre-check consent. When affirmative consent is a required field, its visible wording, native or ARIA semantics, Zod rule, default value, validation message, and Submitted Values must agree.

Do not ship fake `#` policy links, FormMuse's own policy URLs, or framework-specific navigation. A template that genuinely needs policy links may expose a small, documented template-specific URL prop or use an obvious source placeholder that must be replaced before production; the Template Preview must keep the interaction local and make no network request.

Provider-dependent assurances such as “No spam,” “Unsubscribe anytime,” guaranteed response times, delivery frequency, confidentiality, deletion, or data handling must not appear as FormMuse's default promise because the provider-agnostic Submission Connection cannot enforce them. Adopters may add accurate promises they can operationally honor. Newsletter templates use polished but neutral default copy unless the adopter supplies and owns a stronger assurance.

The adopter is responsible for:

- Server-side validation with sensible type, allowlist, length, and business-rule checks.
- Context-appropriate output encoding and safe downstream handling.
- Rate limiting, abuse monitoring, logging, spam controls, and retry or idempotency rules appropriate to the backend.
- Privacy notices, consent records, data minimization, retention, deletion, and applicable legal requirements.
- Keeping provider secret keys exclusively in a trusted backend or secret store.
- Verifying every CAPTCHA or challenge token server-side before accepting a submission.

FormMuse may later publish optional recipes for Cloudflare Turnstile, reCAPTCHA, honeypots, rate limiting, and common backend providers. Recipes remain outside the universal component API and Template Block, clearly identify their backend requirements and privacy tradeoffs, and never cause FormMuse's own Template Previews to make network requests. A honeypot is documented only as one optional signal, never as a security guarantee.

Submission Feedback must use one announcement mechanism per state:

- While pending, set `aria-busy="true"` on the form and disable its controls with a native `<fieldset disabled>`.
- Show visible progress text such as “Sending…”; a spinner is optional decoration, never the only indicator.
- Place the pending polite `role="status"` outside the busy form subtree so `aria-busy` cannot defer it.
- On failure, re-enable the fieldset, preserve values, and focus a visible failure heading or summary with `tabIndex={-1}`.
- On success, focus the designed success heading with `tabIndex={-1}` after it replaces the form.
- Do not add `role="alert"`, `role="status"`, or another live region containing the same focused result message.
- Update semantics and focus immediately; animation follows state and never delays it.

React Hook Form must capture validated values before the awaited call. The disabled fieldset therefore cannot change the values passed to `onSubmit`.

## Accessibility requirements

Every template must include:

- Visible labels, not placeholder-only identification.
- Programmatic label/control association.
- Helpful field descriptions where format or intent is not obvious.
- Accessible inline validation tied to the corresponding control.
- `aria-invalid` and error references where appropriate.
- A clear keyboard-visible focus state.
- Logical tab and reading order at every breakpoint.
- No keyboard traps in Select, Calendar, Popover, Command, or animated UI.
- Disabled or otherwise guarded duplicate submission while pending.
- An announced submitting, success, and failure state using an appropriate live region or focus-management pattern.
- Sufficient text, control, focus, and error contrast.
- Touch targets and spacing suitable for mobile use.
- No information communicated only through color or motion.

Use one Requirement Marker policy across every Form Template:

- Request only information genuinely required for the visitor's intent and the adopter's next action.
- Place the visible sentence “All fields are required unless marked optional.” immediately before the form's opening element. Give it an instance-unique ID and associate it with the form through `aria-describedby` when that does not replace other necessary form-level description.
- Append the literal visible text “(optional)” to every optional field label. Do not append “(required)” to every other label after the form-level rule has established the convention.
- Do not use color, placeholder text, styling, or an unexplained asterisk as the only Requirement Marker.
- Put native `required` on required semantic inputs, textareas, and selects even though the form uses `noValidate`. Do not redundantly add `aria-required` to those native controls.
- Apply `aria-required="true"` to the appropriate control or group role for a required custom or composite Base UI control that cannot express native `required` semantics. ARIA communicates the state but does not replace Zod validation or interaction behavior.
- Make Zod, complete defaults, optional empty-value representation, visible labels, native or ARIA semantics, and step validation agree. An optional field must accept its documented empty Transport Value; a required field must reject it.

For checkbox and radio groups, state the selection requirement in the visible legend or group instruction and apply semantics at the correct group or control level. Do not mark every checkbox required when the actual rule is “choose at least one.”

Use consistent Validation Copy throughout every Form Template:

- Write short, specific, respectful, actionable messages that tell the visitor what to enter or change.
- Avoid blame, jokes at the visitor's expense, “invalid” without explanation, implementation terminology, Zod issue codes, field paths, stack details, and raw error objects.
- Author messages explicitly in the template's schema or a narrow template-owned mapping. Never expose Zod's default or technical output directly and never expose raw backend errors.
- Order checks by usefulness: missing required value first, then basic type or format, then length or range, then cross-field or business constraints that can only be evaluated after the individual values are usable.
- Configure React Hook Form with `criteriaMode: "firstError"` and render only the highest-priority currently relevant message for each field or field group. Do not stack every failed rule beneath one control.
- Attach cross-field feedback to the control or named group the visitor can act on. If multiple controls participate, use concise group guidance without duplicating the same message under each field.
- Keep messages stable while correcting input; do not replace one message with a less useful downstream failure until the higher-priority problem is resolved.
- Keep Validation Copy in adopter-owned source and test it as part of that Form Template. Do not expose validation messages through a universal prop object.

Inline errors remain programmatically associated with their field. They do not each need an assertive live region; first-error focus and the existing description relationship provide the primary announcement path without making change-based correction noisy.

Use submit-first Validation Timing:

```ts
useForm<FormValues>({
  mode: "onSubmit",
  reValidateMode: "onChange",
  criteriaMode: "firstError",
  shouldFocusError: true,
  resolver: zodResolver(templateSchema),
  defaultValues: initialValues,
})
```

Before the first submission attempt, show no validation errors. On submit, validate the full form and focus the first invalid control. Afterward, revalidate erroneous fields as they are edited and remove corrected errors promptly.

Add `noValidate` to `<form>` so Zod and FormMuse own visible validation messages. Retain semantic `type`, native `required` where applicable, `aria-required` for custom controls when needed, `aria-invalid`, and linked descriptions and errors. Verify that every shadcn control forwards focus correctly.

For a multi-step Form Template:

- Use one Zod schema, one exported values type, and one React Hook Form instance with `shouldUnregister: false`.
- Preserve values in both directions.
- “Next” validates only the current step and focuses its first invalid field.
- “Back” does not validate or discard values.
- Final submission validates the complete schema and invokes `onSubmit` exactly once.
- If final validation finds an earlier-step error, return to the earliest affected step and focus its first invalid field.
- Use an ordered named progress indicator, visible “Step N of M” context, and `aria-current="step"`.
- Focus the new step heading after rendering it.
- Keep state client-side; do not use routing, URL state, server state, or multiple form instances.
- Make step transitions reduced-motion safe and never delay semantic updates.

Intermediate Enter submission must run the same step-aware submit path as “Next” and must never invoke final `onSubmit`. Do not attach a global Enter key handler: textareas and composite controls keep native Enter behavior.

Every field must also have:

- A stable ID unique to the rendered form instance, created with React `useId()` or an equivalent instance prefix rather than a hardcoded shared ID.
- An associated visible label.
- A meaningful form `name`.
- The correct semantic `type`, `inputMode`, and `autoComplete` token.

Never disable autocomplete for the whole form. Use `type="tel"` for phone numbers rather than `number`. For numeric text where leading zeros matter, retain a text input and use `inputMode="numeric"`. Placeholders are optional hints, never labels. Test autofill with floating labels, animation, validation styling, and two instances of the same template rendered together.

## Animation policy

Apply this order:

1. CSS or Tailwind transitions/keyframes for simple hover, reveal, looping, and decorative effects.
2. Motion as the default JavaScript animation library for state, presence, gesture, spring, or coordinated React animation.
3. GSAP only for a clearly documented need such as a complex timeline, advanced SVG choreography, or sequencing that is materially clearer than Motion.

Each template declares only its own animation dependencies. Prefer transform and opacity. Avoid layout thrashing, large continuously blurred layers, excessive `will-change`, and animations that make typing or reading unstable.

Every animation must support `prefers-reduced-motion`:

- Remove nonessential looping and parallax.
- Replace large movement with no movement or a short opacity transition.
- Make the final content and all form states immediately available.
- Keep Reset and Replay Animation preview controls deterministic.

Animation must serve the template concept. Generic entrance effects alone are not a creative direction.

## Styling and asset rules

- Use Tailwind CSS 4.
- Scope template-specific CSS, variables, selectors, and keyframe names to the template.
- Prefix unavoidable global keyframes or custom properties with the template slug.
- Do not change `body`, universal selectors, shared shadcn primitives, or unrelated application tokens.
- Use `className` on the template root so adopters can place and extend it.
- Prefer transform and opacity for animated changes.
- Test light, dark, or adaptive behavior exactly as declared by `appearance`.
- Include only original or redistribution-safe assets.
- Do not require visible FormMuse attribution in the installed interface.

### Template palette

Every Form Template owns a polished Template Palette and must look like its preview immediately after installation. Define palette classes and custom properties on the template root or in its scoped CSS Module. Style local shadcn Control Primitives through their normal `className` APIs; never edit or globally override the adopter's shared `components/ui/*` files.

Base UI popups may render through a portal outside the template root. Apply the template's scoped palette class or required tokens directly to each template-owned portaled surface, such as Select, Popover, Calendar, or Command content, so it retains the correct appearance without relying on root inheritance or global rules.

- A `light` template keeps its intended light palette and applies a scoped light `color-scheme` at its root.
- A `dark` template keeps its intended dark palette and applies a scoped dark `color-scheme` at its root.
- An `adaptive` template provides both palettes through Tailwind `dark:` variants and applies the corresponding scoped `color-scheme`. It consumes the adopter's existing dark-mode configuration and must not redefine whether `dark:` is controlled by system preference, a `.dark` class, or a data attribute.

Do not add `:root`, `body`, universal, or generic `.dark` palette rules to distributed source. Do not expose a universal theme object or granular color props. Adopters customize deeper palette details by editing the copied, scoped variables or classes. Typography continues to inherit from the adopter.

Test every declared appearance and every enabled visual state. Normal text and error text must meet WCAG 2.2 AA contrast of at least 4.5:1, or 3:1 for qualifying large text. Authored focus indicators and visual boundaries or states required to identify enabled controls must meet at least 3:1 against adjacent colors. Disabled controls are exempt from these contrast ratios, but must remain visibly and semantically recognizable as unavailable.

### Responsive layout

Every Form Template must be intentionally composed and tested for narrow, intermediate, and wide Responsive Frames. Start mobile-first and fluid, with the primary form flow in one column at 320 CSS pixels unless a compact field group remains genuinely readable and operable. Desktop is a first-class design target: use the available space for richer composition, spacing, artwork, and interaction where that strengthens the template rather than merely enlarging the narrow layout.

Prefer intrinsically responsive Grid and Flexbox before adding breakpoints. When internal columns, spacing, alignment, content arrangement, or decorative placement depend on the width allocated by the adopter, make the template root a slug-named inline-size container and use Tailwind container variants. Do not add a query container when the naturally fluid layout already works.

Reserve viewport-width queries for genuinely page-level behavior rather than template composition. Environmental and viewport-level media queries remain appropriate for conditions such as reduced motion, hover capability, print, orientation, and constrained viewport height.

A published template must:

- Reflow without loss of information, functionality, or page-level horizontal scrolling at a 320 CSS-pixel Responsive Frame.
- Work in narrow columns, modals, sidebars, grids, and full-page placements without assuming the browser viewport equals its own width.
- Keep labels, controls, errors, result states, and essential actions usable at every supported width.
- Recompose or safely clip decorative artwork so it never obscures fields, focus indicators, validation, or submission feedback.
- Pass visual and interaction checks at 320 CSS pixels, immediately below and above every template-defined layout breakpoint, and at its intended wide presentation width.

The desktop, tablet, and mobile preview buttons are convenient presets, not the complete responsive contract.

### Interaction targets and input parity

Use a minimum 44 by 44 CSS-pixel Interaction Target as the FormMuse quality standard for primary controls and actions, including text inputs, textareas, selects, primary buttons, step navigation, reset actions, and icon-only controls. The visible glyph may be smaller when a non-overlapping wrapper provides the full target.

A checkbox or radio indicator may remain visually compact when its associated label or group wrapper enlarges the combined clickable area to the target size. Do not use invisible target expansion that overlaps or steals interaction from an adjacent control. Inline links inside prose and other legitimate exceptions do not have to meet the 44-pixel house target, but every pointer target must still satisfy WCAG 2.2 AA's 24 by 24 CSS-pixel minimum or one of its documented exceptions.

Hover can add visual polish but cannot be the only way to discover information or operate functionality. Every essential pointer action must have equivalent touch and keyboard operation using native platform conventions. Information revealed on hover must also be available from keyboard focus; transient hover or focus content must be dismissible, hoverable, and persistent where WCAG requires it. Pair important hover affordances with an appropriate focus-visible treatment, while keeping focus and activation as separate behaviors.

Use this Template Asset priority:

1. CSS artwork.
2. Inline SVG or a template-owned JSX/TSX SVG component.
3. Lucide icons when the template genuinely needs them.
4. An optimized local raster image only when concept-essential.

Never depend on `next/image`, remote URLs, external CDNs, large base64 data URLs, or a framework-specific SVG loader. Every asset rendered inside the Template Preview iframe must be included in the Template Block; FormMuse's preview controls outside the iframe are not distributed template assets. Record provenance and licence terms repository-side, and verify every local asset in both Next.js and Vite.

Meaningful images require useful `alt` text. Pure decoration uses empty alternative text or `aria-hidden="true"` as appropriate. Preview tests must confirm zero external asset requests.

When a template genuinely requires raster assets:

- Install them as `registry:file` entries targeted to `~/public/formmuse/<canonical-slug>/`.
- Expose `assetBaseUrl?: string` only on that template.
- Default it to `/formmuse/<canonical-slug>`.
- Strip trailing slashes before appending a filename.
- Accept a root-relative path, deployment subpath, or adopter-controlled absolute CDN URL.
- Use standard `<img>` with explicit width and height plus correct meaningful or decorative accessibility attributes.
- Document every file and the optional prop in Manual Installation and the Props table.

FormMuse previews must use the packaged local default and make no external requests. Templates without raster assets must not expose `assetBaseUrl`.

## Typography and fonts

- Inherit the adopter's application font by default.
- Keep the template polished with sensible common sans-serif or serif fallbacks.
- Use normal Tailwind typography utilities and locally scoped CSS variables where useful.
- Never fetch Google Fonts or another remote font from a Form Template or Template Preview.
- Never globally replace the adopter's typography.

A bundled font is an exceptional escape hatch, not a standard template feature. Use one only when the entire visual concept depends on it, the licence clearly permits redistribution, and the loading method passes both Next.js and Vite compatibility builds. Install it only with that template and document its licence, files, fallbacks, and Manual Installation steps.

## Registry Record

`registry.json` is the single manifest for installation, catalog discovery, generated Template Pages, search, and filters.

Keep standard shadcn fields at the top level:

- `name`
- `title`
- `description`
- `categories`
- `files`
- `dependencies`
- `registryDependencies`

Store only FormMuse-specific data under `meta.formmuse`, including layout, animation technology, objective appearance mode, fields, tags, featured status, Publication Status, Template Version, updated date, structured props, example references, usage notes, and accessibility notes. Do not duplicate standard fields in `meta.formmuse`.

`FormMuseMetaSchema` is authoritative. It must:

- Be strict and reject unknown keys.
- Export its inferred TypeScript type; do not create a handwritten duplicate interface.
- Validate semantic versions and ISO `YYYY-MM-DD` dates.
- Use closed values for category validation, layout, animation technology, Publication Status, and objective appearance mode.
- Allow validated, unique lowercase kebab-case slugs for `tags` and `fields`.
- Fail registry generation and CI on invalid metadata.

Each template has exactly one Primary Category as the only top-level `categories` value. V1 category values are:

- `contact`
- `newsletter`
- `waitlist`
- `quote-request`
- `project-inquiry`
- `booking`
- `consultation`
- `feedback`

Choose the dominant visitor intent. Put secondary use cases, audiences, subjective visual traits, and behaviors in `meta.formmuse.tags`. Never duplicate the Primary Category as a tag.

Objective appearance values are `light`, `dark`, and `adaptive`. Subjective descriptions such as `playful`, `minimal`, `luxury`, `editorial`, and `colorful` are tags.

Controlled vocabularies begin with values used by real launch templates and grow only when a Published Template needs a new value.

ADR 0074 defines the initial strict wire contract derived from Hanging Gifts: `page` is the only initial layout value; `animation` is a unique non-empty array over `css`, `motion`, and `gsap`; documentation records use the locked structured props, examples, usage-note, and accessibility-note shapes; lifecycle-specific deprecation data controls deprecated installability; and V1 Template Versions use stable `major.minor.patch` form only. The schema implementation and ADR must remain aligned when evidence from a real later template requires the vocabulary to grow.

## Canonical slug and public routes

Every Form Template has one lowercase kebab-case Canonical Slug. The same value must be used everywhere:

```text
registry name:       hanging-gifts-contact
source directory:    registry/base/hanging-gifts-contact/
Template Page:       /templates/hanging-gifts-contact
Template Preview:    /preview/hanging-gifts-contact
registry item:       /r/hanging-gifts-contact.json
```

Titles and descriptions may change; a published Canonical Slug must not normally change. A replacement receives a new slug and the old template becomes deprecated.

If an exceptional identity migration is unavoidable, preserve the old slug as a deprecated compatibility Registry Record and static Template Page with a clear replacement link. Keep the old registry item installable only while it remains safe and functional. Do not rely on provider-specific HTTP redirects.

Catalog category views are client-side query parameters such as `/templates?category=contact`, not separate category routes. All filtered variants declare `/templates` as canonical and do not become separate indexed pages. Preview routes must declare `noindex` so the Template Page is the indexed canonical result.

## Documentation and examples

Every Template Page uses one shared, statically generated layout. Do not create a per-template MDX page.

Use `fumadocs-mdx` and `fumadocs-core` only as the headless Guide Content Pipeline for the eight general guides. Author those guides as ordinary portable MDX and build FormMuse-owned layouts, navigation, typography, code presentation, table of contents, and search UI. Do not install or depend on `fumadocs-ui`, its visual theme, providers, layouts, or global styles.

Keep all Fumadocs packages, generated content data, and documentation providers out of the minimal root layout, `(preview)` layout, Template Preview output, registry items, compatibility fixtures, and Distributed Template Source. Fumadocs is a website build dependency and never an adopter dependency.

At build time, combine structured guide content with Published Template registry metadata into a normal static search index. Consume it locally in the browser without an `app/api` route, server function, database, or hosted search provider. Exclude preview routes, drafts, and deprecated records that the catalog policy marks non-browsable. Keep guide MDX free of unnecessary Fumadocs-specific visual constructs so replacing the content processor remains practical.

The generated page must provide:

- Preview and Code tabs.
- CLI and Manual Installation tabs.
- pnpm, npm, Yarn, and Bun shadcn CLI commands.
- Every distributed file in the Code and Manual views.
- Exact dependency and CSS/animation setup.
- Import-path instructions.
- Type-checked examples and final usage code.
- A documented Props table.
- Structured usage and accessibility notes.
- Version and changelog access.
- A Copy Agent Prompt action.

Keep template-specific documentation concise and structured in `meta.formmuse`, such as `props`, `examples`, `usageNotes`, and `accessibilityNotes`. Reference small repository-only `.tsx` example files so examples are compiled and tested. Do not put long essays or escaped source files in JSON.

Long general guides—including Introduction, Installation, Template API, Connecting a Backend, Customizing Templates, Using FormMuse with Agents, Accessibility, and the project Changelog—remain ordinary documentation pages.

## Isolated preview contract

Each template has its own build-time static iframe route. On the Template Page, that route renders the complete scrollable Complete Composition, from its initial entrance through the form and every designed supporting section. The preview must:

- Be isolated from FormMuse website CSS.
- Support desktop, tablet, and mobile viewport controls.
- Exercise validation and deterministic simulated submitting, success, and failure states.
- Provide Reset and Replay Animation controls.
- Make no template-initiated or external network requests, including analytics, remote images, fonts, maps, or form submissions. Static navigation and same-origin files required to load the generated preview document are the transport for the preview itself, not template runtime behavior; publication tests must establish an idle baseline after load and reject subsequent unexpected requests during interaction.
- Render without a runtime code sandbox or server.
- Preserve Preview Parity: every section and asset rendered inside the Complete Composition is part of the distributed Template Block, while only FormMuse preview chrome and the deterministic submission adapter remain repository-only.
- Allow visitors to scroll, type, validate, submit, experience success and failure, move between steps where applicable, and operate the form normally.
- Keep external navigation inert in demo data without changing the adopter-owned component's real semantic structure.

Reset remounts the complete preview, clears demo form state, returns the preview to its initial scroll position, and restarts its initial sequence. Replay Animation reruns the template's replayable visual sequence without silently changing entered values or submission state unless the template's documented animation makes a full reset inseparable; any such exception must be explicit and tested. The Code tab stays outside the iframe and displays every distributed file.

Apply layered Preview Isolation. Give an iframe only the capabilities required to load reviewed static JavaScript and styles, render local assets and animation, and run the deterministic client-side form simulation. Do not permit downloads, popups, modal browser dialogs, top-level navigation, external protocol navigation, storage access, real form navigation, or access to FormMuse site state. Deny unneeded browser capabilities such as camera, microphone, geolocation, payment, fullscreen, and display capture through a restrictive Permissions Policy.

Use a preview-specific Content Security Policy independently of iframe sandboxing. Begin from denial and allow only the local scripts, styles, images, fonts, and media genuinely required by the generated preview. Explicitly block connections, real form actions, nested frames, objects, workers, manifests, and other unused active content. Because FormMuse is a portable static export and Next.js hydration and animation may require narrowly scoped script or style allowances, the Hanging Gifts vertical slice must prove the smallest functional policy across the supported browsers and document every exception. Do not claim that a CSP directive works until its header or static-document delivery mechanism has been tested on the Initial Production Host and a portable local static server.

Do not casually combine `allow-scripts` and `allow-same-origin` for a same-origin frame. First test an opaque-origin frame with scripts but without same-origin privileges. If the static module-loading model cannot function safely, record the failure and security consequence before granting another capability. A distinct preview origin is a fallback to evaluate only when required by evidence, not an automatic V1 hosting dependency. FormMuse runs reviewed owner-authored templates rather than arbitrary uploaded code, but that reduced threat does not justify overstating the sandbox boundary.

Keep the Preview Protocol versioned and schema-validated. Its required surface is readiness, Reset, and Replay. Validate `event.source`, the expected origin whenever the frame has a meaningful origin, the protocol version, a per-frame channel identifier, and the exact message shape before acting. Use an exact target origin whenever possible. Never exchange submitted or in-progress values, visitor-authored content, HTML, selectors, URLs, code, arbitrary commands, credentials, or analytics data. Do not add height messages because full previews retain a fixed emulated viewport and internal scrolling. Add pause/resume only if measured catalog behavior proves that lazy mounting and off-screen unmounting cannot satisfy the performance requirement.

The vertical slice must record the tested iframe flags, CSP, Permissions Policy, message schema, origin behavior, browser results, static-host behavior, and reason for every granted capability before Preview Isolation becomes shared infrastructure.

## Agent Handoff

Each Template Page includes a Copy Agent Prompt assembled from machine-readable metadata. It should tell the adopter's coding agent to:

1. Inspect the target project's framework, Tailwind 4 setup, import aliases, and existing shadcn Base UI files.
2. Inspect the registry item with shadcn tooling before writing.
3. Install only the declared files and dependencies through the chosen CLI or Manual path.
4. Preserve adopter modifications and never overwrite copied code automatically.
5. Import the template and implement the typed `onSubmit` connection to the adopter's existing backend.
6. Keep raw backend errors out of visitor-facing UI.
7. Run the target project's relevant type, lint, test, and build checks.

FormMuse uses the existing shadcn MCP server and machine-readable Registry Records. Do not build a custom FormMuse MCP server, hosted agent backend, or chat interface in V1.

## Publication lifecycle

- `draft`: development-only; excluded from the production catalog and public installation output.
- `published`: visible, searchable, documented, and installable only after every quality gate passes.
- `deprecated`: retains its stable URL, documentation, changelog, warning, and optional replacement; excluded from ordinary browsing and featured sections.

A deprecated template remains directly installable only while safe, legally redistributable, and functional. Disable installation for a critical security, licensing, or serious compatibility problem while preserving historical documentation.

Every template has its own semantic version and changelog. Installation gives the latest version but never automatically overwrites adopter-owned code. Adopters inspect changes with shadcn `--diff` and manually merge what they want.

Launch the public repository with tag and GitHub Release `v1.0.0`. After launch, passing changes on `main` may deploy continuously without requiring a tag for every production deployment. Create later GitHub Releases only for meaningful product milestones, template batches, shared compatibility changes, or other notable releases. Repository release notes may aggregate template changes but never replace individual changelogs.

Keep the Repository Release version independent from every Template Version. Do not bump unrelated templates when the site, documentation, tooling, or another template changes. Do not add a FormMuse component npm package, prerelease channel, nightly channel, or synchronized version across all templates in V1.

Generate `/formmuse-deployment.json` from the validated registry and CI inputs before final artifact verification. Its strict, schema-versioned public shape records:

- Manifest schema version.
- Exact Git commit SHA.
- ISO build timestamp.
- `FORMMUSE_DEPLOY_ENV` value.
- Repository Release version when the commit is tagged, otherwise `null`.
- A canonical-slug-to-version map for every Published Template.

Reject credentials, private environment values, local paths, actor identity, draft templates, and deprecated non-installable source from the Deployment Manifest. Verify that its template versions exactly match registry metadata. Retain each manifest with its immutable Production Artifact and roll back that pair without rebuilding the historical commit.

## Quality tooling ownership

Use one free, repository-owned Quality Toolchain with clear boundaries:

- Vitest covers Zod schemas and normalization, utilities, registry and documentation generation logic, metadata validation, and isolated state logic.
- React Testing Library, `user-event`, and DOM matchers cover one rendered template from the visitor's perspective: labels, typing, validation timing and copy, focus, submit, pending, rejection, explicit retry, success, and reset. Test observable behavior rather than component internals.
- Playwright covers built-browser integration: isolated iframe previews, keyboard workflows, responsive and reduced-motion behavior, deterministic submission simulation, Reset and Replay, network isolation, CSP and sandbox behavior, static-export navigation, Next.js and Vite fixtures, and automated engine coverage.
- `@axe-core/playwright` checks detectable accessibility violations in both the FormMuse site document and interactive preview frames.
- Playwright screenshot assertions own responsive and state-based visual regression. Do not add a second visual-regression service in V1.
- Lighthouse CI audits representative pages from the served static export for performance, accessibility, SEO, and best-practice regressions.
- Linkinator crawls the served static export for broken internal and external links, excluding deliberately inert preview demo destinations.
- JSX accessibility lint rules provide immediate source feedback but do not replace rendered checks.

Do not repeat every behavior in Vitest and Playwright. Prefer the cheapest layer that faithfully exercises the contract, then use Playwright only for behavior requiring a real browser, iframe, responsive rendering, static output, or cross-engine integration. Do not add Jest, Cypress, Storybook, Chromatic, Percy, or another overlapping test platform in V1.

Create and compare official screenshots only in a pinned Visual Baseline Environment. Pin the CI image or container, Playwright and browser builds, fonts, locale, timezone, color scheme, viewport, device scale, reduced-motion setting, and animation/test clock behavior required for deterministic output. A developer may generate local comparison artifacts, but must not replace authoritative baselines merely because a different OS or browser renders differently.

Automated lint and axe results are safeguards, not accessibility certification. Publication still requires manual keyboard, focus-order, focus-visibility, zoom/reflow, screen-reader, motion, touch, and applicable real-device review. Record who or what was tested, the browser/device and assistive technology version, and any accepted limitation in publication evidence.

## Whole-site quality gate

Audit the served static export with Lighthouse CI. Representative coverage must include the homepage, catalog, a general guide, and every newly published Template Page with its corresponding Template Preview.

- Indexable routes require Performance of at least 90 and Accessibility, Best Practices, and SEO scores of 100.
- Intentionally `noindex` Template Preview routes do not receive an SEO requirement; their other applicable category thresholds remain unchanged.
- A verified Lighthouse false positive requires a narrow documented exception. Do not lower a global threshold to hide an ordinary failure.
- Require zero unhandled page errors, unhandled promise rejections, hydration warnings, broken internal links, serious or critical axe violations, and unexpected Template Preview network requests.

Lighthouse and axe are repeatable laboratory safeguards, not WCAG certification. FormMuse targets all applicable WCAG 2.2 Level A and AA success criteria and retains the mandatory manual keyboard, focus, zoom/reflow, screen-reader, touch, reduced-motion, responsive, and real-device publication checks.

Once FormMuse has enough representative production traffic, treat these Core Web Vitals as field-data requirements at the 75th percentile, assessed separately for mobile and desktop:

- Largest Contentful Paint at or below 2.5 seconds.
- Interaction to Next Paint at or below 200 milliseconds.
- Cumulative Layout Shift at or below 0.1.

Before sufficient field data exists, use pinned Lighthouse CI, Playwright measurements, and the Hanging Gifts vertical slice as laboratory evidence. Never describe laboratory values as real-user performance.

Do not choose JavaScript, image, or total-transfer budgets before measuring the complete Hanging Gifts vertical slice. Use that implementation to establish the first Performance Baseline, then require explicit review for regressions or baseline changes before scaling the catalog.

## Required quality gate

A template cannot become `published` until all of these pass:

- TypeScript.
- ESLint.
- Strict shadcn and `FormMuseMetaSchema` registry validation.
- Registry generation.
- Full static Next.js export.
- Next.js compatibility fixture build.
- Vite React compatibility fixture build.
- Pinned Playwright Chromium, Firefox, WebKit, and mobile-emulation projects, labelled as engine or emulation coverage rather than branded-browser evidence.
- Current stable branded Chrome, Edge, Firefox, and Safari smoke tests plus current real-device iOS Safari and Android Chrome smoke tests before template publication.
- Full recorded current-and-previous-major Browser Support Window for initial launch, tagged releases, and compatibility-affecting shared changes.
- Validation and submission behavior tests.
- Transport Value tests proving validated submission values survive a JSON stringify/parse round trip without loss or semantic change.
- Parsed Values tests proving documented normalization occurs, meaningful textarea content is preserved, and `onSubmit` receives exactly the exported schema output type.
- Field Length Contract tests covering every free-text maximum in both Zod and the rendered control, including boundary, counter association, and non-chatty announcement behavior where a counter exists.
- Requirement Marker tests proving the form-level instruction, labels, native or ARIA state, defaults, Zod optionality, group rules, and step validation agree.
- Validation Copy tests proving rule priority, one message per field or group, actionable authored wording, field association, correction behavior, and the absence of raw Zod or backend output.
- Root Class Extension tests proving `className` reaches only the outer template root, retains default classes, and permits intended root-level Tailwind overrides through `cn`.
- Duplicate-submission prevention test.
- Failure-value preservation test.
- Explicit Retry tests proving rejection never triggers an automatic, delayed, connectivity-driven, service-worker, or queued resend and that only a visible visitor action starts another `onSubmit` call.
- Persistent-success and explicit-reset tests.
- Ephemeral Draft tests proving templates and previews do not write form values to Web Storage, IndexedDB, cookies, Cache Storage, service workers, browser history, query parameters, URL fragments, or unload requests.
- Navigation Ownership tests proving templates do not register `beforeunload`, block routes, intercept browser navigation, manipulate history, or display leave-confirmation dialogs.
- Legal Copy tests, when applicable, proving consent is not pre-checked, semantics and Zod agree, placeholder obligations are documented, policy links are not fake or framework-specific, and default copy makes no unsupported backend promise.
- Telemetry-free Template checks proving distributed source and dependencies contain no analytics SDK, pixel, beacon, tracking identifier, analytics-specific prop, automatic event emission, or FormMuse-owned request.
- Site Analytics checks proving the integration appears only in production site routes, is absent from development and preview builds and all Template Preview iframes, sends no visitor-authored values, cannot affect core site behavior, and matches the documented privacy notice and production CSP allowlist.
- Launch Analytics Provider checks proving the Cloudflare beacon is absent without production configuration, uses only the reviewed script and connection origins, remains non-blocking under script or network failure, and does not implement custom events, UTM workarounds, query capture, or template-level tracking.
- Keyboard interaction checks.
- Interaction-target checks for the 44 CSS-pixel FormMuse standard, the WCAG 2.2 AA fallback, non-overlap, touch operation, and keyboard-equivalent activation.
- Automated accessibility checks plus required manual review.
- Responsive visual regression at 320 CSS pixels, on both sides of every template-defined layout breakpoint, at the intended wide presentation width, and through the desktop, tablet, and mobile preview presets.
- Reduced-motion behavior and visual checks.
- Preview Reset and Replay behavior.
- Verification that the preview makes zero network requests.
- Verification that CLI and Manual Installation contain the same distributed files and dependencies.
- Asset license and redistribution review.
- Security Gate checks for dependency changes, static analysis, secret exposure, generated registry contents, and distributed source.
- Triage of every known vulnerability; unresolved relevant high- or critical-severity vulnerabilities in FormMuse runtime, build, CI, or distributed dependencies block publication.

Never mark a template published to satisfy the launch count. Fix the template or keep it as `draft`.

## FormMuse project security baseline

Treat FormMuse as a software supply chain because visitors copy and execute its registry source. Security checks apply to the website, build tooling, CI, registry generation, generated item JSON, and every distributed dependency—not only to the rendered form.

- Commit `pnpm-lock.yaml`, pin required development tools deliberately, and install with `pnpm install --frozen-lockfile` in CI.
- Keep each Template Block's npm and registry dependencies minimal. Review every new dependency's source, maintenance, licence, install behavior, transitive changes, and known vulnerabilities.
- Enable GitHub dependency graph, Dependabot alerts and reviewed security-update pull requests, dependency review for manifest or lockfile changes, CodeQL scanning for JavaScript/TypeScript, and secret scanning with push protection where GitHub makes them available. Never auto-merge dependency updates without the full gate.
- Protect `main` with required checks and review. Give GitHub Actions the minimum `permissions` needed, pin third-party actions to reviewed immutable commit SHAs, keep secrets unavailable to untrusted pull-request code, and never execute untrusted checkout code through `pull_request_target`.
- Never place provider keys, tokens, credentials, private endpoints, or sensitive environment values in browser code, examples, registry records, preview fixtures, logs, `public/r`, or `out`. Production builds must scan generated output for accidental secrets before deployment.
- Distributed templates must not use `eval`, dynamic code execution, remote scripts, unsafe HTML rendering, or hidden network behavior. Render visitor data as ordinary React text; any future rich-content rendering requires a separate security decision and tested sanitization strategy.
- Generate registry items only from validated authoritative source, inspect generated diffs, and fail when generated contents, dependency declarations, or Manual Installation diverge. Never hand-edit generated registry JSON.
- Publish the production website and registry only over HTTPS. Document and verify a host-appropriate security-header baseline—including CSP, MIME sniffing protection, referrer policy, permissions policy, and HSTS where applicable—without sacrificing the portable static export or same-origin preview iframes.
- Add a root `SECURITY.md` before public launch with supported-version scope, a private vulnerability-reporting path, expected response handling, and disclosure policy. Do not ask reporters to publish an exploitable issue publicly.
- Re-run security checks on dependency changes, releases, and a schedule. Affected registry installation must be disabled when a serious security issue makes a template unsafe, while its historical documentation and remediation guidance remain available.

Security tooling supports review; it does not prove the absence of vulnerabilities. Record threat assumptions, review findings in context, and prefer removing unnecessary attack surface over adding ceremonial controls.

## Authoring workflow for agents

Follow this order for each new template:

1. **Read the contracts.** Read this file, `CONTEXT.md`, applicable ADRs, the registry schema, and at least the closest existing template.
2. **Propose the concept.** State the Primary Category, dominant visitor intent, visual metaphor, layout, fields, animation technology, appearance mode, and tags.
3. **Prove uniqueness.** Compare the proposal against the inventory and name at least three material differences from its closest template.
4. **Define behavior first.** Create the named Zod schema, values type, complete defaults, public props, and all Form States.
5. **Build the accessible form.** Use React Hook Form, the resolver, local shadcn Base UI controls, labels, errors, focus behavior, and keyboard support.
6. **Build the visual concept.** Add the smallest number of supporting components required to make the idea memorable and coherent.
7. **Add animation deliberately.** Start with CSS, use Motion when needed, justify GSAP, and implement reduced motion at the same time.
8. **Create the preview and examples.** Use deterministic simulation, no network, all viewport modes, Reset, Replay, and type-checked usage.
9. **Add the Registry Record and changelog.** Keep standard fields top-level, validate `meta.formmuse`, and begin the template at `1.0.0` only when it is ready to publish.
10. **Run the full gate.** Report every check and leave the template as `draft` if any required check fails.

## Reusable template-authoring prompt

Give the following prompt to a coding agent together with this repository:

```text
Create one FormMuse Form Template in this repository.

First read reference.md, CONTEXT.md, all applicable docs/adr decisions, the registry schema, and the nearest existing Form Template. Do not implement until you can summarize the template contract and show that the proposed concept is materially different from existing templates.

Template brief:
- Working title: <title>
- Slug: <lowercase-kebab-case-slug>
- Primary category: <one locked category>
- Dominant visitor intent: <intent>
- Visual concept: <concept>
- Required fields: <field slugs>
- Objective appearance: <light | dark | adaptive>
- Candidate tags: <lowercase-kebab-case tags>

Use React, TypeScript, Tailwind CSS 4, local shadcn controls backed by Base UI, React Hook Form, Zod, and the Zod resolver. Use CSS first, Motion when JavaScript animation is warranted, and GSAP only with a written justification. Support prefers-reduced-motion. Do not use Next.js-specific APIs or direct @base-ui/react imports.

Create the main Form Template component, a separate named schema and exported values type, complete internal defaults, and only necessary supporting components. Expose onSubmit: (values) => Promise<void>, defaultValues?: Partial<FormValues>, and className?. Apply className only to the outer template root and merge it after defaults with the shadcn cn utility; do not add a classNames slot object or theme API. Do not expose schema or fields configuration props. Keep all submitted values transport-friendly and document date or time string semantics. Implement accessible validation, duplicate-submission prevention, safe failure UI that preserves values, persistent success UI, and an explicit reset action only when appropriate. Keep the installed template telemetry-free: no tracking SDKs, pixels, beacons, analytics props, automatic events, identifiers, or FormMuse-owned network requests.

Add its strict Registry Record, isolated static no-network preview, type-checked examples, structured documentation metadata, props documentation, changelog, tests, and visual snapshots. Keep tests, previews, examples, docs, and changelog out of the installed payload. Ensure CLI and Manual Installation distribute exactly the same production files and per-template dependencies.

Run every FormMuse publication check for TypeScript, ESLint, registry validation and generation, static export, Next.js and Vite builds, behavior, keyboard, accessibility, responsive visual regression, reduced motion, replay/reset, zero preview network requests, security, dependency review, secret exposure, and asset licensing. Keep status as draft if any required check fails. Finish with a concise report of files created, dependencies added, uniqueness evidence, test results, and any remaining publication blockers.
```

## Agent completion report

Every agent should finish template work with:

- Template title, slug, Primary Category, status, and version.
- One-sentence visual concept.
- Three or more uniqueness differences from the nearest existing template.
- Distributed files.
- Repository-only files.
- Runtime and registry dependencies.
- Animation choice and reduced-motion behavior.
- Submission and reset behavior.
- Accessibility behavior.
- Asset provenance.
- Exact commands/checks run and their results.
- Remaining blockers. If any required gate fails, status must remain `draft`.

## Final rule

FormMuse is a curated library of templates created by the project owner. V1 has no community submissions, creator profiles, marketplace, moderation, ratings, favorites, accounts, popularity tracking, backend, Upload Fields, custom MCP server, or runtime sandbox. Optimize for originality, adopter-owned code, reliable integration, and a small honest API—not for feature count inside an individual template.
