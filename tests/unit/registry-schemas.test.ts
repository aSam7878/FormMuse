import { describe, expect, expectTypeOf, it } from "vitest";

import {
  FormMuseMetaSchema,
  FormMuseRegistryBoundarySchema,
  ISOCalendarDateSchema,
  KebabCaseSlugSchema,
  SemanticVersionSchema,
  TransportValueSchema,
  uniqueArray,
  validateFormMuseRegistryBoundary,
  type FormMuseMeta,
  type FormMuseRegistryBoundary,
  type TransportValue,
} from "../../lib/formmuse/registry-schemas";

const publishedMeta = {
  layout: "page",
  animation: ["css", "motion", "gsap"],
  appearance: "light",
  fields: ["first-name", "email", "message"],
  tags: ["playful", "single-step"],
  featured: true,
  status: "published",
  version: "1.0.0",
  updated: "2026-07-22",
  props: [
    {
      name: "onSubmit",
      type: "(values: FormValues) => Promise<void>",
      required: true,
      description: "Connects validated values to an adopter-owned backend.",
    },
    {
      name: "assetBaseUrl",
      type: "string",
      required: false,
      description: "Overrides the root-relative local asset directory.",
      default: "/formmuse/hanging-gifts-contact",
    },
  ],
  examples: [
    {
      title: "Basic usage",
      description: "Connects the template to an asynchronous submit handler.",
      path: "examples/hanging-gifts-contact-basic.tsx",
    },
  ],
  usageNotes: ["Replace the demonstration submit handler before deployment."],
  accessibilityNotes: [
    "Preserve the programmatic labels and error associations when editing fields.",
  ],
} as const;

function boundaryWith(meta: unknown, categories: unknown = ["contact"]) {
  return {
    categories,
    meta: { formmuse: meta },
  };
}

describe("reusable registry validators", () => {
  it.each(["0.0.0", "1.0.0", "10.20.30"])(
    "accepts stable semantic version %s",
    (version) => {
      expect(SemanticVersionSchema.parse(version)).toBe(version);
    },
  );

  it.each([
    "1.0",
    "1.0.0.0",
    "01.0.0",
    "1.00.0",
    "1.0.00",
    "v1.0.0",
    "1.0.0-alpha.1",
    "1.0.0+build.1",
    " 1.0.0",
  ])("rejects unsupported semantic version %s", (version) => {
    expect(SemanticVersionSchema.safeParse(version).success).toBe(false);
  });

  it.each(["2024-02-29", "2026-07-22", "2000-02-29"])(
    "accepts real ISO calendar date %s",
    (date) => {
      expect(ISOCalendarDateSchema.parse(date)).toBe(date);
    },
  );

  it.each([
    "2023-02-29",
    "1900-02-29",
    "2026-00-10",
    "2026-13-10",
    "2026-04-31",
    "2026-7-22",
    "22-07-2026",
    "2026-07-22T00:00:00Z",
  ])("rejects malformed or impossible calendar date %s", (date) => {
    expect(ISOCalendarDateSchema.safeParse(date).success).toBe(false);
  });

  it.each(["contact", "first-name", "field-2"])(
    "accepts normalized kebab-case slug %s",
    (slug) => {
      expect(KebabCaseSlugSchema.parse(slug)).toBe(slug);
    },
  );

  it.each(["", "Contact", "first_name", "first name", "-contact", "contact-"])(
    "rejects invalid kebab-case slug %s",
    (slug) => {
      expect(KebabCaseSlugSchema.safeParse(slug).success).toBe(false);
    },
  );

  it("accepts recursively transport-friendly values without semantic loss", () => {
    const value = {
      string: "value",
      number: 42.5,
      boolean: true,
      nullable: null,
      array: ["one", 2, false, null],
      object: { nested: "value" },
    };
    const parsed = TransportValueSchema.parse(value);

    expect(JSON.parse(JSON.stringify(parsed))).toEqual(parsed);
    expectTypeOf(parsed).toEqualTypeOf<TransportValue>();
  });

  it.each([
    undefined,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    BigInt(1),
    new Date("2026-07-22T00:00:00Z"),
    new Map(),
    new Set(),
    () => undefined,
    { nested: undefined },
  ])("rejects non-Transport Value %#", (value) => {
    expect(TransportValueSchema.safeParse(value).success).toBe(false);
  });

  it("reports duplicate values through the reusable unique-array validator", () => {
    const schema = uniqueArray(KebabCaseSlugSchema, (value) => value, {
      minimum: 1,
    });

    expect(schema.safeParse([]).success).toBe(false);
    expect(schema.safeParse(["email", "message"]).success).toBe(true);
    expect(schema.safeParse(["email", "email"]).success).toBe(false);
  });
});

