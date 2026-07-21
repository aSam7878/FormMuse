# Prefer the newest compatible stable dependency

FormMuse will select the newest stable package version that is officially compatible with the complete locked toolchain rather than automatically selecting the numerically newest publication. Unsupported peer ranges, suppressed compatibility warnings, release candidates, beta versions, canaries, and nightly builds are not acceptable merely to claim a newer version.

Accordingly, V1 will use TypeScript 6.0.3 instead of the provisional TypeScript 7.0.2. The current `typescript-eslint` line used by `eslint-config-next` officially supports TypeScript versions below 6.1. TypeScript 7 becomes eligible only after the selected linting and critical framework ecosystem officially supports it and the complete FormMuse quality and deployment gates pass.

The same rule applies to ESLint: V1 will use ESLint 9.39.5 instead of 10.7.0 because the React, import, and JSX-accessibility plugins selected by Next.js 16 currently declare support only through ESLint 9. FormMuse will not ignore peer failures to force ESLint 10.

Direct repository dependencies will be exact in `package.json`, with `pnpm-lock.yaml` as the executable resolved graph. A newer stable release creates an update candidate, not an automatic upgrade. Every accepted update must preserve registry generation, static export, Next.js and Vite compatibility, previews, tests, accessibility, performance, and deployment behavior.
