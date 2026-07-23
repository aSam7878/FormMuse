import { describe, expect, it } from "vitest";

import { createTemplateInstallationModel } from "../../lib/formmuse/template-installation";
import { createTemplatePageModel } from "../../lib/formmuse/template-page";
import { findTemplatePageRoute } from "../../lib/formmuse/template-routes";

const developmentBuild = {
  deployEnvironment: "development",
  origin: "http://localhost:3000",
  isIndexable: false,
  shouldPublishCanonicalUrls: false,
  shouldPublishSitemap: false,
} as const;

function installation() {
  const route = findTemplatePageRoute(
    "hanging-gifts-contact",
    developmentBuild,
  );
  if (!route) throw new Error("Hanging Gifts route missing.");
  return createTemplateInstallationModel(
    createTemplatePageModel(route),
    developmentBuild,
  );
}

describe("Template installation presentation", () => {
  it("generates the four locked commands from the current Build Origin", () => {
    const model = installation();
    expect(model.registryUrl).toBe(
      "http://localhost:3000/r/hanging-gifts-contact.json",
    );
    expect(model.commands).toMatchObject({
      pnpm: {
        install:
          "pnpm dlx shadcn@latest add http://localhost:3000/r/hanging-gifts-contact.json",
      },
      npm: {
        install:
          "npx shadcn@latest add http://localhost:3000/r/hanging-gifts-contact.json",
      },
      yarn: {
        install:
          "yarn dlx shadcn@latest add http://localhost:3000/r/hanging-gifts-contact.json",
      },
      bun: {
        install:
          "bunx --bun shadcn@latest add http://localhost:3000/r/hanging-gifts-contact.json",
      },
    });
    for (const commands of Object.values(model.commands)) {
      expect(commands.install).not.toMatch(/--overwrite|--yes/);
      expect(commands.initialize).toContain("init --base base");
    }
  });

  it("keeps Code and Manual file and dependency coverage exact", () => {
    const model = installation();
    expect(model.files).toHaveLength(7);
    expect(model.files.every((file) => file.content.length > 0)).toBe(true);
    expect(model.files.map((file) => file.path)).toEqual([
      "registry/base/hanging-gifts-contact/hanging-gifts-contact-form.tsx",
      "registry/base/hanging-gifts-contact/hanging-gifts-contact-form.schema.ts",
      "registry/base/hanging-gifts-contact/animated-icons.tsx",
      "registry/base/hanging-gifts-contact/hanging-gifts.tsx",
      "registry/base/hanging-gifts-contact/template-navbar.tsx",
      "registry/base/hanging-gifts-contact/hanging-gifts-contact-form.module.css",
      "public/formmuse/hanging-gifts-contact/hanging-gifts-hero.svg",
    ]);
    expect(model.dependencies).toHaveLength(8);
    expect(model.registryDependencies).toHaveLength(5);
    expect(model.finalUsageSource).toContain("HangingGiftsContactForm");
  });
});
