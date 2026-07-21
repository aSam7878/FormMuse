# FormMuse

FormMuse is a focused open-source catalog of premium-quality, creative, animated Form Templates that developers copy into their own applications and adapt to their products. It concentrates the copy-paste component-library model specifically on forms used across public websites.

## Language

**Form Template**:
A complete, copy-pasteable form that includes its visual design, interactions, and user-facing states while leaving data delivery to the adopter's application.
_Avoid_: Form experience

**Published Template**:
A Form Template available through the Curated Library after passing every required behavior, accessibility, visual, portability, registry, and static-build check.
_Avoid_: Draft template, preview experiment

**Publication Status**:
The lifecycle state of a Form Template: `draft`, `published`, or `deprecated`. Drafts are development-only; published templates have passed the quality gate; deprecated templates retain historical documentation but leave ordinary discovery, and remain installable only while safe and functional.
_Avoid_: Popularity status, moderation status

**Portable Template**:
A Form Template that works across the supported React application environments without depending on one framework's routing, rendering, or backend features.
_Avoid_: Next.js-only template

**Curated Library**:
The FormMuse catalog of Form Templates created and selected exclusively by the project owner. V1 has no external submission or publishing path.
_Avoid_: Marketplace, community library

**V1 Launch Collection**:
The 20 Published Templates required for FormMuse's first public release: ten contact, five newsletter, and five quote-request Form Templates. There is no separate internal-alpha collection.
_Avoid_: Three-template launch, unfinished template quota

**Template Planning ID**:
A permanent repository-side identifier for one slot in the V1 Launch Collection: `C01`–`C10` for contact, `N01`–`N05` for newsletter, and `Q01`–`Q05` for quote request. It survives draft concept, name, and slug changes but never replaces the published slug as the public identity.
_Avoid_: Public registry name, installation alias, mutable spreadsheet row number

**Launch Brief**:
The directional creative and functional specification attached to one Template Planning ID. It records purpose, intended audience, visual concept, layout, core fields, primary interaction or animation, appearance mode, differentiation, and notable technical or asset requirements without prescribing every visual detail.
_Avoid_: Final pixel specification, improvised template idea, public Registry Record

**Audience Lens**:
The broadly described visitor or adopter scenario used to make a Launch Brief and its demo copy coherent. It guides presentation without introducing industry-specific infrastructure, proprietary terminology, or a public restriction on who can reuse the template.
_Avoid_: Supported-industry list, hardcoded provider workflow, niche structural dependency

**Interaction Depth**:
Whether a Form Template presents its fields in one directly submittable view or in an intentional Step Flow. The V1 Launch Collection uses 16 single-step and four multi-step templates, reserving steps for concepts whose field depth justifies them.
_Avoid_: Multi-step animation gimmick, route-backed wizard, one-field step

**Public-facing Form**:
A form placed on a public website to let a visitor contact, subscribe to, join, request something from, book with, consult, or give feedback to an organization.
_Avoid_: Authentication form, checkout form, product dashboard form

**Primary Category**:
The single dominant visitor intent served by a Form Template, stored as the only value in the top-level shadcn `categories` array. Secondary use cases, audiences, styles, and behaviours belong in FormMuse tags and must not repeat the Primary Category.
_Avoid_: Multiple primary categories, category duplicated as a tag

**Submission Connection**:
The handoff between a Form Template and the adopter's chosen backend, expressed in V1 as `onSubmit: (values) => Promise<void>`. Resolution means success; a thrown error or rejected promise means failure. FormMuse defines and manages this handoff but does not choose or host the backend.
_Avoid_: Built-in backend, FormMuse backend

**Transport Value**:
A recursively JSON-compatible submission value: a string, finite number, boolean, null, array of Transport Values, or plain object whose properties are Transport Values. Dates and times use documented ISO strings rather than runtime objects.
_Avoid_: `Date`, `File`, `undefined`, `NaN`, `Infinity`, `bigint`, custom class instance

**Parsed Values**:
The successful Zod schema output passed to the Submission Connection and described exactly by the template's exported values type. Parsed Values may apply documented conservative normalization but preserve meaningful visitor content.
_Avoid_: Raw unchecked fields, surprising rewrite, values type that describes schema input

