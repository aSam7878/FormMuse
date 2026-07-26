import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import type { RegistryItem } from "shadcn/schema";

import { validateFormMuseRegistryBoundary } from "./registry-schemas";

export type PublicationEvidenceKind =
  | "automated"
  | "engine-emulation"
  | "laboratory"
  | "external-workflow"
  | "manual";

type PublicationGateDefinition = Readonly<{
  id: string;
  label: string;
  command?: string;
  evidenceKind: PublicationEvidenceKind;
  evidenceReference?: string;
}>;

export const publicationGateDefinitions: readonly PublicationGateDefinition[] =
  [
    {
      id: "format",
      label: "Tracked source formatting",
      command: "pnpm format:check",
      evidenceKind: "automated",
    },
    {
      id: "types",
      label: "TypeScript",
      command: "pnpm typecheck",
      evidenceKind: "automated",
    },
    {
      id: "lint",
      label: "ESLint and JSX accessibility linting",
      command: "pnpm lint",
      evidenceKind: "automated",
    },
    {
      id: "unit",
      label: "Vitest and Testing Library",
      command: "pnpm quality:unit",
      evidenceKind: "automated",
    },
    {
      id: "registry-validate",
      label: "Registry validation",
      command: "pnpm quality:registry-validate",
      evidenceKind: "automated",
    },
    {
      id: "registry-build",
      label: "Registry generation",
      command: "pnpm registry:build",
      evidenceKind: "automated",
    },
    {
      id: "installation-pinned",
      label: "Pinned shadcn installation fixture",
      command: "pnpm test:registry-install",
      evidenceKind: "automated",
    },
    {
      id: "static-export",
      label: "Static export",
      command: "pnpm quality:static-export",
      evidenceKind: "automated",
    },
    {
      id: "generated-diff",
      label: "Generated-output drift",
      command: "pnpm quality:generated-diff",
      evidenceKind: "automated",
    },
    {
      id: "fixture-next",
      label: "Next.js compatibility fixture",
      command: "pnpm quality:fixture-next",
      evidenceKind: "automated",
    },
    {
      id: "fixture-vite",
      label: "Vite compatibility fixture",
      command: "pnpm quality:fixture-vite",
      evidenceKind: "automated",
    },
    {
      id: "browser-engines",
      label: "Playwright engine and mobile-emulation coverage",
      command: "pnpm quality:browser",
      evidenceKind: "engine-emulation",
    },
    {
      id: "visual",
      label: "Official visual baseline",
      command: "pnpm quality:visual",
      evidenceKind: "automated",
    },
    {
      id: "accessibility-automation",
      label: "Automated parent and preview accessibility checks",
      command: "pnpm quality:accessibility",
      evidenceKind: "automated",
    },
    {
      id: "lighthouse",
      label: "Lighthouse laboratory audits",
      command: "pnpm quality:lighthouse",
      evidenceKind: "laboratory",
    },
    {
      id: "links",
      label: "Exported-site link crawl",
      command: "pnpm quality:links",
      evidenceKind: "automated",
    },
    {
      id: "security",
      label: "Supply-chain and generated-output security",
      command: "pnpm quality:security",
      evidenceKind: "automated",
    },
    {
      id: "installation-public-latest",
      label: "Fresh scheduled latest shadcn public-command workflow",
      evidenceKind: "external-workflow",
    },
    {
      id: "manual-accessibility",
      label:
        "Recorded keyboard, focus, zoom, screen-reader, touch, motion, and contrast review",
      evidenceKind: "manual",
      evidenceReference: "docs/quality/accessibility-manual-evidence.md",
    },
    {
      id: "branded-browser",
      label: "Current branded Chrome, Edge, Firefox, and Safari smoke tests",
      evidenceKind: "manual",
    },
    {
      id: "physical-device",
      label: "Current physical iOS Safari and Android Chrome smoke tests",
      evidenceKind: "manual",
    },
    {
      id: "asset-license-review",
      label: "Asset and dependency license review",
      evidenceKind: "manual",
      evidenceReference: "docs/security/license-triage.md",
    },
  ] as const;

export type PublicationGateId = string;
export type PublicationGateResult = "passed" | "failed" | "incomplete";

export type PublicationReport = Readonly<{
  schemaVersion: 1;
  template: Readonly<{
    slug: string;
    version: string;
    registryStatus: "draft" | "published" | "deprecated";
  }>;
  recordedAt: string;
  environment: Readonly<{
    node: string;
    pnpm: string;
    operatingSystem: string;
  }>;
  artifact: Readonly<{
    authoredItemSha256: string;
    generatedItemSha256?: string;
  }>;
  gates: readonly Readonly<{
    id: PublicationGateId;
    result: PublicationGateResult;
    command?: string;
    evidenceKind: PublicationEvidenceKind;
    evidenceReference?: string;
  }>[];
  blockers: readonly string[];
  eligible: boolean;
}>;

