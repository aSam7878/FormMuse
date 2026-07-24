import { describe, expect, it } from "vitest";

import {
  distributedSourceFindings,
  ownerReviewLicenseRecords,
  secretFindings,
  staticExportFindings,
  unrecordedUnknownLicenseRecords,
} from "../../lib/formmuse/security-quality";

describe("security content scanning", () => {
  it("rejects secret-shaped tracked source content", () => {
    const source = "const " + 'token = "actual-' + 'secret-value";';

    expect(secretFindings(source, "example.ts")).toEqual([
      { path: "example.ts", rule: "credential-shaped assignment" },
    ]);
  });

  it("rejects distributed dynamic execution, unsafe HTML, network, telemetry, and remote resources", () => {
    expect(
      distributedSourceFindings(
        'eval("x"); fetch("/api"); <div dangerouslySetInnerHTML={{ __html: value }} />; <img src="https://example.com" alt="" />;',
        "template.tsx",
      ).map((finding) => finding.rule),
    ).toEqual([
      "dynamic evaluation",
      "unsafe HTML rendering",
      "template-initiated network API",
      "remote resource URL",
    ]);
  });

  it("rejects remote static resource elements without treating ordinary external prose as a resource", () => {
    expect(
      staticExportFindings(
        '<script src="https://example.com/app.js"></script>',
        "out/index.html",
      ),
    ).toEqual([
      {
        path: "out/index.html",
        rule: "remote executable or media resource",
      },
    ]);
    expect(
      staticExportFindings(
        "<p>Read https://example.com for documentation.</p>",
        "out/index.html",
      ),
    ).toEqual([]);
  });
});

describe("licence inventory review", () => {
  it("permits only the recorded platform-specific build exception", () => {
    const records = [
      {
        license: "Unknown",
        name: "@yuku-analyzer/binding-darwin-arm64",
        version: "0.6.12",
      },
      { license: "MIT", name: "react", version: "19.2.7" },
      { license: "Unknown", name: "unreviewed-package", version: "1.0.0" },
    ];

    expect(ownerReviewLicenseRecords(records)).toEqual([records[0]]);
    expect(unrecordedUnknownLicenseRecords(records)).toEqual([records[2]]);
  });
});
