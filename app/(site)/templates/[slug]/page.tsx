import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  findTemplatePageRoute,
  templateCanonicalUrl,
  templatePageStaticParams,
} from "@/lib/formmuse/template-routes";

type TemplatePageProps = Readonly<{
  params: Promise<{ slug: string }>;
}>;

export const dynamicParams = false;

export function generateStaticParams() {
  return templatePageStaticParams();
}

export async function generateMetadata({
  params,
}: TemplatePageProps): Promise<Metadata> {
  const { slug } = await params;
  const route = findTemplatePageRoute(slug);

  if (!route) {
    notFound();
  }

  const canonical = templateCanonicalUrl(route);

  return {
    title: route.title,
    description: route.description,
    alternates: canonical ? { canonical } : undefined,
  };
}

export default async function TemplatePage({ params }: TemplatePageProps) {
  const { slug } = await params;
  const route = findTemplatePageRoute(slug);

  if (!route) {
    notFound();
  }

  return (
    <main
      data-formmuse-template-route={route.slug}
      data-formmuse-template-status={route.status}
    />
  );
}
