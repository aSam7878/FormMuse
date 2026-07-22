# FormMuse Tech Stack

> **Agent instruction — authoritative V1 stack**
> This document is the source of truth for FormMuse technology choices and version pins. Coding agents must not upgrade, downgrade, substitute, or add overlapping frameworks and tools without an explicit reviewed architecture change. Once the application is initialized, `package.json` records direct pins and `pnpm-lock.yaml` is the executable resolved dependency graph. If a new package appears numerically newer than a version below, do not update automatically.

Versions were verified on **2026-07-21** against official release information and npm's stable `latest` tags. FormMuse chooses the newest stable version officially compatible with the complete toolchain, not blindly the numerically newest publication.

## 1. Product shape

FormMuse V1 is one public repository containing one fully static Next.js application. The repository contains the website, eight MDX guides, registry-authored Form Templates, generated registry files, isolated previews, examples, tests, compatibility fixtures, changelogs, and build scripts.

It is not a monorepo and has no database, CMS, API server, Server Actions, middleware, ISR, custom registry server, hosted form backend, or traditional FormMuse component npm package.

## 2. Runtime and package manager

| Purpose | Locked choice | Version |
|---|---|---:|
| Build runtime | Node.js LTS | `24.18.0` |
| Repository package manager | pnpm | `11.15.1` |
| Node typings | `@types/node` | `24.13.3` |

Pin Node and pnpm identically in local runtime files, `package.json`, GitHub Actions, Cloudflare Pages, and production artifact builds. Node 26 is a Current release and is excluded. A future Node major becoming LTS makes it eligible for review; it does not authorize an automatic upgrade.

Use pnpm for FormMuse development. User-facing installation documentation must still show pnpm, npm, Yarn, and Bun commands invoking `shadcn@latest`.

## 3. Website application

| Purpose | Package | Version |
|---|---|---:|
| Static website framework | `next` | `16.2.10` |
| UI runtime | `react` | `19.2.7` |
| DOM renderer | `react-dom` | `19.2.7` |
| Language | `typescript` | `6.0.3` |
| React typings | `@types/react` | `19.2.17` |
| React DOM typings | `@types/react-dom` | `19.2.3` |
| Site theme preference | `next-themes` | `0.4.6` |

Use the Next.js App Router and `output: "export"`. The generated `out/` directory is the complete portable deployment artifact and is never committed. Do not use runtime server features or framework-specific APIs inside Distributed Template Source.

TypeScript `7.0.2` is deliberately excluded because the selected `typescript-eslint` toolchain officially supports TypeScript only below `6.1.0`. Do not suppress that compatibility warning.

## 4. Styling and component foundation

| Purpose | Package | Version |
|---|---|---:|
| Utility CSS | `tailwindcss` | `4.3.3` |
| Tailwind PostCSS adapter | `@tailwindcss/postcss` | `4.3.3` |
| CSS processing | `postcss` | `8.5.20` |
| Registry and component CLI | `shadcn` | `4.13.1` |
| Sole supported primitive foundation | `@base-ui/react` | `1.6.0` |
| Icons | `lucide-react` | `1.25.0` |
| Conditional class composition | `clsx` | `2.1.1` |
| Tailwind conflict merging | `tailwind-merge` | `3.6.0` |
| Variant utility | `class-variance-authority` | `0.7.1` |
| Shared shadcn animation utilities | `tw-animate-css` | `1.4.0` |

Use shadcn controls backed only by Base UI. Distributed templates import controls through adopter-local `components/ui/*` paths and never import `@base-ui/react` directly. Each registry block declares only the controls and packages it actually needs.

Tailwind handles ordinary styling and simple transitions. A colocated CSS Module is allowed for complex selectors, pseudo-elements, or keyframes. Do not add runtime style injection, global template palettes, CSS-in-JS, Sass, styled-components, or another design system.

## 5. Forms and validation

| Purpose | Package | Version |
|---|---|---:|
| Form state | `react-hook-form` | `7.82.0` |
| Runtime schemas and inferred types | `zod` | `4.4.3` |
| React Hook Form Zod integration | `@hookform/resolvers` | `5.4.0` |

Every Form Template uses this baseline and exports one Zod schema plus the inferred parsed values type. The universal contract is `onSubmit: (values) => Promise<void>`. FormMuse provides no backend.

Do not add Formik, Yup, Valibot, a custom response type, runtime `fields` configuration, runtime `schema` replacement, or a generic form-builder layer.

## 6. Animation

| Level | Package | Version | Use |
|---|---|---:|---|
| First | Tailwind and CSS | Stack versions above | Simple transitions, keyframes, decorative loops, and reduced-motion fallbacks |
| Default JavaScript animation | `motion` | `12.42.2` | Presence, state transitions, gestures, springs, and React-oriented choreography |
| Exceptional complex animation | `gsap` | `3.15.0` | Complex timelines, advanced sequencing, SVG choreography, or justified scroll behavior |
| GSAP React integration | `@gsap/react` | `2.1.2` | Scoped React lifecycle and cleanup when GSAP is used |

Motion is the successor package to Framer Motion and is FormMuse's default JavaScript animation dependency. GSAP is not installed into every template. A template may declare GSAP only when its implementation contains a written justification that Motion or CSS would materially weaken clarity or quality.

Every animation supports `prefers-reduced-motion`, prioritizes transforms and opacity, cleans up on unmount, and is tested for Reset and Replay behavior.

## 7. Documentation and static search

| Purpose | Package | Version |
|---|---|---:|
| Headless documentation logic | `fumadocs-core` | `16.11.5` |
| MDX content pipeline | `fumadocs-mdx` | `15.2.0` |
| MDX typings | `@types/mdx` | `2.0.14` |
| Syntax highlighting, when directly required | `shiki` | `4.3.1` |

