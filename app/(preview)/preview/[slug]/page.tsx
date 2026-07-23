import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";

import {
  findTemplatePreviewRoute,
  templatePreviewStaticParams,
} from "@/lib/formmuse/template-routes";
import { HangingGiftsContactPreview } from "@/registry/base/hanging-gifts-contact/preview";

type TemplatePreviewPageProps = Readonly<{
  params: Promise<{ slug: string }>;
}>;

const previewComponents: Partial<Record<string, ComponentType>> = {
  "hanging-gifts-contact": HangingGiftsContactPreview,
};

export const dynamicParams = false;

export function generateStaticParams() {
  return templatePreviewStaticParams();
}

export async function generateMetadata({
  params,
}: TemplatePreviewPageProps): Promise<Metadata> {
  const { slug } = await params;
  const route = findTemplatePreviewRoute(slug);

  if (!route) {
    notFound();
  }

  return {
    title: `${route.title} Preview`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function TemplatePreviewPage({
  params,
}: TemplatePreviewPageProps) {
  const { slug } = await params;
  const route = findTemplatePreviewRoute(slug);

  if (!route) {
    notFound();
  }

  const Preview = previewComponents[route.slug];

  if (!Preview) {
    notFound();
  }

  return <Preview />;
}
