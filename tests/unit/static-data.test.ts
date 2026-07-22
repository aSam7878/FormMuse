import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import type { RegistryItem } from "shadcn/schema";
import { afterEach, describe, expect, it } from "vitest";

import { GUIDE_DEFINITIONS } from "../../lib/formmuse/guide-contract";
import { loadAuthoredRegistry } from "../../lib/formmuse/registry-build";
import {
  DEPLOYMENT_MANIFEST_FILENAME,
  DeploymentManifestInputSchema,
  DeploymentManifestSchema,
  SEARCH_DATA_FILENAME,
  STATIC_DATA_FIXTURE_INPUT,
  SearchDataSchema,
  StaticDataError,
  type GuideSearchSource,
  buildDeploymentManifest,
  buildSearchData,
  deploymentInputFromEnvironment,
  loadGuideSearchSources,
  normalizeSearchText,
  writeStaticData,
} from "../../lib/formmuse/static-data";

const projectRoot = resolve(process.cwd());
const temporaryDirectories: string[] = [];

function authoredItems(): RegistryItem[] {
  return loadAuthoredRegistry(projectRoot).items;
}

function guideSources(): GuideSearchSource[] {
  return GUIDE_DEFINITIONS.map((guide) => ({
    slug: guide.slug,
    title: guide.title,
    description: guide.description,
    processedText: `# ${guide.title}\n\nPortable guide content for ${guide.slug}.`,
  }));
}

function withStatus(
  item: RegistryItem,
  status: "draft" | "published" | "deprecated",
): RegistryItem {
  const clone = structuredClone(item);
  const metadata = clone.meta?.formmuse as Record<string, unknown>;
  metadata.status = status;
  metadata.featured = false;

  if (status === "deprecated") {
    metadata.deprecation = {
      warning: "This template is deprecated.",
      installable: true,
    };
  } else {
    delete metadata.deprecation;
  }

  return clone;
}

