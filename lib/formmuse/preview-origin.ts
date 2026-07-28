import {
  resolveBuildOrigin,
  type BuildOriginConfig,
  type FormMuseDeployEnvironment,
} from "./build-origin";

const DEFAULT_DEVELOPMENT_PREVIEW_ORIGIN = "http://localhost:3101";

export type PreviewOriginEnvironment = Readonly<{
  FORMMUSE_PREVIEW_URL?: string;
}>;

export type PreviewOriginConfig = Readonly<{
  origin: string;
}>;

export class PreviewOriginConfigurationError extends Error {
  override readonly name = "PreviewOriginConfigurationError";
}

function isLocalHostname(hostname: string): boolean {
  const value = hostname
    .toLowerCase()
    .replace(/^\[/, "")
    .replace(/\]$/, "")
    .replace(/\.$/, "");
  if (
    value === "localhost" ||
    value.endsWith(".localhost") ||
    value === "::1" ||
    value === "0.0.0.0" ||
    /^::(?:ffff:)?7f[0-9a-f]{2}:/.test(value)
  ) {
    return true;
  }
  const parts = value.split(".");
  return (
    parts.length === 4 &&
    parts.every((part) => /^\d{1,3}$/.test(part)) &&
    Number(parts[0]) === 127
  );
}

function parsePreviewOrigin(
  value: string | undefined,
  deployEnvironment: FormMuseDeployEnvironment,
): string {
  if (value === undefined) {
    if (deployEnvironment === "development") {
      return DEFAULT_DEVELOPMENT_PREVIEW_ORIGIN;
    }
    throw new PreviewOriginConfigurationError(
      `FORMMUSE_PREVIEW_URL is required for ${deployEnvironment} builds.`,
    );
  }
  if (value !== value.trim()) {
    throw new PreviewOriginConfigurationError(
      "FORMMUSE_PREVIEW_URL must be an absolute HTTP(S) origin without surrounding whitespace.",
    );
  }
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new PreviewOriginConfigurationError(
      "FORMMUSE_PREVIEW_URL must be a valid absolute HTTP(S) origin.",
    );
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new PreviewOriginConfigurationError(
      "FORMMUSE_PREVIEW_URL must use HTTP or HTTPS.",
    );
  }
  if (url.username || url.password) {
    throw new PreviewOriginConfigurationError(
      "FORMMUSE_PREVIEW_URL must not contain credentials.",
    );
  }
  if (url.pathname !== "/" || url.search || url.hash) {
    throw new PreviewOriginConfigurationError(
      "FORMMUSE_PREVIEW_URL must contain only an origin, without a path, query, or fragment.",
    );
  }
  if (deployEnvironment !== "development" && url.protocol !== "https:") {
    throw new PreviewOriginConfigurationError(
      `FORMMUSE_PREVIEW_URL must use HTTPS for ${deployEnvironment} builds.`,
    );
  }
  if (deployEnvironment !== "development" && isLocalHostname(url.hostname)) {
    throw new PreviewOriginConfigurationError(
      `FORMMUSE_PREVIEW_URL must not use a local or loopback origin for ${deployEnvironment} builds.`,
    );
  }
  return url.origin;
}

export function resolvePreviewOrigin(
  environment: PreviewOriginEnvironment = {
    FORMMUSE_PREVIEW_URL: process.env.FORMMUSE_PREVIEW_URL,
  },
  site: BuildOriginConfig = resolveBuildOrigin(),
): PreviewOriginConfig {
  const origin = parsePreviewOrigin(
    environment.FORMMUSE_PREVIEW_URL,
    site.deployEnvironment,
  );
  if (origin === site.origin) {
    throw new PreviewOriginConfigurationError(
      "FORMMUSE_PREVIEW_URL must use an origin distinct from FORMMUSE_SITE_URL.",
    );
  }
  return { origin };
}

export function previewOriginUrl(
  pathname: `/${string}`,
  config: PreviewOriginConfig = resolvePreviewOrigin(),
): string {
  if (!pathname.startsWith("/") || pathname.startsWith("//")) {
    throw new PreviewOriginConfigurationError(
      "Preview URL paths must be root-relative and start with exactly one slash.",
    );
  }
  const url = new URL(pathname, `${config.origin}/`);
  if (url.origin !== config.origin) {
    throw new PreviewOriginConfigurationError(
      "Preview URL paths must not change the configured origin.",
    );
  }
  return url.toString();
}
