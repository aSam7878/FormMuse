import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { hangingGiftsContactDocumentation } from "@/registry/base/hanging-gifts-contact/hanging-gifts-contact.documentation";

import type { TemplateInstallationModel } from "./template-installation";
import type { TemplatePageModel } from "./template-page";

export type TemplatePresentationModel = Readonly<{
  version: string;
  updated: string;
  examples: readonly Readonly<{
    title: string;
    description: string;
    path: string;
    source: string;
  }>[];
  props: TemplatePageModel["props"];
  usageNotes: readonly string[];
  accessibilityNotes: readonly string[];
  templateApiPath: "/docs/template-api";
  changelogPath: string;
  changelogSource: string;
  agentPrompt: string;
}>;

function readTemplateFile(pathname: string): string {
  const prefix = "registry/base/hanging-gifts-contact/";
  if (!pathname.startsWith(prefix)) {
    throw new Error(
      `Presentation source is outside the template root: ${pathname}`,
    );
  }

  return readFileSync(
    resolve(
      process.cwd(),
      "registry/base/hanging-gifts-contact",
      pathname.slice(prefix.length),
    ),
    "utf8",
  );
}

function exportedProps(source: string) {
  const interfaceMatch = source.match(
    /export interface HangingGiftsContactFormProps \{([\s\S]*?)\n\}/,
  );
  if (!interfaceMatch?.[1]) {
    throw new Error("The exported Hanging Gifts props contract is missing.");
  }

  return interfaceMatch[1]
    .split("\n")
    .map((line) => line.match(/^\s*([A-Za-z][A-Za-z0-9]*)(\?)?:\s*(.+);$/))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map((match) => ({
      name: match[1],
      required: match[2] !== "?",
      type: match[3].replace(/\s+/g, " "),
    }));
}

function assertPropsMatchExport(template: TemplatePageModel): void {
  const componentSource = readTemplateFile(
    "registry/base/hanging-gifts-contact/hanging-gifts-contact-form.tsx",
  );
  const exported = exportedProps(componentSource);
  const documented = template.props.map(({ name, required, type }) => ({
    name,
    required,
    type: type.replace(/\s+/g, " "),
  }));

  if (JSON.stringify(exported) !== JSON.stringify(documented)) {
    throw new Error(
      "Structured Props metadata must match the exported TypeScript contract exactly.",
    );
  }
}

function createAgentPrompt(
  template: TemplatePageModel,
  installation: TemplateInstallationModel,
): string {
  const handoff = hangingGiftsContactDocumentation.agentHandoff;
  return `Install and integrate the ${template.title} from ${installation.registryUrl}.

1. Inspect this project's framework, Tailwind CSS 4 setup, import aliases, and existing shadcn files before changing anything.
2. Run shadcn info when needed and confirm the project uses shadcn with Base UI. Do not migrate or reconfigure an existing Radix project automatically.
3. Inspect the registry item with shadcn tooling, then install only its declared files, dependencies, and Base UI controls through the selected CLI or documented Manual path.
4. Preserve adopter modifications. Never use overwrite or automatic-confirmation flags; stop and surface every file conflict for an explicit merge decision.
5. Import ${handoff.componentExport} from ${installation.importPath}. Use the exported ${handoff.schemaExport} and ${handoff.valuesTypeExport}, and connect the typed ${handoff.submissionProp} prop to this project's existing backend.
6. Keep raw backend errors, credentials, and response details out of visitor-facing UI. Reject safely so the template can show its generic failure state and explicit retry.
7. Run this target project's relevant format, typecheck, lint, test, and build commands, then report every changed file and unresolved conflict.`;
}

export function createTemplatePresentationModel(
  template: TemplatePageModel,
  installation: TemplateInstallationModel,
): TemplatePresentationModel {
  assertPropsMatchExport(template);
  const changelogPath =
    "registry/base/hanging-gifts-contact/changelog.md" as const;

  return {
    version: template.version,
    updated: template.updated,
    examples: template.examples.map((example) => ({
      ...example,
      source: readTemplateFile(example.path),
    })),
    props: template.props,
    usageNotes: template.usageNotes,
    accessibilityNotes: template.accessibilityNotes,
    templateApiPath: "/docs/template-api",
    changelogPath,
    changelogSource: readTemplateFile(changelogPath),
    agentPrompt: createAgentPrompt(template, installation),
  };
}
