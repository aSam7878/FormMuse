import { relative, resolve } from "node:path";

import {
  buildStaticQualityArtifact,
  exportedSiteRoutes,
  publishedTemplateCount,
  runQualityTool,
  siteQualityBuilds,
} from "./site-quality-lab.mjs";

for (const build of siteQualityBuilds(publishedTemplateCount())) {
  buildStaticQualityArtifact(build);
  const outputDirectory = resolve(process.cwd(), "out");

  for (const route of exportedSiteRoutes(build.environment)) {
    const routeDirectory =
      route.path === "/"
        ? outputDirectory
        : resolve(outputDirectory, `.${route.path}`);
    const routeTarget = relative(
      outputDirectory,
      resolve(routeDirectory, "index.html"),
    );
    runQualityTool(
      [
        "exec",
        "linkinator",
        routeTarget,
        "--server-root",
        "out",
        "--recurse",
        "--check-fragments",
        "--directory-listing",
        "--format",
        "JSON",
        "--verbosity",
        "error",
      ],
      build,
    );
  }

  process.stdout.write(
    `[links:pass] ${build.environment} exported routes crawled individually\n`,
  );
}