**Submission Trust Boundary**:
The point where validated browser values leave a Form Template through its Submission Connection. Values remain untrusted after crossing this boundary; the adopter's backend must validate and protect the submission independently.
_Avoid_: Treating client Zod validation as security, client-only CAPTCHA

**Form State**:
The user-visible condition of a Form Template as input is validated and submitted, including validation feedback, submitting, success, and failure. FormMuse prevents duplicate submissions, preserves entered values after failure, and shows safe template-authored failure copy instead of raw thrown errors. A successful submission remains visible indefinitely unless the visitor uses an explicit template-provided action to begin again.
_Avoid_: Backend status

**Submission Feedback**:
The accessible presentation of pending, success, and failure Form States. Pending uses a polite status outside the busy form; success and failure move focus once to visible result content, with no duplicate assertive announcement.
_Avoid_: Spinner-only progress, focused alert live region

**Explicit Retry**:
A new visitor-initiated submission attempt made from the still-mounted failure state. FormMuse preserves current values after rejection but never retries, queues, stores, or resends them automatically.
_Avoid_: Automatic retry, offline queue, Background Sync, assumed backend idempotency

**Validation Timing**:
The V1 interaction rule that withholds errors before the first submit attempt, validates the complete form on submit, focuses the first invalid control, and then revalidates erroneous fields as the visitor edits them.
_Avoid_: Error while first typing, browser validation popup

**Validation Copy**:
The template-authored visitor-facing message for correcting one validation problem. It is short, specific, respectful, actionable, and selected as the highest-priority relevant message for that field.
_Avoid_: “Invalid input,” blame, Zod issue code, multiple simultaneous field errors

**Step Flow**:
The client-side progression of a multi-step Form Template within one schema and React Hook Form instance. Current-step validation controls forward movement, values survive backward movement, and only a valid final step invokes the Submission Connection.
_Avoid_: Route-backed wizard, per-step form state

**Field Identity**:
The stable, instance-unique ID and meaningful form name assigned to each control so labels, descriptions, errors, autofill, and multiple copies of one Form Template work without collisions.
_Avoid_: Hardcoded shared ID, placeholder-only field name

**Field Length Contract**:
The intent-appropriate maximum accepted length for one visitor-authored free-text field, enforced with the same numeric limit in its Zod schema and native control attributes and explained through accessible UI when useful.
_Avoid_: Unlimited free text, one global maximum, per-keystroke live counter

**Requirement Marker**:
The consistent visible and semantic indication of whether a field is required or optional. FormMuse states that unmarked fields are required and appends “(optional)” to optional labels, while control semantics and Zod agree.
_Avoid_: Unexplained asterisk, color-only requirement, optional-looking required field

**CLI Installation**:
An installation path that uses the shadcn CLI and a permanent direct HTTPS item URL in the form `https://<canonical-domain>/r/<canonical-slug>.json` to copy a Form Template and everything it requires into the adopter's application. Published commands never force overwrites or suppress conflict confirmation.
_Avoid_: FormMuse package installation

**CLI Compatibility**:
The two-level shadcn CLI policy: FormMuse pins and routinely tests one exact CLI version for reproducible registry generation, while public commands use `shadcn@latest` and publication requires a passing latest-version installation smoke test.
_Avoid_: Unpinned internal build, untested public latest command

**Installation Preflight**:
The compact compatibility check shown before installation: React, TypeScript, Tailwind CSS 4, and shadcn configured with Base UI. It offers explicit Base UI initialization when missing and warns without migrating when an existing project uses Radix.
_Avoid_: Automatic foundation migration, mandatory diagnostics for every human

**Manual Installation**:
An installation path that exposes every source file and every setup step required to add a Form Template without relying on an opaque installer.
_Avoid_: Partial code sample

**Agent Handoff**:
The template-specific instructions and machine-readable context that let an adopter's coding agent install a Form Template and connect its Submission Connection without redesigning the template.
_Avoid_: AI builder, FormMuse agent

**Template Page**:
The canonical, statically generated documentation page for one Form Template, rendered through a shared layout using its Registry Record, distributed source files, and referenced type-checked examples. V1 has no separate per-template MDX page.
_Avoid_: Gallery card, marketing page

**Complete Composition**:
The complete visual and interactive boundary installed for one Form Template and rendered inside its full Template Preview. It may be a compact section or an entire scrollable contact page; every in-composition section and asset shown in the preview ships with the template.
_Avoid_: Form fields detached from their designed page, hidden preview-only section, mandatory full-page layout

