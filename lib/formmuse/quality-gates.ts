export type QualityGateAvailability =
  | "foundation"
  | "stage-4.3"
  | "stage-4.4"
  | "stage-4.5"
  | "stage-4.6"
  | "stage-4.7"
  | "stage-4.8"
  | "stage-4.9"
  | "stage-4.10";

export type QualityGate = Readonly<{
  id: string;
  label: string;
  script: string;
  availability: QualityGateAvailability;
}>;

export const qualityGates = [
  {
    id: "format",
    label: "Tracked source formatting",
    script: "format:check",
    availability: "foundation",
  },
  {
    id: "types",
    label: "TypeScript",
    script: "typecheck",
    availability: "foundation",
  },
  {
    id: "lint",
    label: "ESLint and JSX accessibility linting",
    script: "lint",
    availability: "foundation",
  },
  {
    id: "unit",
    label: "Vitest and Testing Library",
    script: "test",
    availability: "foundation",
  },
  {
    id: "registry-validate",
    label: "Registry validation",
    script: "quality:registry-validate",
    availability: "foundation",
  },
  {
    id: "registry-build",
    label: "Registry generation",
    script: "registry:build",
    availability: "foundation",
  },
  {
    id: "installation-pinned",
    label: "Pinned shadcn installation smoke test",
    script: "test:registry-install",
    availability: "foundation",
  },
  {
    id: "static-export",
    label: "Guide data and static export",
    script: "quality:static-export",
    availability: "foundation",
  },
  {
    id: "generated-diff",
    label: "Generated output drift",
    script: "quality:generated-diff",
    availability: "foundation",
  },
  {
    id: "fixture-next",
    label: "Clean Next.js compatibility fixture",
    script: "quality:fixture-next",
    availability: "stage-4.3",
  },
  {
    id: "fixture-vite",
    label: "Clean Vite compatibility fixture",
    script: "quality:fixture-vite",
    availability: "stage-4.3",
  },
  {
    id: "browser",
    label: "Cross-engine and mobile-emulation browser integration",
    script: "quality:browser",
    availability: "stage-4.4",
  },
  {
    id: "visual",
    label: "Official visual regression",
    script: "quality:visual",
    availability: "stage-4.5",
  },
  {
    id: "accessibility",
    label: "Automated and manual accessibility evidence",
    script: "quality:accessibility",
    availability: "stage-4.6",
  },
  {
    id: "lighthouse",
    label: "Lighthouse laboratory audits",
    script: "quality:lighthouse",
    availability: "stage-4.7",
  },
  {
    id: "links",
    label: "Exported-site link crawl",
    script: "quality:links",
    availability: "stage-4.7",
  },
  {
    id: "security",
    label: "Supply-chain and generated-output security",
    script: "quality:security",
    availability: "stage-4.8",
  },
  {
    id: "installation-public",
    label: "Public shadcn command compatibility",
    script: "quality:installation-public",
    availability: "stage-4.9",
  },
  {
    id: "publication-report",
    label: "Machine-readable publication eligibility",
    script: "quality:publication-report",
    availability: "stage-4.10",
  },
] as const satisfies readonly QualityGate[];

export function foundationQualityGates(): readonly QualityGate[] {
  return qualityGates.filter((gate) => gate.availability === "foundation");
}

export type GateExecution = Readonly<{
  exitCode: number;
}>;

export function runQualityGates(
  gates: readonly QualityGate[],
  execute: (gate: QualityGate) => GateExecution,
  write: (message: string) => void,
): number {
  for (const gate of gates) {
    write(`[quality:start] ${gate.id} — ${gate.label}`);
    const result = execute(gate);
    if (result.exitCode !== 0) {
      write(`[quality:fail] ${gate.id} — exit ${result.exitCode}`);
      return result.exitCode;
    }
    write(`[quality:pass] ${gate.id}`);
  }
  write(`[quality:complete] ${gates.length} gate(s) passed`);
  return 0;
}
