import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const SOURCE_EXTENSIONS = new Set([
  ".css",
  ".js",
  ".json",
  ".jsx",
  ".mjs",
  ".mts",
  ".mdx",
  ".ts",
  ".tsx",
  ".yaml",
  ".yml",
]);
const EXCLUDED_TRACKED_FILES = new Set(["pnpm-lock.yaml"]);

const args = process.argv.slice(2);
if (args.some((argument) => argument !== "--write") || args.length > 1) {
  throw new Error("Format scope accepts only the optional --write flag.");
}

const projectRoot = resolve(process.cwd());
const tracked = spawnSync("git", ["ls-files", "-z", "--cached"], {
  cwd: projectRoot,
  encoding: "utf8",
});

if (tracked.status !== 0) {
  throw new Error(
    `Cannot enumerate tracked source files: ${tracked.stderr.trim()}`,
  );
}

const files = tracked.stdout
  .split("\0")
  .filter(Boolean)
  .filter((path) => {
    if (EXCLUDED_TRACKED_FILES.has(path)) {
      return false;
    }
    const dot = path.lastIndexOf(".");
    return dot >= 0 && SOURCE_EXTENSIONS.has(path.slice(dot));
  })
  .sort();

if (files.length === 0) {
  throw new Error("No tracked FormMuse source files matched the format scope.");
}

const prettierPath = resolve(
  projectRoot,
  "node_modules/prettier/bin/prettier.cjs",
);
const prettier = spawnSync(
  process.execPath,
  [prettierPath, args.includes("--write") ? "--write" : "--check", ...files],
  {
    cwd: projectRoot,
    encoding: "utf8",
  },
);

process.stdout.write(prettier.stdout);
process.stderr.write(prettier.stderr);
process.exitCode = prettier.status ?? 1;
