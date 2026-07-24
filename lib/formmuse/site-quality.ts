export type SiteQualityEnvironment = "preview" | "production";

export type SiteQualityRouteKind =
  "homepage" | "catalog" | "guide" | "template-page" | "preview" | "site";

export type SiteQualityRoute = Readonly<{
  path: `/${string}`;
  kind: SiteQualityRouteKind;
  indexable: boolean;
}>;

type LighthouseCategoryId =
  "performance" | "accessibility" | "best-practices" | "seo";

export type LighthouseReport = Readonly<{
  finalUrl: string;
  categories?: Partial<
    Record<LighthouseCategoryId, Readonly<{ score: number | null }>>
  >;
  audits?: Record<string, Readonly<{ score: number | null }>>;
}>;

const excludedOutputDirectories = new Set(["404", "_not-found"]);

function normalizedRoutePath(pathname: string): `/${string}` {
  const segments = pathname.split("/").filter(Boolean);
  return (
    segments.length === 0 ? "/" : `/${segments.join("/")}/`
  ) as `/${string}`;
}

function routeKind(path: `/${string}`): SiteQualityRouteKind {
  if (path === "/") return "homepage";
  if (path === "/templates/") return "catalog";
  if (path.startsWith("/docs/")) return "guide";
  if (path.startsWith("/templates/")) return "template-page";
  if (path.startsWith("/preview/")) return "preview";
  return "site";
}

export function siteQualityRoutes(
  exportedIndexPaths: readonly string[],
  environment: SiteQualityEnvironment,
): SiteQualityRoute[] {
  const paths = exportedIndexPaths
    .map((outputPath) => outputPath.replaceAll("\\", "/"))
    .filter(
      (outputPath) =>
        outputPath === "index.html" || outputPath.endsWith("/index.html"),
    )
    .map((outputPath) => outputPath.replace(/(?:^|\/)index\.html$/, ""))
    .filter((pathname) => !excludedOutputDirectories.has(pathname))
    .map(normalizedRoutePath);
  const uniquePaths = [...new Set(paths)].sort((left, right) =>
    left.localeCompare(right),
  );

  if (!uniquePaths.includes("/")) {
    throw new Error("The generated static artifact must include the homepage.");
  }

  return uniquePaths.map((path) => {
    const kind = routeKind(path);
    return {
      path,
      kind,
      indexable: environment === "production" && kind !== "preview",
    };
  });
}

function scoreFor(
  report: LighthouseReport,
  category: LighthouseCategoryId,
): number | null {
  return report.categories?.[category]?.score ?? null;
}

function routeFromFinalUrl(finalUrl: string): `/${string}` {
  return normalizedRoutePath(new URL(finalUrl).pathname);
}

export function lighthouseFailures(
  report: LighthouseReport,
  route: SiteQualityRoute,
): string[] {
  const failures: string[] = [];
  const actualRoute = routeFromFinalUrl(report.finalUrl);

  if (actualRoute !== route.path) {
    failures.push(
      `Lighthouse report route ${actualRoute} does not match expected ${route.path}.`,
    );
  }

  const thresholds: Array<readonly [LighthouseCategoryId, number]> = [
    ["performance", 0.9],
    ["accessibility", 1],
    ["best-practices", 1],
  ];

  if (route.indexable) thresholds.push(["seo", 1]);

  for (const [category, minimum] of thresholds) {
    const score = scoreFor(report, category);
    if (score === null || score < minimum) {
      failures.push(
        `${route.path} ${category} score must be at least ${minimum}, received ${score ?? "none"}.`,
      );
    }
  }

  if (report.audits?.["errors-in-console"]?.score !== 1) {
    failures.push(`${route.path} reported a browser console error.`);
  }

  return failures;
}