**Catalog Teaser**:
A lazy live view of a Form Template's opening viewport, rendered from its isolated static preview route inside a non-interactive catalog card. It provides visual motion and identity without loading every complete preview at initial page load.
_Avoid_: Static-only catalog, 20 eager iframes, interactive miniature form

**Preview Parity**:
The rule that the Complete Composition shown in a Template Preview matches the distributed template source and local assets. FormMuse preview chrome and the deterministic `onSubmit` simulation adapter remain repository-only and sit outside that distributed boundary.
_Avoid_: Preview-only artwork, code that cannot reproduce the preview

**Preview Isolation**:
The layered containment applied to static Template Previews through minimum iframe capabilities, a preview-specific Content Security Policy, restrictive Permissions Policy, no template-initiated network behavior, and a narrowly validated parent/frame protocol. Exact compatible directives are proven by the vertical slice.
_Avoid_: Treating iframe CSS separation as a security boundary, untested sandbox flags, arbitrary message bridge

**Preview Protocol**:
The small versioned parent/iframe message contract required for readiness, Reset, and Replay. It validates the expected window, origin when meaningful, channel, version, and exact message shape and never carries visitor values or executable instructions.
_Avoid_: Height synchronization for an internally scrolling preview, arbitrary command bus, form-value transfer

**Template API Guide**:
The canonical general documentation for the shared V1 Form Template contract: `onSubmit`, `defaultValues`, `className`, exported schemas and values types, submission states, failure handling, success persistence, and explicit reset behavior.
_Avoid_: Duplicating the universal contract differently on every Template Page

**Guide Content Pipeline**:
The headless `fumadocs-mdx` and `fumadocs-core` build-time processing used for FormMuse's eight general MDX guides and their structured search data. FormMuse owns all visual documentation components and does not adopt `fumadocs-ui`.
_Avoid_: Fumadocs theme dependency, per-template MDX page, documentation runtime server

**Build Toolchain**:
The exact Node.js 24 LTS and pnpm versions shared by local development, preview CI, production CI, and dependency metadata. A newer runtime becomes eligible only after reaching LTS and passing the complete FormMuse gate through an explicit reviewed upgrade.
_Avoid_: Node Current in production, floating pnpm version, provider-specific runtime drift

**Site Search**:
The accessible client-side command interface for finding Published Template Pages and public guides from static build-time data. It has no required public route, excludes Template Preview routes, and is a convenience rather than the only way to navigate.
_Avoid_: Runtime search service, indexed preview, navigation available only through JavaScript search

**Catalog View**:
One of the four deliberately simple V1 browsing states: All, Contact, Newsletter, or Quote Request. Category views preserve curated registry order and use controlled query parameters without becoming separately indexed pages.
_Avoid_: Marketplace faceting, popularity sort, empty speculative filter

**Registry Record**:
The single machine-readable description of a Form Template that drives its installation, documentation, catalog listing, search, and filters. Standard shadcn fields remain at the top level, while FormMuse-specific catalog and documentation metadata lives only under `meta.formmuse`.
_Avoid_: Separate catalog entry, duplicated metadata

**Template Block**:
The complete installable shadcn `registry:block` for one Form Template. It groups template-owned components, schemas, utilities, optional hooks, dependencies, and only genuinely required scoped styling into one installation unit.
_Avoid_: Single primitive item, repository-only files in installation

**FormMuse Metadata**:
The strictly validated `meta.formmuse` portion of a Registry Record. Its Zod schema is the sole runtime and TypeScript definition used by registry generation, the website, documentation, search, and filters.
_Avoid_: Handwritten duplicate interface, unvalidated metadata

**Controlled Vocabulary**:
A closed set of objective metadata values used for category, layout, animation technology, publication status, and appearance mode. Initial values must come from real launch templates and expand only when a Published Template requires them; subjective visual traits belong in tags.
_Avoid_: Speculative filter values, subjective appearance enum

**Template Version**:
The semantic version of the source currently published by FormMuse for one Form Template. It does not control or automatically change an adopter's copied implementation.
_Avoid_: Package version, automatic update

