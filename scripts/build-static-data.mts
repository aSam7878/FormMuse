import { resolve } from "node:path";

import { loadAuthoredRegistry } from "../lib/formmuse/registry-build";
import {
  STATIC_DATA_FIXTURE_INPUT,
  buildDeploymentManifest,
  buildSearchData,
  deploymentInputFromEnvironment,
  loadGuideSearchSources,
  writeStaticData,
} from "../lib/formmuse/static-data";

const args = process.argv.slice(2);
if (args.some((argument) => argument !== "--fixture") || args.length > 1) {
  throw new Error(
    "Static data build accepts only the optional --fixture flag.",
  );
}

const projectRoot = resolve(process.cwd());
const registry = loadAuthoredRegistry(projectRoot);
const guideSources = loadGuideSearchSources(projectRoot);
const deploymentInput = args.includes("--fixture")
  ? STATIC_DATA_FIXTURE_INPUT
  : deploymentInputFromEnvironment({
      FORMMUSE_COMMIT_SHA: process.env.FORMMUSE_COMMIT_SHA,
      FORMMUSE_BUILD_TIMESTAMP: process.env.FORMMUSE_BUILD_TIMESTAMP,
      FORMMUSE_DEPLOY_ENV: process.env.FORMMUSE_DEPLOY_ENV,
      FORMMUSE_REPOSITORY_VERSION: process.env.FORMMUSE_REPOSITORY_VERSION,
    });
const searchData = buildSearchData(guideSources, registry.items);
const deploymentManifest = buildDeploymentManifest(
  deploymentInput,
  registry.items,
);
const result = writeStaticData(
  resolve(projectRoot, "public"),
  searchData,
  deploymentManifest,
);

console.log(
  `Generated ${searchData.entries.length} search entries and ${Object.keys(deploymentManifest.templateVersions).length} published template versions.`,
);
console.log(
  `Static data hashes: search=${result.searchSha256} deployment=${result.deploymentSha256}.`,
);
