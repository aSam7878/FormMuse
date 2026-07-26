import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  lighthouseFailures,
  type LighthouseReport,
} from "../lib/formmuse/site-quality";
import {
  buildStaticQualityArtifact,
  exportedSiteRoutes,
  publishedTemplateCount,
  runQualityTool,
  siteQualityBuilds,
} from "./site-quality-lab.mjs";

function reports(): LighthouseReport[] {
  const directory = resolve(process.cwd(), ".lighthouseci");
  return readdirSync(directory)
    .filter((name) => /^lhr-.+\.json$/u.test(name))
    .sort((left, right) => left.localeCompare(right))
    .map(
      (name) =>
        JSON.parse(
          readFileSync(resolve(directory, name), "utf8"),
        ) as LighthouseReport,
    );
}

for (const build of siteQualityBuilds(publishedTemplateCount())) {
  buildStaticQualityArtifact(build);
  const routes = exportedSiteRoutes(build.environment);
  runQualityTool(
    ["exec", "lhci", "collect", "--config=lighthouserc.cjs"],
    build,
  );

  const reportByPath = new Map(
    reports().map((report) => [new URL(report.finalUrl).pathname, report]),
  );
  const failures = routes.flatMap((route) => {
    const report = reportByPath.get(route.path);
    if (!report)
      return [`Lighthouse did not produce a report for ${route.path}.`];
    return lighthouseFailures(report, route);
  });

  if (failures.length > 0) {
    throw new Error(
      `Lighthouse quality failures:\n${failures.map((failure) => `- ${failure}`).join("\n")}`,
    );
  }

  process.stdout.write(
    `[lighthouse:pass] ${build.environment} ${routes.length} exported route(s)\n`,
  );
}
