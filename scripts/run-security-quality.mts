import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

import {
  distributedSourceFindings,
  ownerReviewLicenseRecords,
  secretFindings,
  staticExportFindings,
  unrecordedUnknownLicenseRecords,
  type LicenseRecord,
  type SecurityFinding,
} from "../lib/formmuse/security-quality";
import { resolveBuildOrigin } from "../lib/formmuse/build-origin";
import { resolvePreviewOrigin } from "../lib/formmuse/preview-origin";
import { loadAuthoredRegistry } from "../lib/formmuse/registry-build";
import { createTemplateInstallationModel } from "../lib/formmuse/template-installation";
import { createTemplatePageModel } from "../lib/formmuse/template-page";
import { templatePageRoutes } from "../lib/formmuse/template-routes";

const projectRoot = resolve(process.cwd());

type AuditAdvisory = Readonly<{
  id: number;
  module_name: string;
  severity: string;
}>;

type LicenseInventory = Readonly<
  Record<
    string,
    readonly Readonly<{ name: string; versions: readonly string[] }>[]
  >
>;

function pnpmCli(): string {
  if (!process.env.npm_execpath) {
    throw new Error("Run quality:security through the pinned pnpm script.");
  }
  return process.env.npm_execpath;
}

function runPnpm(arguments_: readonly string[]): void {
  const result = spawnSync(process.execPath, [pnpmCli(), ...arguments_], {
    cwd: projectRoot,
    env: process.env,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `pnpm ${arguments_.join(" ")} failed with exit ${result.status ?? 1}.`,
    );
  }
}

function pnpmJson(arguments_: readonly string[], acceptedStatuses: number[]) {
  const result = spawnSync(process.execPath, [pnpmCli(), ...arguments_], {
    cwd: projectRoot,
    encoding: "utf8",
    env: process.env,
  });
  if (result.error) throw result.error;
  if (!acceptedStatuses.includes(result.status ?? 1)) {
    throw new Error(
      `pnpm ${arguments_.join(" ")} failed: ${(result.stderr || result.stdout).trim()}`,
    );
  }
  try {
    return JSON.parse(result.stdout) as unknown;
  } catch (error) {
    throw new Error(
      `pnpm ${arguments_.join(" ")} returned invalid JSON: ${(error as Error).message}`,
    );
  }
}

function filesUnder(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(path) : [path];
  });
}

function readText(path: string): string | undefined {
  if (!statSync(path).isFile()) return undefined;
  const content = readFileSync(path);
  return content.includes(0) ? undefined : content.toString("utf8");
}

function trackedFiles(): string[] {
  const result = spawnSync("git", ["ls-files", "-z"], {
    cwd: projectRoot,
    encoding: "utf8",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`git ls-files failed: ${result.stderr.trim()}`);
  }
  return result.stdout.split("\0").filter(Boolean);
}

function findingsFromFiles(
  files: readonly string[],
  find: (content: string, path: string) => SecurityFinding[],
): SecurityFinding[] {
  return files.flatMap((path) => {
    const content = readText(path);
    return content === undefined
      ? []
      : find(content, relative(projectRoot, path));
  });
}

function auditFindings(value: unknown): string[] {
  const advisories = Object.values(
    (value as { advisories?: Record<string, AuditAdvisory> }).advisories ?? {},
  );
  return advisories
    .filter(
      (advisory) =>
        advisory.severity === "high" || advisory.severity === "critical",
    )
    .map(
      (advisory) =>
        `npm advisory ${advisory.id} for ${advisory.module_name} is ${advisory.severity}.`,
    )
    .sort();
}

function licenseRecords(value: unknown): LicenseRecord[] {
  const inventory = value as LicenseInventory;
  return Object.entries(inventory)
    .flatMap(([license, packages]) =>
      packages.flatMap((item) =>
        item.versions.map((version) => ({ license, name: item.name, version })),
      ),
    )
    .sort((left, right) =>
      `${left.name}@${left.version}`.localeCompare(
        `${right.name}@${right.version}`,
      ),
    );
}

