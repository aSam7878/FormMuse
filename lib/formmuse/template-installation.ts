import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { hangingGiftsContactDocumentation } from "@/registry/base/hanging-gifts-contact/hanging-gifts-contact.documentation";

import {
  buildOriginUrl,
  resolveBuildOrigin,
  type BuildOriginConfig,
} from "./build-origin";
import { RADIX_UNSUPPORTED_WARNING } from "./install-preflight";
import type { TemplatePageModel } from "./template-page";

export const packageManagers = ["pnpm", "npm", "yarn", "bun"] as const;
export type PackageManager = (typeof packageManagers)[number];

export type TemplateInstallationFile = Readonly<{
  path: string;
  target?: string;
  type: string;
  kind: "source" | "stylesheet" | "asset";
  purpose: string;
  content: string;
}>;

export type TemplateInstallationModel = Readonly<{
  slug: string;
  registryUrl: string;
  requirements: readonly Readonly<{ name: string; detail: string }>[];
  commands: Readonly<
    Record<
      PackageManager,
      Readonly<{ initialize: string; install: string; inspect: string }>
    >
  >;
  files: readonly TemplateInstallationFile[];
  dependencies: typeof hangingGiftsContactDocumentation.manualInstallation.dependencies;
  registryDependencies: typeof hangingGiftsContactDocumentation.manualInstallation.registryDependencies;
  stylesheetAndAnimationSteps: typeof hangingGiftsContactDocumentation.manualInstallation.stylesheetAndAnimationSteps;
  importPath: string;
  finalUsageExamplePath: string;
  finalUsageSource: string;
  radixWarning: typeof RADIX_UNSUPPORTED_WARNING;
}>;

function readRepositoryFile(pathname: string): string {
  const templatePrefix = "registry/base/hanging-gifts-contact/";
  const assetPrefix = "public/formmuse/hanging-gifts-contact/";

  if (pathname.startsWith(templatePrefix)) {
    return readFileSync(
      resolve(
        process.cwd(),
        "registry/base/hanging-gifts-contact",
        pathname.slice(templatePrefix.length),
      ),
      "utf8",
    );
  }

  if (pathname.startsWith(assetPrefix)) {
    return readFileSync(
      resolve(
        process.cwd(),
        "public/formmuse/hanging-gifts-contact",
        pathname.slice(assetPrefix.length),
      ),
      "utf8",
    );
  }

  throw new Error(
    `Template source path is outside the allowed roots: ${pathname}`,
  );
}

function commandFor(
  packageManager: PackageManager,
  operation: "init" | "add" | "info",
  registryUrl?: string,
): string {
  const invocation = {
    pnpm: "pnpm dlx",
    npm: "npx",
    yarn: "yarn dlx",
    bun: "bunx --bun",
  }[packageManager];

  if (operation === "init") {
    return `${invocation} shadcn@latest init --base base`;
  }

  if (operation === "info") {
    return `${invocation} shadcn@latest info`;
  }

  if (!registryUrl) {
    throw new Error("The registry URL is required for an add command.");
  }

  return `${invocation} shadcn@latest add ${registryUrl}`;
}

export function createTemplateInstallationModel(
  template: TemplatePageModel,
  buildConfig: BuildOriginConfig = resolveBuildOrigin(),
): TemplateInstallationModel {
  if (template.slug !== hangingGiftsContactDocumentation.slug) {
    throw new Error(
      `Template documentation is unavailable for ${template.slug}.`,
    );
  }

  const registryUrl = buildOriginUrl(`/r/${template.slug}.json`, buildConfig);
  const fileNotes = new Map(
    hangingGiftsContactDocumentation.manualInstallation.files.map((file) => [
      file.path,
      file,
    ]),
  );

  const files = template.files.map((file) => {
    const note = fileNotes.get(file.path);
    if (!note) {
      throw new Error(`Installation documentation is missing ${file.path}.`);
    }

    return {
      ...file,
      kind: note.kind,
      purpose: note.purpose,
      content: readRepositoryFile(file.path),
    };
  });

  const commands = Object.fromEntries(
    packageManagers.map((packageManager) => [
      packageManager,
      {
        initialize: commandFor(packageManager, "init"),
        install: commandFor(packageManager, "add", registryUrl),
        inspect: commandFor(packageManager, "info"),
      },
    ]),
  ) as TemplateInstallationModel["commands"];

  return {
    slug: template.slug,
    registryUrl,
    requirements: [
      { name: "React", detail: "A supported React application" },
      { name: "TypeScript", detail: "TypeScript 5.3 or later" },
      { name: "Tailwind CSS 4", detail: "Tailwind CSS 4 configured" },
      {
        name: "shadcn (Base UI)",
        detail: "Initialized with the Base UI foundation",
      },
    ],
    commands,
    files,
    dependencies:
      hangingGiftsContactDocumentation.manualInstallation.dependencies,
    registryDependencies:
      hangingGiftsContactDocumentation.manualInstallation.registryDependencies,
    stylesheetAndAnimationSteps:
      hangingGiftsContactDocumentation.manualInstallation
        .stylesheetAndAnimationSteps,
    importPath: hangingGiftsContactDocumentation.manualInstallation.importPath,
    finalUsageExamplePath:
      hangingGiftsContactDocumentation.manualInstallation.finalUsageExamplePath,
    finalUsageSource: readRepositoryFile(
      hangingGiftsContactDocumentation.manualInstallation.finalUsageExamplePath,
    ),
    radixWarning: RADIX_UNSUPPORTED_WARNING,
  };
}
