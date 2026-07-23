import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { TemplatePrimaryTabs } from "../../components/template-page/template-primary-tabs";
import { createTemplatePageModel } from "../../lib/formmuse/template-page";
import { findTemplatePageRoute } from "../../lib/formmuse/template-routes";

const developmentBuild = {
  deployEnvironment: "development",
  origin: "http://localhost:3000",
  isIndexable: false,
  shouldPublishCanonicalUrls: false,
  shouldPublishSitemap: false,
} as const;

afterEach(cleanup);

function hangingGiftsTemplate() {
  const route = findTemplatePageRoute(
    "hanging-gifts-contact",
    developmentBuild,
  );

  if (!route) {
    throw new Error("The Hanging Gifts Template Page route is required.");
  }

  return createTemplatePageModel(route);
}

describe("Template Page model", () => {
  it("derives public presentation data from the validated Registry Record", () => {
    const template = hangingGiftsTemplate();

    expect(template).toMatchObject({
      slug: "hanging-gifts-contact",
      title: "Hanging Gifts Contact Form",
      category: "contact",
      categoryLabel: "Contact",
      status: "draft",
      statusLabel: "Draft",
      version: "0.0.0",
      appearance: "light",
      appearanceLabel: "Light",
      animation: ["css", "motion", "gsap"],
      animationLabels: ["CSS", "Motion", "GSAP"],
      previewPath: "/preview/hanging-gifts-contact",
    });
    expect(template.fieldLabels).toEqual([
      "First Name",
      "Last Name",
      "Requirement",
      "Email",
      "Message",
    ]);
    expect(template.tagLabels).toEqual([
      "Cinematic",
      "Gift Inspired",
      "Single Step",
    ]);
    expect(template.dependencies).toContain("gsap@3.15.0");
    expect(template.registryDependencies).toEqual([
      "button",
      "input",
      "label",
      "select",
      "textarea",
    ]);
    expect(template.files).toHaveLength(7);
    expect(template.files.at(-1)).toMatchObject({
      path: "public/formmuse/hanging-gifts-contact/hanging-gifts-hero.svg",
      type: "registry:file",
    });
  });
});

describe("TemplatePrimaryTabs", () => {
  it("provides stable tab semantics and embeds the isolated preview", () => {
    const template = hangingGiftsTemplate();

    render(
      <TemplatePrimaryTabs
        previewPath={template.previewPath}
        files={template.files}
      />,
    );

    const previewTab = screen.getByRole("tab", { name: "Preview" });
    const codeTab = screen.getByRole("tab", { name: "Code" });

    expect(
      screen.getByRole("tablist", { name: "Template presentation" }),
    ).toBeInTheDocument();
    expect(previewTab).toHaveAttribute("aria-selected", "true");
    expect(codeTab).toHaveAttribute("aria-selected", "false");
    expect(
      screen.getByTitle("Interactive Hanging Gifts template preview"),
    ).toHaveAttribute("src", "/preview/hanging-gifts-contact?outcome=success");
    expect(
      screen.queryByRole("heading", { name: "Distributed file manifest" }),
    ).not.toBeInTheDocument();
  });

  it("moves selection and focus with Arrow, Home, and End keys", async () => {
    const user = userEvent.setup();
    const template = hangingGiftsTemplate();

    render(
      <TemplatePrimaryTabs
        previewPath={template.previewPath}
        files={template.files}
      />,
    );

    const previewTab = screen.getByRole("tab", { name: "Preview" });
    const codeTab = screen.getByRole("tab", { name: "Code" });

    previewTab.focus();
    await user.keyboard("{ArrowRight}");
    expect(codeTab).toHaveFocus();
    expect(codeTab).toHaveAttribute("aria-selected", "true");
    expect(
      screen.getByRole("heading", { name: "Distributed file manifest" }),
    ).toBeInTheDocument();

    await user.keyboard("{Home}");
    expect(previewTab).toHaveFocus();
    expect(previewTab).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{End}");
    expect(codeTab).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(previewTab).toHaveFocus();
  });
});
