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
  ["actions/upload-artifact", "ea165f8d65b6e75b540449e92b4886f43607fa02"],
  ["oven-sh/setup-bun", "0c5077e51419868618aeaa5fe8019c62421857d6"],
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
      read(".github/workflows/latest-shadcn-compatibility.yml"),
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

  it("uses the pinned toolchain and canonical local/CI quality profile", () => {
    const workflow = read(".github/workflows/ci.yml");

    expect(workflow).toContain("node-version: 24.18.0");
    expect(workflow).toContain("pnpm install --frozen-lockfile");
    expect(workflow).toContain("run: pnpm quality:foundation");
    expect(workflow).not.toContain("run: pnpm test\n");
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
    const packageJson = JSON.parse(read("package.json")) as {
      scripts: Record<string, string>;
    };

    expect(workflow).toContain("fail-on-severity: high");
    expect(workflow).toContain("license-check: true");
    expect(workflow).toContain("vulnerability-check: true");
    expect(workflow).toContain("comment-summary-in-pr: never");
    expect(packageJson.scripts["quality:generated-diff"]).toBe(
      "git diff --exit-code -- .",
    );
    expect(workflow).toContain(
      "name: Supply-chain and generated-output security",
    );
    expect(workflow).toContain("run: pnpm quality:security");
  });

  it("compares a reviewed visual baseline without updating it in CI", () => {
    const workflow = read(".github/workflows/ci.yml");
    const visualConfig = read("playwright.visual.config.ts");
    const packageJson = JSON.parse(read("package.json")) as {
      scripts: Record<string, string>;
    };

    expect(workflow).toContain("name: Official Chromium visual baseline");
    expect(workflow).toContain("runs-on: ubuntu-24.04");
    expect(workflow).toContain(
      "pnpm exec playwright install --with-deps chromium",
    );
    expect(workflow).toContain("run: pnpm quality:visual");
    expect(workflow).not.toContain("--update-snapshots");
    expect(packageJson.scripts["quality:visual"]).toBe("pnpm test:visual");
    expect(visualConfig).toContain('locale: "en-US"');
    expect(visualConfig).toContain('timezoneId: "UTC"');
    expect(visualConfig).toContain("deviceScaleFactor: 1");
    expect(visualConfig).toContain('name: "chromium-ubuntu-24.04"');
  });

  it("keeps latest public CLI compatibility outside pull-request CI", () => {
    const workflow = read(".github/workflows/latest-shadcn-compatibility.yml");

    expect(workflow).toContain("schedule:");
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).not.toContain("pull_request:");
    expect(workflow).toContain("manager: [pnpm, npm, yarn, bun]");
    expect(workflow).toContain("pnpm quality:installation-public --manager");
    expect(workflow).toContain("COREPACK_ENABLE_PROJECT_SPEC:");
    expect(workflow).toContain("if: matrix.manager == 'yarn'");
    expect(workflow).toContain("if: matrix.manager == 'bun'");
    expect(workflow).not.toContain("npm install --global bun");
  });

  it("generates complete reproducible publication evidence in CI", () => {
    const workflow = read(".github/workflows/ci.yml");
    const packageJson = JSON.parse(read("package.json")) as {
      scripts: Record<string, string>;
    };

    expect(workflow).toContain("name: Reproducible publication evidence");
    expect(workflow).toContain(
      "needs: [source, visual, site-quality, security]",
    );
    expect(workflow).toContain(
      "pnpm exec playwright install --with-deps chromium firefox webkit",
    );
    expect(workflow).toContain("run: pnpm quality:publication-report:ci");
    expect(packageJson.scripts["quality:publication-report"]).toBe(
      "node --import tsx scripts/generate-publication-report.mts",
    );
    expect(packageJson.scripts["quality:publication-report:ci"]).toBe(
      "node --import tsx scripts/generate-publication-report.mts --allow-draft-failures",
    );
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
