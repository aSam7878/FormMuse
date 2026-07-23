import { validateFormMuseRegistryBoundary } from "./registry-schemas";
import type { TemplateRouteRecord } from "./template-routes";

export type TemplatePageFile = Readonly<{
  path: string;
  type: string;
  target?: string;
}>;

export type TemplatePageModel = Readonly<{
  slug: string;
  title: string;
  description: string;
  category: string;
  categoryLabel: string;
  status: string;
  statusLabel: string;
  version: string;
  updated: string;
  layout: string;
  layoutLabel: string;
  appearance: string;
  appearanceLabel: string;
  fields: readonly string[];
  fieldLabels: readonly string[];
  tags: readonly string[];
  tagLabels: readonly string[];
  animation: readonly string[];
  animationLabels: readonly string[];
  dependencies: readonly string[];
  registryDependencies: readonly string[];
  files: readonly TemplatePageFile[];
  props: readonly Readonly<{
    name: string;
    type: string;
    required: boolean;
    description: string;
    default?: string;
  }>[];
  examples: readonly Readonly<{
    title: string;
    description: string;
    path: string;
  }>[];
  usageNotes: readonly string[];
  accessibilityNotes: readonly string[];
  templatePath: `/templates/${string}`;
  previewPath: `/preview/${string}`;
}>;

function titleCaseIdentifier(value: string): string {
  return value
    .split("-")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export function createTemplatePageModel(
  route: TemplateRouteRecord,
): TemplatePageModel {
  const boundary = validateFormMuseRegistryBoundary({
    categories: route.item.categories,
    meta: route.item.meta,
  });
  const metadata = boundary.meta.formmuse;

  return {
    slug: route.slug,
    title: route.title,
    description: route.description,
    category: boundary.categories[0],
    categoryLabel: titleCaseIdentifier(boundary.categories[0]),
    status: metadata.status,
    statusLabel: titleCaseIdentifier(metadata.status),
    version: metadata.version,
    updated: metadata.updated,
    layout: metadata.layout,
    layoutLabel: titleCaseIdentifier(metadata.layout),
    appearance: metadata.appearance,
    appearanceLabel: titleCaseIdentifier(metadata.appearance),
    fields: metadata.fields,
    fieldLabels: metadata.fields.map(titleCaseIdentifier),
    tags: metadata.tags,
    tagLabels: metadata.tags.map(titleCaseIdentifier),
    animation: metadata.animation,
    animationLabels: metadata.animation.map((technology) => {
      if (technology === "css") {
        return "CSS";
      }
      if (technology === "gsap") {
        return "GSAP";
      }

      return titleCaseIdentifier(technology);
    }),
    dependencies: route.item.dependencies ?? [],
    registryDependencies: route.item.registryDependencies ?? [],
    files: (route.item.files ?? []).map((file) => ({
      path: file.path,
      type: file.type,
      target: file.target,
    })),
    props: metadata.props.map((prop) => ({
      ...prop,
      default:
        prop.default === undefined
          ? undefined
          : typeof prop.default === "string"
            ? prop.default
            : JSON.stringify(prop.default),
    })),
    examples: metadata.examples,
    usageNotes: metadata.usageNotes,
    accessibilityNotes: metadata.accessibilityNotes,
    templatePath: route.templatePath,
    previewPath: route.previewPath,
  };
}
