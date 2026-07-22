import { describe, expect, it } from "vitest";

import {
  classifyShadcnInstallation,
  InstallationPreflightError,
  RADIX_UNSUPPORTED_WARNING,
} from "../../lib/formmuse/install-preflight";

describe("classifyShadcnInstallation", () => {
  it("accepts a Base UI project", () => {
    expect(classifyShadcnInstallation({ config: { base: "base" } })).toEqual({
      status: "supported",
      foundation: "base",
    });
  });

  it("returns the locked warning without migrating a Radix project", () => {
    expect(classifyShadcnInstallation({ config: { base: "radix" } })).toEqual({
      status: "unsupported",
      foundation: "radix",
      warning: RADIX_UNSUPPORTED_WARNING,
    });
  });

  it.each([undefined, {}, { config: null }, { config: { base: "aria" } }])(
    "fails closed for an unsupported information shape",
    (value) => {
      expect(() => classifyShadcnInstallation(value)).toThrow(
        InstallationPreflightError,
      );
    },
  );
});
