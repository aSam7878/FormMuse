import { spawn, type ChildProcess } from "node:child_process";

const servers: ChildProcess[] = [];

function start(port: number): ChildProcess {
  const server = spawn(
    "pnpm",
    ["exec", "serve", "out", "-l", String(port), "--no-clipboard"],
    { stdio: "inherit" },
  );
  servers.push(server);
  return server;
}

function stop(): void {
  for (const server of servers) {
    if (!server.killed) server.kill("SIGTERM");
  }
}

process.once("SIGINT", () => {
  stop();
  process.exit(130);
});
process.once("SIGTERM", () => {
  stop();
  process.exit(143);
});
process.once("exit", stop);

const site = start(3100);
const preview = start(3101);

await Promise.race(
  [site, preview].map(
    (server) =>
      new Promise<never>((_, reject) => {
        server.once("error", reject);
        server.once("exit", (code, signal) => {
          reject(
            new Error(
              `Static origin server exited unexpectedly (${code ?? signal}).`,
            ),
          );
        });
      }),
  ),
).finally(stop);
