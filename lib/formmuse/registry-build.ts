import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import {
  basename,
  dirname,
  isAbsolute,
  join,
  normalize,
  relative,
  resolve,
  sep,
} from "node:path";
import { brotliCompressSync } from "node:zlib";

import {
  registryItemSchema,
  registrySchema,
  type RegistryItem,
} from "shadcn/schema";

import type { FormMuseDeployEnvironment } from "./build-origin";
import {
  KebabCaseSlugSchema,
  validateFormMuseRegistryBoundary,
} from "./registry-schemas";

const PINNED_SHADCN_VERSION = "4.13.1";
const ROOT_REGISTRY_KEYS = ["$schema", "homepage", "items", "name"];
const ITEM_KEYS = [
  "categories",
  "dependencies",
  "description",
  "files",
  "meta",
  "name",
  "registryDependencies",
  "title",
  "type",
];
const FILE_KEYS = ["path", "target", "type"];
const FORBIDDEN_DISTRIBUTED_MARKERS = [
  "/Users/",
  "\\Users\\",
  "file://",
  "website-v2",
  ".agents/",
  ".formmuse-worker/",
];
const REPOSITORY_ONLY_PATTERNS = [
  /(?:^|\/)preview\.tsx$/,
  /\.example\.tsx$/,
  /\.test\.(?:ts|tsx)$/,
  /(?:^|\/)asset-provenance\.md$/,
  /(?:^|\/)changelog\.md$/i,
];
const SECRET_PATTERNS = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /(?:api[_-]?key|secret|token|password)\s*[:=]\s*["'][^"']{8,}["']/i,
];
const IMPORT_PATTERNS = [
  /(?:import|export)\s+(?:type\s+)?[^;]*?\s+from\s+["']([^"']+)["']/g,
  /import\s+["']([^"']+)["']/g,
] as const;
const APPROVED_SVG_TRANSPORTS = {
  "public/formmuse/hanging-gifts-contact/hanging-gifts-hero.svg": {
    payloadBytes: 125_832,
    payloadSha256:
      "1f7dbcc7b81430ee0fb6c22bcf0c4825d1b67bbe144e2d7502f3c52057a39106",
    width: 1536,
    height: 1024,
    wrapperBytes: 167_944,
    wrapperSha256:
      "12dc9c2dfb600fe74d6a2b4aa3b4eb3e8a7a41dfee780f845a07fd0bf725c9e8",
    maximumBrotliBytes: 126_500,
  },
} as const;

type JsonObject = Record<string, unknown>;
type AuthoredRegistry = Readonly<{
  $schema: string;
  name: string;
  homepage: string;
  items: RegistryItem[];
}>;

export type RegistryBuildOptions = Readonly<{
  projectRoot: string;
  deployEnvironment: FormMuseDeployEnvironment;
  registryPath?: string;
  outputDirectory?: string;
}>;

export type RegistryBuildResult = Readonly<{
  outputDirectory: string;
  itemNames: string[];
  fileInventory: RegistryItemFileInventory[];
  outputSha256: string;
}>;

export type RegistryItemFileInventory = Readonly<{
  itemName: string;
  files: ReadonlyArray<
    Readonly<{
      path: string;
      target: string;
      type: string;
    }>
  >;
}>;

export class RegistryBuildError extends Error {
  override readonly name = "RegistryBuildError";
}

function fail(message: string): never {
  throw new RegistryBuildError(message);
}