describe("FormMuseMetaSchema", () => {
  it("parses valid published metadata and exposes its inferred type", () => {
    const parsed = FormMuseMetaSchema.parse(publishedMeta);

    expect(parsed).toEqual(publishedMeta);
    expectTypeOf(parsed).toEqualTypeOf<FormMuseMeta>();
    expectTypeOf<FormMuseMeta["status"]>().toEqualTypeOf<
      "draft" | "published" | "deprecated"
    >();
  });

  it("accepts a non-featured draft without deprecation data", () => {
    expect(
      FormMuseMetaSchema.safeParse({
        ...publishedMeta,
        featured: false,
        status: "draft",
      }).success,
    ).toBe(true);
  });

  it.each([true, false])(
    "accepts deprecated metadata with installable=%s",
    (installable) => {
      expect(
        FormMuseMetaSchema.safeParse({
          ...publishedMeta,
          featured: false,
          status: "deprecated",
          deprecation: {
            warning: "Use the replacement for new installations.",
            replacement: "hanging-gifts-contact-v2",
            installable,
          },
        }).success,
      ).toBe(true);
    },
  );

  it.each([
    { ...publishedMeta, extra: true },
    {
      ...publishedMeta,
      props: [{ ...publishedMeta.props[0], extra: true }],
    },
    {
      ...publishedMeta,
      examples: [{ ...publishedMeta.examples[0], extra: true }],
    },
  ])("rejects unknown metadata and documentation keys", (meta) => {
    expect(FormMuseMetaSchema.safeParse(meta).success).toBe(false);
  });

  it.each([
    { ...publishedMeta, layout: "full-page" },
    { ...publishedMeta, animation: ["framer-motion"] },
    { ...publishedMeta, animation: ["css", "css"] },
    { ...publishedMeta, animation: [] },
    { ...publishedMeta, appearance: "playful" },
    { ...publishedMeta, status: "Published" },
  ])(
    "rejects uncontrolled vocabulary or duplicate animation values",
    (meta) => {
      expect(FormMuseMetaSchema.safeParse(meta).success).toBe(false);
    },
  );

  it.each([
    { ...publishedMeta, fields: [] },
    { ...publishedMeta, fields: ["first-name", "first-name"] },
    { ...publishedMeta, fields: ["firstName"] },
    { ...publishedMeta, tags: ["single-step", "single-step"] },
    { ...publishedMeta, tags: ["Single-Step"] },
  ])("rejects invalid, empty, or duplicate field and tag slugs", (meta) => {
    expect(FormMuseMetaSchema.safeParse(meta).success).toBe(false);
  });

  it.each([
    { ...publishedMeta, props: [] },
    {
      ...publishedMeta,
      props: [publishedMeta.props[0], publishedMeta.props[0]],
    },
    {
      ...publishedMeta,
      props: [{ ...publishedMeta.props[0], description: " description" }],
    },
    {
      ...publishedMeta,
      props: [{ ...publishedMeta.props[1], default: undefined }],
    },
    { ...publishedMeta, examples: [] },
    {
      ...publishedMeta,
      examples: [publishedMeta.examples[0], publishedMeta.examples[0]],
    },
    {
      ...publishedMeta,
      examples: [{ ...publishedMeta.examples[0], path: "../outside.tsx" }],
    },
    {
      ...publishedMeta,
      examples: [{ ...publishedMeta.examples[0], path: "/absolute.tsx" }],
    },
    { ...publishedMeta, usageNotes: [] },
    { ...publishedMeta, accessibilityNotes: [" "] },
  ])("rejects malformed structured documentation metadata", (meta) => {
    expect(FormMuseMetaSchema.safeParse(meta).success).toBe(false);
  });

  it.each([
    { ...publishedMeta, featured: true, status: "draft" },
    {
      ...publishedMeta,
      featured: false,
      status: "draft",
      deprecation: {
        warning: "Not allowed for a draft.",
        installable: false,
      },
    },
    {
      ...publishedMeta,
      deprecation: {
        warning: "Not allowed for a published record.",
        installable: true,
      },
    },
    { ...publishedMeta, featured: false, status: "deprecated" },
    {
      ...publishedMeta,
      featured: true,
      status: "deprecated",
      deprecation: {
        warning: "Deprecated records cannot be featured.",
        installable: true,
      },
    },
    {
      ...publishedMeta,
      featured: false,
      status: "deprecated",
      deprecation: {
        warning: "Unknown lifecycle data is rejected.",
        installable: false,
        reason: "compatibility",
      },
    },
  ])("enforces lifecycle-specific deprecation and featured rules", (meta) => {
    expect(FormMuseMetaSchema.safeParse(meta).success).toBe(false);
  });
});

describe("FormMuse registry boundary", () => {
  it("parses exactly one authoritative top-level category", () => {
    const parsed = validateFormMuseRegistryBoundary(
      boundaryWith(publishedMeta),
    );

    expect(parsed.categories).toEqual(["contact"]);
    expectTypeOf(parsed).toEqualTypeOf<FormMuseRegistryBoundary>();
  });

  it.each([[[]], [["contact", "newsletter"]], [["unknown-category"]]])(
    "rejects invalid Primary Category tuple %#",
    (categories) => {
      expect(
        FormMuseRegistryBoundarySchema.safeParse(
          boundaryWith(publishedMeta, categories),
        ).success,
      ).toBe(false);
    },
  );

  it("rejects the Primary Category when duplicated as a tag", () => {
    expect(
      FormMuseRegistryBoundarySchema.safeParse(
        boundaryWith({
          ...publishedMeta,
          tags: ["playful", "contact"],
        }),
      ).success,
    ).toBe(false);
  });

  it.each([
    { ...boundaryWith(publishedMeta), title: "Standard field" },
    {
      categories: ["contact"],
      meta: { formmuse: publishedMeta, extra: true },
    },
  ])("rejects unknown keys at the strict validation boundary", (boundary) => {
    expect(FormMuseRegistryBoundarySchema.safeParse(boundary).success).toBe(
      false,
    );
  });
});
