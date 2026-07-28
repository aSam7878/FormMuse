import { describe, expect, it } from "vitest";

import { resolveBuildOrigin } from "../../lib/formmuse/build-origin";
import {
  PreviewOriginConfigurationError,
  previewOriginUrl,
  resolvePreviewOrigin,
} from "../../lib/formmuse/preview-origin";

const developmentSite = resolveBuildOrigin({
  FORMMUSE_DEPLOY_ENV: "development",
  FORMMUSE_SITE_URL: "http://127.0.0.1:3100",
});

describe("distinct preview origin", () => {
  it("uses a separate safe development default", () => {
    expect(resolvePreviewOrigin({}, developmentSite)).toEqual({
      origin: "http://localhost:3101",
    });
  });

  it("requires a distinct origin", () => {
    expect(() =>
      resolvePreviewOrigin(
        { FORMMUSE_PREVIEW_URL: developmentSite.origin },
        developmentSite,
      ),
    ).toThrow("must use an origin distinct from FORMMUSE_SITE_URL");
  });

  it("requires an explicit HTTPS non-local origin outside development", () => {
    const productionSite = resolveBuildOrigin({
      FORMMUSE_DEPLOY_ENV: "production",
      FORMMUSE_SITE_URL: "https://formmuse.test",
    });
    expect(() => resolvePreviewOrigin({}, productionSite)).toThrow(
      "FORMMUSE_PREVIEW_URL is required for production builds",
    );
    expect(() =>
      resolvePreviewOrigin(
        { FORMMUSE_PREVIEW_URL: "http://preview.formmuse.test" },
        productionSite,
      ),
    ).toThrow("must use HTTPS for production builds");
    expect(
      resolvePreviewOrigin(
        { FORMMUSE_PREVIEW_URL: "https://preview.formmuse.test/" },
        productionSite,
      ),
    ).toEqual({ origin: "https://preview.formmuse.test" });
  });

  it.each([
    "not a url",
    "ftp://preview.formmuse.test",
    "https://user:secret@preview.formmuse.test",
    "https://preview.formmuse.test/path",
    " https://preview.formmuse.test",
  ])("rejects invalid preview origins without echoing them: %s", (value) => {
    let thrown: unknown;
    try {
      resolvePreviewOrigin({ FORMMUSE_PREVIEW_URL: value }, developmentSite);
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeInstanceOf(PreviewOriginConfigurationError);
    expect((thrown as Error).message).not.toContain(value);
  });

  it("constructs preview URLs without permitting an origin escape", () => {
    expect(
      previewOriginUrl("/preview/hanging-gifts-contact", {
        origin: "https://preview.formmuse.test",
      }),
    ).toBe("https://preview.formmuse.test/preview/hanging-gifts-contact");
    expect(() =>
      previewOriginUrl("//evil.test" as `/${string}`, {
        origin: "https://preview.formmuse.test",
      }),
    ).toThrow("start with exactly one slash");
  });
});
