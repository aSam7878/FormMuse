export const RADIX_UNSUPPORTED_WARNING =
  "FormMuse V1 officially supports shadcn projects using Base UI. Radix projects are not currently supported.";

export type InstallationPreflight =
  | Readonly<{
      status: "supported";
      foundation: "base";
    }>
  | Readonly<{
      status: "unsupported";
      foundation: "radix";
      warning: typeof RADIX_UNSUPPORTED_WARNING;
    }>;

export class InstallationPreflightError extends Error {
  override readonly name = "InstallationPreflightError";
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function classifyShadcnInstallation(
  shadcnInfo: unknown,
): InstallationPreflight {
  if (!isObject(shadcnInfo) || !isObject(shadcnInfo.config)) {
    throw new InstallationPreflightError(
      "shadcn info did not return a project configuration.",
    );
  }

  if (shadcnInfo.config.base === "base") {
    return { status: "supported", foundation: "base" };
  }

  if (shadcnInfo.config.base === "radix") {
    return {
      status: "unsupported",
      foundation: "radix",
      warning: RADIX_UNSUPPORTED_WARNING,
    };
  }

  throw new InstallationPreflightError(
    "FormMuse V1 requires shadcn configured with Base UI.",
  );
}
