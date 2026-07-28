import { execFileSync, spawn, type ChildProcess } from "node:child_process";
import { brotliCompressSync, gzipSync } from "node:zlib";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

import { chromium, type BrowserContext, type Page } from "@playwright/test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { CatalogTeaser } from "../components/catalog/catalog-teaser";

Object.assign(globalThis, { React });

const root = process.cwd();
const origin = "http://127.0.0.1:3100";
const previewOrigin = "http://127.0.0.1:3101";
const previewPath = "/preview/hanging-gifts-contact/";
const templatePath = "/templates/hanging-gifts-contact/";
const outputPath = resolve(
  root,
  "docs/quality/performance/hanging-gifts-contact.raw.json",
);

type Profile = Readonly<{
  id: "desktop" | "mobile-class";
  viewport: { width: number; height: number };
  deviceScaleFactor: number;
  cpuSlowdown: number;
  network: null | {
    latency: number;
    downloadThroughput: number;
    uploadThroughput: number;
  };
}>;

const profiles: readonly Profile[] = [
  {
    id: "desktop",
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    cpuSlowdown: 1,
    network: null,
  },
  {
    id: "mobile-class",
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2.75,
    cpuSlowdown: 4,
    network: {
      latency: 150,
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
    },
  },
] as const;

function percentile(values: readonly number[], fraction: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  return (
    sorted[
      Math.min(sorted.length - 1, Math.ceil(fraction * sorted.length) - 1)
    ] ?? 0
  );
}

function rounded(value: number, digits = 2): number {
  return Number(value.toFixed(digits));
}

function filesBelow(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesBelow(path) : [path];
  });
}

function assetKind(path: string): string {
  const extension = extname(path).toLowerCase();
  if (extension === ".html" || extension === ".txt") return "html-data";
  if (extension === ".css") return "css";
  if (extension === ".js") return "javascript";
  if ([".woff", ".woff2", ".ttf", ".otf"].includes(extension)) return "font";
  if (
    [".avif", ".gif", ".jpeg", ".jpg", ".png", ".svg", ".webp"].includes(
      extension,
    )
  )
    return "image";
  if (extension === ".json") return "json";
  return "other";
}

function staticInventory() {
  const directory = resolve(root, "out");
  const entries = filesBelow(directory).map((path) => {
    const bytes = readFileSync(path);
    return {
      path: relative(directory, path).replaceAll("\\", "/"),
      kind: assetKind(path),
      rawBytes: bytes.byteLength,
      gzipBytes: gzipSync(bytes, { level: 9 }).byteLength,
      brotliBytes: brotliCompressSync(bytes).byteLength,
    };
  });
  const totals: Record<
    string,
    { files: number; rawBytes: number; gzipBytes: number; brotliBytes: number }
  > = {};
  for (const entry of entries) {
    const total = (totals[entry.kind] ??= {
      files: 0,
      rawBytes: 0,
      gzipBytes: 0,
      brotliBytes: 0,
    });
    total.files += 1;
    total.rawBytes += entry.rawBytes;
    total.gzipBytes += entry.gzipBytes;
    total.brotliBytes += entry.brotliBytes;
  }
  return { totals, entries };
}

function stylesheetUrls(): string[] {
  const html = readFileSync(resolve(root, "out/index.html"), "utf8");
  return [
    ...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/gu),
  ].map((match) => new URL(match[1]!, origin).href);
}

function teaserMarkup(
  count: number,
  activeIndexes: ReadonlySet<number>,
): string {
  return Array.from({ length: count }, (_, index) =>
    renderToStaticMarkup(
      React.createElement(CatalogTeaser, {
        title: `Hanging Gifts ${index + 1}`,
        description:
          "Representative laboratory slot using the real Catalog Teaser component.",
        templatePath,
        previewPath,
        previewOrigin,
        active: activeIndexes.has(index),
      }),
    ),
  ).join("");
}

