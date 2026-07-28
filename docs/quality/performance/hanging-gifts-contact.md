# Hanging Gifts Stage 5.1 laboratory baseline

Measured on 2026-07-27 from baseline commit
`484bf6d00ef6842e713954c5e8340305ef441439`. These results are laboratory
observations, not field data and not approved performance budgets.

The machine-readable samples are in
`hanging-gifts-contact.raw.json`. Reproduce them with the pinned Node 24.18.0
and pnpm 11.15.1 toolchain:

```text
pnpm quality:performance-baseline
```

The command creates a fresh preview static export, serves it over loopback,
and replaces the raw report. Timing and memory observations are expected to
vary; a baseline change requires review rather than a blind report update.

## Environment and method

- macOS arm64 host, Playwright 1.61.1, headless Chromium 149.0.7827.55, UTC,
  `en-US`, light color scheme, and a new browser context for every sample.
- Desktop profile: 1440 × 900 CSS pixels, device scale 1, no CPU or network
  throttling.
- Mobile-class profile: 390 × 844 CSS pixels, device scale 2.75, 4× CPU
  slowdown, 150 ms latency, 1.6 Mbit/s download, and 750 Kbit/s upload.
- Three repetitions per scenario. Tables below use the middle observed value
  unless a range is shown.
- LCP, CLS, paint, long tasks, and frame cadence come from browser performance
  observers; task duration and heap are Chromium CDP laboratory estimates.
- Hydration readiness is the elapsed time until network idle and, for an
  interactive preview, a visible editable first-name field. It is not a React
  internal timestamp.
- Scenario transport is the sum of loopback response bodies. The local static
  server does not compress them. Static-artifact gzip and Brotli values are
  deterministic compression estimates, not observed host delivery.

## Approved test-only catalog harness

The public `/templates` catalog route does not exist yet. The owner approved a
test-only harness for Stage 5.1 so measurement would not pull Stage 7 site UI
work forward. The harness server-renders the real `CatalogTeaser` component,
loads the real exported Hanging Gifts preview route, and is fulfilled by
Playwright at a same-origin laboratory URL. It is never written to `app/`,
included in `out/`, indexed, linked, or treated as public catalog evidence.

The harness represents explicit populations before Stage 5.6 selects the real
lifecycle:

- one inactive teaser;
- one active teaser;
- twenty inactive slots;
- twenty slots with three nearby active teasers; and
- twenty slots with eight retained active/visited teasers distributed through
  the grid, including off-screen instances.

Future agents must continue to label these as representative laboratory
scenarios. They do not authorize a public catalog route or freeze activation,
pause, unmount, or reactivation behavior.

## Static artifact and dependency contribution

The complete preview artifact contains 73 files totalling 3,958,306 raw bytes,
1,760,354 estimated gzip bytes, and 1,511,253 estimated Brotli bytes.

| Kind                | Files | Raw bytes | Gzip estimate | Brotli estimate |
| ------------------- | ----: | --------: | ------------: | --------------: |
| HTML and route data |    38 | 1,531,480 |       791,934 |         624,026 |
| JavaScript          |    16 | 1,734,571 |       497,052 |         424,052 |
| CSS                 |     2 |    91,196 |        17,191 |          14,586 |
| Fonts               |    10 |   179,756 |       180,011 |         179,779 |
| Images              |     3 |   168,158 |       126,768 |         126,502 |
| JSON                |     4 |   253,145 |       147,398 |         142,308 |

The desktop preview loaded 757,004 bytes of JavaScript from two response
resources that the homepage did not load. This is the measured incremental
preview resource graph, not a package-by-package bundle attribution. Hanging
Gifts declares the materially used animation packages `@gsap/react@2.1.2`,
`gsap@3.15.0`, and `motion@12.42.2`; the raw report retains the exact resource
URLs and sizes.

## Preview observations

| Scenario                     |    Ready |      LCP |           CLS | Scripted interaction | Steady/scroll task work |  JS heap | Frame interval p95 |
| ---------------------------- | -------: | -------: | ------------: | -------------------: | ----------------------: | -------: | -----------------: |
| Full preview, desktop        |   557 ms | 4,664 ms |      0–0.0033 |             34.67 ms |               435.32 ms |  9.31 MB |            17.6 ms |
| Full preview, reduced motion |   553 ms | 4,632 ms | 0.0004–0.0037 |             25.31 ms |                78.17 ms |  7.52 MB |            17.6 ms |
| Full preview, mobile-class   | 3,675 ms | 7,720 ms |        0.0021 |             18.41 ms |                51.88 ms | 28.82 MB |            17.6 ms |
| Template Page plus iframe    |   592 ms | 4,668 ms |        0.0061 |             27.67 ms |               677.46 ms | 11.74 MB |            17.6 ms |

Desktop and Template Page samples recorded no long tasks. Each mobile-class
sample recorded one or two long tasks; the longest task ranged from 84 to 92
ms. The mobile heap estimate varied materially (20.81–30.68 MB), so Stage 5.2
must not treat one point as a stable device-memory truth.

The late LCP values track the intentionally animated entrance and require an
explicit Stage 5.2 decision; the existing Stage 4 Lighthouse score and this
observer timing measure different laboratory conditions. Reduced motion cut
median steady/scroll task work from 435.32 ms to 78.17 ms without reducing the
transport graph.

## Catalog Teaser observations

| Scenario                             | Response bodies | JavaScript responses |  JS heap | Task work | >50 ms frame gaps |
| ------------------------------------ | --------------: | -------------------: | -------: | --------: | ----------------: |
| One inactive                         |        81,310 B |                  0 B |  1.08 MB |  15.81 ms |                 0 |
| One active                           |     1,721,180 B |          1,271,439 B |  7.45 MB | 303.83 ms |                 0 |
| 20 inactive                          |       106,135 B |                  0 B |  1.08 MB |  18.84 ms |                 0 |
| 20 with 3 nearby active              |     5,025,745 B |          3,814,317 B | 12.24 MB | 263.42 ms |               0–1 |
| 20 with 8 retained active/off-screen |    13,225,098 B |         10,171,512 B | 30.30 MB | 503.10 ms |             12–29 |

The inactive 20-slot grid loads no preview JavaScript. Retaining visited
off-screen previews scales response bodies, heap, documents, nodes, and missed
frames sharply. This is evidence for Stage 5.2 proposals and Stage 5.6 lifecycle
selection; it does not itself approve a threshold or implementation.

All 30 accepted samples recorded zero external requests and zero page or
console errors.

## Limitations and next decisions

- The observations are local laboratory samples, not production RUM or Core
  Web Vitals field data.
- Chromium/CDP supplies the detailed task and heap evidence. Branded-browser
  and physical-device evidence remains Stage 5.7 work.
- The current static server repeats identical preview response bodies across
  multiple iframes; later host caching/compression behavior is not assumed.
- Event Timing did not report a duration for the programmatic fill, so the
  report retains a scripted round-trip proxy and does not call it INP.
- Stage 5.2 must propose reviewable thresholds from these ranges and stop for
  owner approval before they become policy.
