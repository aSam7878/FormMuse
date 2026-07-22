import type { StructuredData } from "fumadocs-core/mdx-plugins/remark-structure";
import type { TOCItemType } from "fumadocs-core/toc";
import type { MDXContent } from "mdx/types";
import { guides as guideCollection } from "collections/server";

import {
  GUIDE_DEFINITIONS,
  GuideFrontmatterSchema,
  isGuideSlug,
  type GuideSlug,
} from "./guide-contract";

type FumadocsGuidePage = Readonly<{
  title: string;
  description?: string;
  body: MDXContent;
  structuredData: StructuredData;
  toc: TOCItemType[];
  info: Readonly<{
    path: string;
    fullPath: string;
  }>;
  getText: (type: "raw" | "processed") => Promise<string>;
}>;

export type GuideRecord = Readonly<{
  slug: GuideSlug;
  title: string;
  description: string;
  route: `/docs/${GuideSlug}`;
  sourcePath: string;
  body: MDXContent;
  structuredData: StructuredData;
  toc: TOCItemType[];
  getRawContent: () => Promise<string>;
}>;

function slugFromMdxPath(path: string): string {
  return path.replace(/\.mdx$/, "");
}

function collectionPagesBySlug(): Map<GuideSlug, FumadocsGuidePage> {
  const pages = guideCollection.docs as readonly FumadocsGuidePage[];
  const bySlug = new Map<GuideSlug, FumadocsGuidePage>();

  for (const page of pages) {
    const slug = slugFromMdxPath(page.info.path);

    if (!isGuideSlug(slug)) {
      throw new Error(`Unexpected guide source file: ${page.info.path}`);
    }

    if (bySlug.has(slug)) {
      throw new Error(`Duplicate guide source file for slug: ${slug}`);
    }

    bySlug.set(slug, page);
  }

  return bySlug;
}

export function getGuideRecords(): GuideRecord[] {
  const pagesBySlug = collectionPagesBySlug();

  return GUIDE_DEFINITIONS.map((definition) => {
    const page = pagesBySlug.get(definition.slug);

    if (!page) {
      throw new Error(`Missing guide source file: ${definition.sourcePath}`);
    }

    const metadata = GuideFrontmatterSchema.parse({
      title: page.title,
      description: page.description,
    });

    if (
      metadata.title !== definition.title ||
      metadata.description !== definition.description
    ) {
      throw new Error(`Guide metadata drift for ${definition.sourcePath}`);
    }

    return {
      slug: definition.slug,
      title: metadata.title,
      description: metadata.description,
      route: definition.route,
      sourcePath: definition.sourcePath,
      body: page.body,
      structuredData: page.structuredData,
      toc: page.toc,
      getRawContent: () => page.getText("raw"),
    };
  });
}

export function getGuideRecord(slug: GuideSlug): GuideRecord {
  const record = getGuideRecords().find((guide) => guide.slug === slug);

  if (!record) {
    throw new Error(`Missing guide source file for slug: ${slug}`);
  }

  return record;
}

export function getGuideNavigationItems(): Pick<
  GuideRecord,
  "description" | "route" | "slug" | "title"
>[] {
  return getGuideRecords().map(({ description, route, slug, title }) => ({
    description,
    route,
    slug,
    title,
  }));
}
