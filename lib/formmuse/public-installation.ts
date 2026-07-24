export const publicInstallationPackageManagers = [
  "pnpm",
  "npm",
  "yarn",
  "bun",
] as const;

export type PublicInstallationPackageManager =
  (typeof publicInstallationPackageManagers)[number];

export type PublicInstallationCommand = Readonly<{
  executable: string;
  arguments: readonly string[];
}>;

function assertRegistryItemUrl(url: string): void {
  const parsed = new URL(url);
  if (
    !["http:", "https:"].includes(parsed.protocol) ||
    !parsed.pathname.endsWith(".json")
  ) {
    throw new Error(
      "Public installation requires an HTTP(S) registry item URL.",
    );
  }
}

export function publicInstallationCommand(
  packageManager: PublicInstallationPackageManager,
  registryItemUrl: string,
): PublicInstallationCommand {
  assertRegistryItemUrl(registryItemUrl);

  const invocation = {
    pnpm: { executable: "pnpm", arguments: ["dlx"] },
    npm: { executable: "npx", arguments: [] },
    yarn: { executable: "yarn", arguments: ["dlx"] },
    bun: { executable: "bunx", arguments: ["--bun"] },
  }[packageManager];

  return {
    executable: invocation.executable,
    arguments: [
      ...invocation.arguments,
      "shadcn@latest",
      "add",
      registryItemUrl,
    ],
  };
}

export function publicInstallationDisplayCommand(
  packageManager: PublicInstallationPackageManager,
  registryItemUrl: string,
): string {
  const command = publicInstallationCommand(packageManager, registryItemUrl);
  return [command.executable, ...command.arguments].join(" ");
}
