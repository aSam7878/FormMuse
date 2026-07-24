import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const projectRoot = resolve(process.cwd());

function read(path: string): string {
  return readFileSync(resolve(projectRoot, path), "utf8");
}

describe("accessibility publication evidence", () => {
  it("keeps the required manual review categories and record fields explicit", () => {
    const checklist = read(
      "docs/quality/accessibility-publication-checklist.md",
    );
    const record = read("docs/quality/accessibility-manual-evidence.md");

    for (const category of [
      "Keyboard",
      "Focus order and visibility",
      "Zoom and reflow",
      "Screen reader",
      "Touch",
      "Reduced motion",
      "Target size",
      "Contrast",
      "Real-device review",
    ]) {
      expect(checklist).toContain(category);
    }
    for (const field of [
      "Browser",
      "Operating system",
      "Assistive technology",
      "Device",
      "Tester",
      "Date",
      "Limitations",
      "Outcome",
    ]) {
      expect(record).toContain(field);
    }
  });

  it("does not present automated safeguards as accessibility certification", () => {
    const checklist = read(
      "docs/quality/accessibility-publication-checklist.md",
    );
    const record = read("docs/quality/accessibility-manual-evidence.md");

    expect(checklist).toMatch(
      /Automated results do not\s+establish WCAG conformance or replace manual review\./,
    );
    expect(record).toContain("Status: Not performed");
  });
});