Use Fumadocs only for the eight general guides and their structured search data. Build all layouts, navigation, typography, code presentation, and search UI specifically for FormMuse.

Do not install `fumadocs-ui`. Do not add its providers, themes, layouts, or global CSS. Template Pages remain generated from validated registry metadata and type-checked examples, not per-template MDX files.

Generate a normal static search index at build time from guide content and Published Template metadata. Search locally in the browser without an API route, server, database, or hosted search provider.

## 8. Compatibility fixtures and scripts

| Purpose | Package | Version |
|---|---|---:|
| Vite compatibility fixture | `vite` | `8.1.5` |
| React Vite integration | `@vitejs/plugin-react` | `6.0.3` |
| Repository TypeScript scripts | `tsx` | `4.23.1` |
| Local static-export server | `serve` | `14.2.6` |

Next.js and Vite fixtures are repository test inputs, not workspace packages or separately maintained applications. Do not turn the repository into a monorepo to host fixtures.

## 9. Tests and quality tooling

| Purpose | Package | Version |
|---|---|---:|
| Unit and component test runner | `vitest` | `4.1.10` |
| Coverage | `@vitest/coverage-v8` | `4.1.10` |
| DOM environment | `jsdom` | `29.1.1` |
| React component testing | `@testing-library/react` | `16.3.2` |
| DOM queries | `@testing-library/dom` | `10.4.1` |
| Visitor interaction simulation | `@testing-library/user-event` | `14.6.1` |
| DOM assertions | `@testing-library/jest-dom` | `7.0.0` |
| Browser and screenshot testing | `@playwright/test` | `1.61.1` |
| Browser accessibility integration | `@axe-core/playwright` | `4.12.1` |
| Accessibility engine | `axe-core` | `4.12.1` |
| Lighthouse automation | `@lhci/cli` | `0.15.1` |
| Exported-site link crawler | `linkinator` | `7.6.1` |

Vitest and Testing Library own isolated schemas, utilities, registry logic, form behavior, validation, focus, and submission states. Playwright owns browser integration, iframe previews, keyboard workflows, responsive and reduced-motion behavior, screenshots, network isolation, Reset and Replay, static output, and compatibility flows.

Do not add Jest, Cypress, Storybook, Chromatic, Percy, or another overlapping runner or paid visual-regression service in V1.

## 10. Linting and formatting

| Purpose | Package | Version |
|---|---|---:|
| Linter | `eslint` | `9.39.5` |
| Next.js lint configuration | `eslint-config-next` | `16.2.10` |
| JSX accessibility rules | `eslint-plugin-jsx-a11y` | `6.10.2` |
| Formatter | `prettier` | `3.9.5` |
| Tailwind-aware formatting | `prettier-plugin-tailwindcss` | `0.8.1` |

ESLint 10 is deliberately excluded because the current React, import, and JSX-accessibility plugins selected by Next.js 16 officially support ESLint only through 9.x. `eslint-config-next` currently resolves the compatible `typescript-eslint` 8.x line. Do not force TypeScript 7, disable unsupported-version warnings, force ESLint 10, or add a competing lint stack.

## 11. Registry dependency ownership

The repository needs all packages required to build the site and published previews, but an adopter must receive only one template's actual dependencies:

- `registryDependencies` contains only the shadcn controls used by that template.
- `dependencies` contains only the template's required npm packages.
- CSS-only templates do not receive Motion or GSAP.
- Motion templates do not receive GSAP.
- Asset-free templates do not receive raster assets or `assetBaseUrl`.
- If the pinned shadcn builder cannot preserve an approved raster's binary bytes, only a standalone template-owned SVG `registry:file` may carry that exact raster as Base64. It remains a local public asset, must pass deterministic decode/hash, size, CSP, Next.js, Vite, browser-engine, locality, and zero-external-request checks, and never authorizes Base64 in TypeScript, TSX, JavaScript, JSX, CSS, or HTML.
- Tests, previews, examples, changelogs, Fumadocs, Next.js, and FormMuse website tooling are never distributed.

Use relative imports between files inside `components/formmuse/<template-slug>/`. Use adopter-local shadcn aliases only for shared controls and utilities.

## 12. Hosting, previews, analytics, and licensing

| Area | Locked V1 choice |
|---|---|
| Build output | Fully static Next.js `out/` export |
| Production build authority | GitHub Actions |
| Initial production host | Hostinger Premium static hosting |
| Branch and pull-request previews | Cloudflare Pages, preview-only |
| Launch site analytics | Cloudflare Web Analytics, production site shell only |
| Source and template licence | MIT |
| Name, logo, domain, and listed brand assets | Separate trademark and brand policy |

Analytics is absent from development, preview deployments, preview iframes, registry items, and Distributed Template Source. Deployment credentials remain outside the repository. The exact Hostinger promotion and rollback commands must be proven against the real account during the Hanging Gifts vertical slice.

## 13. Dependency update rule

All direct repository dependencies use exact versions. `pnpm-lock.yaml` is committed and CI installs with `pnpm install --frozen-lockfile`.

A newer release is only an update candidate. Accept it only when:

1. It is stable and officially compatible with the full stack.
2. Peer-dependency and runtime warnings remain clean.
3. Licences and supply-chain changes have been reviewed.
4. Registry generation and CLI installation pass.
5. Static export, Next.js, and Vite fixtures pass.
6. Unit, component, browser, accessibility, visual, reduced-motion, network, performance, and deployment gates pass.

Do not auto-merge dependency upgrades. Do not use prereleases, canaries, nightly packages, `--force`, ignored peer conflicts, or suppressed compatibility warnings to claim a newer stack.
