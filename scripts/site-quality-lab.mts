import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { relative, resolve } from "node:path";

import {
  type SiteQualityEnvironment,
  siteQualityRoutes,
} from "../lib/formmuse/site-quality";
import { loadAuthoredRegistry } from "../lib/formmuse/registry-build";
import { validateFormMuseRegistryBoundary } from "../lib/formmuse/registry-schemas";

const previewOrigin = "https://preview.formmuse.example";

export type SiteQualityBuild = Readonly<{
  environment: SiteQualityEnvironment;
  origin: string;
}>;

function pnpmCli(): string {
  if (!process.env.npm_execpath) {
    throw new Error(
      "Run the site-quality gates through their pinned pnpm scripts.",
    );
  }
  return process.env.npm_execpath;
}

function runPnpm(
  arguments_: readonly string[],
  environment: NodeJS.ProcessEnv,
) {
  const result = spawnSync(process.execPath, [pnpmCli(), ...arguments_], {
    cwd: process.cwd(),
    env: environment,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `pnpm ${arguments_.join(" ")} failed with exit ${result.status ?? 1}.`,
    );
  }
}

export function publishedTemplateCount(): number {
  return loadAuthoredRegistry(process.cwd()).items.filter((item) => {
    const boundary = validateFormMuseRegistryBoundary({
      categories: item.categories,
      meta: item.meta,
    });
    return boundary.meta.formmuse.status === "published";
  }).length;
}

export function siteQualityBuilds(
  publishedTemplates: number,
  productionOrigin = process.env.FORMMUSE_SITE_URL,
): SiteQualityBuild[] {
  const builds: SiteQualityBuild[] = [
    { environment: "preview", origin: previewOrigin },
  ];

  if (publishedTemplates === 0) return builds;
  if (!productionOrigin) {
    throw new Error(
      "Published templates require the owner-verified FORMMUSE_SITE_URL for the production Lighthouse and Linkinator audit.",
    );
  }

  return [...builds, { environment: "production", origin: productionOrigin }];
}

function findIndexFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return findIndexFiles(path);
    return entry.name === "index.html" ? [path] : [];
  });
}

export function exportedSiteRoutes(environment: SiteQualityEnvironment) {
  const outputDirectory = resolve(process.cwd(), "out");
  if (!existsSync(outputDirectory)) {
    throw new Error("Site-quality gates require the generated out/ artifact.");
  }
  const paths = findIndexFiles(outputDirectory).map((path) =>
    relative(outputDirectory, path),
  );
  return siteQualityRoutes(paths, environment);
}

export function qualityEnvironment(build: SiteQualityBuild): NodeJS.ProcessEnv {
  return {
    ...process.env,
    FORMMUSE_DEPLOY_ENV: build.environment,
    FORMMUSE_SITE_URL: build.origin,
  };
}

export function buildStaticQualityArtifact(build: SiteQualityBuild): void {
  runPnpm(["run", "quality:static-export"], qualityEnvironment(build));
}

export function runQualityTool(
  arguments_: readonly string[],
  build: SiteQualityBuild,
): void {
  runPnpm(arguments_, qualityEnvironment(build));
}
