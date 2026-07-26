import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  authoredItemSha256,
  publicationGateDefinitions,
  type PublicationReport,
  validatePublicationReport,
} from "../../lib/formmuse/publication-report";
import {
  buildRegistry,
  loadAuthoredRegistry,
} from "../../lib/formmuse/registry-build";

const projectRoot = resolve(process.cwd());
const item = structuredClone(loadAuthoredRegistry(projectRoot).items[0]);

function reportFor(
  registryStatus: "draft" | "published" | "deprecated",
  result: "passed" | "incomplete",
): PublicationReport {
  const gates = publicationGateDefinitions.map((definition) => ({
    id: definition.id,
    result,
    ...(definition.command === undefined
      ? {}
      : { command: definition.command }),
    evidenceKind: definition.evidenceKind,
    ...(definition.evidenceReference === undefined
      ? {}
      : { evidenceReference: definition.evidenceReference }),
  }));
  return {
    schemaVersion: 1,
    template: {
      slug: item.name,
      version: (item.meta as { formmuse: { version: string } }).formmuse
        .version,
      registryStatus,
    },
    recordedAt: "2026-07-25T00:00:00.000Z",
    environment: {
      node: "v24.18.0",
      pnpm: "pnpm@11.15.1",
      operatingSystem: "darwin-arm64",
    },
    artifact: { authoredItemSha256: authoredItemSha256(item) },
    gates,
    blockers: result === "passed" ? [] : ["Manual evidence is incomplete."],
    eligible: result === "passed",
  };
}

describe("publication report eligibility", () => {
  it("accepts a current complete report only when every gate is passing", () => {
    validatePublicationReport(reportFor("draft", "passed"), item);
  });

  it("rejects a report whose eligibility contradicts an incomplete gate", () => {
    const report = reportFor("draft", "incomplete");
    expect(() =>
      validatePublicationReport({ ...report, eligible: true }, item),
    ).toThrow("inconsistent eligibility");
  });

  it("rejects a registry build that changes an item to published without complete evidence", () => {
    const registry = JSON.parse(
      JSON.stringify(loadAuthoredRegistry(projectRoot)),
    ) as {
      items: Array<{
        meta: { formmuse: { status: string; featured: boolean } };
      }>;
    };
    registry.items[0].meta.formmuse.status = "published";
    registry.items[0].meta.formmuse.featured = true;
    const registryPath = join(
      tmpdir(),
      `formmuse-publication-${Date.now()}.json`,
    );
    writeFileSync(registryPath, JSON.stringify(registry));

    expect(() =>
      buildRegistry({
        projectRoot,
        registryPath,
        deployEnvironment: "development",
        outputDirectory: join(
          tmpdir(),
          `formmuse-publication-output-${Date.now()}`,
        ),
      }),
    ).toThrow(/Publication report (is missing|does not match|has incomplete)/);
  });
});
