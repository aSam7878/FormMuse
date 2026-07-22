import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";

import { registryItemSchema, type RegistryItem } from "shadcn/schema";
import { createServer } from "vite";

import {
  classifyShadcnInstallation,
  RADIX_UNSUPPORTED_WARNING,
} from "../lib/formmuse/install-preflight";
import { buildRegistry } from "../lib/formmuse/registry-build";

const PROJECT_ROOT = resolve(process.cwd());
const SHADCN_VERSION = "4.13.1";
const TEMPLATE_NAME = "hanging-gifts-contact";
const ALTERNATE_ASSET_BASE_URL = "/alternate-assets/hanging-gifts-contact";
const WEBSITE_ONLY_PACKAGES = [
  "fumadocs-core",
  "fumadocs-mdx",
  "linkinator",
] as const;
const DIRECT_IMPORT_PATTERNS = [
  /(?:import|export)\s+(?:type\s+)?[^;]*?\s+from\s+["']([^"']+)["']/g,
  /import\s+["']([^"']+)["']/g,
] as const;

type JsonObject = Record<string, unknown>;
type FixtureFramework = "next" | "vite";
type ShadcnInfo = Readonly<{
  config: Readonly<{
    base: string;
    resolvedPaths: Readonly<{ components: string; ui: string }>;
  }>;
  components: string[];
}>;

function fail(message: string): never {
  throw new Error(message);
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readJson(filePath: string): unknown {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function run(
  command: string,
  arguments_: string[],
  cwd: string,
  options: Readonly<{
    allowPromptExit?: boolean;
    environment?: Readonly<Record<string, string>>;
  }> = {},
): string {
  const result = spawnSync(command, arguments_, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, ...options.environment, NO_COLOR: "1" },
  });
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;

  if (result.error) {
    fail(`${command} could not start: ${result.error.message}`);
  }
  if (result.status !== 0) {
    fail(`${command} ${arguments_.join(" ")} failed:\n${output.trim()}`);
  }
  if (
    !options.allowPromptExit &&
    /Would you like to overwrite\?/.test(output)
  ) {
    fail(`Unexpected shadcn overwrite prompt:\n${output.trim()}`);
  }

  return output;
}

function assertPinnedShadcn(): string {
  const projectPackage = readJson(join(PROJECT_ROOT, "package.json"));
  const installedPackage = readJson(
    join(PROJECT_ROOT, "node_modules/shadcn/package.json"),
  );

  if (
    !isObject(projectPackage) ||
    !isObject(projectPackage.devDependencies) ||
    projectPackage.devDependencies.shadcn !== SHADCN_VERSION ||
    !isObject(installedPackage) ||
    installedPackage.version !== SHADCN_VERSION
  ) {
    fail(`Fixture verification requires shadcn ${SHADCN_VERSION}.`);
  }

  return join(PROJECT_ROOT, "node_modules/shadcn/dist/index.js");
}

function parseShadcnInfo(output: string): ShadcnInfo {
  const value: unknown = JSON.parse(output);
  if (
    !isObject(value) ||
    !isObject(value.config) ||
    !isObject(value.config.resolvedPaths) ||
    typeof value.config.base !== "string" ||
    typeof value.config.resolvedPaths.components !== "string" ||
    typeof value.config.resolvedPaths.ui !== "string" ||
    !Array.isArray(value.components) ||
    !value.components.every((component) => typeof component === "string")
  ) {
    fail("shadcn info returned an unexpected JSON contract.");
  }
  return value as unknown as ShadcnInfo;
}

function shadcnInfo(cliPath: string, projectRoot: string): ShadcnInfo {
  return parseShadcnInfo(
    run(
      process.execPath,
      [cliPath, "info", "--json", "--cwd", projectRoot],
      PROJECT_ROOT,
    ),
  );
}

function importSpecifiers(content: string): string[] {
  return [
    ...new Set(
      DIRECT_IMPORT_PATTERNS.flatMap((pattern) =>
        [...content.matchAll(pattern)].map((match) => match[1]),
      ),
    ),
  ];
}

function packageName(specifier: string): string {
  return specifier.startsWith("@")
    ? specifier.split("/").slice(0, 2).join("/")
    : specifier.split("/")[0];
}

