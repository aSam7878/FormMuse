import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TemplatePageShell } from "@/components/template-page/template-page-shell";
import { createTemplatePageModel } from "@/lib/formmuse/template-page";
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

  return <TemplatePageShell template={createTemplatePageModel(route)} />;
}
