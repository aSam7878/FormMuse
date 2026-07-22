import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { RegistryItem } from "shadcn/schema";

import {
  buildRegistry,
  createRegistryFileInventory,
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

function distributedFixture(label: string): string {
  const fixtureRoot = temporaryDirectory(label);
  mkdirSync(join(fixtureRoot, "registry/base"), { recursive: true });
  mkdirSync(join(fixtureRoot, "public"), { recursive: true });
  cpSync(
    join(projectRoot, "registry/base/hanging-gifts-contact"),
    join(fixtureRoot, "registry/base/hanging-gifts-contact"),
    { recursive: true },
  );
  cpSync(
    join(projectRoot, "public/formmuse"),
    join(fixtureRoot, "public/formmuse"),
    { recursive: true },
  );
  cpSync(join(projectRoot, "package.json"), join(fixtureRoot, "package.json"));
  return fixtureRoot;
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

  it("rejects direct Base UI imports even when the package is declared", () => {
    const fixtureRoot = distributedFixture("direct-base-ui-import");

    const invalid = JSON.parse(
      readFileSync(join(projectRoot, "registry.json"), "utf8"),
    );
    writeFileSync(
      join(fixtureRoot, invalid.items[0].files[0].path),
      'import { Button } from "@base-ui/react/button";\nexport { Button };\n',
    );

    expect(() => validateAuthoredRegistry(invalid, fixtureRoot)).toThrow(
      "must import adopter-local shadcn controls instead of @base-ui/react",
    );
  });

  it("rejects Next.js imports from distributed source", () => {
    const fixtureRoot = distributedFixture("next-import");
    const invalid = JSON.parse(
      readFileSync(join(projectRoot, "registry.json"), "utf8"),
    );
    writeFileSync(
      join(fixtureRoot, invalid.items[0].files[0].path),
      'import Image from "next/image";\nexport { Image };\n',
    );

    expect(() => validateAuthoredRegistry(invalid, fixtureRoot)).toThrow(
      "imports a forbidden framework package",
    );
  });

  it("rejects remote runtime references from distributed source", () => {
    const fixtureRoot = distributedFixture("remote-runtime-reference");
    const invalid = JSON.parse(
      readFileSync(join(projectRoot, "registry.json"), "utf8"),
    );
    writeFileSync(
      join(fixtureRoot, invalid.items[0].files[0].path),
      'export function RemoteAsset() { return <img alt="" src="https://example.com/asset.png" />; }\n',
    );

    expect(() => validateAuthoredRegistry(invalid, fixtureRoot)).toThrow(
      "contains a forbidden remote or runtime boundary",
    );
  });

  it("rejects global selectors from a distributed CSS Module", () => {
    const fixtureRoot = distributedFixture("global-css-module");
    const invalid = JSON.parse(
      readFileSync(join(projectRoot, "registry.json"), "utf8"),
    );
    const stylesheet = invalid.items[0].files.find((file: { path: string }) =>
      file.path.endsWith(".module.css"),
    );
    writeFileSync(
      join(fixtureRoot, stylesheet.path),
      ".root { color: black; }\nbody { margin: 0; }\n",
    );

    expect(() => validateAuthoredRegistry(invalid, fixtureRoot)).toThrow(
      "contains a global CSS Module selector",
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

  it.each([
    "registry/base/hanging-gifts-contact/preview.tsx",
    "registry/base/hanging-gifts-contact/hanging-gifts-contact.example.tsx",
    "registry/base/hanging-gifts-contact/hanging-gifts-contact-form.schema.test.ts",
    "registry/base/hanging-gifts-contact/asset-provenance.md",
    "registry/base/hanging-gifts-contact/portability-audit.md",
    "registry/base/hanging-gifts-contact/changelog.md",
  ])("rejects declared repository-only file %s", (path) => {
    const invalid = JSON.parse(
      readFileSync(join(projectRoot, "registry.json"), "utf8"),
    );
    invalid.items[0].files[0].path = path;

    expect(() => validateAuthoredRegistry(invalid, projectRoot)).toThrow(
      "must not distribute repository-only file",
    );
  });

  it("derives the exact distributed inventory from the Registry Record", () => {
    expect(createRegistryFileInventory(registry.items)).toEqual([
      {
        itemName: "hanging-gifts-contact",
        files: [
          {
            path: "registry/base/hanging-gifts-contact/hanging-gifts-contact-form.tsx",
            target:
              "@components/formmuse/hanging-gifts-contact/hanging-gifts-contact-form.tsx",
            type: "registry:component",
          },
          {
            path: "registry/base/hanging-gifts-contact/hanging-gifts-contact-form.schema.ts",
            target:
              "@components/formmuse/hanging-gifts-contact/hanging-gifts-contact-form.schema.ts",
            type: "registry:lib",
          },
          {
            path: "registry/base/hanging-gifts-contact/animated-icons.tsx",
            target:
              "@components/formmuse/hanging-gifts-contact/animated-icons.tsx",
            type: "registry:component",
          },
          {
            path: "registry/base/hanging-gifts-contact/hanging-gifts.tsx",
            target:
              "@components/formmuse/hanging-gifts-contact/hanging-gifts.tsx",
            type: "registry:component",
          },
          {
            path: "registry/base/hanging-gifts-contact/template-navbar.tsx",
            target:
              "@components/formmuse/hanging-gifts-contact/template-navbar.tsx",
            type: "registry:component",
          },
          {
            path: "registry/base/hanging-gifts-contact/hanging-gifts-contact-form.module.css",
            target:
              "@components/formmuse/hanging-gifts-contact/hanging-gifts-contact-form.module.css",
            type: "registry:file",
          },
          {
            path: "public/formmuse/hanging-gifts-contact/hanging-gifts-hero.svg",
            target:
              "~/public/formmuse/hanging-gifts-contact/hanging-gifts-hero.svg",
            type: "registry:file",
          },
        ],
      },
    ]);
  });

  it("keeps visible asset sources local, declared, and repository-documented", () => {
    const formSource = readFileSync(
      join(
        projectRoot,
        "registry/base/hanging-gifts-contact/hanging-gifts-contact-form.tsx",
      ),
      "utf8",
    );
    const provenance = readFileSync(
      join(
        projectRoot,
        "registry/base/hanging-gifts-contact/asset-provenance.md",
      ),
      "utf8",
    );

    expect(formSource).not.toMatch(/FacebookIcon|InstagramIcon|https?:\/\//);
    expect(formSource).not.toMatch(
      /Facebook placeholder|Instagram placeholder/,
    );
    expect(formSource).toContain("[Share2, Camera, Phone]");
    expect(registry.items[0].dependencies).toContain("lucide-react@1.25.0");
    expect(provenance).toContain("Lucide package: `lucide-react@1.25.0`");
    expect(provenance).toContain("Licence: ISC");
    expect(provenance).toContain("Licence: SIL Open Font License 1.1");
    expect(provenance).toContain("no external file or runtime request");
    expect(provenance).toContain("no external asset file or remote request");
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
    expect(result.fileInventory).toEqual(
      createRegistryFileInventory(registry.items),
    );
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
