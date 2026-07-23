import { describe, expect, it } from "vitest";

import { createTemplateInstallationModel } from "../../lib/formmuse/template-installation";
import { createTemplatePageModel } from "../../lib/formmuse/template-page";
import { createTemplatePresentationModel } from "../../lib/formmuse/template-presentation";
import { findTemplatePageRoute } from "../../lib/formmuse/template-routes";

const developmentBuild = {
  deployEnvironment: "development",
  origin: "http://localhost:3000",
  isIndexable: false,
  shouldPublishCanonicalUrls: false,
  shouldPublishSitemap: false,
} as const;

function presentation() {
  const route = findTemplatePageRoute(
    "hanging-gifts-contact",
    developmentBuild,
  );
  if (!route) throw new Error("Hanging Gifts route missing.");
  const template = createTemplatePageModel(route);
  const installation = createTemplateInstallationModel(
    template,
    developmentBuild,
  );
  return createTemplatePresentationModel(template, installation);
}

describe("Template documentation presentation", () => {
  it("renders only referenced type-checked examples and exact exported Props", () => {
    const model = presentation();
    expect(model.examples.map((example) => example.path)).toEqual([
      "registry/base/hanging-gifts-contact/hanging-gifts-contact.example.tsx",
      "registry/base/hanging-gifts-contact/hanging-gifts-contact.backend.example.tsx",
    ]);
    expect(
      model.examples.every((example) =>
        example.source.includes("HangingGiftsContactForm"),
      ),
    ).toBe(true);
    expect(
      model.props.map(({ name, required }) => ({ name, required })),
    ).toEqual([
      { name: "onSubmit", required: true },
      { name: "defaultValues", required: false },
      { name: "className", required: false },
      { name: "assetBaseUrl", required: false },
      { name: "animationReplayKey", required: false },
    ]);
  });

  it("generates a bounded Agent Prompt from machine-readable handoff data", () => {
    const prompt = presentation().agentPrompt;
    expect(prompt).toContain("HangingGiftsContactForm");
    expect(prompt).toContain("hangingGiftsContactFormSchema");
    expect(prompt).toContain("HangingGiftsContactFormValues");
    expect(prompt).toContain("shadcn with Base UI");
    expect(prompt).toContain(
      "Never use overwrite or automatic-confirmation flags",
    );
    expect(prompt).toContain("raw backend errors");
    expect(prompt).toContain("format, typecheck, lint, test, and build");
    expect(prompt).not.toMatch(/MCP server|hosted agent|chat UI/);
  });
});