function temporaryDirectory(): string {
  const directory = mkdtempSync(join(tmpdir(), "formmuse-static-data-test."));
  temporaryDirectories.push(directory);
  return directory;
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("search data", () => {
  it("keeps canonical guides first and excludes Draft and Deprecated Templates", () => {
    const item = authoredItems()[0];
    expect(item).toBeDefined();

    const data = buildSearchData(guideSources(), [
      withStatus(item, "draft"),
      withStatus(item, "deprecated"),
    ]);

    expect(data.entries.map((entry) => entry.slug)).toEqual(
      GUIDE_DEFINITIONS.map((guide) => guide.slug),
    );
    expect(data.entries.every((entry) => entry.kind === "guide")).toBe(true);
  });

  it("appends Published Templates in registry order with canonical routes", () => {
    const item = authoredItems()[0];
    expect(item).toBeDefined();
    const published = withStatus(item, "published");
    const data = buildSearchData(guideSources(), [published]);
    const template = data.entries.at(-1);

    expect(template).toMatchObject({
      kind: "template",
      slug: item.name,
      url: `/templates/${item.name}`,
      category: "contact",
    });
    expect(template?.searchText).toContain("hanging gifts contact form");
  });

  it("normalizes plain text without carrying display markup or executable content", () => {
    const normalized = normalizeSearchText(
      "# Heading",
      "<p>Visible <strong>copy</strong></p>",
      "```js\nalert('removed')\n```",
      "<script>alert('removed')</script>",
      "[Documentation](/docs/introduction)",
    );

    expect(normalized).toBe("heading visible copy documentation");
    expect(normalized).not.toMatch(/[<>]|alert|script|```/);
  });

  it("removes the duplicated display heading from authoritative guide text", () => {
    const sources = loadGuideSearchSources(projectRoot);
    const data = buildSearchData(sources, []);

    data.entries.forEach((entry, index) => {
      const definition = GUIDE_DEFINITIONS[index];
      expect(definition).toBeDefined();
      expect(entry.searchText).not.toContain(
        `${normalizeSearchText(definition.title, definition.description)} ${normalizeSearchText(definition.title)} `,
      );
    });
  });

  it("rejects non-canonical URLs, markup, duplicate identities, and metadata drift", () => {
    const valid = buildSearchData(guideSources(), []);
    const first = valid.entries[0];
    expect(first).toBeDefined();

    expect(() =>
      SearchDataSchema.parse({
        ...valid,
        entries: [{ ...first, url: "https://example.com/docs/introduction" }],
      }),
    ).toThrow();
    expect(() =>
      SearchDataSchema.parse({
        ...valid,
        entries: [{ ...first, searchText: "<strong>markup</strong>" }],
      }),
    ).toThrow();
    expect(() =>
      SearchDataSchema.parse({ ...valid, entries: [first, first] }),
    ).toThrow();

    const drifted = guideSources();
    drifted[0] = { ...drifted[0], title: "Changed" };
    expect(() => buildSearchData(drifted, [])).toThrow(
      "Guide search metadata drifted",
    );
  });

  it("rejects secret-shaped and local-path source content", () => {
    const secret = guideSources();
    secret[0] = {
      ...secret[0],
      processedText: 'api_key = "abcdefgh12345678"',
    };
    expect(() => buildSearchData(secret, [])).toThrow(StaticDataError);

    const localPath = guideSources();
    localPath[0] = {
      ...localPath[0],
      processedText: "/Users/private/project/source.ts",
    };
    expect(() => buildSearchData(localPath, [])).toThrow(StaticDataError);
  });
});

describe("deployment manifest", () => {
  it("derives a sorted version map from Published registry records only", () => {
    const item = authoredItems()[0];
    expect(item).toBeDefined();
    const manifest = buildDeploymentManifest(STATIC_DATA_FIXTURE_INPUT, [
      withStatus(item, "draft"),
      withStatus(item, "deprecated"),
      withStatus(item, "published"),
    ]);

    expect(manifest).toEqual({
      schemaVersion: 1,
      ...STATIC_DATA_FIXTURE_INPUT,
      templateVersions: { [item.name]: "0.0.0" },
    });
  });

  it("rejects malformed identity, release, unknown, actor, and private inputs", () => {
    expect(() =>
      DeploymentManifestInputSchema.parse({
        ...STATIC_DATA_FIXTURE_INPUT,
        commitSha: "ABC123",
      }),
    ).toThrow();
    expect(() =>
      DeploymentManifestInputSchema.parse({
        ...STATIC_DATA_FIXTURE_INPUT,
        buildTimestamp: "2026-02-30T00:00:00Z",
      }),
    ).toThrow();
    expect(() =>
      DeploymentManifestInputSchema.parse({
        ...STATIC_DATA_FIXTURE_INPUT,
        repositoryVersion: "1.0.0",
      }),
    ).toThrow();
    expect(() =>
      DeploymentManifestInputSchema.parse({
        ...STATIC_DATA_FIXTURE_INPUT,
        actor: "repository-owner",
      }),
    ).toThrow();
    expect(() =>
      deploymentInputFromEnvironment({
        FORMMUSE_COMMIT_SHA: "/Users/private/commit",
        FORMMUSE_BUILD_TIMESTAMP: "1970-01-01T00:00:00Z",
        FORMMUSE_DEPLOY_ENV: "development",
      }),
    ).toThrow();
  });
});

describe("static output", () => {
  it("writes deterministic schema-valid public files and no additional output", () => {
    const directory = temporaryDirectory();
    const search = buildSearchData(guideSources(), authoredItems());
    const deployment = buildDeploymentManifest(
      STATIC_DATA_FIXTURE_INPUT,
      authoredItems(),
    );
    const first = writeStaticData(directory, search, deployment);
    const firstSearch = readFileSync(first.searchPath, "utf8");
    const firstDeployment = readFileSync(first.deploymentPath, "utf8");

    writeFileSync(first.searchPath, "changed", "utf8");
    writeFileSync(first.deploymentPath, "changed", "utf8");
    const second = writeStaticData(directory, search, deployment);

    expect(second.searchSha256).toBe(first.searchSha256);
    expect(second.deploymentSha256).toBe(first.deploymentSha256);
    expect(readFileSync(second.searchPath, "utf8")).toBe(firstSearch);
    expect(readFileSync(second.deploymentPath, "utf8")).toBe(firstDeployment);
    expect(SearchDataSchema.parse(JSON.parse(firstSearch))).toEqual(search);
    expect(DeploymentManifestSchema.parse(JSON.parse(firstDeployment))).toEqual(
      deployment,
    );
    expect([SEARCH_DATA_FILENAME, DEPLOYMENT_MANIFEST_FILENAME].sort()).toEqual(
      [first.searchPath, first.deploymentPath]
        .map((path) => path.split("/").at(-1))
        .sort(),
    );
  });
});
