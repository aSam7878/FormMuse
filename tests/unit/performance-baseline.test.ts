import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

type Sample = Readonly<{
  id: string;
  run: number;
  errors: readonly string[];
  transport: Readonly<{
    externalRequests: readonly string[];
  }>;
}>;

type Baseline = Readonly<{
  schemaVersion: number;
  kind: string;
  classification: string;
  baselineCommit: string;
  environment: Readonly<{
    node: string;
    pnpm: string;
    playwright: string;
  }>;
  methodology: Readonly<{
    repetitions: number;
    catalogHarness: string;
  }>;
  scenarios: readonly Sample[];
}>;

const baseline = JSON.parse(
  readFileSync(
    resolve(
      process.cwd(),
      "docs/quality/performance/hanging-gifts-contact.raw.json",
    ),
    "utf8",
  ),
) as Baseline;

const scenarioIds = [
  "homepage-desktop",
  "preview-desktop",
  "preview-desktop-reduced-motion",
  "preview-mobile-class",
  "template-page-desktop",
  "teaser-inactive",
  "teaser-active",
  "catalog-grid-initial",
  "catalog-grid-nearby",
  "catalog-grid-visited-offscreen",
] as const;

describe("Hanging Gifts performance baseline", () => {
  it("labels the pinned evidence as laboratory data", () => {
    expect(baseline).toMatchObject({
      schemaVersion: 1,
      kind: "laboratory-performance-baseline",
      classification: "laboratory-only-not-field-data",
      baselineCommit: "484bf6d00ef6842e713954c5e8340305ef441439",
      environment: {
        node: "v24.18.0",
        pnpm: "11.15.1",
        playwright: "1.61.1",
      },
      methodology: { repetitions: 3 },
    });
  });

  it("retains three clean samples for every required scenario", () => {
    expect(baseline.scenarios).toHaveLength(scenarioIds.length * 3);

    for (const id of scenarioIds) {
      const samples = baseline.scenarios.filter((sample) => sample.id === id);
      expect(samples.map((sample) => sample.run).sort()).toEqual([1, 2, 3]);
      expect(samples.every((sample) => sample.errors.length === 0)).toBe(true);
      expect(
        samples.every(
          (sample) => sample.transport.externalRequests.length === 0,
        ),
      ).toBe(true);
    }
  });

  it("identifies the catalog fixture as test-only rather than a public route", () => {
    expect(baseline.methodology.catalogHarness).toContain("Test-only SSR");
    expect(baseline.methodology.catalogHarness).toContain(
      "not a public or exported catalog route",
    );
  });
});
