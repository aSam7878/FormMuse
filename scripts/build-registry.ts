import { resolve } from "node:path";

import { resolveBuildOrigin } from "../lib/formmuse/build-origin";
import { buildRegistry } from "../lib/formmuse/registry-build";

const projectRoot = resolve(process.cwd());
const { deployEnvironment } = resolveBuildOrigin();
const result = buildRegistry({ projectRoot, deployEnvironment });

console.log(
  `Generated ${result.itemNames.length} registry item(s) for ${deployEnvironment} at ${result.outputDirectory}.`,
);