export class PublicationReportError extends Error {
  override readonly name = "PublicationReportError";
}

function fail(message: string): never {
  throw new PublicationReportError(message);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function authoredItemSha256(item: RegistryItem): string {
  return sha256(JSON.stringify(item));
}

function formmuseMetadata(item: RegistryItem) {
  return validateFormMuseRegistryBoundary({
    categories: item.categories,
    meta: item.meta,
  }).meta.formmuse;
}

export function publicationReportPath(
  projectRoot: string,
  slug: string,
): string {
  return join(projectRoot, "docs/quality/publication-reports", `${slug}.json`);
}

function validGateResult(value: unknown): value is PublicationGateResult {
  return value === "passed" || value === "failed" || value === "incomplete";
}

function validEvidenceKind(value: unknown): value is PublicationEvidenceKind {
  return publicationGateDefinitions.some(
    (definition) => definition.evidenceKind === value,
  );
}

export function parsePublicationReport(value: unknown): PublicationReport {
  if (
    !isObject(value) ||
    value.schemaVersion !== 1 ||
    !isObject(value.template) ||
    typeof value.template.slug !== "string" ||
    typeof value.template.version !== "string" ||
    !["draft", "published", "deprecated"].includes(
      value.template.registryStatus as string,
    ) ||
    typeof value.recordedAt !== "string" ||
    !isObject(value.environment) ||
    typeof value.environment.node !== "string" ||
    typeof value.environment.pnpm !== "string" ||
    typeof value.environment.operatingSystem !== "string" ||
    !isObject(value.artifact) ||
    !/^[0-9a-f]{64}$/.test(value.artifact.authoredItemSha256 as string) ||
    (value.artifact.generatedItemSha256 !== undefined &&
      !/^[0-9a-f]{64}$/.test(value.artifact.generatedItemSha256 as string)) ||
    !Array.isArray(value.gates) ||
    !value.gates.every(
      (gate) =>
        isObject(gate) &&
        typeof gate.id === "string" &&
        validGateResult(gate.result) &&
        validEvidenceKind(gate.evidenceKind) &&
        (gate.command === undefined || typeof gate.command === "string") &&
        (gate.evidenceReference === undefined ||
          typeof gate.evidenceReference === "string"),
    ) ||
    !Array.isArray(value.blockers) ||
    !value.blockers.every((blocker) => typeof blocker === "string") ||
    typeof value.eligible !== "boolean"
  ) {
    fail("Publication report has an invalid schema.");
  }

  return value as unknown as PublicationReport;
}

export function validatePublicationReport(
  report: PublicationReport,
  item: RegistryItem,
): void {
  const metadata = formmuseMetadata(item);
  const expectedIds = publicationGateDefinitions.map(
    (definition) => definition.id,
  );
  const actualIds = report.gates.map((gate) => gate.id);

  if (
    report.template.slug !== item.name ||
    report.template.version !== metadata.version ||
    report.template.registryStatus !== metadata.status ||
    report.artifact.authoredItemSha256 !== authoredItemSha256(item) ||
    JSON.stringify(actualIds) !== JSON.stringify(expectedIds)
  ) {
    fail(`Publication report does not match the current ${item.name} record.`);
  }

  for (const [index, definition] of publicationGateDefinitions.entries()) {
    const gate = report.gates[index];
    if (
      gate.evidenceKind !== definition.evidenceKind ||
      gate.command !== definition.command ||
      gate.evidenceReference !== definition.evidenceReference
    ) {
      fail(
        `Publication report ${item.name} gate ${definition.id} is malformed.`,
      );
    }
  }

  const allPassed = report.gates.every((gate) => gate.result === "passed");
  if (report.eligible !== (allPassed && report.blockers.length === 0)) {
    fail(
      `Publication report ${item.name} has an inconsistent eligibility result.`,
    );
  }
  if (metadata.status === "published" && !report.eligible) {
    fail(
      `Published template ${item.name} has incomplete publication evidence.`,
    );
  }
}

export function loadPublicationReport(
  projectRoot: string,
  slug: string,
): PublicationReport {
  const path = publicationReportPath(projectRoot, slug);
  if (!existsSync(path)) {
    fail(`Publication report is missing for ${slug}.`);
  }
  try {
    return parsePublicationReport(JSON.parse(readFileSync(path, "utf8")));
  } catch (error) {
    if (error instanceof PublicationReportError) throw error;
    fail(`Publication report for ${slug} cannot be parsed.`);
  }
}

export function assertPublishedItemsHaveCompleteEvidence(
  projectRoot: string,
  items: readonly RegistryItem[],
): void {
  for (const item of items) {
    const status = formmuseMetadata(item).status;
    if (status !== "published") continue;
    validatePublicationReport(
      loadPublicationReport(projectRoot, item.name),
      item,
    );
  }
}
