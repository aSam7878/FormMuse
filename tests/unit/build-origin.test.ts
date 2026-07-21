import { describe, expect, it } from "vitest";

import {
  BuildOriginConfigurationError,
  buildOriginUrl,
  resolveBuildOrigin,
  type BuildOriginEnvironment,
} from "../../lib/formmuse/build-origin";

function resolve(environment: BuildOriginEnvironment = {}) {
  return resolveBuildOrigin(environment);
}

describe("resolveBuildOrigin", () => {
  it("defaults missing configuration to safe non-indexable development", () => {
    expect(resolve()).toEqual({
      deployEnvironment: "development",
      origin: "http://localhost:3000",
      isIndexable: false,
      shouldPublishCanonicalUrls: false,
      shouldPublishSitemap: false,
    });
  });

  it("accepts and normalizes an explicit development origin", () => {
    expect(
      resolve({
        FORMMUSE_DEPLOY_ENV: "development",
        FORMMUSE_SITE_URL: "https://dev.formmuse.example/",
      }),
    ).toMatchObject({
      deployEnvironment: "development",
      origin: "https://dev.formmuse.example",
      isIndexable: false,
    });
  });

  it.each(["", "staging", "Production"])(
    "rejects the unsupported deploy environment %j",
    (deployEnvironment) => {
      expect(() => resolve({ FORMMUSE_DEPLOY_ENV: deployEnvironment })).toThrow(
        "FORMMUSE_DEPLOY_ENV must be development, preview, or production.",
      );
    },
  );

  it.each(["preview", "production"] as const)(
    "requires an explicit origin for %s builds",
    (deployEnvironment) => {
      expect(() => resolve({ FORMMUSE_DEPLOY_ENV: deployEnvironment })).toThrow(
        `FORMMUSE_SITE_URL is required for ${deployEnvironment} builds.`,
      );
    },
  );

  it("keeps a valid preview non-indexable and non-canonical", () => {
    expect(
      resolve({
        FORMMUSE_DEPLOY_ENV: "preview",
        FORMMUSE_SITE_URL: "https://branch-preview.example",
      }),
    ).toEqual({
      deployEnvironment: "preview",
      origin: "https://branch-preview.example",
      isIndexable: false,
      shouldPublishCanonicalUrls: false,
      shouldPublishSitemap: false,
    });
  });

  it("enables public identity only for a valid production origin", () => {
    expect(
      resolve({
        FORMMUSE_DEPLOY_ENV: "production",
        FORMMUSE_SITE_URL: "https://formmuse.example/",
      }),
    ).toEqual({
      deployEnvironment: "production",
      origin: "https://formmuse.example",
      isIndexable: true,
      shouldPublishCanonicalUrls: true,
      shouldPublishSitemap: true,
    });
  });

  it.each(["preview", "production"] as const)(
    "requires HTTPS for %s builds",
    (deployEnvironment) => {
      expect(() =>
        resolve({
          FORMMUSE_DEPLOY_ENV: deployEnvironment,
          FORMMUSE_SITE_URL: "http://public.example",
        }),
      ).toThrow(
        `FORMMUSE_SITE_URL must use HTTPS for ${deployEnvironment} builds.`,
      );
    },
  );

  it.each([
    "https://localhost:3000",
    "https://localhost.",
    "https://preview.localhost",
    "https://preview.localhost.",
    "https://127.0.0.1",
    "https://127.42.0.9",
    "https://[::1]",
    "https://[::ffff:127.0.0.1]",
    "https://[::ffff:127.42.0.9]",
    "https://0.0.0.0",
  ])("rejects local or loopback public origins: %s", (siteUrl) => {
    expect(() =>
      resolve({
        FORMMUSE_DEPLOY_ENV: "production",
        FORMMUSE_SITE_URL: siteUrl,
      }),
    ).toThrow(
      "FORMMUSE_SITE_URL must not use a local or loopback origin for production builds.",
    );
  });

  it.each([
    "not a url",
    "ftp://formmuse.example",
    "https://user:secret@formmuse.example",
    "https://formmuse.example/path",
    "https://formmuse.example?query=value",
    "https://formmuse.example#fragment",
    " https://formmuse.example",
  ])("rejects a non-origin site URL without echoing it: %s", (siteUrl) => {
    let thrown: unknown;

    try {
      resolve({
        FORMMUSE_DEPLOY_ENV: "development",
        FORMMUSE_SITE_URL: siteUrl,
      });
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(BuildOriginConfigurationError);
    expect((thrown as Error).message).not.toContain(siteUrl);
  });
});

describe("buildOriginUrl", () => {
  const productionConfig = resolve({
    FORMMUSE_DEPLOY_ENV: "production",
    FORMMUSE_SITE_URL: "https://formmuse.example/",
  });

  it("constructs an absolute URL without duplicate origin slashes", () => {
    expect(
      buildOriginUrl("/r/hanging-gifts-contact.json", productionConfig),
    ).toBe("https://formmuse.example/r/hanging-gifts-contact.json");
  });

  it("preserves a root-relative query and fragment", () => {
    expect(
      buildOriginUrl("/templates?category=contact#results", productionConfig),
    ).toBe("https://formmuse.example/templates?category=contact#results");
  });

  it.each(["templates", "//other.example/path", "https://other.example/path"])(
    "rejects a path that can escape the Build Origin: %s",
    (pathname) => {
      expect(() =>
        buildOriginUrl(pathname as `/${string}`, productionConfig),
      ).toThrow(
        "Build Origin URL paths must be root-relative and start with exactly one slash.",
      );
    },
  );
});