function sha256(value: Buffer | string): string {
  return createHash("sha256").update(value).digest("hex");
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertExactKeys(
  value: unknown,
  expectedKeys: readonly string[],
  label: string,
): asserts value is JsonObject {
  if (!isObject(value)) {
    fail(`${label} must be an object.`);
  }

  const actualKeys = Object.keys(value).sort();
  const sortedExpected = [...expectedKeys].sort();

  if (JSON.stringify(actualKeys) !== JSON.stringify(sortedExpected)) {
    fail(`${label} has unsupported or missing keys.`);
  }
}

function assertUniqueSorted(values: string[], label: string): void {
  if (new Set(values).size !== values.length) {
    fail(`${label} must contain unique values.`);
  }

  if (JSON.stringify(values) !== JSON.stringify([...values].sort())) {
    fail(`${label} must be sorted.`);
  }
}

function assertSafeRelativePath(path: string, label: string): void {
  if (
    isAbsolute(path) ||
    path.includes("\\") ||
    normalize(path) !== path ||
    path.split("/").some((part) => part === "" || part === "." || part === "..")
  ) {
    fail(`${label} must be a normalized repository-relative path.`);
  }
}

function assertInsideProject(projectRoot: string, path: string): string {
  const absolutePath = resolve(projectRoot, path);
  const relativePath = relative(projectRoot, absolutePath);

  if (relativePath.startsWith(`..${sep}`) || relativePath === "..") {
    fail(`Registry source escapes the project root: ${path}`);
  }

  return absolutePath;
}

function readJson(path: string): unknown {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    fail(`Cannot parse JSON at ${path}: ${(error as Error).message}`);
  }
}

function packageNameFromSpecifier(specifier: string): string {
  if (specifier.startsWith("@")) {
    return specifier.split("/").slice(0, 2).join("/");
  }

  return specifier.split("/")[0];
}

function parsePinnedDependency(value: string): [name: string, version: string] {
  const separator = value.lastIndexOf("@");

  if (separator <= 0 || separator === value.length - 1) {
    fail(`Registry dependency must pin an exact version: ${value}`);
  }

  return [value.slice(0, separator), value.slice(separator + 1)];
}

function resolveRelativeImport(
  sourcePath: string,
  specifier: string,
  declaredPaths: Set<string>,
): string | undefined {
  const base = normalize(join(dirname(sourcePath), specifier))
    .split(sep)
    .join("/");
  const candidates = [base, `${base}.ts`, `${base}.tsx`, `${base}.css`];
  return candidates.find((candidate) => declaredPaths.has(candidate));
}

function importSpecifiers(content: string): string[] {
  return [
    ...new Set(
      IMPORT_PATTERNS.flatMap((pattern) =>
        [...content.matchAll(pattern)].map((match) => match[1]),
      ),
    ),
  ];
}

function assertNoForbiddenContent(content: string, label: string): void {
  for (const marker of FORBIDDEN_DISTRIBUTED_MARKERS) {
    if (content.includes(marker)) {
      fail(`${label} contains forbidden repository or local-path data.`);
    }
  }

  for (const pattern of SECRET_PATTERNS) {
    if (pattern.test(content)) {
      fail(`${label} contains secret-shaped data.`);
    }
  }
}

function listFiles(root: string, current = root): string[] {
  if (!existsSync(current)) {
    return [];
  }

  return readdirSync(current, { withFileTypes: true }).flatMap((entry) => {
    const path = join(current, entry.name);
    return entry.isDirectory()
      ? listFiles(root, path)
      : [relative(root, path).split(sep).join("/")];
  });
}

function validateSvgTransport(path: string, content: string): void {
  const relativePath = path as keyof typeof APPROVED_SVG_TRANSPORTS;
  const approved = APPROVED_SVG_TRANSPORTS[relativePath];

  if (!approved) {
    if (content.includes(";base64,")) {
      fail(`Unapproved Base64 transport: ${path}`);
    }
    return;
  }

  const match =
    /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="(\d+)" height="(\d+)" viewBox="0 0 \d+ \d+">\n  <image width="\d+" height="\d+" href="data:image\/webp;base64,([A-Za-z0-9+/]+={0,2})"\/>\n<\/svg>\n$/.exec(
      content,
    );

  if (!match) {
    fail(`Approved SVG transport has unexpected markup: ${path}`);
  }

  const payload = Buffer.from(match[3], "base64");
  const expectedWrapper = `<svg xmlns="http://www.w3.org/2000/svg" width="${approved.width}" height="${approved.height}" viewBox="0 0 ${approved.width} ${approved.height}">\n  <image width="${approved.width}" height="${approved.height}" href="data:image/webp;base64,${payload.toString("base64")}"/>\n</svg>\n`;

  if (
    Number(match[1]) !== approved.width ||
    Number(match[2]) !== approved.height ||
    content !== expectedWrapper ||
    payload.length !== approved.payloadBytes ||
    sha256(payload) !== approved.payloadSha256 ||
    Buffer.byteLength(content) !== approved.wrapperBytes ||
    sha256(content) !== approved.wrapperSha256 ||
    brotliCompressSync(content).length > approved.maximumBrotliBytes
  ) {
    fail(`Approved SVG transport failed integrity or size validation: ${path}`);
  }
}

