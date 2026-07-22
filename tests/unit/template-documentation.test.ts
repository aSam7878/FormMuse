import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, expectTypeOf, it } from "vitest";

import registry from "../../registry.json";
import { createTemplateDocumentation } from "../../lib/formmuse/template-documentation";
import {
  hangingGiftsContactFormSchema,
  type HangingGiftsContactFormValues,
} from "../../registry/base/hanging-gifts-contact/hanging-gifts-contact-form.schema";
import {
  hangingGiftsContactDocumentation,
  hangingGiftsContactDocumentationInput,
} from "../../registry/base/hanging-gifts-contact/hanging-gifts-contact.documentation";

const registryItem = registry.items[0];

describe("Hanging Gifts documentation inputs", () => {
  it("derives every Manual inventory from the Registry Record", () => {
    expect(
      hangingGiftsContactDocumentation.manualInstallation.files.map(
        (file) => file.path,
      ),
    ).toEqual(registryItem.files.map((file) => file.path));
    expect(
      hangingGiftsContactDocumentation.manualInstallation.dependencies.map(
        (dependency) => dependency.dependency,
      ),
    ).toEqual(registryItem.dependencies);
    expect(
      hangingGiftsContactDocumentation.manualInstallation.registryDependencies.map(
        (dependency) => dependency.dependency,
      ),
    ).toEqual(registryItem.registryDependencies);
  });

  it("covers assets, scoped styles, animation setup, final import, and usage", () => {
    expect(
      hangingGiftsContactDocumentation.manualInstallation.files.filter(
        (file) => file.kind === "asset",
      ),
    ).toHaveLength(1);
    expect(
      hangingGiftsContactDocumentation.manualInstallation.files.filter(
        (file) => file.kind === "stylesheet",
      ),
    ).toHaveLength(1);
    expect(
      hangingGiftsContactDocumentation.manualInstallation
        .stylesheetAndAnimationSteps,
    ).toHaveLength(4);
    expect(hangingGiftsContactDocumentation.manualInstallation.importPath).toBe(
      "@components/formmuse/hanging-gifts-contact/hanging-gifts-contact-form",
    );
    expect(
      hangingGiftsContactDocumentation.manualInstallation.finalUsageExamplePath,
    ).toBe(
      "registry/base/hanging-gifts-contact/hanging-gifts-contact.example.tsx",
    );
  });

  it("names real public component, schema, values, and submission exports", () => {
    const parsed = hangingGiftsContactFormSchema.parse({
      firstName: "Avery",
      lastName: "",
      requirement: "events",
      email: "avery@example.com",
      message: "Please tell me more about the event options.",
    });
    const componentSource = readFileSync(
      resolve(
        process.cwd(),
        "registry/base/hanging-gifts-contact/hanging-gifts-contact-form.tsx",
      ),
      "utf8",
    );
    const backendExampleSource = readFileSync(
      resolve(
        process.cwd(),
        "registry/base/hanging-gifts-contact/hanging-gifts-contact.backend.example.tsx",
      ),
      "utf8",
    );

    expect(componentSource).toContain(
      `export function ${hangingGiftsContactDocumentation.agentHandoff.componentExport}`,
    );
    expect(hangingGiftsContactDocumentation.agentHandoff.schemaExport).toBe(
      "hangingGiftsContactFormSchema",
    );
    expect(hangingGiftsContactDocumentation.agentHandoff.valuesTypeExport).toBe(
      "HangingGiftsContactFormValues",
    );
    expect(hangingGiftsContactDocumentation.agentHandoff.submissionProp).toBe(
      "onSubmit",
    );
    expect(backendExampleSource).toContain(
      "export function HangingGiftsContactBackendExample",
    );
    expectTypeOf(parsed).toEqualTypeOf<HangingGiftsContactFormValues>();
  });

  it("rejects handwritten Manual inventory drift", () => {
    const missingFile = {
      ...hangingGiftsContactDocumentationInput,
      manualInstallation: {
        ...hangingGiftsContactDocumentationInput.manualInstallation,
        files:
          hangingGiftsContactDocumentationInput.manualInstallation.files.slice(
            0,
            -1,
          ),
      },
    };

    expect(() =>
      createTemplateDocumentation(registryItem, missingFile),
    ).toThrow("Manual file notes must cover the Registry Record exactly.");
  });

  it("keeps the template draft and starts its changelog at Unreleased", () => {
    const changelog = readFileSync(
      resolve(
        process.cwd(),
        "registry/base/hanging-gifts-contact/changelog.md",
      ),
      "utf8",
    );

    expect(registryItem.meta.formmuse.status).toBe("draft");
    expect(registryItem.meta.formmuse.version).toBe("0.0.0");
    expect(changelog).toContain("## Unreleased");
    expect(changelog).not.toMatch(/^## 1\.0\.0$/m);
  });
});
