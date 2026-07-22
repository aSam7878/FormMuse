import { z } from "zod";

export const GUIDE_CONTENT_DIRECTORY = "content/guides";

export const GUIDE_SLUGS = [
  "introduction",
  "installation",
  "template-api",
  "connecting-a-backend",
  "customizing-templates",
  "using-with-agents",
  "accessibility",
  "changelog",
] as const;

export const GuideSlugSchema = z.enum(GUIDE_SLUGS);

export type GuideSlug = z.infer<typeof GuideSlugSchema>;

type GuideDefinitionRecord = Readonly<{
  slug: GuideSlug;
  title: string;
  description: string;
  sourcePath: `${typeof GUIDE_CONTENT_DIRECTORY}/${GuideSlug}.mdx`;
  route: `/docs/${GuideSlug}`;
}>;

export const GUIDE_DEFINITIONS = [
  {
    slug: "introduction",
    title: "Introduction",
    description:
      "Learn what FormMuse is and how its copy-paste Form Templates work.",
    sourcePath: "content/guides/introduction.mdx",
    route: "/docs/introduction",
  },
  {
    slug: "installation",
    title: "Installation",
    description:
      "Install FormMuse templates through shadcn Base UI and manual source copy paths.",
    sourcePath: "content/guides/installation.mdx",
    route: "/docs/installation",
  },
  {
    slug: "template-api",
    title: "Template API",
    description:
      "Understand the shared props, values, validation, submission, and reset contract.",
    sourcePath: "content/guides/template-api.mdx",
    route: "/docs/template-api",
  },
  {
    slug: "connecting-a-backend",
    title: "Connecting a Backend",
    description:
      "Connect FormMuse templates to adopter-owned form handlers and services.",
    sourcePath: "content/guides/connecting-a-backend.mdx",
    route: "/docs/connecting-a-backend",
  },
  {
    slug: "customizing-templates",
    title: "Customizing Templates",
    description:
      "Customize installed source while preserving accessibility and portability.",
    sourcePath: "content/guides/customizing-templates.mdx",
    route: "/docs/customizing-templates",
  },
  {
    slug: "using-with-agents",
    title: "Using FormMuse with Agents",
    description:
      "Give coding agents enough context to install and adapt templates safely.",
    sourcePath: "content/guides/using-with-agents.mdx",
    route: "/docs/using-with-agents",
  },
  {
    slug: "accessibility",
    title: "Accessibility",
    description:
      "Review the accessibility contract shared by FormMuse templates and previews.",
    sourcePath: "content/guides/accessibility.mdx",
    route: "/docs/accessibility",
  },
  {
    slug: "changelog",
    title: "Changelog",
    description:
      "Track FormMuse project and template-level changes without coupling template versions to the repository release.",
    sourcePath: "content/guides/changelog.mdx",
    route: "/docs/changelog",
  },
] as const satisfies readonly GuideDefinitionRecord[];

export const GuideFrontmatterSchema = z
  .object({
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
  })
  .strict();

export type GuideFrontmatter = z.infer<typeof GuideFrontmatterSchema>;

export type GuideDefinition = (typeof GUIDE_DEFINITIONS)[number];

export function isGuideSlug(value: string): value is GuideSlug {
  return GuideSlugSchema.safeParse(value).success;
}

export function guideDefinitionForSlug(slug: GuideSlug): GuideDefinition {
  const definition = GUIDE_DEFINITIONS.find((guide) => guide.slug === slug);

  if (!definition) {
    throw new Error(`Unknown FormMuse guide slug: ${slug}`);
  }

  return definition;
}