function validateItemFiles(
  projectRoot: string,
  item: RegistryItem,
  packageJson: JsonObject,
): void {
  const slug = item.name;
  const files = item.files ?? [];
  const declaredPaths = new Set<string>();
  const declaredTargets = new Set<string>();
  const externalImports = new Set<string>();
  const controlImports = new Set<string>();

  if (files.length === 0) {
    fail(`${slug} must declare distributed files.`);
  }

  for (const file of files) {
    assertExactKeys(file, FILE_KEYS, `${slug} file`);
    assertSafeRelativePath(file.path, `${slug} file path`);
    if (REPOSITORY_ONLY_PATTERNS.some((pattern) => pattern.test(file.path))) {
      fail(`${slug} must not distribute repository-only file: ${file.path}`);
    }
    if (typeof file.target !== "string") {
      fail(`${slug} files must have explicit targets.`);
    }
    if (declaredPaths.has(file.path) || declaredTargets.has(file.target)) {
      fail(`${slug} file paths and targets must be unique.`);
    }

    declaredPaths.add(file.path);
    declaredTargets.add(file.target);
  }

  for (const file of files) {
    const target = file.target as string;

    const expectedComponentTarget = `@components/formmuse/${slug}/${basename(file.path)}`;
    const expectedAssetTarget = `~/public/formmuse/${slug}/${basename(file.path)}`;
    const isPublicAsset = file.path.startsWith(`public/formmuse/${slug}/`);

    if (
      target !== (isPublicAsset ? expectedAssetTarget : expectedComponentTarget)
    ) {
      fail(`${slug} has an invalid explicit target for ${file.path}.`);
    }

    if (isPublicAsset && file.type !== "registry:file") {
      fail(`${slug} public assets must use registry:file.`);
    }

    const absolutePath = assertInsideProject(projectRoot, file.path);

    if (!existsSync(absolutePath) || !statSync(absolutePath).isFile()) {
      fail(`${slug} source file is missing: ${file.path}`);
    }
    if (lstatSync(absolutePath).isSymbolicLink()) {
      fail(`${slug} source files must not be symbolic links.`);
    }

    const content = readFileSync(absolutePath, "utf8");
    assertNoForbiddenContent(content, file.path);

    if (file.path.endsWith(".svg")) {
      validateSvgTransport(file.path, content);
    } else if (content.includes(";base64,")) {
      fail(
        `Base64 is forbidden outside an approved standalone SVG: ${file.path}`,
      );
    }

    if (!file.path.endsWith(".ts") && !file.path.endsWith(".tsx")) {
      continue;
    }

    for (const specifier of importSpecifiers(content)) {
      if (specifier.startsWith(".")) {
        if (!resolveRelativeImport(file.path, specifier, declaredPaths)) {
          fail(
            `${file.path} imports an undeclared template file: ${specifier}`,
          );
        }
      } else if (specifier.startsWith("@/components/ui/")) {
        controlImports.add(specifier.split("/").at(-1) ?? "");
      } else if (specifier === "@/lib/utils") {
        continue;
      } else if (
        specifier === "@base-ui/react" ||
        specifier.startsWith("@base-ui/react/")
      ) {
        fail(
          `${file.path} must import adopter-local shadcn controls instead of @base-ui/react.`,
        );
      } else if (specifier.startsWith("@/") || specifier.startsWith("node:")) {
        fail(`${file.path} imports an unsupported adopter or Node module.`);
      } else {
        const packageName = packageNameFromSpecifier(specifier);
        if (packageName !== "react") {
          externalImports.add(packageName);
        }
      }
    }
  }

  const registryDependencies = item.registryDependencies ?? [];
  assertUniqueSorted(registryDependencies, `${slug} registryDependencies`);
  if (
    JSON.stringify(registryDependencies) !==
    JSON.stringify([...controlImports].sort())
  ) {
    fail(`${slug} registryDependencies do not match direct control imports.`);
  }

  const dependencies = item.dependencies ?? [];
  assertUniqueSorted(dependencies, `${slug} dependencies`);
  const manifestDependencies = {
    ...(isObject(packageJson.dependencies) ? packageJson.dependencies : {}),
    ...(isObject(packageJson.devDependencies)
      ? packageJson.devDependencies
      : {}),
  };
  const declaredPackages = dependencies.map((dependency) => {
    const [name, version] = parsePinnedDependency(dependency);
    if (manifestDependencies[name] !== version) {
      fail(`${slug} dependency pin does not match package.json: ${name}`);
    }
    return name;
  });

  if (
    JSON.stringify(declaredPackages.sort()) !==
    JSON.stringify([...externalImports].sort())
  ) {
    fail(`${slug} dependencies do not match distributed imports.`);
  }

  const templateRoot = join(projectRoot, "registry/base", slug);
  const undeclaredTemplateFiles = listFiles(templateRoot)
    .map((path) => `registry/base/${slug}/${path}`)
    .filter(
      (path) =>
        !declaredPaths.has(path) &&
        !REPOSITORY_ONLY_PATTERNS.some((pattern) => pattern.test(path)),
    );
  if (undeclaredTemplateFiles.length > 0) {
    fail(`${slug} contains undeclared template files.`);
  }

  const publicAssetRoot = join(projectRoot, "public/formmuse", slug);
  const undeclaredPublicFiles = listFiles(publicAssetRoot)
    .map((path) => `public/formmuse/${slug}/${path}`)
    .filter((path) => !declaredPaths.has(path));
  if (undeclaredPublicFiles.length > 0) {
    fail(`${slug} contains undeclared public assets.`);
  }
}

