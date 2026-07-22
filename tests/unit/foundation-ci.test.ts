import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const projectRoot = resolve(process.cwd());

function read(path: string): string {
  return readFileSync(resolve(projectRoot, path), "utf8");
}

const EXPECTED_ACTION_PINS = new Map([
  ["actions/checkout", "3d3c42e5aac5ba805825da76410c181273ba90b1"],
  ["actions/setup-node", "820762786026740c76f36085b0efc47a31fe5020"],
  [
    "actions/dependency-review-action",
    "a1d282b36b6f3519aa1f3fc636f609c47dddb294",
  ],
  ["github/codeql-action/init", "e4fba868fa4b1b91e1fdab776edc8cfbe6e9fb81"],
  ["github/codeql-action/analyze", "e4fba868fa4b1b91e1fdab776edc8cfbe6e9fb81"],
]);

describe("foundation CI source", () => {
  it("pins every action use to the reviewed immutable commit", () => {
    const workflows = [
      read(".github/workflows/ci.yml"),
      read(".github/workflows/codeql.yml"),
    ].join("\n");
    const uses = [...workflows.matchAll(/^\s*uses:\s*([^@\s]+)@([^\s#]+)/gmu)];

    expect(uses.length).toBeGreaterThan(0);
    for (const match of uses) {
      expect(match[2]).toMatch(/^[0-9a-f]{40}$/);
      expect(EXPECTED_ACTION_PINS.get(match[1])).toBe(match[2]);
    }
    expect(new Set(uses.map((match) => match[1]))).toEqual(
      new Set(EXPECTED_ACTION_PINS.keys()),
    );
  });

  it("uses the pinned toolchain and complete Stage 1 source gate", () => {
    const workflow = read(".github/workflows/ci.yml");

    expect(workflow).toContain("node-version: 24.18.0");
    expect(workflow).toContain("pnpm install --frozen-lockfile");
    for (const command of [
      "pnpm format:check",
      "pnpm typecheck",
      "pnpm lint",
      "pnpm test",
      "pnpm registry:build",
      "pnpm guides:build",
      "pnpm static-data:fixture",
      "pnpm build",
      "git diff --exit-code -- .",
    ]) {
      expect(workflow).toContain(`run: ${command}`);
    }
  });

  it("keeps pull-request execution least-privileged and credential-free", () => {
    const workflows = [
      read(".github/workflows/ci.yml"),
      read(".github/workflows/codeql.yml"),
    ].join("\n");

    expect(workflows).not.toContain("pull_request_target");
    expect(workflows).not.toContain("${{ secrets.");
    expect(workflows).not.toMatch(/permissions:\s*write-all/);
    expect(workflows).toContain("persist-credentials: false");
    expect(workflows).toContain("contents: read");
    expect(workflows).toContain("security-events: write");
  });

  it("defines fail-closed dependency and generated-output review gates", () => {
    const workflow = read(".github/workflows/ci.yml");

    expect(workflow).toContain("fail-on-severity: high");
    expect(workflow).toContain("license-check: true");
    expect(workflow).toContain("vulnerability-check: true");
    expect(workflow).toContain("comment-summary-in-pr: never");
    expect(workflow).toContain("git diff --exit-code -- .");
  });
});

describe("repository security source", () => {
  it("configures reviewed update proposals without auto-merge", () => {
    const dependabot = read(".github/dependabot.yml");

    expect(dependabot).toContain("package-ecosystem: npm");
    expect(dependabot).toContain("package-ecosystem: github-actions");
    expect(dependabot).not.toMatch(/auto-?merge/i);
  });

  it("documents every owner-only setting without claiming it is enabled", () => {
    const baseline = read("docs/security/repository-security-baseline.md");

    for (const control of [
      "dependency graph",
      "Dependabot alerts",
      "Dependency Review",
      "CodeQL",
      "secret scanning",
      "push protection",
      "Protect `main`",
      "Actions default token permission",
    ]) {
      expect(baseline).toContain(control);
    }
    expect(baseline).toContain(
      "Its presence does not claim that an account-dependent feature is enabled.",
    );
  });

  it("scopes formatting to tracked source without owner-local path inventories", () => {
    const script = read("scripts/check-format.mts");
    const packageJson = JSON.parse(read("package.json")) as {
      scripts: Record<string, string>;
    };

    expect(script).toContain('spawnSync("git", ["ls-files", "-z", "--cached"]');
    expect(script).not.toContain("/Users/");
    expect(script).not.toContain("website-v2");
    expect(packageJson.scripts.format).toContain(
      "scripts/check-format.mts --write",
    );
    expect(packageJson.scripts["format:check"]).toBe(
      "node --import tsx scripts/check-format.mts",
    );
  });
});
