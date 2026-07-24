import { describe, expect, it } from "vitest";

import {
  publicInstallationCommand,
  publicInstallationDisplayCommand,
  publicInstallationPackageManagers,
} from "../../lib/formmuse/public-installation";

const registryItemUrl = "https://example.test/r/hanging-gifts-contact.json";

describe("public shadcn installation commands", () => {
  it("uses every ADR-locked public launch form without suppressing conflicts", () => {
    expect(publicInstallationPackageManagers).toEqual([
      "pnpm",
      "npm",
      "yarn",
      "bun",
    ]);
    expect(publicInstallationDisplayCommand("pnpm", registryItemUrl)).toBe(
      `pnpm dlx shadcn@latest add ${registryItemUrl}`,
    );
    expect(publicInstallationDisplayCommand("npm", registryItemUrl)).toBe(
      `npx shadcn@latest add ${registryItemUrl}`,
    );
    expect(publicInstallationDisplayCommand("yarn", registryItemUrl)).toBe(
      `yarn dlx shadcn@latest add ${registryItemUrl}`,
    );
    expect(publicInstallationDisplayCommand("bun", registryItemUrl)).toBe(
      `bunx --bun shadcn@latest add ${registryItemUrl}`,
    );

    for (const manager of publicInstallationPackageManagers) {
      expect(
        [
          publicInstallationCommand(manager, registryItemUrl).executable,
          ...publicInstallationCommand(manager, registryItemUrl).arguments,
        ].join(" "),
      ).not.toMatch(/--(?:yes|overwrite)\b/);
    }
  });

  it("rejects a non-registry public item address", () => {
    expect(() =>
      publicInstallationCommand("pnpm", "file:///tmp/item.json"),
    ).toThrow("HTTP(S) registry item URL");
    expect(() =>
      publicInstallationCommand("pnpm", "https://example.test/r/item"),
    ).toThrow("HTTP(S) registry item URL");
  });
});
