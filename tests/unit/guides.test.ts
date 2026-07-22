import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

import { describe, expect, it } from "vitest";

import {
  GUIDE_CONTENT_DIRECTORY,
  GUIDE_DEFINITIONS,
  GUIDE_SLUGS,
  GuideFrontmatterSchema,
} from "../../lib/formmuse/guide-contract";

const projectRoot = resolve(process.cwd());

function listFiles(root: string): string[] {
  if (!existsSync(root)) {
    return [];
  }

  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);

    if (entry.isDirectory()) {
      return listFiles(path);
    }

    return [relative(projectRoot, path).split(sep).join("/")];
  });
}

function readProjectFile(path: string): string {
  return readFileSync(join(projectRoot, path), "utf8");
}

function readGuideFrontmatter(path: string): Record<string, string> {
  const content = readProjectFile(path);
  const match = /^---\n([\s\S]*?)\n---/.exec(content);

  if (!match) {
    throw new Error(`Missing guide frontmatter: ${path}`);
  }

  return Object.fromEntries(
    match[1].split("\n").map((line) => {
      const separator = line.indexOf(":");

      if (separator <= 0) {
        throw new Error(`Malformed guide frontmatter in ${path}: ${line}`);
      }

      return [line.slice(0, separator), line.slice(separator + 1).trim()];
    }),
  );
}

describe("guide source contract", () => {
  it("defines the fixed V1 guide source set in route order", () => {
    expect(GUIDE_DEFINITIONS.map((guide) => guide.slug)).toEqual(GUIDE_SLUGS);
    expect(GUIDE_DEFINITIONS.map((guide) => guide.route)).toEqual([
      "/docs/introduction",
      "/docs/installation",
      "/docs/template-api",
      "/docs/connecting-a-backend",
      "/docs/customizing-templates",
      "/docs/using-with-agents",
      "/docs/accessibility",
      "/docs/changelog",
    ]);

    const sourceFiles = readdirSync(join(projectRoot, GUIDE_CONTENT_DIRECTORY))
      .filter((file) => file.endsWith(".mdx"))
      .sort();
    expect(sourceFiles).toEqual(
      [...GUIDE_SLUGS].map((slug) => `${slug}.mdx`).sort(),
    );
  });

  it("keeps routes, slugs, and source paths unique", () => {
    const fields = [
      GUIDE_DEFINITIONS.map((guide) => guide.slug),
      GUIDE_DEFINITIONS.map((guide) => guide.route),
      GUIDE_DEFINITIONS.map((guide) => guide.sourcePath),
    ];

    for (const values of fields) {
      expect(new Set(values).size).toBe(values.length);
    }
  });

  it("rejects malformed and non-portable guide frontmatter", () => {
    expect(() =>
      GuideFrontmatterSchema.parse({
        title: "Template API",
        description: "Shared template contract.",
      }),
    ).not.toThrow();

    expect(() =>
      GuideFrontmatterSchema.parse({
        title: "",
        description: "Missing title.",
      }),
    ).toThrow();

    expect(() =>
      GuideFrontmatterSchema.parse({
        title: "Introduction",
        description: "Has unsupported metadata.",
        layout: "docs",
      }),
    ).toThrow();
  });

  it("keeps MDX guide frontmatter aligned with the typed source contract", () => {
    for (const definition of GUIDE_DEFINITIONS) {
      expect(
        GuideFrontmatterSchema.parse(
          readGuideFrontmatter(definition.sourcePath),
        ),
      ).toEqual({
        title: definition.title,
        description: definition.description,
      });
      expect(readProjectFile(definition.sourcePath)).toContain(
        `# ${definition.title}`,
      );
    }
  });
});

describe("guide dependency boundaries", () => {
  it("keeps Fumadocs visual packages out of the dependency graph", () => {
    const packageJson = JSON.parse(readProjectFile("package.json")) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };

    expect(packageJson.dependencies).toMatchObject({
      "fumadocs-core": "16.11.5",
      "fumadocs-mdx": "15.2.0",
    });
    expect(packageJson.dependencies).not.toHaveProperty("fumadocs-ui");
    expect(packageJson.devDependencies).not.toHaveProperty("fumadocs-ui");
  });

  it("keeps Fumadocs imports out of root, preview, registry, public registry output, and compatibility source", () => {
    const protectedFiles = [
      "app/layout.tsx",
      "app/(preview)/layout.tsx",
      ...listFiles(join(projectRoot, "app/(preview)/preview")),
      ...listFiles(join(projectRoot, "registry/base")),
      ...listFiles(join(projectRoot, "public/r")),
      ...listFiles(join(projectRoot, "tests/compatibility")),
    ].filter(
      (path) =>
        existsSync(join(projectRoot, path)) &&
        statSync(join(projectRoot, path)).isFile(),
    );

    const leaks = protectedFiles.filter((path) =>
      /\bfumadocs(?:-|\/|$)/.test(readProjectFile(path)),
    );

    expect(leaks).toEqual([]);
  });
});
