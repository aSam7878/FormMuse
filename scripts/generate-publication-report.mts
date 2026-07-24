import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import {
  authoredItemSha256,
  publicationGateDefinitions,
  publicationReportPath,
  type PublicationGateId,
  type PublicationGateResult,
  type PublicationReport,
} from "../lib/formmuse/publication-report";
import { loadAuthoredRegistry } from "../lib/formmuse/registry-build";

const PROJECT_ROOT = resolve(process.cwd());
const pnpmCli = process.env.npm_execpath;

if (!pnpmCli) {
  throw new Error(
    "Run the publication report through the pinned pnpm scripts.",
  );
}
const pinnedPnpmCli = pnpmCli;

function sha256File(path: string): string | undefined {
  if (!existsSync(path)) return undefined;
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function run(command: string): number {
  process.stdout.write(`[publication-report:start] ${command}\n`);
  const result = spawnSync(process.execPath, [pinnedPnpmCli, "run", command], {
    cwd: PROJECT_ROOT,
    env: process.env,
    stdio: "inherit",
  });
  const exitCode = result.status ?? 1;
  process.stdout.write(
    `[publication-report:${exitCode === 0 ? "pass" : "fail"}] ${command}\n`,
  );
  return exitCode;
}

function resultFor(
  id: PublicationGateId,
  results: ReadonlyMap<PublicationGateId, PublicationGateResult>,
): PublicationGateResult {
  return results.get(id) ?? "incomplete";
}

function blockersFor(gates: PublicationReport["gates"]): readonly string[] {
  return gates
    .filter((gate) => gate.result !== "passed")
    .map((gate) => {
      const definition = publicationGateDefinitions.find(
        (candidate) => candidate.id === gate.id,
      );
      return `${definition?.label ?? gate.id} is ${gate.result}.`;
    });
}

function createReport(
  item: ReturnType<typeof loadAuthoredRegistry>["items"][number],
  results: ReadonlyMap<PublicationGateId, PublicationGateResult>,
): PublicationReport {
  const metadata = (
    item.meta as { formmuse: { status: string; version: string } }
  ).formmuse;
  const generatedItemSha256 = sha256File(
    join(PROJECT_ROOT, "public/r", `${item.name}.json`),
  );
  const gates = publicationGateDefinitions.map((definition) => ({
    id: definition.id,
    result: resultFor(definition.id, results),
    ...(definition.command === undefined
      ? {}
      : { command: definition.command }),
    evidenceKind: definition.evidenceKind,
    ...(definition.evidenceReference === undefined
      ? {}
      : { evidenceReference: definition.evidenceReference }),
  }));
  const blockers = blockersFor(gates);

  return {
    schemaVersion: 1,
    template: {
      slug: item.name,
      version: metadata.version,
      registryStatus: metadata.status as "draft" | "published" | "deprecated",
    },
    recordedAt: new Date().toISOString(),
    environment: {
      node: process.version,
      pnpm: process.env.npm_package_manager ?? "pnpm (unknown version)",
      operatingSystem: `${process.platform}-${process.arch}`,
    },
    artifact: {
      authoredItemSha256: authoredItemSha256(item),
      ...(generatedItemSha256 === undefined ? {} : { generatedItemSha256 }),
    },
    gates,
    blockers,
    eligible: blockers.length === 0,
  };
}

const results = new Map<PublicationGateId, PublicationGateResult>();
for (const definition of publicationGateDefinitions) {
  if (definition.command === undefined) continue;
  results.set(
    definition.id,
    run(definition.command) === 0 ? "passed" : "failed",
  );
}

const authored = loadAuthoredRegistry(PROJECT_ROOT);
for (const item of authored.items) {
  const report = createReport(item, results);
  const path = publicationReportPath(PROJECT_ROOT, item.name);
  mkdirSync(resolve(path, ".."), { recursive: true });
  writeFileSync(path, `${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(
    `[publication-report:written] ${path} (${report.eligible ? "eligible" : "blocked"})\n`,
  );
}

if ([...results.values()].some((result) => result === "failed")) {
  process.exitCode = 1;
}