**Canonical Slug**:
The permanent lowercase kebab-case identity of a Form Template, shared by its registry name, source directory, Template Page route, Template Preview route, and generated registry item URL. A published Canonical Slug is never normally renamed.
_Avoid_: Title-derived mutable URL, separate registry and page IDs

**Template Preview**:
An isolated, interactive demonstration of a Form Template that exercises its validation, animation, and simulated Form States without sending data over a network.
_Avoid_: Screenshot, production submission

**Redistribution-safe Asset**:
An asset created by FormMuse or licensed so it may be copied, modified, and redistributed with a Form Template.
_Avoid_: Preview-only asset, unlicensed asset

**Template Asset**:
Artwork, iconography, or media rendered inside a Form Template. Every Template Asset visible inside its preview iframe must be distributed with the template, work without an external request, have recorded provenance, and receive meaningful alternative text or decorative accessibility treatment.
_Avoid_: Hidden preview-only artwork, remote CDN asset

**Asset Base URL**:
The optional initial location exposed only by a raster-using Form Template as `assetBaseUrl?: string`. It defaults to that template's local `/formmuse/<canonical-slug>` public directory but lets an adopter explicitly choose a deployment subpath or CDN.
_Avoid_: Asset prop on asset-free template, remote FormMuse preview asset

**Template Typography**:
Typography that inherits the adopter's application font and remains intentionally designed with sensible system fallbacks. A bundled font is an exceptional, concept-essential Redistribution-safe Asset rather than a normal template dependency.
_Avoid_: Remote runtime font, globally replaced adopter font

**Template Palette**:
The template-owned, root-scoped colors and visual tokens that preserve a Form Template's designed appearance without changing the adopter's global theme or shared Control Primitives. A fixed palette declares `light` or `dark`; an `adaptive` palette responds through the adopter's existing Tailwind dark-mode variant.
_Avoid_: Global theme override, universal color-prop object

**Root Class Extension**:
The universal `className?: string` customization point applied only to a Form Template's outermost rendered element and merged after its default root classes. It supports placement, sizing, and limited root-level styling without creating a slot map or theme API.
_Avoid_: `classNames` slot object, `styles` object, class prop on every internal part

**Responsive Frame**:
The inline space actually allocated to a Form Template by the adopter's layout. Form Templates adapt their internal composition to this space through fluid layout first and a slug-named container query only when a breakpoint is genuinely needed.
_Avoid_: Assuming desktop viewport width, device-label-only responsiveness

**Interaction Target**:
The complete pointer- and touch-activatable area of a control or action, including an associated label or non-overlapping wrapper when appropriate. FormMuse targets at least 44 by 44 CSS pixels for primary interactions while preserving keyboard-equivalent operation.
_Avoid_: Tiny icon hit box, overlapping invisible target

**Adopter**:
A developer or team that copies a Form Template into an application and owns the resulting code.
_Avoid_: Customer, end user

**Control Primitive**:
A standard interactive form building block—such as an input, button, checkbox, radio group, select, calendar, popover, or command menu—implemented with the corresponding shadcn component when one is suitable. Each Form Template includes only the Control Primitives it actually uses and styles them within the template's scope.
_Avoid_: FormMuse design system, globally restyled control

**Template Stylesheet**:
An optional colocated CSS Module used only when a Form Template needs selectors, pseudo-elements, or keyframes that are clearer than Tailwind classes. It is installed beside the template, imported relatively, and contains its own reduced-motion rules.
_Avoid_: Runtime style injection, unscoped global stylesheet

**Component Foundation**:
The primitive library beneath FormMuse's shadcn Control Primitives. Base UI is the sole officially supported Component Foundation in V1; templates consume it through local shadcn component files rather than importing Base UI directly.
_Avoid_: Multiple primitive targets, direct Base UI template imports

**Browser Support Window**:
The current and immediately previous stable major releases, measured when FormMuse publishes a tagged release, of Chrome, Edge, Firefox, Safari, iOS Safari, and Android Chrome. Support guarantees complete form behavior and a polished usable result rather than pixel-identical rendering.
_Avoid_: Internet Explorer, untested support claim, treating WebKit or device emulation as an actual branded browser or physical device

