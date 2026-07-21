const FORMMUSE_DEPLOY_ENVIRONMENTS = [
  "development",
  "preview",
  "production",
] as const;

const DEFAULT_DEVELOPMENT_ORIGIN = "http://localhost:3000";

export type FormMuseDeployEnvironment =
  (typeof FORMMUSE_DEPLOY_ENVIRONMENTS)[number];

export type BuildOriginEnvironment = Readonly<{
  FORMMUSE_DEPLOY_ENV?: string;
  FORMMUSE_SITE_URL?: string;
}>;

export type BuildOriginConfig = Readonly<{
  deployEnvironment: FormMuseDeployEnvironment;
  origin: string;
  isIndexable: boolean;
  shouldPublishCanonicalUrls: boolean;
  shouldPublishSitemap: boolean;
}>;

export class BuildOriginConfigurationError extends Error {
  override readonly name = "BuildOriginConfigurationError";
}

function parseDeployEnvironment(
  value: string | undefined,
): FormMuseDeployEnvironment {
  if (value === undefined) {
    return "development";
  }

  if (
    FORMMUSE_DEPLOY_ENVIRONMENTS.includes(value as FormMuseDeployEnvironment)
  ) {
    return value as FormMuseDeployEnvironment;
  }

  throw new BuildOriginConfigurationError(
    "FORMMUSE_DEPLOY_ENV must be development, preview, or production.",
  );
}

function isLocalHostname(hostname: string): boolean {
  const normalizedHostname = hostname
    .toLowerCase()
    .replace(/^\[/, "")
    .replace(/\]$/, "")
    .replace(/\.$/, "");

  if (
    normalizedHostname === "localhost" ||
    normalizedHostname.endsWith(".localhost") ||
    normalizedHostname === "::1" ||
    normalizedHostname === "0.0.0.0" ||
    /^::(?:ffff:)?7f[0-9a-f]{2}:/.test(normalizedHostname)
  ) {
    return true;
  }

  const ipv4Parts = normalizedHostname.split(".");

  return (
    ipv4Parts.length === 4 &&
    ipv4Parts.every((part) => /^\d{1,3}$/.test(part)) &&
    Number(ipv4Parts[0]) === 127
  );
}

function parseOrigin(
  value: string | undefined,
  deployEnvironment: FormMuseDeployEnvironment,
): string {
  if (value === undefined) {
    if (deployEnvironment === "development") {
      return DEFAULT_DEVELOPMENT_ORIGIN;
    }

    throw new BuildOriginConfigurationError(
      `FORMMUSE_SITE_URL is required for ${deployEnvironment} builds.`,
    );
  }

  if (value !== value.trim()) {
    throw new BuildOriginConfigurationError(
      "FORMMUSE_SITE_URL must be an absolute HTTP(S) origin without surrounding whitespace.",
    );
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(value);
  } catch {
    throw new BuildOriginConfigurationError(
      "FORMMUSE_SITE_URL must be a valid absolute HTTP(S) origin.",
    );
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new BuildOriginConfigurationError(
      "FORMMUSE_SITE_URL must use HTTP or HTTPS.",
    );
  }

  if (parsedUrl.username || parsedUrl.password) {
    throw new BuildOriginConfigurationError(
      "FORMMUSE_SITE_URL must not contain credentials.",
    );
  }

  if (
    parsedUrl.pathname !== "/" ||
    parsedUrl.search !== "" ||
    parsedUrl.hash !== ""
  ) {
    throw new BuildOriginConfigurationError(
      "FORMMUSE_SITE_URL must contain only an origin, without a path, query, or fragment.",
    );
  }

  if (deployEnvironment !== "development" && parsedUrl.protocol !== "https:") {
    throw new BuildOriginConfigurationError(
      `FORMMUSE_SITE_URL must use HTTPS for ${deployEnvironment} builds.`,
    );
  }

  if (
    deployEnvironment !== "development" &&
    isLocalHostname(parsedUrl.hostname)
  ) {
    throw new BuildOriginConfigurationError(
      `FORMMUSE_SITE_URL must not use a local or loopback origin for ${deployEnvironment} builds.`,
    );
  }

  return parsedUrl.origin;
}

export function resolveBuildOrigin(
  environment: BuildOriginEnvironment = {
    FORMMUSE_DEPLOY_ENV: process.env.FORMMUSE_DEPLOY_ENV,
    FORMMUSE_SITE_URL: process.env.FORMMUSE_SITE_URL,
  },
): BuildOriginConfig {
  const deployEnvironment = parseDeployEnvironment(
    environment.FORMMUSE_DEPLOY_ENV,
  );
  const origin = parseOrigin(environment.FORMMUSE_SITE_URL, deployEnvironment);
  const isProduction = deployEnvironment === "production";

  return {
    deployEnvironment,
    origin,
    isIndexable: isProduction,
    shouldPublishCanonicalUrls: isProduction,
    shouldPublishSitemap: isProduction,
  };
}

export function buildOriginUrl(
  pathname: `/${string}`,
  config: BuildOriginConfig = resolveBuildOrigin(),
): string {
  if (!pathname.startsWith("/") || pathname.startsWith("//")) {
    throw new BuildOriginConfigurationError(
      "Build Origin URL paths must be root-relative and start with exactly one slash.",
    );
  }

  const url = new URL(pathname, `${config.origin}/`);

  if (url.origin !== config.origin) {
    throw new BuildOriginConfigurationError(
      "Build Origin URL paths must not change the configured origin.",
    );
  }

  return url.toString();
}