function assertManualInstallationParity(): void {
  const build = resolveBuildOrigin({
    FORMMUSE_DEPLOY_ENV: "development",
    FORMMUSE_SITE_URL: "http://localhost:3000",
  });
  const authored = loadAuthoredRegistry(projectRoot);
  const routes = templatePageRoutes(build);

  if (routes.length !== authored.items.length) {
    throw new Error(
      "Manual Installation parity is missing an authored template.",
    );
  }

  for (const route of routes) {
    const installation = createTemplateInstallationModel(
      createTemplatePageModel(route),
      build,
    );
    const files = route.item.files ?? [];
    if (
      JSON.stringify(installation.files.map((file) => file.path)) !==
        JSON.stringify(files.map((file) => file.path)) ||
      JSON.stringify(
        installation.dependencies.map((item) => item.dependency),
      ) !== JSON.stringify(route.item.dependencies ?? []) ||
      JSON.stringify(
        installation.registryDependencies.map((item) => item.dependency),
      ) !== JSON.stringify(route.item.registryDependencies ?? [])
    ) {
      throw new Error(
        `Manual Installation diverges from ${route.slug}'s registry declaration.`,
      );
    }
  }
}

const failures: string[] = [];
const audit = pnpmJson(["audit", "--audit-level=high", "--json"], [0, 1]);
failures.push(...auditFindings(audit));

const licenses = licenseRecords(pnpmJson(["licenses", "list", "--json"], [0]));
for (const record of unrecordedUnknownLicenseRecords(licenses)) {
  failures.push(
    `Unrecorded unknown license: ${record.name}@${record.version}.`,
  );
}

for (const record of ownerReviewLicenseRecords(licenses)) {
  process.stdout.write(
    `[security:license-owner-review] ${record.name}@${record.version} remains build-only and cannot clear the public-launch legal checkpoint.\n`,
  );
}
process.stdout.write(
  `[security:license-inventory] ${licenses.length} resolved package/version record(s) across ${new Set(licenses.map((record) => record.license)).size} declared license value(s).\n`,
);

const tracked = trackedFiles().map((path) => resolve(projectRoot, path));
for (const finding of findingsFromFiles(tracked, secretFindings)) {
  failures.push(`Tracked source ${finding.path} contains ${finding.rule}.`);
}

const authored = loadAuthoredRegistry(projectRoot);
for (const item of authored.items) {
  for (const file of item.files ?? []) {
    const path = resolve(projectRoot, file.path);
    const content = readText(path);
    if (content === undefined) {
      failures.push(`Distributed source ${file.path} is not readable text.`);
      continue;
    }
    for (const finding of distributedSourceFindings(content, file.path)) {
      failures.push(
        `Distributed source ${finding.path} contains ${finding.rule}.`,
      );
    }
  }
}

runPnpm(["run", "registry:build"]);
for (const finding of findingsFromFiles(
  filesUnder(resolve(projectRoot, "public/r")),
  distributedSourceFindings,
)) {
  failures.push(`Generated registry ${finding.path} contains ${finding.rule}.`);
}

assertManualInstallationParity();
runPnpm(["run", "quality:static-export"]);
const previewOrigin = resolvePreviewOrigin(
  undefined,
  resolveBuildOrigin(),
).origin;
for (const finding of findingsFromFiles(
  filesUnder(resolve(projectRoot, "out")).filter((path) =>
    path.endsWith(".html"),
  ),
  (content, path) => staticExportFindings(content, path, previewOrigin),
)) {
  failures.push(`Static export ${finding.path} contains ${finding.rule}.`);
}

if (failures.length > 0) {
  throw new Error(
    `Security quality failures:\n${failures.map((failure) => `- ${failure}`).join("\n")}`,
  );
}

process.stdout.write(
  "[security:pass] audit, licenses, source, registry, Manual Installation, and static export checks passed\n",
);