**Quality Toolchain**:
The non-overlapping repository-owned test stack: Vitest and Testing Library for isolated contracts, Playwright for browser integration and screenshots, axe for detectable accessibility violations, Lighthouse CI for built-site audits, Linkinator for exported-site links, and accessibility lint rules for source feedback.
_Avoid_: Duplicate runners, paid visual-regression dependency, automated accessibility certification claim

**Visual Baseline Environment**:
The pinned CI operating system, browser build, fonts, rendering settings, viewport, and device scale used to create and compare official Playwright screenshots. Baselines from a different environment are review artifacts, not authoritative replacements.
_Avoid_: Updating snapshots on whichever laptop differs, floating CI browser image

**Whole-site Quality Gate**:
The combined laboratory, manual, and production-field evidence required for the FormMuse website and Template Previews. Lighthouse CI enforces repeatable static-build thresholds, manual review covers applicable WCAG 2.2 Level A and AA criteria that automation cannot establish, and Core Web Vitals become field requirements once representative real-user data exists.
_Avoid_: Treating Lighthouse 100 as accessibility certification, treating lab data as real-user performance

**Performance Baseline**:
The measured JavaScript, asset, transfer, rendering, and interaction profile established by the completed Hanging Gifts vertical slice and used to detect later regressions. It is evidence-based and reviewable rather than an arbitrary pre-implementation byte budget.
_Avoid_: Guessed size limit, silently refreshed performance snapshot

**Distributed Template Source**:
The smallest useful set of adopter-owned files installed for a Form Template: its main component, a separate schema with an exported values type, and only the supporting components that the design genuinely needs. Tests, previews, documentation, and changelogs remain repository-only.
_Avoid_: One giant file, unnecessary file splitting, installed project documentation

**Content Slot**:
A small optional template-specific prop for a natural reusable piece of copy, such as a title or success message. Content Slots are not universal and do not replace direct editing of adopter-owned source.
_Avoid_: Universal content object, prop for every phrase

**Form Shape**:
The coordinated field set, Zod schema, inferred values type, defaults, rendered controls, validation messages, and optional step placement that define one Form Template. It is exported and editable as adopter-owned source rather than supplied through runtime configuration props.
_Avoid_: `fields` prop, replaceable `schema` prop, generic form builder

**Upload Field**:
A form control whose submitted value contains one or more browser `File` objects and therefore requires a dedicated transport, storage, validation, and security contract. Upload Fields are outside FormMuse V1 and may be reconsidered only after demonstrated demand.
_Avoid_: V1 attachment input, upload-looking UI without a secure backend contract

**Generated Output**:
Build-owned files created from authoritative source, including static registry JSON in `public/r/` and the exported site in `out/`. Generated Output is never edited manually; `out/` is never committed.
_Avoid_: Authored registry item, manually patched build file

**Security Gate**:
The repository and publication checks that protect FormMuse source, dependencies, registry output, static deployment, and distributed template code through least privilege, secret detection, dependency review, static analysis, and vulnerability triage.
_Avoid_: Security-by-client-validation, automatic dependency trust

**Public Source Repository**:
The complete owner-maintained FormMuse V1 codebase published for inspection, use, modification, and redistribution under MIT, including the static website, documentation system, registry, templates, tests, and build tooling. Public source does not create a community template-submission path.
_Avoid_: Partially closed website source, public marketplace, secrets committed with source

**Local Source Reference**:
Existing workspace material used only to understand or adapt original work, such as `website-v2/`. It remains outside FormMuse version control, builds, deployment, and MIT licensing until specific code or assets pass provenance and redistribution review.
_Avoid_: Nested second application, accidental relicensing, bulk copy into the public repository

**FormMuse Brand**:
The FormMuse name, logo, domain, and specifically designated Brand Assets, which are outside the MIT software licence and governed by a separate trademark and brand policy. The policy prevents forks or redistributors from implying official status or endorsement while allowing accurate references to FormMuse.
_Avoid_: Treating code copyright as a trademark registration, claiming every visual style as protected, blocking truthful attribution

**Brand Asset**:
A specific FormMuse logo or source-identifying artwork listed in `public/brand/README.md` as excluded from MIT. Brand Assets remain publicly inspectable but do not become reusable product branding merely because they are stored beside MIT-licensed source.
_Avoid_: Unlisted blanket “official visual identity,” accidental MIT logo grant

