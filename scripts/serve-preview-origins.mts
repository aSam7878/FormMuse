import { spawn, type ChildProcess } from "node:child_process";
import {
  createServer,
  request,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from "node:http";

import {
  PREVIEW_CONTENT_SECURITY_POLICY,
  PREVIEW_PERMISSIONS_POLICY,
} from "../lib/formmuse/preview-security";

const backendPort = 3199;
const servers: Server[] = [];
let backend: ChildProcess | undefined;

function previewPathAllowed(pathname: string): boolean {
  return ["/preview/", "/_next/", "/formmuse/"].some((prefix) =>
    pathname.startsWith(prefix),
  );
}

function proxy(
  incoming: IncomingMessage,
  outgoing: ServerResponse,
  previewOnly: boolean,
  siteOrigin: string,
): void {
  const pathname = new URL(incoming.url ?? "/", "http://local").pathname;
  if (previewOnly && !previewPathAllowed(pathname)) {
    outgoing.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    outgoing.end("Preview origin exposes preview documents and assets only.");
    return;
  }
  const upstream = request(
    {
      hostname: "127.0.0.1",
      port: backendPort,
      path: incoming.url,
      method: incoming.method,
      headers: { ...incoming.headers, host: `127.0.0.1:${backendPort}` },
    },
    (response) => {
      const headers = { ...response.headers };
      if (previewOnly && pathname.startsWith("/preview/")) {
        headers["content-security-policy"] =
          `${PREVIEW_CONTENT_SECURITY_POLICY}; frame-ancestors ${siteOrigin}`;
        headers["permissions-policy"] = PREVIEW_PERMISSIONS_POLICY;
        headers["referrer-policy"] = "no-referrer";
        headers["x-content-type-options"] = "nosniff";
      }
      outgoing.writeHead(response.statusCode ?? 502, headers);
      response.pipe(outgoing);
    },
  );
  upstream.on("error", (error) => {
    outgoing.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
    outgoing.end(`Static preview proxy failed: ${error.message}`);
  });
  incoming.pipe(upstream);
}

async function waitForBackend(): Promise<void> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${backendPort}/`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Static export backend did not start.");
}

function stop(): void {
  for (const server of servers) server.close();
  if (backend && !backend.killed) backend.kill("SIGTERM");
}

const configuredSiteOrigin = process.env.FORMMUSE_SITE_URL;
if (!configuredSiteOrigin) {
  throw new Error("FORMMUSE_SITE_URL is required by the dual-origin server.");
}
const siteOrigin = new URL(configuredSiteOrigin).origin;

backend = spawn(
  "pnpm",
  ["exec", "serve", "out", "-l", String(backendPort), "--no-clipboard"],
  { stdio: "inherit" },
);
backend.once("error", (error) => {
  throw error;
});

await waitForBackend();

for (const [port, previewOnly] of [
  [3100, false],
  [3101, true],
] as const) {
  const server = createServer((incoming, outgoing) =>
    proxy(incoming, outgoing, previewOnly, siteOrigin),
  );
  servers.push(server);
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", resolve);
  });
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

await new Promise<never>((_, reject) => {
  backend?.once("exit", (code, signal) => {
    reject(
      new Error(
        `Static export backend exited unexpectedly (${code ?? signal}).`,
      ),
    );
  });
});