function pinnedDependency(value: string): [name: string, version: string] {
  const separator = value.lastIndexOf("@");
  if (separator <= 0 || separator === value.length - 1) {
    fail(`Dependency is not exactly pinned: ${value}`);
  }
  return [value.slice(0, separator), value.slice(separator + 1)];
}

function assertFile(filePath: string): void {
  if (
    !existsSync(filePath) ||
    !statSync(filePath).isFile() ||
    lstatSync(filePath).isSymbolicLink()
  ) {
    fail(`Expected an installed regular file: ${filePath}`);
  }
}

function installedPath(
  target: string,
  fixtureRoot: string,
  info: ShadcnInfo,
): string {
  if (target.startsWith("@components/")) {
    return join(
      info.config.resolvedPaths.components,
      target.slice("@components/".length),
    );
  }
  if (target.startsWith("~/public/")) {
    return join(fixtureRoot, target.slice(2));
  }
  return fail(`Unsupported registry target in fixture: ${target}`);
}

function assertPublicBaseUiImports(filePath: string): void {
  const imports = importSpecifiers(readFileSync(filePath, "utf8"));
  for (const specifier of imports) {
    if (
      (specifier.startsWith("@base-ui/react/") &&
        !/^@base-ui\/react\/[a-z0-9-]+$/.test(specifier)) ||
      specifier.startsWith("@radix-ui/")
    ) {
      fail(`${filePath} imports a non-public or unsupported primitive API.`);
    }
  }
}

function assertControlBoundary(
  projectRoot: string,
  info: ShadcnInfo,
  registryDependencies: string[],
): void {
  const preflight = classifyShadcnInstallation(info);
  if (preflight.status !== "supported") {
    fail("Expected a Base UI installation.");
  }

  const installedControls = new Set(info.components);
  for (const control of info.components) {
    const controlPath = join(info.config.resolvedPaths.ui, `${control}.tsx`);
    assertFile(controlPath);
    assertPublicBaseUiImports(controlPath);
  }
  for (const control of registryDependencies) {
    if (!installedControls.has(control)) {
      fail(`shadcn info did not report installed control: ${control}`);
    }
  }

  const componentsJson = readJson(join(projectRoot, "components.json"));
  if (!isObject(componentsJson) || componentsJson.style !== "base-nova") {
    fail("The project is not configured with the reviewed Base UI style.");
  }
}

function assertInstalledDependencies(
  fixtureRoot: string,
  dependencies: string[],
): void {
  const manifest = readJson(join(fixtureRoot, "package.json"));
  if (!isObject(manifest) || !isObject(manifest.dependencies)) {
    fail("Fixture package.json is missing its dependency map.");
  }

  for (const dependency of dependencies) {
    const [name, version] = pinnedDependency(dependency);
    if (!Object.hasOwn(manifest.dependencies, name)) {
      fail(`Fixture does not independently declare ${name}.`);
    }
    const installed = readJson(
      join(fixtureRoot, "node_modules", name, "package.json"),
    );
    if (!isObject(installed) || installed.version !== version) {
      fail(`Installed dependency does not match ${dependency}.`);
    }
  }

  for (const packageName of WEBSITE_ONLY_PACKAGES) {
    if (Object.hasOwn(manifest.dependencies, packageName)) {
      fail(`Clean compatibility fixture unexpectedly requires ${packageName}.`);
    }
  }
}