**Build Origin**:
The validated absolute origin of the current build, supplied through `FORMMUSE_SITE_URL` and interpreted with `FORMMUSE_DEPLOY_ENV`. It is local in development, temporary in previews, and the verified permanent HTTPS domain in production.
_Avoid_: Hardcoded hostname, temporary canonical domain

**Initial Values**:
The one-time starting values for a Form Template, exposed as `defaultValues?: Partial<FormValues>`. A template merges them with its complete internal defaults when it mounts and preserves that snapshot for explicit resets; later prop changes do not control or reinitialize the form.
_Avoid_: Controlled values, reactive defaults, automatic reinitialization

**Ephemeral Draft**:
Unsubmitted visitor values held only in the mounted React Hook Form instance. FormMuse does not write them to Web Storage, IndexedDB, cookies, browser history, query parameters, or URL fragments, so its own state disappears when the form unmounts or the page reloads.
_Avoid_: Silent draft recovery, persisted personal data, URL-backed form state

**Navigation Ownership**:
The adopter application's sole authority to decide whether page, route, tab, refresh, and browser-history navigation should be delayed or blocked. A Form Template never registers a leave warning or intercepts navigation to protect its Ephemeral Draft.
_Avoid_: `beforeunload`, route blocker, global back-button interception, template-owned leave dialog

**Legal Copy**:
Template-specific placeholder wording or a consent control included only when integral to that Form Template's dominant intent. It is not a universal field, legal advice, compliance guarantee, or promise of backend behavior, and adopters must review and replace it for their context.
_Avoid_: Universal privacy checkbox, pre-checked consent, fake policy link, “unsubscribe anytime” without adopter support

**Telemetry-free Template**:
A distributed Form Template that performs only its visible form behavior and never tracks visitors, emits analytics events, loads pixels or SDKs, creates identifiers, or sends FormMuse-owned network requests. Adopters add and own any analytics outside the template contract.
_Avoid_: `onAnalyticsEvent`, hidden beacon, tracking dependency, FormMuse phone-home request

**Site Analytics**:
Privacy-friendly aggregate traffic measurement loaded only by the production FormMuse website shell. It is hosting- and provider-agnostic, absent from non-production builds and Template Previews, and never collects form values or becomes part of a Template Block.
_Avoid_: User profile, fingerprint, cross-site tracking, public template popularity score

**Initial Production Host**:
Hostinger Premium static hosting as FormMuse's first operational deployment target. It does not become an architecture dependency; the same Generated Output may later move to another static host.
_Avoid_: Hostinger-specific application API, permanent hosting lock-in

**Production Artifact**:
The exact immutable `out/` output built and verified by GitHub Actions from `main`, then promoted to the Initial Production Host. A preview provider's independent rebuild is not the Production Artifact.
_Avoid_: Rebuilding unverified source on the production host, committing `out/`, treating a preview build as release authority

**Repository Release**:
A meaningful tagged FormMuse product milestone beginning with `v1.0.0`. It is independent from Template Versions and is not required for every passing production deployment from `main`.
_Avoid_: Tag per deployment, synchronized template bump, npm package version

**Deployment Manifest**:
The generated public `/formmuse-deployment.json` inside each Production Artifact, containing its schema version, commit SHA, build timestamp, deployment environment, nullable Repository Release version, and exact Published Template versions. It is built before final verification and travels with the artifact during promotion or rollback.
_Avoid_: Secret-bearing build dump, handwritten version list, rebuilding during rollback

**Production Deployment Credential**:
The secret used only by the protected production deployment job, with the narrowest access the actual host supports. Its account type and scope must be verified from the real Hostinger plan rather than assumed from generic FTP or SFTP documentation.
_Avoid_: Repository credential, preview credential, unverified promise of directory-scoped SFTP

**Preview Host**:
Cloudflare Pages as the replaceable V1 service for trusted same-repository branch and pull-request previews. It may rebuild preview source independently but has no production deployment authority or production credentials.
_Avoid_: Second production host, preview URL used as canonical, secret-bearing fork build

**Launch Analytics Provider**:
Cloudflare Web Analytics as the replaceable production-site implementation used to measure aggregate launch traffic and performance while FormMuse is hosted on Hostinger. It is isolated behind Site Analytics and is not an architecture, hosting, registry, or template dependency.
_Avoid_: Permanent Cloudflare dependency, custom tracking workaround, analytics inside Template Preview
