import { spawnSync } from "node:child_process";
import {
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

import {
  classifyShadcnInstallation,
  RADIX_UNSUPPORTED_WARNING,
} from "../lib/formmuse/install-preflight";
import { buildRegistry } from "../lib/formmuse/registry-build";

const PROJECT_ROOT = resolve(process.cwd());
const SHADCN_VERSION = "4.13.1";
const TEMPLATE_NAME = "hanging-gifts-contact";
const DIRECT_IMPORT_PATTERNS = [
  /(?:import|export)\s+(?:type\s+)?[^;]*?\s+from\s+["']([^"']+)["']/g,
  /import\s+["']([^"']+)["']/g,
] as const;

type JsonObject = Record<string, unknown>;
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
  options: Readonly<{ allowPromptExit?: boolean }> = {},
): string {
  const result = spawnSync(command, arguments_, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1" },
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
  for (const dependency of dependencies) {
    const [name, version] = pinnedDependency(dependency);
    const installed = readJson(
      join(fixtureRoot, "node_modules", name, "package.json"),
    );
    if (!isObject(installed) || installed.version !== version) {
      fail(`Installed dependency does not match ${dependency}.`);
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

  const examplePath = join(
    fixtureRoot,
    "src/components/formmuse/hanging-gifts-contact/hanging-gifts-contact.example.tsx",
  );
  if (existsSync(examplePath)) {
    fail("Repository-only example leaked into the fixture installation.");
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
): string {
  mkdirSync(temporaryRoot, { recursive: true });
  const name = `formmuse-${foundation}-fixture`;
  run(
    process.execPath,
    [
      cliPath,
      "init",
      "--template",
      "vite",
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
  const fixtureRoot = createFixture(cliPath, temporaryRoot, "radix");
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

function main(): void {
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

    const fixtureRoot = createFixture(
      cliPath,
      join(temporaryRoot, "base"),
      "base",
    );
    run(
      process.execPath,
      [cliPath, "add", itemPath, "--cwd", fixtureRoot],
      PROJECT_ROOT,
    );
    const fixtureInfo = shadcnInfo(cliPath, fixtureRoot);
    assertControlBoundary(
      fixtureRoot,
      fixtureInfo,
      item.registryDependencies ?? [],
    );
    assertInstalledDependencies(fixtureRoot, item.dependencies ?? []);
    const installedFiles = assertInstalledTemplate(
      fixtureRoot,
      fixtureInfo,
      item,
    );
    run("pnpm", ["--dir", fixtureRoot, "build"], PROJECT_ROOT);
    assertConflictIsVisible(cliPath, fixtureRoot, itemPath, installedFiles);

    assertRadixPreflight(cliPath, join(temporaryRoot, "radix"));
    process.stdout.write(
      `Verified pinned shadcn ${SHADCN_VERSION} Base UI initialization, installation, dependency ownership, visible conflicts, and Radix rejection.\n`,
    );
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

main();
