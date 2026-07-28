import { describe, expect, it } from "vitest";

import {
  PREVIEW_CONTENT_SECURITY_POLICY,
  PREVIEW_PERMISSIONS_ALLOW,
  PREVIEW_PERMISSIONS_POLICY,
} from "../../lib/formmuse/preview-security";

describe("preview security policy", () => {
  it("starts CSP from denial and names every narrow exception", () => {
    expect(PREVIEW_CONTENT_SECURITY_POLICY.split("; ")).toEqual([
      "default-src 'none'",
      "base-uri 'none'",
      "connect-src 'none'",
      "font-src 'self'",
      "form-action 'none'",
      "frame-src 'none'",
      "img-src 'self' data:",
      "manifest-src 'none'",
      "media-src 'self'",
      "object-src 'none'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "worker-src 'none'",
      "sandbox allow-forms allow-same-origin allow-scripts",
    ]);
  });

  it("denies every declared browser capability at the header and iframe", () => {
    const policyFeatures = PREVIEW_PERMISSIONS_POLICY.split(", ").map(
      (directive) => directive.replace("=()", ""),
    );
    const iframeFeatures = PREVIEW_PERMISSIONS_ALLOW.split("; ").map(
      (directive) => directive.replace(" 'none'", ""),
    );
    expect(policyFeatures).toEqual(iframeFeatures);
    expect(policyFeatures).toEqual(
      expect.arrayContaining([
        "camera",
        "display-capture",
        "fullscreen",
        "geolocation",
        "microphone",
        "payment",
        "usb",
      ]),
    );
  });
});
