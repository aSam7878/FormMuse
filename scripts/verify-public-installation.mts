import { spawn } from "node:child_process";
import { once } from "node:events";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { dirname, join, normalize, resolve, sep } from "node:path";

import {
  publicInstallationCommand,
  publicInstallationPackageManagers,
  type PublicInstallationPackageManager,
} from "../lib/formmuse/public-installation";
import { buildRegistry } from "../lib/formmuse/registry-build";

const PROJECT_ROOT = resolve(process.cwd());
const PINNED_SHADCN_VERSION = "4.13.1";
const TEMPLATE_NAME = "hanging-gifts-contact";
const CONFLICT_PATHS = [
  join(
    "components",
    "formmuse",
    "hanging-gifts-contact",
    "hanging-gifts-contact-form.tsx",
  ),
  join(
    "src",
    "components",
    "formmuse",
    "hanging-gifts-contact",
    "hanging-gifts-contact-form.tsx",
  ),
] as const;

function fail(message: string): never {
  throw new Error(message);
}

function selectedPackageManager(): PublicInstallationPackageManager {
  const arguments_ = process.argv.slice(2);
  if (
    arguments_.length !== 2 ||
    arguments_[0] !== "--manager" ||
    !publicInstallationPackageManagers.includes(
      arguments_[1] as PublicInstallationPackageManager,
    )
  ) {
    fail(
      `Usage: verify-public-installation.mts --manager ${publicInstallationPackageManagers.join("|")}`,
    );
  }

  return arguments_[1] as PublicInstallationPackageManager;
}

