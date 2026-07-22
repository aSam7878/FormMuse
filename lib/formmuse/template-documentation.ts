import { z } from "zod";
import { registryItemSchema } from "shadcn/schema";

import {
  RepositoryTsxPathSchema,
  validateFormMuseRegistryBoundary,
} from "./registry-schemas";

const nonEmptyTrimmedString = (label: string) =>
  z
    .string()
    .min(1, `${label} must not be empty.`)
    .refine((value) => value === value.trim(), {
      message: `${label} must not have surrounding whitespace.`,
    });

const RepositoryPathSchema = z.string().refine((value) => {
  if (value.startsWith("/") || value.includes("\\")) {
    return false;
  }

  return value
    .split("/")
    .every(
      (segment) =>
        segment !== "" &&
        segment !== "." &&
        segment !== ".." &&
        /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(segment),
    );
}, "Path must be a safe repository-relative path.");

const uniqueBy = <TSchema extends z.ZodType>(
  schema: TSchema,
  keyFor: (value: z.output<TSchema>) => string,
) =>
  z
    .array(schema)
    .min(1)
    .superRefine((values, context) => {
      const seen = new Set<string>();

      values.forEach((value, index) => {
        const key = keyFor(value);
        if (seen.has(key)) {
          context.addIssue({
            code: "custom",
            message: "Documentation keys must be unique.",
            path: [index],
          });
        }
        seen.add(key);
      });
    });

const FileNoteSchema = z.strictObject({
  path: RepositoryPathSchema,
  kind: z.enum(["source", "stylesheet", "asset"]),
  purpose: nonEmptyTrimmedString("File purpose"),
});

const DependencyNoteSchema = z.strictObject({
  dependency: nonEmptyTrimmedString("Dependency"),
  purpose: nonEmptyTrimmedString("Dependency purpose"),
});

const RegistryDependencyNoteSchema = z.strictObject({
  dependency: nonEmptyTrimmedString("Registry dependency"),
  purpose: nonEmptyTrimmedString("Registry dependency purpose"),
});

const InstallationStepSchema = z.strictObject({
  title: nonEmptyTrimmedString("Installation step title"),
  instruction: nonEmptyTrimmedString("Installation step instruction"),
});

export const TemplateDocumentationInputSchema = z.strictObject({
  manualInstallation: z.strictObject({
    files: uniqueBy(FileNoteSchema, (value) => value.path),
    dependencies: uniqueBy(DependencyNoteSchema, (value) => value.dependency),
    registryDependencies: uniqueBy(
      RegistryDependencyNoteSchema,
      (value) => value.dependency,
    ),
    stylesheetAndAnimationSteps: z.array(InstallationStepSchema).min(1),
    importPath: nonEmptyTrimmedString("Template import path"),
    finalUsageExamplePath: RepositoryTsxPathSchema,
  }),
  agentHandoff: z.strictObject({
    componentExport: nonEmptyTrimmedString("Component export"),
    schemaExport: nonEmptyTrimmedString("Schema export"),
    valuesTypeExport: nonEmptyTrimmedString("Values type export"),
    submissionProp: z.literal("onSubmit"),
  }),
});

export type TemplateDocumentationInput = z.input<
  typeof TemplateDocumentationInputSchema
>;

function assertExactCoverage(
  actual: readonly string[],
  documented: readonly string[],
  label: string,
): void {
  const sortedActual = [...actual].sort();
  const sortedDocumented = [...documented].sort();

  if (JSON.stringify(sortedActual) !== JSON.stringify(sortedDocumented)) {
    throw new Error(`${label} must cover the Registry Record exactly.`);
  }
}

export function createTemplateDocumentation(
  registryItemValue: unknown,
  inputValue: unknown,
) {
  const registryItem = registryItemSchema.parse(registryItemValue);
  const input = TemplateDocumentationInputSchema.parse(inputValue);
  const boundary = validateFormMuseRegistryBoundary({
    categories: registryItem.categories,
    meta: registryItem.meta,
  });
  const files = registryItem.files ?? [];
  const dependencies = registryItem.dependencies ?? [];
  const registryDependencies = registryItem.registryDependencies ?? [];

  assertExactCoverage(
    files.map((file) => file.path),
    input.manualInstallation.files.map((file) => file.path),
    "Manual file notes",
  );
  assertExactCoverage(
    dependencies,
    input.manualInstallation.dependencies.map(
      (dependency) => dependency.dependency,
    ),
    "Manual npm dependency notes",
  );
  assertExactCoverage(
    registryDependencies,
    input.manualInstallation.registryDependencies.map(
      (dependency) => dependency.dependency,
    ),
    "Manual registry dependency notes",
  );

  if (
    !boundary.meta.formmuse.examples.some(
      (example) =>
        example.path === input.manualInstallation.finalUsageExamplePath,
    )
  ) {
    throw new Error(
      "The final usage example must be referenced by FormMuse metadata.",
    );
  }

  const fileNotes = new Map(
    input.manualInstallation.files.map((file) => [file.path, file]),
  );
  const dependencyNotes = new Map(
    input.manualInstallation.dependencies.map((dependency) => [
      dependency.dependency,
      dependency,
    ]),
  );
  const registryDependencyNotes = new Map(
    input.manualInstallation.registryDependencies.map((dependency) => [
      dependency.dependency,
      dependency,
    ]),
  );

  return {
    slug: registryItem.name,
    fields: boundary.meta.formmuse.fields,
    props: boundary.meta.formmuse.props,
    usageNotes: boundary.meta.formmuse.usageNotes,
    accessibilityNotes: boundary.meta.formmuse.accessibilityNotes,
    manualInstallation: {
      files: files.map((file) => {
        const note = fileNotes.get(file.path);
        if (!note) {
          throw new Error(`Manual file note is missing for ${file.path}.`);
        }

        return { ...file, kind: note.kind, purpose: note.purpose };
      }),
      dependencies: dependencies.map((dependency) => {
        const note = dependencyNotes.get(dependency);
        if (!note) {
          throw new Error(
            `Manual npm dependency note is missing for ${dependency}.`,
          );
        }

        return { dependency, purpose: note.purpose };
      }),
      registryDependencies: registryDependencies.map((dependency) => {
        const note = registryDependencyNotes.get(dependency);
        if (!note) {
          throw new Error(
            `Manual registry dependency note is missing for ${dependency}.`,
          );
        }

        return { dependency, purpose: note.purpose };
      }),
      stylesheetAndAnimationSteps:
        input.manualInstallation.stylesheetAndAnimationSteps,
      importPath: input.manualInstallation.importPath,
      finalUsageExamplePath: input.manualInstallation.finalUsageExamplePath,
    },
    agentHandoff: input.agentHandoff,
  } as const;
}
