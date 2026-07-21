import { z } from "zod";

const STABLE_SEMANTIC_VERSION_PATTERN =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const KEBAB_CASE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const nonEmptyTrimmedString = (label: string) =>
  z
    .string()
    .min(1, `${label} must not be empty.`)
    .refine((value) => value === value.trim(), {
      message: `${label} must not have surrounding whitespace.`,
    });

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function isISOCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const daysByMonth = [
    31,
    isLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  return month >= 1 && month <= 12 && day >= 1 && day <= daysByMonth[month - 1];
}

function isSafeRepositoryTsxPath(value: string): boolean {
  if (
    value.startsWith("/") ||
    value.includes("\\") ||
    !value.endsWith(".tsx")
  ) {
    return false;
  }

  const segments = value.split("/");

  return segments.every(
    (segment) =>
      segment !== "" &&
      segment !== "." &&
      segment !== ".." &&
      /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(segment),
  );
}

type UniqueArrayOptions = Readonly<{
  minimum?: number;
  duplicateMessage?: string;
}>;

export function uniqueArray<TSchema extends z.ZodType>(
  itemSchema: TSchema,
  keyFor: (value: z.output<TSchema>) => PropertyKey,
  options: UniqueArrayOptions = {},
) {
  const minimum = options.minimum ?? 0;
  const duplicateMessage =
    options.duplicateMessage ?? "Array values must be unique.";
  const schema = z.array(itemSchema).min(minimum);

  return schema.superRefine((values, context) => {
    const seen = new Set<PropertyKey>();

    values.forEach((value, index) => {
      const key = keyFor(value);

      if (seen.has(key)) {
        context.addIssue({
          code: "custom",
          message: duplicateMessage,
          path: [index],
        });
      } else {
        seen.add(key);
      }
    });
  });
}

export const SemanticVersionSchema = z
  .string()
  .regex(
    STABLE_SEMANTIC_VERSION_PATTERN,
    "Template Version must use stable major.minor.patch form.",
  );

export const ISOCalendarDateSchema = z
  .string()
  .refine(isISOCalendarDate, "Updated date must be a real YYYY-MM-DD date.");

export const KebabCaseSlugSchema = z
  .string()
  .regex(
    KEBAB_CASE_SLUG_PATTERN,
    "Value must be a normalized lowercase kebab-case slug.",
  );

export const TransportValueSchema = z.json(
  "Value must contain only Transport Values.",
);

export type TransportValue = z.infer<typeof TransportValueSchema>;

export const PrimaryCategorySchema = z.enum([
  "contact",
  "newsletter",
  "waitlist",
  "quote-request",
  "project-inquiry",
  "booking",
  "consultation",
  "feedback",
]);

export const FormMuseLayoutSchema = z.enum(["page"]);
export const FormMuseAnimationTechnologySchema = z.enum([
  "css",
  "motion",
  "gsap",
]);
export const FormMuseAppearanceSchema = z.enum(["light", "dark", "adaptive"]);
export const FormMusePublicationStatusSchema = z.enum([
  "draft",
  "published",
  "deprecated",
]);

const AnimationArraySchema = uniqueArray(
  FormMuseAnimationTechnologySchema,
  (value) => value,
  {
    minimum: 1,
    duplicateMessage: "Animation technologies must be unique.",
  },
);

const FieldsSchema = uniqueArray(KebabCaseSlugSchema, (value) => value, {
  minimum: 1,
  duplicateMessage: "Field slugs must be unique.",
});

const TagsSchema = uniqueArray(KebabCaseSlugSchema, (value) => value, {
  duplicateMessage: "Tag slugs must be unique.",
});

const PropSchema = z
  .strictObject({
    name: nonEmptyTrimmedString("Prop name"),
    type: nonEmptyTrimmedString("Prop type"),
    required: z.boolean(),
    description: nonEmptyTrimmedString("Prop description"),
    default: TransportValueSchema.optional(),
  })
  .superRefine((value, context) => {
    if (Object.hasOwn(value, "default") && value.default === undefined) {
      context.addIssue({
        code: "custom",
        message: "A documented prop default must be a Transport Value.",
        path: ["default"],
      });
    }
  });

const PropsSchema = uniqueArray(PropSchema, (value) => value.name, {
  minimum: 1,
  duplicateMessage: "Documented prop names must be unique.",
});

export const RepositoryTsxPathSchema = z
  .string()
  .refine(
    isSafeRepositoryTsxPath,
    "Example path must be a safe repository-relative .tsx path.",
  );

const ExampleSchema = z.strictObject({
  title: nonEmptyTrimmedString("Example title"),
  description: nonEmptyTrimmedString("Example description"),
  path: RepositoryTsxPathSchema,
});

const ExamplesSchema = uniqueArray(ExampleSchema, (value) => value.path, {
  minimum: 1,
  duplicateMessage: "Example paths must be unique.",
});

const UsageNotesSchema = z
  .array(nonEmptyTrimmedString("Usage note"))
  .min(1, "At least one usage note is required.");

const AccessibilityNotesSchema = z
  .array(nonEmptyTrimmedString("Accessibility note"))
  .min(1, "At least one accessibility note is required.");

const DeprecationSchema = z.strictObject({
  warning: nonEmptyTrimmedString("Deprecation warning"),
  replacement: KebabCaseSlugSchema.optional(),
  installable: z.boolean(),
});

const CommonFormMuseMetaShape = {
  layout: FormMuseLayoutSchema,
  animation: AnimationArraySchema,
  appearance: FormMuseAppearanceSchema,
  fields: FieldsSchema,
  tags: TagsSchema,
  version: SemanticVersionSchema,
  updated: ISOCalendarDateSchema,
  props: PropsSchema,
  examples: ExamplesSchema,
  usageNotes: UsageNotesSchema,
  accessibilityNotes: AccessibilityNotesSchema,
} as const;

export const FormMuseMetaSchema = z.discriminatedUnion("status", [
  z.strictObject({
    ...CommonFormMuseMetaShape,
    featured: z.literal(false),
    status: z.literal("draft"),
  }),
  z.strictObject({
    ...CommonFormMuseMetaShape,
    featured: z.boolean(),
    status: z.literal("published"),
  }),
  z.strictObject({
    ...CommonFormMuseMetaShape,
    featured: z.literal(false),
    status: z.literal("deprecated"),
    deprecation: DeprecationSchema,
  }),
]);

export type FormMuseMeta = z.infer<typeof FormMuseMetaSchema>;

export const FormMuseRegistryBoundarySchema = z
  .strictObject({
    categories: z.tuple([PrimaryCategorySchema]),
    meta: z.strictObject({
      formmuse: FormMuseMetaSchema,
    }),
  })
  .superRefine((value, context) => {
    const primaryCategory = value.categories[0];
    const duplicateTagIndex = value.meta.formmuse.tags.indexOf(primaryCategory);

    if (duplicateTagIndex >= 0) {
      context.addIssue({
        code: "custom",
        message: "Primary Category must not be duplicated as a FormMuse tag.",
        path: ["meta", "formmuse", "tags", duplicateTagIndex],
      });
    }
  });

export type FormMuseRegistryBoundary = z.infer<
  typeof FormMuseRegistryBoundarySchema
>;

export function validateFormMuseRegistryBoundary(
  value: unknown,
): FormMuseRegistryBoundary {
  return FormMuseRegistryBoundarySchema.parse(value);
}