function assertInstalledTemplate(
  fixtureRoot: string,
  info: ShadcnInfo,
  item: RegistryItem,
): string[] {
  const installedFiles = (item.files ?? []).map((file) => {
    if (typeof file.target !== "string") {
      return fail(`Registry file is missing an explicit target: ${file.path}`);
    }
    const filePath = installedPath(file.target, fixtureRoot, info);
    assertFile(filePath);

    if (filePath.endsWith(".svg")) {
      const source = readFileSync(join(PROJECT_ROOT, file.path));
      const installed = readFileSync(filePath);
      if (!source.equals(installed)) {
        fail("The installed local asset differs from the registry source.");
      }
    }
    return filePath;
  });

  const templateImports = new Set<string>();
  for (const filePath of installedFiles.filter((file) =>
    /\.tsx?$/.test(file),
  )) {
    for (const specifier of importSpecifiers(readFileSync(filePath, "utf8"))) {
      templateImports.add(specifier);
      if (
        specifier === "@base-ui/react" ||
        specifier.startsWith("@base-ui/react/") ||
        specifier.startsWith("@radix-ui/")
      ) {
        fail(
          `Installed template imports an unsupported primitive: ${specifier}`,
        );
      }
    }
  }

  const installedControlImports = [...templateImports]
    .filter((specifier) => specifier.startsWith("@/components/ui/"))
    .map((specifier) => basename(specifier))
    .sort();
  const expectedControls = [...(item.registryDependencies ?? [])].sort();
  if (
    JSON.stringify(installedControlImports) !== JSON.stringify(expectedControls)
  ) {
    fail(
      "Installed template control imports do not match registryDependencies.",
    );
  }

  const installedPackages = [
    ...new Set(
      [...templateImports]
        .filter(
          (specifier) =>
            !specifier.startsWith(".") &&
            !specifier.startsWith("@/") &&
            specifier !== "react",
        )
        .map(packageName),
    ),
  ].sort();
  const expectedPackages = (item.dependencies ?? [])
    .map((dependency) => pinnedDependency(dependency)[0])
    .sort();
  if (JSON.stringify(installedPackages) !== JSON.stringify(expectedPackages)) {
    fail("Installed template imports do not match its npm dependencies.");
  }

  const templateRoot = join(
    info.config.resolvedPaths.components,
    "formmuse/hanging-gifts-contact",
  );
  for (const repositoryOnlyName of [
    "hanging-gifts-contact.example.tsx",
    "hanging-gifts-contact.backend.example.tsx",
    "hanging-gifts-contact.documentation.ts",
    "hanging-gifts-contact-form.test.tsx",
    "hanging-gifts-contact-form.schema.test.ts",
    "changelog.md",
  ]) {
    if (existsSync(join(templateRoot, repositoryOnlyName))) {
      fail(
        `Repository-only file leaked into installation: ${repositoryOnlyName}`,
      );
    }
  }

  return installedFiles;
}

function assertConflictIsVisible(
  cliPath: string,
  fixtureRoot: string,
  itemPath: string,
  installedFiles: string[],
): void {
  const inputPath = join(fixtureRoot, "src/components/ui/input.tsx");
  const marker =
    "\n// Adopter customization that FormMuse must never overwrite automatically.\n";
  writeFileSync(inputPath, `${readFileSync(inputPath, "utf8")}${marker}`);
  const controlFiles = readdirSync(join(fixtureRoot, "src/components/ui"))
    .filter((file) => file.endsWith(".tsx"))
    .map((file) => join(fixtureRoot, "src/components/ui", file));
  const auditedFiles = [
    join(fixtureRoot, "package.json"),
    ...installedFiles,
    ...controlFiles,
  ];
  for (const lockfile of ["pnpm-lock.yaml", "package-lock.json"]) {
    const filePath = join(fixtureRoot, lockfile);
    if (existsSync(filePath)) {
      auditedFiles.push(filePath);
    }
  }
  const before = new Map(
    auditedFiles.map((filePath) => [filePath, readFileSync(filePath)]),
  );

  const output = run(
    process.execPath,
    [cliPath, "add", itemPath, "--cwd", fixtureRoot],
    PROJECT_ROOT,
    { allowPromptExit: true },
  );
  if (
    !/input\.tsx already exists[\s\S]*Would you like to overwrite\?/.test(
      output,
    )
  ) {
    fail("The pinned CLI did not expose the customized-control conflict.");
  }

  for (const [filePath, bytes] of before) {
    if (!readFileSync(filePath).equals(bytes)) {
      fail(`Conflict handling changed a file without approval: ${filePath}`);
    }
  }
}

function createFixture(
  cliPath: string,
  temporaryRoot: string,
  foundation: "base" | "radix",
  framework: FixtureFramework,
): string {
  mkdirSync(temporaryRoot, { recursive: true });
  const name = `formmuse-${framework}-${foundation}-fixture`;
  run(
    process.execPath,
    [
      cliPath,
      "init",
      "--template",
      framework,
      "--base",
      foundation,
      "--preset",
      "nova",
      "--name",
      name,
      "--cwd",
      temporaryRoot,
      "--yes",
      "--no-monorepo",
    ],
    PROJECT_ROOT,
  );
  return join(temporaryRoot, name);
}

