import { spawnSync } from "node:child_process";

import {
  foundationQualityGates,
  qualityGates,
  runQualityGates,
} from "../lib/formmuse/quality-gates";

const arguments_ = process.argv.slice(2);

if (arguments_.length === 1 && arguments_[0] === "--list") {
  for (const gate of qualityGates) {
    process.stdout.write(
      `${gate.id}\t${gate.availability}\t${gate.script}\t${gate.label}\n`,
    );
  }
  process.exit(0);
}

if (
  arguments_.length !== 2 ||
  arguments_[0] !== "--profile" ||
  arguments_[1] !== "foundation"
) {
  throw new Error(
    "Quality runner accepts only --list or --profile foundation until later Stage 4 gates are activated.",
  );
}

const pnpmCli = process.env.npm_execpath;
if (!pnpmCli) {
  throw new Error("Run the quality gate through the pinned pnpm scripts.");
}

process.exitCode = runQualityGates(
  foundationQualityGates(),
  (gate) => {
    const result = spawnSync(process.execPath, [pnpmCli, "run", gate.script], {
      cwd: process.cwd(),
      env: process.env,
      stdio: "inherit",
    });
    if (result.error) {
      process.stderr.write(
        `[quality:error] ${gate.id} — ${result.error.message}\n`,
      );
    }
    return { exitCode: result.status ?? 1 };
  },
  (message) => process.stdout.write(`${message}\n`),
);