async function run(
  executable: string,
  arguments_: readonly string[],
  cwd: string,
  allowFailure = false,
): Promise<Readonly<{ output: string; status: number }>> {
  return new Promise((resolveResult, reject) => {
    const child = spawn(executable, arguments_, {
      cwd,
      env: { ...process.env, NO_COLOR: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let output = "";
    child.stdout.on("data", (chunk: Buffer) => {
      output += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer) => {
      output += chunk.toString();
    });
    child.once("error", (error) => {
      reject(new Error(`${executable} could not start: ${error.message}`));
    });
    child.once("close", (status) => {
      const result = { output, status: status ?? 1 };
      if (!allowFailure && result.status !== 0) {
        reject(
          new Error(
            `${executable} ${arguments_.join(" ")} failed:\n${output.trim()}`,
          ),
        );
        return;
      }
      resolveResult(result);
    });
  });
}

function pinnedCliPath(): string {
  const packageJson = JSON.parse(
    readFileSync(
      join(PROJECT_ROOT, "node_modules/shadcn/package.json"),
      "utf8",
    ),
  ) as Readonly<{ version?: string }>;
  if (packageJson.version !== PINNED_SHADCN_VERSION) {
    fail(`Fixture setup requires pinned shadcn ${PINNED_SHADCN_VERSION}.`);
  }
  return join(PROJECT_ROOT, "node_modules/shadcn/dist/index.js");
}

async function createBaseUiFixture(temporaryRoot: string): Promise<string> {
  const name = "formmuse-public-installation-fixture";
  await run(
    process.execPath,
    [
      pinnedCliPath(),
      "init",
      "--template",
      "vite",
      "--base",
      "base",
      "--preset",
      "nova",
      "--name",
      name,
      "--cwd",
      temporaryRoot,
      "--yes",
      "--no-monorepo",
    ],
    PROJECT_ROOT,
  );
  return join(temporaryRoot, name);
}

async function configureFixturePackageManager(
  fixtureRoot: string,
  packageManager: PublicInstallationPackageManager,
): Promise<void> {
  const executable = {
    pnpm: "pnpm",
    npm: "npm",
    yarn: "yarn",
    bun: "bun",
  }[packageManager];
  const version = (
    await run(executable, ["--version"], dirname(fixtureRoot))
  ).output
    .trim()
    .split(/\s+/)
    .at(-1);
  if (!version) {
    fail(`Could not determine the ${packageManager} version for the fixture.`);
  }

  const packageJsonPath = join(fixtureRoot, "package.json");
  const packageJson = JSON.parse(
    readFileSync(packageJsonPath, "utf8"),
  ) as Record<string, unknown>;
  packageJson.packageManager = `${packageManager}@${version}`;
  writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);

  for (const path of [
    ".pnpmfile.mjs",
    "bun.lock",
    "bun.lockb",
    "package-lock.json",
    "pnpm-lock.yaml",
    "yarn.lock",
  ]) {
    rmSync(join(fixtureRoot, path), { force: true });
  }
  rmSync(join(fixtureRoot, "node_modules"), { recursive: true, force: true });
}

async function serveRegistry(registryDirectory: string): Promise<{
  url: string;
  close: () => Promise<void>;
}> {
  const server = createServer((request, response) => {
    const requestPath = new URL(
      request.url ?? "/",
      "http://localhost",
    ).pathname.replace(/^\/+/, "");
    const resolved = resolve(registryDirectory, requestPath);
    const relative = normalize(resolved).slice(
      normalize(registryDirectory).length,
    );

    if (
      relative.startsWith(`..${sep}`) ||
      relative === ".." ||
      !resolved.startsWith(`${registryDirectory}${sep}`) ||
      !existsSync(resolved)
    ) {
      response.writeHead(404).end();
      return;
    }

    response.writeHead(200, { "content-type": "application/json" });
    response.end(readFileSync(resolved));
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  if (!address || typeof address === "string") {
    fail(
      "The local public-installation registry server did not expose a port.",
    );
  }

  return {
    url: `http://127.0.0.1:${address.port}/${TEMPLATE_NAME}.json`,
    close: async () => {
      server.close();
      await once(server, "close");
    },
  };
}

async function main(): Promise<void> {
  const packageManager = selectedPackageManager();
  const temporaryRoot = mkdtempSync(join(tmpdir(), "formmuse-public-install."));

  try {
    const registryDirectory = join(temporaryRoot, "registry");
    buildRegistry({
      projectRoot: PROJECT_ROOT,
      deployEnvironment: "development",
      outputDirectory: registryDirectory,
    });
    const served = await serveRegistry(registryDirectory);
    try {
      const fixtureRoot = await createBaseUiFixture(temporaryRoot);
      await configureFixturePackageManager(fixtureRoot, packageManager);
      const command = publicInstallationCommand(packageManager, served.url);
      const invocation = [command.executable, ...command.arguments].join(" ");

      if (/--(?:yes|overwrite)\b/.test(invocation)) {
        fail(
          "Public compatibility commands must not suppress confirmation or overwrite.",
        );
      }

      const initial = await run(
        command.executable,
        command.arguments,
        fixtureRoot,
      );
      const conflictPath = CONFLICT_PATHS.map((path) =>
        join(fixtureRoot, path),
      ).find(existsSync);
      if (!conflictPath) {
        fail(
          `The public latest CLI did not install the expected template source:\n${initial.output.trim()}`,
        );
      }

      const sentinel = "// FormMuse public-command conflict sentinel\n";
      writeFileSync(conflictPath, sentinel, "utf8");
      const conflict = await run(
        command.executable,
        command.arguments,
        fixtureRoot,
        true,
      );
      const preserved = readFileSync(conflictPath, "utf8") === sentinel;

      if (
        !preserved ||
        !/(?:overwrite|conflict|already exists)/i.test(conflict.output)
      ) {
        fail(
          `The public latest CLI did not leave an existing adopter file visible and unchanged for conflict resolution (status ${conflict.status}, preserved ${preserved}):\n${conflict.output.trim()}`,
        );
      }

      process.stdout.write(
        `Verified ${invocation} with the current public CLI; initial install succeeded and the visible conflict preserved adopter-owned source.\n`,
      );
    } finally {
      await served.close();
    }
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

void main().catch((error: unknown) => {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
});
