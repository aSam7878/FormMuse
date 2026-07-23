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