export function createRegistryFileInventory(
  items: readonly RegistryItem[],
): RegistryItemFileInventory[] {
  return items.map((item) => ({
    itemName: item.name,
    files: (item.files ?? []).map((file) => {
      if (typeof file.target !== "string") {
        fail(`${item.name} files must have explicit targets.`);
      }

      return {
        path: file.path,
        target: file.target,
        type: file.type,
      };
    }),
  }));
}

function validateItemBoundary(item: RegistryItem) {
  return validateFormMuseRegistryBoundary({
    categories: item.categories,
    meta: item.meta,
  });
}

export function validateAuthoredRegistry(
  value: unknown,
  projectRoot: string,
): AuthoredRegistry {
  assertExactKeys(value, ROOT_REGISTRY_KEYS, "Root registry");

  const parsed = registrySchema.safeParse(value);
  if (!parsed.success) {
    fail(`Root registry violates the shadcn schema: ${parsed.error.message}`);
  }

  const root = value as JsonObject;
  if (
    root.$schema !== "https://ui.shadcn.com/schema/registry.json" ||
    root.name !== "formmuse" ||
    root.homepage !== "https://github.com/aSam7878/FormMuse" ||
    !Array.isArray(root.items)
  ) {
    fail("Root registry identity is invalid.");
  }

  const packageJson = readJson(join(projectRoot, "package.json"));
  if (!isObject(packageJson)) {
    fail("package.json must be an object.");
  }

  const names = new Set<string>();
  const items = root.items.map((itemValue, index) => {
    assertExactKeys(itemValue, ITEM_KEYS, `Registry item ${index}`);
    const itemResult = registryItemSchema.safeParse(itemValue);
    if (!itemResult.success) {
      fail(`Registry item ${index} violates the shadcn schema.`);
    }
    const item = itemResult.data;

    if (
      item.type !== "registry:block" ||
      !item.title?.trim() ||
      !item.description?.trim() ||
      names.has(item.name) ||
      KebabCaseSlugSchema.safeParse(item.name).success === false
    ) {
      fail(`Registry item ${index} has an invalid identity.`);
    }
    names.add(item.name);
    const boundary = validateItemBoundary(item);
    validateItemFiles(projectRoot, item, packageJson);
    for (const example of boundary.meta.formmuse.examples) {
      const examplePath = assertInsideProject(projectRoot, example.path);
      if (
        !existsSync(examplePath) ||
        !statSync(examplePath).isFile() ||
        lstatSync(examplePath).isSymbolicLink() ||
        item.files?.some((file) => file.path === example.path)
      ) {
        fail(`${item.name} example references must be repository-only files.`);
      }
    }
    return item;
  });

  return {
    $schema: root.$schema as string,
    name: root.name as string,
    homepage: root.homepage,
    items,
  };
}