function assertRadixPreflight(cliPath: string, temporaryRoot: string): void {
  const fixtureRoot = createFixture(cliPath, temporaryRoot, "radix", "vite");
  const componentsPath = join(fixtureRoot, "components.json");
  const before = readFileSync(componentsPath);
  const info = shadcnInfo(cliPath, fixtureRoot);
  const preflight = classifyShadcnInstallation(info);

  if (
    preflight.status !== "unsupported" ||
    preflight.warning !== RADIX_UNSUPPORTED_WARNING ||
    !readFileSync(componentsPath).equals(before) ||
    existsSync(join(info.config.resolvedPaths.components, "formmuse")) ||
    existsSync(join(fixtureRoot, "public/formmuse"))
  ) {
    fail("Radix preflight did not remain explicit and non-mutating.");
  }
}

function compatibilityEntry(framework: FixtureFramework): string {
  const exportLine =
    framework === "next"
      ? "export default function Page() {"
      : "export function App() {";
  const footer = framework === "next" ? "}\n" : "}\n\nexport default App\n";

  return `"use client"\n\nimport { HangingGiftsContactForm } from "@/components/formmuse/hanging-gifts-contact/hanging-gifts-contact-form"\nimport type { HangingGiftsContactFormValues } from "@/components/formmuse/hanging-gifts-contact/hanging-gifts-contact-form.schema"\n\nfunction handleSubmit(values: HangingGiftsContactFormValues): Promise<void> {\n  void JSON.stringify(values)\n  return Promise.resolve()\n}\n\n${exportLine}\n  return (\n    <main>\n      <section data-asset-path="default">\n        <HangingGiftsContactForm onSubmit={handleSubmit} />\n      </section>\n      <section data-asset-path="alternate">\n        <HangingGiftsContactForm\n          assetBaseUrl="${ALTERNATE_ASSET_BASE_URL}"\n          onSubmit={handleSubmit}\n        />\n      </section>\n    </main>\n  )\n${footer}`;
}

function prepareFixtureEntry(
  fixtureRoot: string,
  framework: FixtureFramework,
): void {
  const entryPath = join(
    fixtureRoot,
    framework === "next" ? "app/page.tsx" : "src/App.tsx",
  );
  writeFileSync(entryPath, compatibilityEntry(framework));

  if (framework === "vite") {
    writeFileSync(
      join(fixtureRoot, "src/compatibility-render.tsx"),
      `import { renderToString } from "react-dom/server"\n\nimport { App } from "./App"\n\nexport function renderCompatibilityFixture(): string {\n  return renderToString(<App />)\n}\n`,
    );
  }
}

function prepareAlternateAsset(
  fixtureRoot: string,
  info: ShadcnInfo,
  item: RegistryItem,
): void {
  const asset = (item.files ?? []).find((file) => file.path.endsWith(".svg"));
  if (!asset || typeof asset.target !== "string") {
    fail("The generated item is missing its packaged hero asset.");
  }
  const sourcePath = installedPath(asset.target, fixtureRoot, info);
  const alternateDirectory = join(
    fixtureRoot,
    "public",
    ALTERNATE_ASSET_BASE_URL.slice(1),
  );
  mkdirSync(alternateDirectory, { recursive: true });
  copyFileSync(sourcePath, join(alternateDirectory, basename(sourcePath)));
}

function assertRenderedMarkup(
  markup: string,
  framework: FixtureFramework,
): void {
  for (const expected of [
    "/formmuse/hanging-gifts-contact/hanging-gifts-hero.svg",
    `${ALTERNATE_ASSET_BASE_URL}/hanging-gifts-hero.svg`,
    "First name",
    "Email address",
  ]) {
    if (!markup.includes(expected)) {
      fail(`${framework} render is missing ${expected}.`);
    }
  }
}

