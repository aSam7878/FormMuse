import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { RegistryItem } from "shadcn/schema";

import {
  buildRegistry,
  itemIsGeneratedForEnvironment,
  loadAuthoredRegistry,
  validateAuthoredRegistry,
} from "../../lib/formmuse/registry-build";

const projectRoot = resolve(process.cwd());
const temporaryRoots: string[] = [];
let registry: ReturnType<typeof loadAuthoredRegistry>;

function temporaryDirectory(label: string): string {
  const path = mkdtempSync(join(tmpdir(), `formmuse-${label}.`));
  temporaryRoots.push(path);
  return path;
}

function itemWithLifecycle(
  status: "draft" | "published" | "deprecated",
  installable = false,
): RegistryItem {
  const item = structuredClone(registry.items[0]) as RegistryItem;
  const formmuse = (item.meta as { formmuse: Record<string, unknown> })
    .formmuse;
  formmuse.status = status;
  formmuse.featured = status === "published";
  delete formmuse.deprecation;

  if (status === "deprecated") {
    formmuse.featured = false;
    formmuse.deprecation = {
      warning: "Use the maintained replacement.",
      replacement: "replacement-template",
      installable,
    };
  }

  return item;
}

beforeAll(() => {
  registry = loadAuthoredRegistry(projectRoot);
});

afterAll(() => {
  for (const path of temporaryRoots) {
    rmSync(path, { recursive: true, force: true });
  }
});

describe("authored registry validation", () => {
  it("composes the shadcn and strict FormMuse boundaries", () => {
    expect(registry.name).toBe("formmuse");
    expect(registry.items.map((item) => item.name)).toEqual([
      "hanging-gifts-contact",
    ]);
  });

  it("rejects invalid FormMuse metadata", () => {
    const invalid = JSON.parse(
      readFileSync(join(projectRoot, "registry.json"), "utf8"),
    );
    invalid.items[0].meta.formmuse.layout = "section";

    expect(() => validateAuthoredRegistry(invalid, projectRoot)).toThrow();
  });

  it("rejects dependency drift from distributed imports", () => {
    const invalid = JSON.parse(
      readFileSync(join(projectRoot, "registry.json"), "utf8"),
    );
    invalid.items[0].dependencies = invalid.items[0].dependencies.filter(
      (dependency: string) => !dependency.startsWith("gsap@"),
    );

    expect(() => validateAuthoredRegistry(invalid, projectRoot)).toThrow(
      "dependencies do not match distributed imports",
    );
  });

  it("rejects an installation target outside the canonical template folder", () => {
    const invalid = JSON.parse(
      readFileSync(join(projectRoot, "registry.json"), "utf8"),
    );
    invalid.items[0].files[0].target =
      "@components/formmuse/other-template/hanging-gifts-contact-form.tsx";

    expect(() => validateAuthoredRegistry(invalid, projectRoot)).toThrow(
      "invalid explicit target",
    );
  });
});

describe("publication lifecycle selection", () => {
  it("keeps drafts development-only", () => {
    const item = itemWithLifecycle("draft");
    expect(itemIsGeneratedForEnvironment(item, "development")).toBe(true);
    expect(itemIsGeneratedForEnvironment(item, "preview")).toBe(false);
    expect(itemIsGeneratedForEnvironment(item, "production")).toBe(false);
  });

  it("keeps published items installable in every environment", () => {
    const item = itemWithLifecycle("published");
    expect(itemIsGeneratedForEnvironment(item, "development")).toBe(true);
    expect(itemIsGeneratedForEnvironment(item, "preview")).toBe(true);
    expect(itemIsGeneratedForEnvironment(item, "production")).toBe(true);
  });

  it("honors the explicit deprecated installability flag", () => {
    expect(
      itemIsGeneratedForEnvironment(
        itemWithLifecycle("deprecated", true),
        "production",
      ),
    ).toBe(true);
    expect(
      itemIsGeneratedForEnvironment(
        itemWithLifecycle("deprecated", false),
        "development",
      ),
    ).toBe(false);
  });
});

describe("deterministic shadcn generation", () => {
  it("builds a byte-checked development registry with the draft item", () => {
    const outputDirectory = join(
      temporaryDirectory("registry-development"),
      "r",
    );
    const result = buildRegistry({
      projectRoot,
      deployEnvironment: "development",
      outputDirectory,
    });

    expect(result.itemNames).toEqual(["hanging-gifts-contact"]);
    const item = JSON.parse(
      readFileSync(join(outputDirectory, "hanging-gifts-contact.json"), "utf8"),
    );
    expect(item.meta.formmuse.status).toBe("draft");
    expect(item.files).toHaveLength(7);
  });

  it("excludes the draft item from production output", () => {
    const outputDirectory = join(
      temporaryDirectory("registry-production"),
      "r",
    );
    const result = buildRegistry({
      projectRoot,
      deployEnvironment: "production",
      outputDirectory,
    });

    expect(result.itemNames).toEqual([]);
    const root = JSON.parse(
      readFileSync(join(outputDirectory, "registry.json"), "utf8"),
    );
    expect(root.items).toEqual([]);
  });
});
