import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import type { RegistryItem } from "shadcn/schema";
import { z } from "zod";

import {
  GUIDE_DEFINITIONS,
  GuideFrontmatterSchema,
  GuideSlugSchema,
  type GuideSlug,
} from "./guide-contract";
import {
  KebabCaseSlugSchema,
  PrimaryCategorySchema,
  SemanticVersionSchema,
  uniqueArray,
  validateFormMuseRegistryBoundary,
} from "./registry-schemas";

export const SEARCH_DATA_FILENAME = "formmuse-search.json";
export const DEPLOYMENT_MANIFEST_FILENAME = "formmuse-deployment.json";

const COMMIT_SHA_PATTERN = /^[0-9a-f]{40}$/;
const BUILD_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const REPOSITORY_VERSION_PATTERN =
  /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const UNSAFE_PLAIN_TEXT_PATTERN =
  /<\/?(?:script|style|iframe|object|embed|svg|math)\b|javascript:|data:text\/html|\u0000/i;
const SECRET_SHAPED_PATTERN =
  /(?:api[_-]?key|client[_-]?secret|private[_-]?key|access[_-]?token|password)\s*[:=]\s*(?:\\?["'])?[A-Za-z0-9_./+=-]{8,}/i;
const PRIVATE_DATA_PATTERNS = [
  /(?:^|[\s"'])\/Users\//,
  /(?:^|[\s"'])[A-Za-z]:\\Users\\/,
  /\bfile:\/\//i,
  /\bGITHUB_ACTOR\b/,
  /\bRUNNER_(?:NAME|WORKSPACE)\b/,
] as const;

const nonEmptyTrimmedString = (label: string) =>
  z
    .string()
    .min(1, `${label} must not be empty.`)
    .refine((value) => value === value.trim(), {
      message: `${label} must not have surrounding whitespace.`,
    });

const CanonicalGuideUrlSchema = z
  .string()
  .regex(/^\/docs\/[a-z0-9]+(?:-[a-z0-9]+)*$/);
const CanonicalTemplateUrlSchema = z
  .string()
  .regex(/^\/templates\/[a-z0-9]+(?:-[a-z0-9]+)*$/);

function isCanonicalBuildTimestamp(value: string): boolean {
  if (!BUILD_TIMESTAMP_PATTERN.test(value)) {
    return false;
  }

  const parsed = new Date(value);
  return (
    Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().replace(".000Z", "Z") === value
  );
}

function isNormalizedPlainText(value: string): boolean {
  return (
    value === normalizeSearchText(value) &&
    !UNSAFE_PLAIN_TEXT_PATTERN.test(value) &&
    !/[<>]/.test(value)
  );
}

const SearchTextSchema = nonEmptyTrimmedString("Search text").refine(
  isNormalizedPlainText,
  "Search text must be normalized plain text without markup or executable content.",
);

const GuideSearchEntrySchema = z.strictObject({
  kind: z.literal("guide"),
  slug: GuideSlugSchema,
  title: nonEmptyTrimmedString("Guide title"),
  description: nonEmptyTrimmedString("Guide description"),
  url: CanonicalGuideUrlSchema,
  searchText: SearchTextSchema,
});

const TemplateSearchEntrySchema = z.strictObject({
  kind: z.literal("template"),
  slug: KebabCaseSlugSchema,
  title: nonEmptyTrimmedString("Template title"),
  description: nonEmptyTrimmedString("Template description"),
  url: CanonicalTemplateUrlSchema,
  category: PrimaryCategorySchema,
  tags: uniqueArray(KebabCaseSlugSchema, (value) => value),
  fields: uniqueArray(KebabCaseSlugSchema, (value) => value, { minimum: 1 }),
  searchText: SearchTextSchema,
});

export const SearchEntrySchema = z.discriminatedUnion("kind", [
  GuideSearchEntrySchema,
  TemplateSearchEntrySchema,
]);

export const SearchDataSchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    entries: z.array(SearchEntrySchema),
  })
  .superRefine((value, context) => {
    const identities = new Set<string>();

    value.entries.forEach((entry, index) => {
      const expectedUrl =
        entry.kind === "guide"
          ? `/docs/${entry.slug}`
          : `/templates/${entry.slug}`;
      const identity = `${entry.kind}:${entry.slug}`;

      if (entry.url !== expectedUrl) {
        context.addIssue({
          code: "custom",
          message: "Search URL must match its canonical FormMuse route.",
          path: ["entries", index, "url"],
        });
      }
      if (identities.has(identity)) {
        context.addIssue({
          code: "custom",
          message: "Search entries must have unique identities.",
          path: ["entries", index, "slug"],
        });
      }
      identities.add(identity);
    });
  });

export type SearchEntry = z.infer<typeof SearchEntrySchema>;
export type SearchData = z.infer<typeof SearchDataSchema>;

export const GuideSearchSourceSchema = z.strictObject({
  slug: GuideSlugSchema,
  title: nonEmptyTrimmedString("Guide title"),
  description: nonEmptyTrimmedString("Guide description"),
  processedText: z.string(),
});

export type GuideSearchSource = z.infer<typeof GuideSearchSourceSchema>;

export function loadGuideSearchSources(
  projectRoot: string,
): GuideSearchSource[] {
  return GUIDE_DEFINITIONS.map((definition) => {
    const content = readFileSync(
      resolve(projectRoot, definition.sourcePath),
      "utf8",
    );
    const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/u.exec(content);

    if (!match) {
      fail(
        `Guide source is missing canonical frontmatter: ${definition.sourcePath}`,
      );
    }

    const metadata = Object.fromEntries(
      match[1].split("\n").map((line) => {
        const separator = line.indexOf(":");
        if (separator <= 0) {
          fail(
            `Guide source has malformed frontmatter: ${definition.sourcePath}`,
          );
        }
        return [line.slice(0, separator), line.slice(separator + 1).trim()];
      }),
    );
    const parsedMetadata = GuideFrontmatterSchema.parse(metadata);
    const bodyLines = match[2].split("\n");
    const headingIndex = bodyLines.findIndex((line) => line.trim() !== "");
    if (
      headingIndex < 0 ||
      bodyLines[headingIndex]?.trim() !== `# ${parsedMetadata.title}`
    ) {
      fail(
        `Guide source is missing its canonical heading: ${definition.sourcePath}`,
      );
    }
    bodyLines.splice(headingIndex, 1);

    return GuideSearchSourceSchema.parse({
      slug: definition.slug,
      title: parsedMetadata.title,
      description: parsedMetadata.description,
      processedText: bodyLines.join("\n"),
    });
  });
}

export const DeploymentManifestInputSchema = z.strictObject({
  commitSha: z
    .string()
    .regex(
      COMMIT_SHA_PATTERN,
      "Commit SHA must be 40 lowercase hex characters.",
    ),
  buildTimestamp: z
    .string()
    .refine(
      isCanonicalBuildTimestamp,
      "Build timestamp must be a real UTC timestamp in YYYY-MM-DDTHH:mm:ssZ form.",
    ),
  deploymentEnvironment: z.enum(["development", "preview", "production"]),
  repositoryVersion: z
    .string()
    .regex(
      REPOSITORY_VERSION_PATTERN,
      "Repository version must use stable vmajor.minor.patch form.",
    )
    .nullable(),
});

export type DeploymentManifestInput = z.infer<
  typeof DeploymentManifestInputSchema
>;

const SortedTemplateVersionsSchema = z
  .record(KebabCaseSlugSchema, SemanticVersionSchema)
  .superRefine((value, context) => {
    const keys = Object.keys(value);
    if (JSON.stringify(keys) !== JSON.stringify([...keys].sort())) {
      context.addIssue({
        code: "custom",
        message: "Template version keys must be sorted by canonical slug.",
      });
    }
  });

export const DeploymentManifestSchema = z.strictObject({
  schemaVersion: z.literal(1),
  commitSha: DeploymentManifestInputSchema.shape.commitSha,
  buildTimestamp: DeploymentManifestInputSchema.shape.buildTimestamp,
  deploymentEnvironment:
    DeploymentManifestInputSchema.shape.deploymentEnvironment,
  repositoryVersion: DeploymentManifestInputSchema.shape.repositoryVersion,
  templateVersions: SortedTemplateVersionsSchema,
});

export type DeploymentManifest = z.infer<typeof DeploymentManifestSchema>;

export type StaticDataWriteResult = Readonly<{
  searchPath: string;
  deploymentPath: string;
  searchSha256: string;
  deploymentSha256: string;
}>;

export class StaticDataError extends Error {
  override readonly name = "StaticDataError";
}

function fail(message: string): never {
  throw new StaticDataError(message);
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function assertSafePublicValue(value: unknown, label: string): void {
  const serialized = JSON.stringify(value);

  if (SECRET_SHAPED_PATTERN.test(serialized)) {
    fail(`${label} contains secret-shaped content.`);
  }
  if (PRIVATE_DATA_PATTERNS.some((pattern) => pattern.test(serialized))) {
    fail(`${label} contains private, actor, or local-path content.`);
  }
}

function stripDisplayMarkup(value: string): string {
  return value
    .replace(/^---\s*[\s\S]*?\s*---\s*/u, " ")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/giu, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/giu, " ")
    .replace(/```[\s\S]*?```/gu, " ")
    .replace(/~~~[\s\S]*?~~~/gu, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/gu, " $1 ")
    .replace(/\[([^\]]+)\]\([^)]*\)/gu, " $1 ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/`([^`]+)`/gu, " $1 ")
    .replace(/^\s{0,3}#{1,6}\s+/gmu, "")
    .replace(/^\s{0,3}(?:>|[-+*]\s+|\d+[.)]\s+)/gmu, "")
    .replace(/[|*_~]/gu, " ");
}

export function normalizeSearchText(...values: string[]): string {
  return stripDisplayMarkup(values.join(" "))
    .normalize("NFKC")
    .toLocaleLowerCase("en-US")
    .replace(/[<>]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function validateGuideSources(
  sources: readonly GuideSearchSource[],
): readonly GuideSearchSource[] {
  const parsed = sources.map((source) => GuideSearchSourceSchema.parse(source));
  const expectedSlugs = GUIDE_DEFINITIONS.map((guide) => guide.slug);

  if (
    JSON.stringify(parsed.map((source) => source.slug)) !==
    JSON.stringify(expectedSlugs)
  ) {
    fail("Guide search sources must use the complete canonical guide order.");
  }

  parsed.forEach((source, index) => {
    const definition = GUIDE_DEFINITIONS[index];
    const metadata = GuideFrontmatterSchema.parse({
      title: source.title,
      description: source.description,
    });
    if (
      definition === undefined ||
      metadata.title !== definition.title ||
      metadata.description !== definition.description
    ) {
      fail(`Guide search metadata drifted for ${source.slug}.`);
    }
  });

  return parsed;
}

function guideEntry(source: GuideSearchSource): SearchEntry {
  assertSafePublicValue(source, `Guide search source ${source.slug}`);
  const searchText = normalizeSearchText(
    source.title,
    source.description,
    source.processedText,
  );
  const entry = {
    kind: "guide" as const,
    slug: source.slug,
    title: source.title,
    description: source.description,
    url: `/docs/${source.slug}` as `/docs/${GuideSlug}`,
    searchText,
  };
  assertSafePublicValue(entry, `Guide search entry ${source.slug}`);
  return SearchEntrySchema.parse(entry);
}

function publishedTemplateEntries(
  registryItems: readonly RegistryItem[],
): SearchEntry[] {
  return registryItems.flatMap((item) => {
    const boundary = validateFormMuseRegistryBoundary({
      categories: item.categories,
      meta: item.meta,
    });
    const metadata = boundary.meta.formmuse;

    if (metadata.status !== "published") {
      return [];
    }
    if (!item.title?.trim() || !item.description?.trim()) {
      fail(
        `Published template ${item.name} is missing public search metadata.`,
      );
    }

    const entry = {
      kind: "template" as const,
      slug: item.name,
      title: item.title,
      description: item.description,
      url: `/templates/${item.name}`,
      category: boundary.categories[0],
      tags: metadata.tags,
      fields: metadata.fields,
      searchText: normalizeSearchText(
        item.title,
        item.description,
        boundary.categories[0],
        ...metadata.tags,
        ...metadata.fields,
      ),
    };
    assertSafePublicValue(entry, `Template search entry ${item.name}`);
    return [SearchEntrySchema.parse(entry)];
  });
}

export function buildSearchData(
  guideSources: readonly GuideSearchSource[],
  registryItems: readonly RegistryItem[],
): SearchData {
  const guides = validateGuideSources(guideSources).map(guideEntry);
  const data = {
    schemaVersion: 1 as const,
    entries: [...guides, ...publishedTemplateEntries(registryItems)],
  };
  assertSafePublicValue(data, "Search data");
  return SearchDataSchema.parse(data);
}

function publishedTemplateVersions(
  registryItems: readonly RegistryItem[],
): Record<string, string> {
  const pairs = registryItems.flatMap((item) => {
    const metadata = validateFormMuseRegistryBoundary({
      categories: item.categories,
      meta: item.meta,
    }).meta.formmuse;
    return metadata.status === "published"
      ? ([[item.name, metadata.version]] as const)
      : [];
  });

  return Object.fromEntries(
    [...pairs].sort(([left], [right]) => left.localeCompare(right)),
  );
}

export function buildDeploymentManifest(
  input: DeploymentManifestInput,
  registryItems: readonly RegistryItem[],
): DeploymentManifest {
  const parsedInput = DeploymentManifestInputSchema.parse(input);
  const manifest = {
    schemaVersion: 1 as const,
    ...parsedInput,
    templateVersions: publishedTemplateVersions(registryItems),
  };
  assertSafePublicValue(manifest, "Deployment manifest");
  return DeploymentManifestSchema.parse(manifest);
}

function deterministicJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function writeAtomically(path: string, content: string): void {
  const temporaryPath = `${path}.${process.pid}.tmp`;
  writeFileSync(temporaryPath, content, { encoding: "utf8", mode: 0o644 });
  renameSync(temporaryPath, path);
}

export function writeStaticData(
  outputDirectory: string,
  searchData: SearchData,
  deploymentManifest: DeploymentManifest,
): StaticDataWriteResult {
  const directory = resolve(outputDirectory);
  const search = SearchDataSchema.parse(searchData);
  const deployment = DeploymentManifestSchema.parse(deploymentManifest);
  assertSafePublicValue(search, "Search data");
  assertSafePublicValue(deployment, "Deployment manifest");
  mkdirSync(directory, { recursive: true });

  const searchPath = join(directory, SEARCH_DATA_FILENAME);
  const deploymentPath = join(directory, DEPLOYMENT_MANIFEST_FILENAME);
  const searchContent = deterministicJson(search);
  const deploymentContent = deterministicJson(deployment);
  writeAtomically(searchPath, searchContent);
  writeAtomically(deploymentPath, deploymentContent);

  return {
    searchPath,
    deploymentPath,
    searchSha256: sha256(searchContent),
    deploymentSha256: sha256(deploymentContent),
  };
}

export function deploymentInputFromEnvironment(
  environment: Readonly<Record<string, string | undefined>>,
): DeploymentManifestInput {
  return DeploymentManifestInputSchema.parse({
    commitSha: environment.FORMMUSE_COMMIT_SHA,
    buildTimestamp: environment.FORMMUSE_BUILD_TIMESTAMP,
    deploymentEnvironment: environment.FORMMUSE_DEPLOY_ENV,
    repositoryVersion: environment.FORMMUSE_REPOSITORY_VERSION ?? null,
  });
}

export const STATIC_DATA_FIXTURE_INPUT = {
  commitSha: "0000000000000000000000000000000000000000",
  buildTimestamp: "1970-01-01T00:00:00Z",
  deploymentEnvironment: "development",
  repositoryVersion: null,
} as const satisfies DeploymentManifestInput;