function nextPrerender(fixtureRoot: string): string {
  const appOutput = join(fixtureRoot, ".next/server/app");
  const candidates = readdirSync(appOutput, {
    recursive: true,
    withFileTypes: true,
  })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
    .map((entry) => join(entry.parentPath, entry.name));
  const rendered = candidates.find((filePath) =>
    readFileSync(filePath, "utf8").includes(
      "/formmuse/hanging-gifts-contact/hanging-gifts-hero.svg",
    ),
  );

  if (!rendered) {
    return fail("Next.js did not emit the installed template prerender.");
  }
  return readFileSync(rendered, "utf8");
}

async function viteRender(fixtureRoot: string): Promise<string> {
  const server = await createServer({
    root: fixtureRoot,
    appType: "custom",
    logLevel: "silent",
    server: { middlewareMode: true },
  });
  try {
    const loadedModule = (await server.ssrLoadModule(
      "/src/compatibility-render.tsx",
    )) as Readonly<{ renderCompatibilityFixture?: () => string }>;
    if (typeof loadedModule.renderCompatibilityFixture !== "function") {
      return fail("Vite compatibility renderer is missing.");
    }
    return loadedModule.renderCompatibilityFixture();
  } finally {
    await server.close();
  }
}

async function verifyFrameworkFixture(
  cliPath: string,
  temporaryRoot: string,
  framework: FixtureFramework,
  itemPath: string,
  item: RegistryItem,
): Promise<string[]> {
  const fixtureRoot = createFixture(
    cliPath,
    join(temporaryRoot, framework),
    "base",
    framework,
  );
  run(
    process.execPath,
    [cliPath, "add", itemPath, "--cwd", fixtureRoot],
    PROJECT_ROOT,
  );
  const info = shadcnInfo(cliPath, fixtureRoot);
  assertControlBoundary(fixtureRoot, info, item.registryDependencies ?? []);
  assertInstalledDependencies(fixtureRoot, item.dependencies ?? []);
  const installedFiles = assertInstalledTemplate(fixtureRoot, info, item);
  prepareAlternateAsset(fixtureRoot, info, item);
  prepareFixtureEntry(fixtureRoot, framework);
  run("npm", ["run", "typecheck"], fixtureRoot);
  run("npm", ["run", "build"], fixtureRoot, {
    environment: { NODE_ENV: "production" },
  });

  const markup =
    framework === "next"
      ? nextPrerender(fixtureRoot)
      : await viteRender(fixtureRoot);
  assertRenderedMarkup(markup, framework);
  return installedFiles;
}

async function main(): Promise<void> {
  const cliPath = assertPinnedShadcn();
  const temporaryRoot = mkdtempSync(
    join(tmpdir(), "formmuse-registry-install."),
  );

  try {
    const registryOutput = join(temporaryRoot, "registry");
    buildRegistry({
      projectRoot: PROJECT_ROOT,
      deployEnvironment: "development",
      outputDirectory: registryOutput,
    });
    const itemPath = join(registryOutput, `${TEMPLATE_NAME}.json`);
    const itemResult = registryItemSchema.safeParse(readJson(itemPath));
    if (!itemResult.success) {
      fail("Generated fixture item violates the shadcn schema.");
    }
    const item = itemResult.data;

    const repositoryInfo = shadcnInfo(cliPath, PROJECT_ROOT);
    assertControlBoundary(
      PROJECT_ROOT,
      repositoryInfo,
      item.registryDependencies ?? [],
    );

    const viteInstalledFiles = await verifyFrameworkFixture(
      cliPath,
      temporaryRoot,
      "vite",
      itemPath,
      item,
    );
    await verifyFrameworkFixture(
      cliPath,
      temporaryRoot,
      "next",
      itemPath,
      item,
    );
    const viteRoot = join(temporaryRoot, "vite/formmuse-vite-base-fixture");
    assertConflictIsVisible(cliPath, viteRoot, itemPath, viteInstalledFiles);

    assertRadixPreflight(cliPath, join(temporaryRoot, "radix"));
    process.stdout.write(
      `Verified pinned shadcn ${SHADCN_VERSION} installed, typed, built, and rendered Hanging Gifts in clean Vite and Next.js Base UI fixtures with independent dependency ownership, visible conflicts, and Radix rejection.\n`,
    );
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

void main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
});
