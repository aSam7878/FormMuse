# Official visual baseline environment

The official automated visual baseline runs in the `Official Chromium visual
baseline` GitHub Actions job on `ubuntu-24.04`. It uses Node.js 24.18.0, the
frozen pnpm graph, and the Chromium build coupled to `@playwright/test` 1.61.1.
The job installs that browser with its system dependencies before it compares
the repository-owned snapshots in `tests/visual/__snapshots__/`.

The visual configuration fixes locale to `en-US`, timezone to `UTC`, light
color scheme, device scale factor 1, and the listed viewport for every state.
Each test installs the fixed 2026-07-24 clock before navigation, waits for
document fonts, and disables screenshot animation and caret rendering. The
generated Geist asset remains part of the reviewed static build; no template or
preview runtime font request is permitted.

The state-only captures clip the form state itself and hide the fixed preview
navigation only for that capture. This prevents parent-page chrome or focus
scroll position from contaminating a form-state baseline; the separate
Template Page snapshot remains the review artifact for preview chrome.

`pnpm quality:visual` only compares snapshots. It never updates them. Run
`pnpm exec playwright test --config=playwright.visual.config.ts --update-snapshots`
only as a deliberate local review draft. The resulting diff must be inspected,
committed intentionally, and accepted by the Ubuntu CI job before it becomes
the official baseline. The test project is named for its official Ubuntu
environment; it is not branded-browser or physical-device evidence.
