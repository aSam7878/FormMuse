import type { RegistryItem } from "shadcn/schema";
import { describe, expect, it } from "vitest";

import { loadAuthoredRegistry } from "../../lib/formmuse/registry-build";
import {
  findTemplatePageRoute,
  findTemplatePreviewRoute,
  templateCanonicalUrl,
  templatePageRoutesForEnvironment,
  templatePreviewRoutesForEnvironment,
  templateRouteParams,
} from "../../lib/formmuse/template-routes";

const registry = loadAuthoredRegistry(process.cwd());
const baseItem = registry.items[0];

function itemWithLifecycle(
  status: "draft" | "published" | "deprecated",
  installable = false,
): RegistryItem {
  if (!baseItem) {
    throw new Error("The Hanging Gifts registry item is required.");
  }

  const item = structuredClone(baseItem) as RegistryItem;
  const formmuse = (item.meta as { formmuse: Record<string, unknown> })
    .formmuse;

  formmuse.status = status;
  formmuse.featured = status === "published";
  delete formmuse.deprecation;

  if (status === "deprecated") {
    formmuse.featured = false;
    formmuse.deprecation = {
      warning: "This deprecated template remains documented.",
      installable,
    };
  }

  return item;
}

describe("template route lifecycle", () => {
  it("generates draft Template Page and Preview routes only for development and review builds", () => {
    const draft = itemWithLifecycle("draft");

    expect(
      templatePageRoutesForEnvironment([draft], "development"),
    ).toHaveLength(1);
    expect(templatePageRoutesForEnvironment([draft], "preview")).toHaveLength(
      1,
    );
    expect(templatePageRoutesForEnvironment([draft], "production")).toEqual([]);
    expect(
      templatePreviewRoutesForEnvironment([draft], "development"),
    ).toHaveLength(1);
    expect(
      templatePreviewRoutesForEnvironment([draft], "preview"),
    ).toHaveLength(1);
    expect(templatePreviewRoutesForEnvironment([draft], "production")).toEqual(
      [],
    );
  });

  it("keeps Published Template Pages and Preview routes available in every build environment", () => {
    const published = itemWithLifecycle("published");

    expect(
      ["development", "preview", "production"].map((environment) =>
        templatePageRoutesForEnvironment(
          [published],
          environment as "development" | "preview" | "production",
        ).map((route) => route.templatePath),
      ),
    ).toEqual([
      ["/templates/hanging-gifts-contact"],
      ["/templates/hanging-gifts-contact"],
      ["/templates/hanging-gifts-contact"],
    ]);
    expect(
      templatePreviewRoutesForEnvironment([published], "production").map(
        (route) => route.previewPath,
      ),
    ).toEqual(["/preview/hanging-gifts-contact"]);
  });

  it("preserves Deprecated Template Page routes while gating unsafe Preview routes by installability", () => {
    const installable = itemWithLifecycle("deprecated", true);
    const unsafe = itemWithLifecycle("deprecated", false);

    expect(
      templatePageRoutesForEnvironment([installable, unsafe], "production"),
    ).toHaveLength(2);
    expect(
      templatePreviewRoutesForEnvironment([installable, unsafe], "production"),
    ).toHaveLength(1);
  });

  it("derives route params and canonicals from validated registry slugs", () => {
    const published = itemWithLifecycle("published");
    const route = templatePageRoutesForEnvironment(
      [published],
      "production",
    )[0];

    expect(route).toBeDefined();
    expect(templateRouteParams([route])).toEqual([
      { slug: "hanging-gifts-contact" },
    ]);
    expect(
      templateCanonicalUrl(route, {
        deployEnvironment: "production",
        origin: "https://formmuse.example",
        isIndexable: true,
        shouldPublishCanonicalUrls: true,
        shouldPublishSitemap: true,
      }),
    ).toBe("https://formmuse.example/templates/hanging-gifts-contact");
    expect(
      templateCanonicalUrl(route, {
        deployEnvironment: "preview",
        origin: "https://preview.formmuse.example",
        isIndexable: false,
        shouldPublishCanonicalUrls: false,
        shouldPublishSitemap: false,
      }),
    ).toBeUndefined();
  });

  it("keeps previews out of Template Page canonicals and rejects unknown slugs", () => {
    expect(
      findTemplatePageRoute("hanging-gifts-contact", {
        deployEnvironment: "development",
        origin: "http://localhost:3000",
        isIndexable: false,
        shouldPublishCanonicalUrls: false,
        shouldPublishSitemap: false,
      })?.templatePath,
    ).toBe("/templates/hanging-gifts-contact");
    expect(
      findTemplatePreviewRoute("hanging-gifts-contact", {
        deployEnvironment: "development",
        origin: "http://localhost:3000",
        isIndexable: false,
        shouldPublishCanonicalUrls: false,
        shouldPublishSitemap: false,
      })?.previewPath,
    ).toBe("/preview/hanging-gifts-contact");
    expect(
      findTemplatePageRoute("../hanging-gifts-contact", {
        deployEnvironment: "development",
        origin: "http://localhost:3000",
        isIndexable: false,
        shouldPublishCanonicalUrls: false,
        shouldPublishSitemap: false,
      }),
    ).toBeUndefined();
  });
});