function harnessHtml(
  count: number,
  activeIndexes: ReadonlySet<number>,
): string {
  const styles = stylesheetUrls()
    .map((href) => `<link rel="stylesheet" href="${href}">`)
    .join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><base href="${origin}/">${styles}<style>body{margin:0;background:#f6f1e8}.lab-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;padding:24px;align-items:start}</style></head><body><main class="lab-grid">${teaserMarkup(count, activeIndexes)}</main></body></html>`;
}

async function waitForServer(): Promise<void> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const [siteResponse, previewResponse] = await Promise.all([
        fetch(origin),
        fetch(`${previewOrigin}${previewPath}`),
      ]);
      if (siteResponse.ok && previewResponse.ok) return;
    } catch {}
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 100));
  }
  throw new Error("Static performance server did not start.");
}

function startServer(): ChildProcess {
  return spawn(
    "node",
    ["--import", "tsx", "scripts/serve-preview-origins.mts"],
    {
      cwd: root,
      env: { ...process.env, FORMMUSE_SITE_URL: origin },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
}

async function configureProfile(
  context: BrowserContext,
  page: Page,
  profile: Profile,
) {
  const session = await context.newCDPSession(page);
  await session.send("Performance.enable");
  await session.send("Emulation.setCPUThrottlingRate", {
    rate: profile.cpuSlowdown,
  });
  if (profile.network) {
    await session.send("Network.enable");
    await session.send("Network.emulateNetworkConditions", {
      offline: false,
      ...profile.network,
      connectionType: "cellular4g",
    });
  }
  return session;
}

async function installObservers(page: Page): Promise<void> {
  await page.addInitScript({
    content: `(() => {
      const state = { cls: 0, events: [], frameIntervals: [], longTasks: [], lcp: 0, paints: {} };
      Object.defineProperty(window, "__formmusePerformance", { value: state });
      const observe = (type, callback) => {
        try {
          const observer = new PerformanceObserver((list) => list.getEntries().forEach(callback));
          observer.observe({ type, buffered: true });
        } catch {}
      };
      observe("largest-contentful-paint", (entry) => { state.lcp = Math.max(state.lcp, entry.startTime); });
      observe("layout-shift", (entry) => { if (!entry.hadRecentInput) state.cls += entry.value || 0; });
      observe("longtask", (entry) => state.longTasks.push(entry.duration));
      observe("event", (entry) => state.events.push(entry.duration));
      observe("paint", (entry) => { state.paints[entry.name] = entry.startTime; });
      let previous = performance.now();
      const sample = (now) => {
        state.frameIntervals.push(now - previous);
        previous = now;
        requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    })();`,
  });
}

type Scenario = Readonly<{
  id: string;
  run: number;
  profile: Profile;
  reducedMotion?: boolean;
  url?: string;
  harness?: { count: number; activeIndexes: ReadonlySet<number> };
  interact?: boolean;
  settleMs: number;
}>;

async function collectScenario(
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  scenario: Scenario,
) {
  const context = await browser.newContext({
    viewport: scenario.profile.viewport,
    deviceScaleFactor: scenario.profile.deviceScaleFactor,
    reducedMotion: scenario.reducedMotion ? "reduce" : "no-preference",
    locale: "en-US",
    timezoneId: "UTC",
    colorScheme: "light",
  });
  const page = await context.newPage();
  await installObservers(page);
  const session = await configureProfile(context, page, scenario.profile);
  const resources: Array<{
    url: string;
    kind: string;
    bytes: number;
    encodedBytes: number;
  }> = [];
  const responseTasks: Promise<void>[] = [];
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("response", (response) => {
    responseTasks.push(
      (async () => {
        try {
          const request = response.request();
          const body = await response.body();
          resources.push({
            url: response.url(),
            kind: request.resourceType(),
            bytes: body.byteLength,
            encodedBytes: Number(
              response.headers()["content-length"] ?? body.byteLength,
            ),
          });
        } catch {}
      })(),
    );
  });

  const start = Date.now();
  if (scenario.url) {
    const scenarioOrigin = scenario.url.startsWith("/preview/")
      ? previewOrigin
      : origin;
    await page.goto(new URL(scenario.url, scenarioOrigin).href, {
      waitUntil: "networkidle",
    });
  } else if (scenario.harness) {
    await page.route("**/__formmuse-performance-harness", async (route) => {
      await route.fulfill({
        body: harnessHtml(
          scenario.harness!.count,
          scenario.harness!.activeIndexes,
        ),
        contentType: "text/html; charset=utf-8",
        status: 200,
      });
    });
    await page.goto(`${origin}/__formmuse-performance-harness`, {
      waitUntil: "networkidle",
    });
  }
  let targetFrame = page.mainFrame();
  if (scenario.interact) {
    targetFrame =
      page
        .frames()
        .find((frame) =>
          new URL(frame.url()).pathname.startsWith(
            "/preview/hanging-gifts-contact",
          ),
        ) ?? page.mainFrame();
    await targetFrame.getByLabel("First name").waitFor({ state: "visible" });
  }
  const readyMs = Date.now() - start;
  const beforeSteady = await session.send("Performance.getMetrics");
  await page.waitForTimeout(scenario.settleMs);

  let interactionMs: number | null = null;
  if (scenario.interact) {
    const input = targetFrame.getByLabel("First name");
    const interactionStart = performance.now();
    await input.fill("Avery");
    await targetFrame.evaluate(
      () =>
        new Promise<void>((resolvePromise) =>
          requestAnimationFrame(() => resolvePromise()),
        ),
    );
    interactionMs = performance.now() - interactionStart;
  }

  const scrollStart = performance.now();
  await page.evaluate(async () => {
    const maximum = Math.max(
      0,
      document.documentElement.scrollHeight - innerHeight,
    );
    for (let step = 1; step <= 12; step += 1) {
      scrollTo(0, (maximum * step) / 12);
      await new Promise<void>((resolvePromise) =>
        requestAnimationFrame(() => resolvePromise()),
      );
    }
    scrollTo(0, 0);
  });
  const scrollMs = performance.now() - scrollStart;
  const afterSteady = await session.send("Performance.getMetrics");
  const cdpBefore = Object.fromEntries(
    beforeSteady.metrics.map(({ name, value }) => [name, value]),
  );
  const cdpAfter = Object.fromEntries(
    afterSteady.metrics.map(({ name, value }) => [name, value]),
  );

  const frameMetrics = await Promise.all(
    page.frames().map(async (frame) => {
      try {
        return await frame.evaluate(() => {
          const state = (
            window as Window & {
              __formmusePerformance?: {
                cls: number;
                events: number[];
                frameIntervals: number[];
                longTasks: number[];
                lcp: number;
                paints: Record<string, number>;
              };
            }
          ).__formmusePerformance;
          const navigation = performance.getEntriesByType("navigation")[0] as
            PerformanceNavigationTiming | undefined;
          return {
            state,
            navigation: navigation
              ? {
                  domContentLoadedMs: navigation.domContentLoadedEventEnd,
                  loadMs: navigation.loadEventEnd,
                  responseEndMs: navigation.responseEnd,
                }
              : null,
          };
        });
      } catch {
        return null;
      }
    }),
  );
  const states = frameMetrics.flatMap((metric) =>
    metric?.state ? [metric.state] : [],
  );
  const intervals = states
    .flatMap((state) => state.frameIntervals)
    .filter((value) => value < 1000);
  const longTasks = states.flatMap((state) => state.longTasks);
  const events = states.flatMap((state) => state.events);
  await Promise.all(responseTasks);
  const resourceList = [...resources].sort((left, right) =>
    left.url.localeCompare(right.url),
  );
  const externalRequests = resourceList.filter(
    (resource) =>
      ![origin, previewOrigin].includes(new URL(resource.url).origin),
  );
  const result = {
    id: scenario.id,
    run: scenario.run,
    profile: scenario.profile.id,
    reducedMotion: Boolean(scenario.reducedMotion),
    url: scenario.url ?? "test-only-catalog-harness",
    harness: scenario.harness
      ? {
          count: scenario.harness.count,
          activeIndexes: [...scenario.harness.activeIndexes],
        }
      : null,
    readyMs,
    navigation: frameMetrics[0]?.navigation ?? null,
    rendering: {
      lcpMs: rounded(Math.max(0, ...states.map((state) => state.lcp))),
      cls: rounded(
        states.reduce((sum, state) => sum + state.cls, 0),
        4,
      ),
      firstContentfulPaintMs: rounded(
        Math.max(
          0,
          ...states.map((state) => state.paints["first-contentful-paint"] ?? 0),
        ),
      ),
    },
    interaction: {
      scriptedRoundTripMs:
        interactionMs === null ? null : rounded(interactionMs),
      eventTimingP95Ms:
        events.length === 0 ? null : rounded(percentile(events, 0.95)),
    },
    mainThread: {
      taskDurationDuringSettleAndScrollMs: rounded(
        ((cdpAfter.TaskDuration ?? 0) - (cdpBefore.TaskDuration ?? 0)) * 1000,
      ),
      scriptDurationDuringSettleAndScrollMs: rounded(
        ((cdpAfter.ScriptDuration ?? 0) - (cdpBefore.ScriptDuration ?? 0)) *
          1000,
      ),
      longTaskCount: longTasks.length,
      longTaskTotalMs: rounded(
        longTasks.reduce((sum, value) => sum + value, 0),
      ),
      longestTaskMs: rounded(Math.max(0, ...longTasks)),
    },
    memory: {
      jsHeapUsedBytes: rounded(cdpAfter.JSHeapUsedSize ?? 0, 0),
      jsHeapTotalBytes: rounded(cdpAfter.JSHeapTotalSize ?? 0, 0),
      documents: rounded(cdpAfter.Documents ?? 0, 0),
      nodes: rounded(cdpAfter.Nodes ?? 0, 0),
    },
    frames: {
      samples: intervals.length,
      p95IntervalMs: rounded(percentile(intervals, 0.95)),
      over20ms: intervals.filter((value) => value > 20).length,
      over50ms: intervals.filter((value) => value > 50).length,
      scrollRoundTripMs: rounded(scrollMs),
    },
    transport: {
      requestCount: resourceList.length,
      decodedBytes: resourceList.reduce(
        (sum, resource) => sum + resource.bytes,
        0,
      ),
      encodedBytes: resourceList.reduce(
        (sum, resource) => sum + resource.encodedBytes,
        0,
      ),
      javascriptBytes: resourceList
        .filter((resource) => resource.kind === "script")
        .reduce((sum, resource) => sum + resource.bytes, 0),
      imageBytes: resourceList
        .filter((resource) => resource.kind === "image")
        .reduce((sum, resource) => sum + resource.bytes, 0),
      fontBytes: resourceList
        .filter((resource) => resource.kind === "font")
        .reduce((sum, resource) => sum + resource.bytes, 0),
      cssBytes: resourceList
        .filter((resource) => resource.kind === "stylesheet")
        .reduce((sum, resource) => sum + resource.bytes, 0),
      externalRequests: externalRequests.map((resource) => resource.url),
      resources: resourceList,
    },
    errors,
  };
  await context.close();
  return result;
}

async function main() {
  const pnpmVersion = execFileSync("pnpm", ["--version"], {
    encoding: "utf8",
  }).trim();
  if (process.version !== "v24.18.0" || pnpmVersion !== "11.15.1") {
    throw new Error(
      `Performance baseline requires Node v24.18.0 and pnpm 11.15.1; received ${process.version} and ${pnpmVersion}.`,
    );
  }
  const server = startServer();
  try {
    await waitForServer();
    const browser = await chromium.launch({ headless: true });
    const desktop = profiles[0]!;
    const mobile = profiles[1]!;
    const scenarioDefinitions: Array<Omit<Scenario, "run">> = [
      { id: "homepage-desktop", profile: desktop, url: "/", settleMs: 1000 },
      {
        id: "preview-desktop",
        profile: desktop,
        url: previewPath,
        interact: true,
        settleMs: 4000,
      },
      {
        id: "preview-desktop-reduced-motion",
        profile: desktop,
        url: previewPath,
        interact: true,
        reducedMotion: true,
        settleMs: 4000,
      },
      {
        id: "preview-mobile-class",
        profile: mobile,
        url: previewPath,
        interact: true,
        settleMs: 4000,
      },
      {
        id: "template-page-desktop",
        profile: desktop,
        url: templatePath,
        interact: true,
        settleMs: 4000,
      },
      {
        id: "teaser-inactive",
        profile: desktop,
        harness: { count: 1, activeIndexes: new Set() },
        settleMs: 1000,
      },
      {
        id: "teaser-active",
        profile: desktop,
        harness: { count: 1, activeIndexes: new Set([0]) },
        settleMs: 4500,
      },
      {
        id: "catalog-grid-initial",
        profile: desktop,
        harness: { count: 20, activeIndexes: new Set() },
        settleMs: 1000,
      },
      {
        id: "catalog-grid-nearby",
        profile: desktop,
        harness: { count: 20, activeIndexes: new Set([0, 1, 2]) },
        settleMs: 4500,
      },
      {
        id: "catalog-grid-visited-offscreen",
        profile: desktop,
        harness: {
          count: 20,
          activeIndexes: new Set([0, 1, 2, 5, 8, 11, 14, 17]),
        },
        settleMs: 4500,
      },
    ];
    const scenarios = [1, 2, 3].flatMap((run) =>
      scenarioDefinitions.map((scenario) => ({ ...scenario, run })),
    );
    const results = [];
    for (const scenario of scenarios) {
      process.stdout.write(`[measure] ${scenario.id} run ${scenario.run}\n`);
      results.push(await collectScenario(browser, scenario));
    }
    await browser.close();
    const homepage = results.find(
      (result) => result.id === "homepage-desktop",
    )!;
    const preview = results.find((result) => result.id === "preview-desktop")!;
    const homepageScripts = new Set(
      homepage.transport.resources
        .filter((resource) => resource.kind === "script")
        .map((resource) => resource.url),
    );
    const incrementalScripts = preview.transport.resources.filter(
      (resource) =>
        resource.kind === "script" && !homepageScripts.has(resource.url),
    );
    const report = {
      schemaVersion: 1,
      kind: "laboratory-performance-baseline",
      template: "hanging-gifts-contact",
      measuredAt: new Date().toISOString(),
      classification: "laboratory-only-not-field-data",
      baselineCommit: "484bf6d00ef6842e713954c5e8340305ef441439",
      environment: {
        os: `${process.platform} ${process.arch}`,
        node: process.version,
        pnpm: pnpmVersion,
        playwright: "1.61.1",
        browser: await chromium
          .launch({ headless: true })
          .then(async (instance) => {
            const version = instance.version();
            await instance.close();
            return version;
          }),
        server: "FormMuse dual-origin static server over loopback HTTP",
        cache: "new browser context per scenario",
        profiles,
      },
      methodology: {
        repetitions: 3,
        settleWindowsMs: { preview: 4000, teaser: 4500 },
        catalogHarness:
          "Test-only SSR of the real CatalogTeaser component against the real static preview route; it is not a public or exported catalog route.",
        limitations: [
          "Single-run local laboratory observations capture a Stage 5 starting point, not statistical field behavior.",
          "Chromium CDP supplies main-thread and heap estimates; branded browsers and physical devices remain Stage 5.7 evidence.",
          "The representative catalog harness measures explicit inactive/active populations before Stage 5.6 selects lifecycle behavior.",
          "Hydration readiness is represented by network-idle plus visible, editable form readiness rather than a React-internal timestamp.",
          "Static inventory gzip and Brotli sizes are deterministic compression estimates; scenario transport is the loopback server response body size.",
        ],
      },
      staticArtifact: staticInventory(),
      dependencyContribution: {
        method:
          "Preview JavaScript resources absent from the homepage resource graph, plus the declared template-owned animation dependencies.",
        declaredTemplateAnimationDependencies: [
          "@gsap/react@2.1.2",
          "gsap@3.15.0",
          "motion@12.42.2",
        ],
        incrementalPreviewJavaScriptBytes: incrementalScripts.reduce(
          (sum, resource) => sum + resource.bytes,
          0,
        ),
        incrementalPreviewScripts: incrementalScripts,
      },
      scenarios: results,
    };
    mkdirSync(resolve(outputPath, ".."), { recursive: true });
    writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
    process.stdout.write(`[measure:complete] ${outputPath}\n`);
  } finally {
    server.kill("SIGTERM");
  }
}

main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? (error.stack ?? error.message) : String(error)}\n`,
  );
  process.exitCode = 1;
});