export function loadAuthoredRegistry(
  projectRoot: string,
  registryPath = join(projectRoot, "registry.json"),
): AuthoredRegistry {
  return validateAuthoredRegistry(readJson(registryPath), projectRoot);
}

export function itemIsGeneratedForEnvironment(
  item: RegistryItem,
  deployEnvironment: FormMuseDeployEnvironment,
): boolean {
  const boundary = validateItemBoundary(item);
  const metadata = boundary.meta.formmuse;

  if (metadata.status === "published") {
    return true;
  }
  if (metadata.status === "draft") {
    return deployEnvironment === "development";
  }
  return metadata.deprecation.installable;
}

export function selectInstallableItems(
  items: RegistryItem[],
  deployEnvironment: FormMuseDeployEnvironment,
): RegistryItem[] {
  return items.filter((item) =>
    itemIsGeneratedForEnvironment(item, deployEnvironment),
  );
}

function assertPinnedShadcn(projectRoot: string): string {
  const packageJsonPath = join(projectRoot, "node_modules/shadcn/package.json");
  const packageJson = readJson(packageJsonPath);
  const projectPackageJson = readJson(join(projectRoot, "package.json"));

  if (
    !isObject(packageJson) ||
    packageJson.version !== PINNED_SHADCN_VERSION ||
    !isObject(projectPackageJson) ||
    !isObject(projectPackageJson.devDependencies) ||
    projectPackageJson.devDependencies.shadcn !== PINNED_SHADCN_VERSION
  ) {
    fail(`Registry builds require shadcn ${PINNED_SHADCN_VERSION}.`);
  }

  return join(projectRoot, "node_modules/shadcn/dist/index.js");
}

function runShadcnBuild(
  projectRoot: string,
  cliPath: string,
  registryPath: string,
  outputDirectory: string,
): void {
  const result = spawnSync(
    process.execPath,
    [cliPath, "build", registryPath, "-o", outputDirectory],
    {
      cwd: projectRoot,
      encoding: "utf8",
      env: { ...process.env, NO_COLOR: "1" },
    },
  );

  if (result.status !== 0) {
    fail(`shadcn build failed: ${(result.stderr || result.stdout).trim()}`);
  }
}

function outputFileMap(root: string): Map<string, Buffer> {
  return new Map(
    listFiles(root)
      .sort()
      .map((path) => [path, readFileSync(join(root, path))]),
  );
}

function validateGeneratedOutput(
  projectRoot: string,
  outputDirectory: string,
  expectedItems: RegistryItem[],
): Map<string, Buffer> {
  const files = outputFileMap(outputDirectory);
  const expectedFiles = [
    "registry.json",
    ...expectedItems.map((item) => `${item.name}.json`),
  ].sort();

  if (JSON.stringify([...files.keys()]) !== JSON.stringify(expectedFiles)) {
    fail("Generated registry contains missing or unexpected files.");
  }

  for (const [path, bytes] of files) {
    const content = bytes.toString("utf8");
    assertNoForbiddenContent(content, `Generated ${path}`);
    if (REPOSITORY_ONLY_PATTERNS.some((pattern) => pattern.test(content))) {
      fail(`Generated ${path} leaks repository-only files.`);
    }
  }

  const generatedRoot = readJson(join(outputDirectory, "registry.json"));
  if (!registrySchema.safeParse(generatedRoot).success) {
    fail("Generated root registry violates the shadcn schema.");
  }
  if (
    !isObject(generatedRoot) ||
    !Array.isArray(generatedRoot.items) ||
    JSON.stringify(generatedRoot.items) !== JSON.stringify(expectedItems)
  ) {
    fail("Generated root registry does not match the selected source records.");
  }

  for (const item of expectedItems) {
    const generated = readJson(join(outputDirectory, `${item.name}.json`));
    const generatedResult = registryItemSchema.safeParse(generated);
    if (!generatedResult.success) {
      fail(`Generated item violates the shadcn schema: ${item.name}`);
    }
    const generatedItem = generatedResult.data;
    validateItemBoundary(generatedItem);

    for (const key of [
      "name",
      "title",
      "description",
      "dependencies",
      "registryDependencies",
      "categories",
      "meta",
      "type",
    ] as const) {
      if (JSON.stringify(generatedItem[key]) !== JSON.stringify(item[key])) {
        fail(`Generated ${item.name} changed the authored ${key}.`);
      }
    }

    const generatedFiles = generatedItem.files ?? [];
    const authoredFiles = item.files ?? [];
    if (generatedFiles.length !== authoredFiles.length) {
      fail(`Generated ${item.name} changed the authored file boundary.`);
    }
    authoredFiles.forEach((authoredFile, index) => {
      const generatedFile = generatedFiles[index];
      const sourceContent = readFileSync(
        join(projectRoot, authoredFile.path),
        "utf8",
      );
      if (
        generatedFile === undefined ||
        generatedFile.path !== authoredFile.path ||
        generatedFile.type !== authoredFile.type ||
        generatedFile.target !== authoredFile.target ||
        generatedFile.content !== sourceContent
      ) {
        fail(`Generated ${item.name} changed ${authoredFile.path}.`);
      }
    });
  }

  return files;
}

