import type { RegistryItem } from "shadcn/schema";

import {
  buildOriginUrl,
  resolveBuildOrigin,
  type BuildOriginConfig,
  type FormMuseDeployEnvironment,
} from "./build-origin";
import { loadAuthoredRegistry } from "./registry-build";
import {
  KebabCaseSlugSchema,
  validateFormMuseRegistryBoundary,
  type FormMuseMeta,
  type FormMuseRegistryBoundary,
} from "./registry-schemas";

export type TemplateRouteStatus = FormMuseMeta["status"];
export type TemplateRouteCategory = FormMuseRegistryBoundary["categories"][0];

export type TemplateRouteRecord = Readonly<{
  item: RegistryItem;
  slug: string;
  title: string;
  description: string;
  category: TemplateRouteCategory;
  status: TemplateRouteStatus;
  version: string;
  templatePath: `/templates/${string}`;
  previewPath: `/preview/${string}`;
}>;

export type TemplateRouteParams = Readonly<{ slug: string }>;

function isDevelopmentOrReview(
  deployEnvironment: FormMuseDeployEnvironment,
): boolean {
  return deployEnvironment !== "production";
}

function templateRouteRecord(item: RegistryItem): TemplateRouteRecord {
  const slug = KebabCaseSlugSchema.parse(item.name);
  const boundary = validateFormMuseRegistryBoundary({
    categories: item.categories,
    meta: item.meta,
  });

  if (!item.title?.trim() || !item.description?.trim()) {
    throw new Error(`Template route ${slug} is missing public metadata.`);
  }

  return {
    item,
    slug,
    title: item.title,
    description: item.description,
    category: boundary.categories[0],
    status: boundary.meta.formmuse.status,
    version: boundary.meta.formmuse.version,
    templatePath: `/templates/${slug}`,
    previewPath: `/preview/${slug}`,
  };
}

export function templatePageIsRoutable(
  item: RegistryItem,
  deployEnvironment: FormMuseDeployEnvironment,
): boolean {
  const metadata = validateFormMuseRegistryBoundary({
    categories: item.categories,
    meta: item.meta,
  }).meta.formmuse;

  if (metadata.status === "draft") {
    return isDevelopmentOrReview(deployEnvironment);
  }

  return true;
}

export function templatePreviewIsRoutable(
  item: RegistryItem,
  deployEnvironment: FormMuseDeployEnvironment,
): boolean {
  const metadata = validateFormMuseRegistryBoundary({
    categories: item.categories,
    meta: item.meta,
  }).meta.formmuse;

  if (metadata.status === "draft") {
    return isDevelopmentOrReview(deployEnvironment);
  }
  if (metadata.status === "deprecated") {
    return metadata.deprecation.installable;
  }

  return true;
}

export function templatePageRoutesForEnvironment(
  items: readonly RegistryItem[],
  deployEnvironment: FormMuseDeployEnvironment,
): TemplateRouteRecord[] {
  return items
    .filter((item) => templatePageIsRoutable(item, deployEnvironment))
    .map(templateRouteRecord);
}

export function templatePreviewRoutesForEnvironment(
  items: readonly RegistryItem[],
  deployEnvironment: FormMuseDeployEnvironment,
): TemplateRouteRecord[] {
  return items
    .filter((item) => templatePreviewIsRoutable(item, deployEnvironment))
    .map(templateRouteRecord);
}

export function templateRouteParams(
  routes: readonly TemplateRouteRecord[],
): TemplateRouteParams[] {
  return routes.map((route) => ({ slug: route.slug }));
}

function authoredItems(): RegistryItem[] {
  return loadAuthoredRegistry(process.cwd()).items;
}

export function templatePageRoutes(
  config: BuildOriginConfig = resolveBuildOrigin(),
): TemplateRouteRecord[] {
  return templatePageRoutesForEnvironment(
    authoredItems(),
    config.deployEnvironment,
  );
}

export function templatePreviewRoutes(
  config: BuildOriginConfig = resolveBuildOrigin(),
): TemplateRouteRecord[] {
  return templatePreviewRoutesForEnvironment(
    authoredItems(),
    config.deployEnvironment,
  );
}

export function templatePageStaticParams(): TemplateRouteParams[] {
  return templateRouteParams(templatePageRoutes());
}

export function templatePreviewStaticParams(): TemplateRouteParams[] {
  return templateRouteParams(templatePreviewRoutes());
}

export function findTemplatePageRoute(
  slug: string,
  config: BuildOriginConfig = resolveBuildOrigin(),
): TemplateRouteRecord | undefined {
  if (!KebabCaseSlugSchema.safeParse(slug).success) {
    return undefined;
  }

  return templatePageRoutes(config).find((route) => route.slug === slug);
}

export function findTemplatePreviewRoute(
  slug: string,
  config: BuildOriginConfig = resolveBuildOrigin(),
): TemplateRouteRecord | undefined {
  if (!KebabCaseSlugSchema.safeParse(slug).success) {
    return undefined;
  }

  return templatePreviewRoutes(config).find((route) => route.slug === slug);
}

export function templateCanonicalUrl(
  route: TemplateRouteRecord,
  config: BuildOriginConfig = resolveBuildOrigin(),
): string | undefined {
  if (!config.shouldPublishCanonicalUrls) {
    return undefined;
  }

  return buildOriginUrl(route.templatePath, config);
}
