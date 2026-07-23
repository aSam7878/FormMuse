import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CatalogTeaser } from "../../components/catalog/catalog-teaser";
import {
  parsePreviewMode,
  teaserPreviewSource,
} from "../../lib/formmuse/catalog-teaser";

afterEach(cleanup);

const teaser = {
  title: "Hanging Gifts Contact Form",
  description: "A cinematic contact-page template.",
  templatePath: "/templates/hanging-gifts-contact",
  previewPath: "/preview/hanging-gifts-contact",
} as const;

describe("Catalog Teaser prototype", () => {
  it("reserves a semantic parent card and lightweight fallback before activation", () => {
    render(<CatalogTeaser {...teaser} />);
    expect(screen.getByRole("link", { name: teaser.title })).toHaveAttribute(
      "href",
      teaser.templatePath,
    );
    expect(screen.getByText(teaser.description)).toBeInTheDocument();
    expect(
      screen.queryByTitle(/decorative catalog teaser/i),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Hanging Gifts preview")).toBeInTheDocument();
  });

  it("activates the same preview route as non-interactive supporting media", () => {
    render(<CatalogTeaser {...teaser} active />);
    const frame = document.querySelector(
      `iframe[title="${teaser.title} decorative catalog teaser"]`,
    );
    expect(frame).not.toBeNull();
    expect(frame).toHaveAttribute(
      "src",
      "/preview/hanging-gifts-contact?mode=teaser",
    );
    expect(frame).toHaveAttribute("aria-hidden", "true");
    expect(frame).toHaveAttribute("tabindex", "-1");
    expect(frame).toHaveClass("pointer-events-none");
    expect(frame).toHaveAttribute("scrolling", "no");
  });

  it("accepts only the exact teaser mode", () => {
    expect(parsePreviewMode("?mode=teaser")).toBe("teaser");
    expect(parsePreviewMode("?mode=interactive")).toBe("interactive");
    expect(parsePreviewMode("?mode=TEASER")).toBe("interactive");
    expect(teaserPreviewSource("/preview/example?outcome=success")).toBe(
      "/preview/example?outcome=success&mode=teaser",
    );
  });
});
