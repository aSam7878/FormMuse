import { describe, expect, it } from "vitest";

import { siteQualityBuilds } from "../../scripts/site-quality-lab.mjs";

describe("site-quality origin pairs", () => {
  it("uses distinct reserved origins for preview-environment evidence", () => {
    expect(siteQualityBuilds(0, undefined, undefined)).toEqual([
      {
        environment: "preview",
        origin: "https://preview.formmuse.example",
        previewOrigin: "https://templates.preview.formmuse.example",
      },
    ]);
  });

  it("requires both owner-verified production origins for published work", () => {
    expect(() =>
      siteQualityBuilds(1, "https://formmuse.test", undefined),
    ).toThrow("FORMMUSE_SITE_URL and FORMMUSE_PREVIEW_URL");
    expect(
      siteQualityBuilds(
        1,
        "https://formmuse.test",
        "https://preview.formmuse.test",
      ),
    ).toContainEqual({
      environment: "production",
      origin: "https://formmuse.test",
      previewOrigin: "https://preview.formmuse.test",
    });
  });
});
