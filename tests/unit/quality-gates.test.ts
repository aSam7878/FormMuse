import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it, vi } from "vitest";

import {
  foundationQualityGates,
  qualityGates,
  runQualityGates,
} from "../../lib/formmuse/quality-gates";

describe("canonical quality gates", () => {
  it("defines one stable owner for every required Stage 4 layer", () => {
    const ids = qualityGates.map((gate) => gate.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual([
      "format",
      "types",
      "lint",
      "unit",
      "registry-validate",
      "registry-build",
      "installation-pinned",
      "static-export",
      "generated-diff",
      "fixture-next",
      "fixture-vite",
      "browser",
      "visual",
      "accessibility",
      "lighthouse",
      "links",
      "security",
      "installation-public",
      "publication-report",
    ]);
  });

  it("runs the foundation profile deterministically", () => {
    expect(foundationQualityGates().map((gate) => gate.id)).toEqual([
      "format",
      "types",
      "lint",
      "unit",
      "registry-validate",
      "registry-build",
      "installation-pinned",
      "static-export",
      "generated-diff",
    ]);
  });

  it("makes the canonical unit gate collect coverage without inventing a threshold", () => {
    const packageJson = JSON.parse(
      readFileSync(resolve(process.cwd(), "package.json"), "utf8"),
    ) as { scripts: Record<string, string> };
    const unitGate = qualityGates.find((gate) => gate.id === "unit");

    expect(unitGate?.script).toBe("quality:unit");
    expect(packageJson.scripts["quality:unit"]).toBe("pnpm test:coverage");
    expect(packageJson.scripts["quality:unit"]).not.toMatch(/--threshold/i);
  });

  it("keeps the clean Next.js and Vite fixture commands independently runnable", () => {
    const packageJson = JSON.parse(
      readFileSync(resolve(process.cwd(), "package.json"), "utf8"),
    ) as { scripts: Record<string, string> };

    expect(packageJson.scripts["quality:fixture-next"]).toBe(
      "node --import tsx scripts/verify-registry-install.ts --framework next",
    );
    expect(packageJson.scripts["quality:fixture-vite"]).toBe(
      "node --import tsx scripts/verify-registry-install.ts --framework vite",
    );
  });

  it("assigns the browser integration suite to one canonical command", () => {
    const packageJson = JSON.parse(
      readFileSync(resolve(process.cwd(), "package.json"), "utf8"),
    ) as { scripts: Record<string, string> };
    const browserGate = qualityGates.find((gate) => gate.id === "browser");

    expect(browserGate?.script).toBe("quality:browser");
    expect(packageJson.scripts["quality:browser"]).toBe("pnpm test:browser");
  });

  it("stops at the owning failing layer and preserves its exit code", () => {
    const write = vi.fn();
    const execute = vi
      .fn()
      .mockReturnValueOnce({ exitCode: 0 })
      .mockReturnValueOnce({ exitCode: 7 });
    const gates = foundationQualityGates().slice(0, 3);

    expect(runQualityGates(gates, execute, write)).toBe(7);
    expect(execute).toHaveBeenCalledTimes(2);
    expect(write.mock.calls.map(([message]) => message)).toEqual([
      "[quality:start] format — Tracked source formatting",
      "[quality:pass] format",
      "[quality:start] types — TypeScript",
      "[quality:fail] types — exit 7",
    ]);
  });
});