function compareOutputs(
  first: Map<string, Buffer>,
  second: Map<string, Buffer>,
): void {
  if (
    JSON.stringify([...first.keys()]) !== JSON.stringify([...second.keys()]) ||
    [...first].some(([path, bytes]) => {
      const comparison = second.get(path);
      return comparison === undefined || !bytes.equals(comparison);
    })
  ) {
    fail("Two clean registry generations were not byte-identical.");
  }
}

function publishOutput(source: string, destination: string): void {
  const parent = dirname(destination);
  const staged = join(parent, `.formmuse-registry-${process.pid}`);
  const backup = join(parent, `.formmuse-registry-backup-${process.pid}`);
  mkdirSync(parent, { recursive: true });
  rmSync(staged, { recursive: true, force: true });
  rmSync(backup, { recursive: true, force: true });
  cpSync(source, staged, { recursive: true });

  try {
    if (existsSync(destination)) {
      renameSync(destination, backup);
    }
    renameSync(staged, destination);
    rmSync(backup, { recursive: true, force: true });
  } catch (error) {
    if (!existsSync(destination) && existsSync(backup)) {
      renameSync(backup, destination);
    }
    throw error;
  } finally {
    rmSync(staged, { recursive: true, force: true });
    rmSync(backup, { recursive: true, force: true });
  }
}

export function buildRegistry(
  options: RegistryBuildOptions,
): RegistryBuildResult {
  const projectRoot = resolve(options.projectRoot);
  const registryPath =
    options.registryPath ?? join(projectRoot, "registry.json");
  const outputDirectory =
    options.outputDirectory ?? join(projectRoot, "public/r");
  const authored = loadAuthoredRegistry(projectRoot, registryPath);
  const items = selectInstallableItems(
    authored.items,
    options.deployEnvironment,
  );
  const cliPath = assertPinnedShadcn(projectRoot);
  const temporaryRoot = mkdtempSync(join(tmpdir(), "formmuse-registry-build."));
  const stagedRegistryPath = join(temporaryRoot, "registry.json");
  const firstOutput = join(temporaryRoot, "first");
  const secondOutput = join(temporaryRoot, "second");

  try {
    writeFileSync(
      stagedRegistryPath,
      `${JSON.stringify({ ...authored, items }, null, 2)}\n`,
    );
    runShadcnBuild(projectRoot, cliPath, stagedRegistryPath, firstOutput);
    runShadcnBuild(projectRoot, cliPath, stagedRegistryPath, secondOutput);
    const first = validateGeneratedOutput(projectRoot, firstOutput, items);
    const second = validateGeneratedOutput(projectRoot, secondOutput, items);
    compareOutputs(first, second);
    publishOutput(firstOutput, outputDirectory);

    return {
      outputDirectory,
      itemNames: items.map((item) => item.name),
      fileInventory: createRegistryFileInventory(items),
      outputSha256: sha256(
        [...first]
          .map(([path, bytes]) => `${path}\0${sha256(bytes)}`)
          .join("\n"),
      ),
    };
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
}
